using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SaftHR.API.DTO.Transaction;
using SaftHR.API.Interface.Transaction;
using SaftHR.API.Models;
using SaftHR.API.Utilities;

namespace SaftHR.API.DAL.Transaction
{
    public class RestDayDAL : IRestDayDAL
    {
        private readonly HRMSDbContext _db;

        public RestDayDAL(HRMSDbContext db)
        {
            _db = db;
        }

        public async Task<int> GetNextTransNoAsync(string site)
        {
            var max = await _db.HrmRestDayMasters
                .Where(m => m.Site == site)
                .Select(m => (int?)m.TransNo)
                .MaxAsync() ?? 0;
            return max + 1;
        }

        public async Task<int> GetNextWeeklyTransNoAsync(string site)
        {
            var max = await _db.HrmWeeklyRestDayMasters
                .Where(m => m.Site == site)
                .Select(m => (int?)m.TransNo)
                .MaxAsync() ?? 0;
            return max + 1;
        }

        public async Task<RestDayMasterDetailsDto> GetEmployeesForRestDayAsync(int departmentCode, DateTime restDate, string site)
        {
            var dateOnly = restDate.Date;
            var dayOfWeekName = dateOnly.DayOfWeek.ToString();

            // 1. Check if an existing master record exists for this department and date
            var existingMaster = await _db.HrmRestDayMasters
                .AsNoTracking()
                .Include(m => m.Children)
                .FirstOrDefaultAsync(m => m.Site == site && m.DepartmentCode == departmentCode && m.RestDate == dateOnly);

            var transNo = existingMaster?.TransNo ?? await GetNextTransNoAsync(site);
            var remarks = existingMaster?.Remarks ?? "";

            // 2. Query Department Name
            var dept = await _db.Departments
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.Site == site && d.DepartmentCode == departmentCode);
            var deptName = dept?.DepartmentName ?? "";

            // 3. Query active employees for this department
            var employees = await _db.Employees
                .AsNoTracking()
                .Where(e => e.Site == site && e.DeptCode == departmentCode && (e.Status == null || e.Status == true) && (e.StuckOff == null || e.StuckOff == false))
                .OrderBy(e => e.EmpCardNo)
                .Select(e => new
                {
                    e.EmpCardNo,
                    e.EmpName,
                    e.RestDay,
                    DeptCode = e.DeptCode ?? departmentCode,
                    DesgCode = e.DesgCode
                })
                .ToListAsync();

            // Designations lookup
            var desgCodes = employees.Where(e => e.DesgCode.HasValue).Select(e => e.DesgCode!.Value).Distinct().ToList();
            var desgMap = await _db.Designations
                .AsNoTracking()
                .Where(d => d.Site == site && desgCodes.Contains(d.DesignationCode))
                .ToDictionaryAsync(d => d.DesignationCode, d => d.DesignationName ?? "");

            // 4. Determine child assignment set
            var assignedEmpSet = existingMaster != null
                ? new HashSet<int>(existingMaster.Children.Select(c => c.EmpCardNo))
                : new HashSet<int>();

            var employeeRows = employees.Select(e =>
            {
                var isSavedChild = assignedEmpSet.Contains(e.EmpCardNo);
                return new RestDayEmployeeRowDto
                {
                    EmpCardNo = e.EmpCardNo,
                    EmpName = e.EmpName ?? string.Empty,
                    DepartmentCode = e.DeptCode,
                    DepartmentName = deptName,
                    DesignationName = (e.DesgCode.HasValue && desgMap.TryGetValue(e.DesgCode.Value, out var desName)) ? desName : "",
                    RestDate = dateOnly,
                    RestDay = dayOfWeekName,
                    WeeklyRestDays = RestDaySchedule.Format(e.RestDay),
                    // If existing master exists, check only saved children; if new, check all active by default
                    IsSelected = existingMaster != null ? isSavedChild : true,
                    IsAssigned = isSavedChild
                };
            }).ToList();

            return new RestDayMasterDetailsDto
            {
                TransNo = transNo,
                Site = site,
                DepartmentCode = departmentCode,
                DepartmentName = deptName,
                RestDate = dateOnly,
                RestDay = dayOfWeekName,
                Remarks = remarks,
                Employees = employeeRows
            };
        }

        public async Task<int> SaveWeeklyRestDayScheduleAsync(SaveWeeklyRestDayScheduleDto dto, string site, string userId)
        {
            if (dto.DepartmentCode <= 0 || dto.EmpCardNos == null || dto.EmpCardNos.Count == 0)
                throw new ArgumentException("Select a department and at least one employee.");
            if (!RestDaySchedule.IsExplicitSchedule(dto.RestDay) || string.IsNullOrWhiteSpace(RestDaySchedule.Format(dto.RestDay)))
                throw new ArgumentException("Select at least one weekly rest day.");
            if (dto.Remarks?.Length > 250)
                throw new ArgumentException("Remarks cannot exceed 250 characters.");

            var ids = dto.EmpCardNos.Distinct().ToList();
            var employees = await _db.Employees
                .Where(e => e.Site == site && e.DeptCode == dto.DepartmentCode && ids.Contains(e.EmpCardNo)
                    && (e.Status == null || e.Status == true) && (e.StuckOff == null || e.StuckOff == false))
                .ToListAsync();
            if (employees.Count != ids.Count)
                throw new ArgumentException("One or more selected employees are no longer active in this department. Refresh and try again.");

            var designationCodes = employees.Where(e => e.DesgCode.HasValue).Select(e => e.DesgCode!.Value).Distinct().ToList();
            var designationNames = await _db.Designations.AsNoTracking()
                .Where(d => d.Site == site && designationCodes.Contains(d.DesignationCode))
                .ToDictionaryAsync(d => d.DesignationCode, d => d.DesignationName ?? string.Empty);

            using var transaction = await _db.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);
            try
            {
                var transNo = await GetNextWeeklyTransNoAsync(site);
                var master = new HrmWeeklyRestDayMaster
                {
                    TransNo = transNo,
                    Site = site,
                    DepartmentCode = dto.DepartmentCode,
                    RestDays = dto.RestDay,
                    Remarks = string.IsNullOrWhiteSpace(dto.Remarks) ? null : dto.Remarks.Trim(),
                    EnterBy = userId,
                    EnteryTime = DateTime.Now
                };
                _db.HrmWeeklyRestDayMasters.Add(master);

                foreach (var employee in employees)
                {
                    employee.RestDay = dto.RestDay;
                    _db.HrmWeeklyRestDayChildren.Add(new HrmWeeklyRestDayChild
                    {
                        TransNo = transNo,
                        Site = site,
                        EmpCardNo = employee.EmpCardNo,
                        EmpName = employee.EmpName,
                        DepartmentCode = dto.DepartmentCode,
                        DesignationName = employee.DesgCode.HasValue && designationNames.TryGetValue(employee.DesgCode.Value, out var name) ? name : null
                    });
                }

                await _db.SaveChangesAsync();
                await transaction.CommitAsync();
                return transNo;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<RestDayMasterDetailsDto?> GetTransactionByNoAsync(int transNo, string site)
        {
            var master = await _db.HrmRestDayMasters
                .AsNoTracking()
                .Include(m => m.Children)
                .FirstOrDefaultAsync(m => m.Site == site && m.TransNo == transNo);

            if (master == null)
            {
                return null;
            }

            var dept = await _db.Departments
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.Site == site && d.DepartmentCode == master.DepartmentCode);
            var deptName = dept?.DepartmentName ?? "";

            // Query all active employees in that department
            var employees = await _db.Employees
                .AsNoTracking()
                .Where(e => e.Site == site && e.DeptCode == master.DepartmentCode && (e.Status == null || e.Status == true) && (e.StuckOff == null || e.StuckOff == false))
                .OrderBy(e => e.EmpCardNo)
                .Select(e => new
                {
                    e.EmpCardNo,
                    e.EmpName,
                    DeptCode = e.DeptCode ?? master.DepartmentCode,
                    DesgCode = e.DesgCode
                })
                .ToListAsync();

            var desgCodes = employees.Where(e => e.DesgCode.HasValue).Select(e => e.DesgCode!.Value).Distinct().ToList();
            var desgMap = await _db.Designations
                .AsNoTracking()
                .Where(d => d.Site == site && desgCodes.Contains(d.DesignationCode))
                .ToDictionaryAsync(d => d.DesignationCode, d => d.DesignationName ?? "");

            var assignedChildMap = master.Children.ToDictionary(c => c.EmpCardNo);

            var employeeRows = employees.Select(e =>
            {
                var isSaved = assignedChildMap.ContainsKey(e.EmpCardNo);
                return new RestDayEmployeeRowDto
                {
                    EmpCardNo = e.EmpCardNo,
                    EmpName = e.EmpName ?? string.Empty,
                    DepartmentCode = e.DeptCode,
                    DepartmentName = deptName,
                    DesignationName = (e.DesgCode.HasValue && desgMap.TryGetValue(e.DesgCode.Value, out var desName)) ? desName : "",
                    RestDate = master.RestDate,
                    RestDay = master.RestDay,
                    IsSelected = isSaved,
                    IsAssigned = isSaved
                };
            }).ToList();

            return new RestDayMasterDetailsDto
            {
                TransNo = master.TransNo,
                Site = site,
                DepartmentCode = master.DepartmentCode,
                DepartmentName = deptName,
                RestDate = master.RestDate,
                RestDay = master.RestDay,
                Remarks = master.Remarks,
                Employees = employeeRows
            };
        }

        public async Task<int> SaveRestDayTransactionAsync(SaveRestDayMasterDto dto, string site, string userId)
        {
            if (dto.DepartmentCode <= 0)
            {
                throw new ArgumentException("Valid Department Code is required.");
            }

            var dateOnly = dto.RestDate.Date;
            var dayOfWeekName = !string.IsNullOrWhiteSpace(dto.RestDay)
                ? dto.RestDay
                : dateOnly.DayOfWeek.ToString();

            // ONLY checked employees from dto.SelectedEmployees are saved!
            var selectedList = dto.SelectedEmployees ?? new List<RestDayChildItemDto>();

            using var transaction = await _db.Database.BeginTransactionAsync();
            try
            {
                int confirmedTransNo = dto.TransNo;

                // 1. Check if master exists by TransNo OR by (DepartmentCode, RestDate, Site)
                HrmRestDayMaster? master = null;

                if (confirmedTransNo > 0)
                {
                    master = await _db.HrmRestDayMasters
                        .FirstOrDefaultAsync(m => m.Site == site && m.TransNo == confirmedTransNo);
                }

                if (master == null)
                {
                    master = await _db.HrmRestDayMasters
                        .FirstOrDefaultAsync(m => m.Site == site && m.DepartmentCode == dto.DepartmentCode && m.RestDate == dateOnly);
                }

                var now = DateTime.Now;

                if (master != null)
                {
                    confirmedTransNo = master.TransNo;
                    master.DepartmentCode = dto.DepartmentCode;
                    master.RestDate = dateOnly;
                    master.RestDay = dayOfWeekName;
                    master.Remarks = dto.Remarks;
                    master.EditBy = userId;
                    master.EditTime = now;

                    // Delete existing child records for this transaction
                    var existingChildren = await _db.HrmRestDayChildren
                        .Where(c => c.Site == site && c.TransNo == confirmedTransNo)
                        .ToListAsync();

                    _db.HrmRestDayChildren.RemoveRange(existingChildren);
                }
                else
                {
                    if (confirmedTransNo <= 0)
                    {
                        confirmedTransNo = await GetNextTransNoAsync(site);
                    }

                    master = new HrmRestDayMaster
                    {
                        TransNo = confirmedTransNo,
                        Site = site,
                        DepartmentCode = dto.DepartmentCode,
                        RestDate = dateOnly,
                        RestDay = dayOfWeekName,
                        Remarks = dto.Remarks,
                        EnterBy = userId,
                        EnteryTime = now
                    };
                    _db.HrmRestDayMasters.Add(master);
                }

                // 2. Insert ONLY selected / checked employees into Child table
                foreach (var emp in selectedList)
                {
                    var child = new HrmRestDayChild
                    {
                        TransNo = confirmedTransNo,
                        Site = site,
                        EmpCardNo = emp.EmpCardNo,
                        EmpName = emp.EmpName,
                        DepartmentCode = dto.DepartmentCode,
                        DesignationName = emp.DesignationName,
                        RestDate = dateOnly,
                        RestDay = dayOfWeekName
                    };
                    _db.HrmRestDayChildren.Add(child);
                }

                await _db.SaveChangesAsync();
                await transaction.CommitAsync();

                return confirmedTransNo;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<List<RestDayTransactionSummaryDto>> GetRecentTransactionsAsync(string site, int count = 20)
        {
            var masters = await _db.HrmRestDayMasters
                .AsNoTracking()
                .Where(m => m.Site == site)
                .OrderByDescending(m => m.TransNo)
                .Take(count)
                .Select(m => new
                {
                    m.TransNo,
                    m.Site,
                    m.DepartmentCode,
                    m.RestDate,
                    m.RestDay,
                    m.Remarks,
                    m.EnterBy,
                    m.EnteryTime,
                    TotalEmployees = m.Children.Count()
                })
                .ToListAsync();

            var deptCodes = masters.Select(m => m.DepartmentCode).Distinct().ToList();
            var deptMap = await _db.Departments
                .AsNoTracking()
                .Where(d => d.Site == site && deptCodes.Contains(d.DepartmentCode))
                .ToDictionaryAsync(d => d.DepartmentCode, d => d.DepartmentName ?? "");

            return masters.Select(m => new RestDayTransactionSummaryDto
            {
                TransNo = m.TransNo,
                Site = m.Site,
                DepartmentCode = m.DepartmentCode,
                DepartmentName = deptMap.TryGetValue(m.DepartmentCode, out var name) ? name : "",
                RestDate = m.RestDate,
                RestDay = m.RestDay,
                TotalEmployees = m.TotalEmployees,
                Remarks = m.Remarks,
                EnterBy = m.EnterBy,
                EnteryTime = m.EnteryTime
            }).ToList();
        }

        public async Task<bool> DeleteTransactionAsync(int transNo, string site)
        {
            using var transaction = await _db.Database.BeginTransactionAsync();
            try
            {
                var master = await _db.HrmRestDayMasters
                    .FirstOrDefaultAsync(m => m.Site == site && m.TransNo == transNo);

                if (master == null)
                {
                    return false;
                }

                var children = await _db.HrmRestDayChildren
                    .Where(c => c.Site == site && c.TransNo == transNo)
                    .ToListAsync();

                _db.HrmRestDayChildren.RemoveRange(children);
                _db.HrmRestDayMasters.Remove(master);

                await _db.SaveChangesAsync();
                await transaction.CommitAsync();

                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}
