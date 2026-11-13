using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SaftHR.API.DTO.Transaction;
using SaftHR.API.Interface.Transaction;
using SaftHR.API.Models;

namespace SaftHR.API.DAL.Transaction
{
    public class DutyTimingDAL : IDutyTimingDAL
    {
        private readonly HRMSDbContext _db;

        public DutyTimingDAL(HRMSDbContext db)
        {
            _db = db;
        }

        public async Task<int> GetNextTransNoAsync(string site)
        {
            var max = await _db.HrmDutyTimingMasters
                .Where(m => m.Site == site)
                .Select(m => (int?)m.TransNo)
                .MaxAsync() ?? 0;
            return max + 1;
        }

        public async Task<DutyTimingMasterDetailsDto> GetEmployeesForDutyTimingAsync(
            int departmentCode,
            DateTime fromDate,
            DateTime toDate,
            string fromTime,
            string toTime,
            string site)
        {
            var fDateOnly = fromDate.Date;
            var tDateOnly = toDate.Date;

            // Department/date lookup starts a new transaction. Existing transactions are edited
            // only when explicitly loaded by transaction number.
            var transNo = await GetNextTransNoAsync(site);
            var fTime = fromTime;
            var tTime = toTime;
            var remarks = "";

            // Warn when an existing transaction overlaps this department/date range.
            string? conflictWarning = null;
            var overlapping = await _db.HrmDutyTimingMasters
                .AsNoTracking()
                .FirstOrDefaultAsync(m =>
                    m.Site == site &&
                    m.DepartmentCode == departmentCode &&
                    m.FromDate <= tDateOnly &&
                    m.ToDate >= fDateOnly
                );

            if (overlapping != null)
            {
                conflictWarning = $"Duty timings are already saved for this department from {overlapping.FromDate:yyyy-MM-dd} to {overlapping.ToDate:yyyy-MM-dd} in Trans #{overlapping.TransNo}. No employees are selected. Select only the employees whose timings should change; previous timings for all others remain in effect.";
            }

            // 3. Query Department Name
            var dept = await _db.Departments
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.Site == site && d.DepartmentCode == departmentCode);
            var deptName = dept?.DepartmentName ?? "";

            // 4. Query active employees for this department
            var employees = await _db.Employees
                .AsNoTracking()
                .Where(e => e.Site == site && e.DeptCode == departmentCode && (e.Status == null || e.Status == true) && (e.StuckOff == null || e.StuckOff == false))
                .OrderBy(e => e.EmpCardNo)
                .Select(e => new
                {
                    e.EmpCardNo,
                    e.EmpName,
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

            var employeeRows = employees.Select(e =>
            {
                return new DutyTimingEmployeeRowDto
                {
                    EmpCardNo = e.EmpCardNo,
                    EmpName = e.EmpName ?? string.Empty,
                    DepartmentCode = e.DeptCode,
                    DepartmentName = deptName,
                    DesignationName = (e.DesgCode.HasValue && desgMap.TryGetValue(e.DesgCode.Value, out var desName)) ? desName : "",
                    FromDate = fDateOnly,
                    ToDate = tDateOnly,
                    FromTime = fTime,
                    ToTime = tTime,
                    IsSelected = overlapping == null,
                    IsAssigned = false
                };
            }).ToList();

            return new DutyTimingMasterDetailsDto
            {
                TransNo = transNo,
                Site = site,
                DepartmentCode = departmentCode,
                DepartmentName = deptName,
                FromDate = fDateOnly,
                ToDate = tDateOnly,
                FromTime = fTime,
                ToTime = tTime,
                Remarks = remarks,
                ConflictWarning = conflictWarning,
                Employees = employeeRows
            };
        }

        public async Task<DutyTimingMasterDetailsDto?> GetTransactionByNoAsync(int transNo, string site)
        {
            var master = await _db.HrmDutyTimingMasters
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

            var assignedChildMap = master.Children
                .GroupBy(c => c.EmpCardNo)
                .ToDictionary(group => group.Key, group => group.First());

            var employeeRows = employees.Select(e =>
            {
                var isSaved = assignedChildMap.TryGetValue(e.EmpCardNo, out var savedChild);
                var childFromTime = isSaved && !string.IsNullOrWhiteSpace(savedChild!.FromTime) ? savedChild.FromTime : master.FromTime;
                var childToTime = isSaved && !string.IsNullOrWhiteSpace(savedChild!.ToTime) ? savedChild.ToTime : master.ToTime;
                return new DutyTimingEmployeeRowDto
                {
                    EmpCardNo = e.EmpCardNo,
                    EmpName = e.EmpName ?? string.Empty,
                    DepartmentCode = e.DeptCode,
                    DepartmentName = deptName,
                    DesignationName = (e.DesgCode.HasValue && desgMap.TryGetValue(e.DesgCode.Value, out var desName)) ? desName : "",
                    FromDate = master.FromDate,
                    ToDate = master.ToDate,
                    FromTime = childFromTime,
                    ToTime = childToTime,
                    IsSelected = isSaved,
                    IsAssigned = isSaved
                };
            }).ToList();

            return new DutyTimingMasterDetailsDto
            {
                TransNo = master.TransNo,
                Site = site,
                DepartmentCode = master.DepartmentCode,
                DepartmentName = deptName,
                FromDate = master.FromDate,
                ToDate = master.ToDate,
                FromTime = master.FromTime,
                ToTime = master.ToTime,
                Remarks = master.Remarks,
                ConflictWarning = null,
                Employees = employeeRows
            };
        }

        public async Task<int> SaveDutyTimingTransactionAsync(SaveDutyTimingMasterDto dto, string site, string userId)
        {
            if (dto.DepartmentCode <= 0)
            {
                throw new ArgumentException("Valid Department Code is required.");
            }

            var fDateOnly = dto.FromDate.Date;
            var tDateOnly = dto.ToDate.Date;

            if (fDateOnly > tDateOnly)
            {
                throw new ArgumentException("From Date cannot be later than To Date.");
            }

            // Existing transactions are updated only when the caller explicitly supplies
            // a transaction number that exists. Department/date matches must never overwrite history.
            HrmDutyTimingMaster? master = null;
            if (dto.TransNo > 0)
            {
                master = await _db.HrmDutyTimingMasters
                    .FirstOrDefaultAsync(m => m.Site == site && m.TransNo == dto.TransNo);
            }

            // Overlapping department date ranges are allowed. Each child row identifies the
            // employees assigned in this transaction, and attendance resolves overlapping
            // assignments to the latest transaction when selecting an employee's duty time.

            // ONLY checked employees from dto.SelectedEmployees are saved!
            var selectedList = dto.SelectedEmployees ?? new List<DutyTimingChildItemDto>();
            if (master == null && selectedList.Count == 0)
            {
                throw new ArgumentException("Select at least one employee before saving a new duty timing transaction.");
            }

            using var transaction = await _db.Database.BeginTransactionAsync();
            try
            {
                int confirmedTransNo = master?.TransNo ?? dto.TransNo;

                var now = DateTime.Now;

                if (master != null)
                {
                    confirmedTransNo = master.TransNo;
                    master.DepartmentCode = dto.DepartmentCode;
                    master.FromDate = fDateOnly;
                    master.ToDate = tDateOnly;
                    master.FromTime = dto.FromTime;
                    master.ToTime = dto.ToTime;
                    master.Remarks = dto.Remarks;
                    master.EditBy = userId;
                    master.EditTime = now;

                    var existingChildren = await _db.HrmDutyTimingChildren
                        .Where(c => c.Site == site && c.TransNo == confirmedTransNo)
                        .ToListAsync();

                    var removeIds = new HashSet<int>(dto.RemoveEmployeeCardNos ?? new List<int>());
                    var childrenToRemove = existingChildren.Where(c => removeIds.Contains(c.EmpCardNo)).ToList();
                    _db.HrmDutyTimingChildren.RemoveRange(childrenToRemove);

                    // Keep existing child assignments and their individual times unless explicitly
                    // marked for removal or selected for an update.
                    var retainedChildren = existingChildren
                        .Except(childrenToRemove)
                        .GroupBy(c => c.EmpCardNo)
                        .ToDictionary(group => group.Key, group => group.First());

                    foreach (var child in retainedChildren.Values)
                    {
                        child.DepartmentCode = dto.DepartmentCode;
                        child.FromDate = fDateOnly;
                        child.ToDate = tDateOnly;
                    }

                    foreach (var emp in selectedList)
                    {
                        if (removeIds.Contains(emp.EmpCardNo))
                        {
                            continue;
                        }

                        if (retainedChildren.TryGetValue(emp.EmpCardNo, out var child))
                        {
                            child.EmpName = emp.EmpName;
                            child.DepartmentCode = dto.DepartmentCode;
                            child.DesignationName = emp.DesignationName;
                            child.FromDate = fDateOnly;
                            child.ToDate = tDateOnly;
                            child.FromTime = string.IsNullOrWhiteSpace(emp.FromTime) ? dto.FromTime : emp.FromTime;
                            child.ToTime = string.IsNullOrWhiteSpace(emp.ToTime) ? dto.ToTime : emp.ToTime;
                        }
                        else
                        {
                            _db.HrmDutyTimingChildren.Add(new HrmDutyTimingChild
                            {
                                TransNo = confirmedTransNo,
                                Site = site,
                                EmpCardNo = emp.EmpCardNo,
                                EmpName = emp.EmpName,
                                DepartmentCode = dto.DepartmentCode,
                                DesignationName = emp.DesignationName,
                                FromDate = fDateOnly,
                                ToDate = tDateOnly,
                                FromTime = string.IsNullOrWhiteSpace(emp.FromTime) ? dto.FromTime : emp.FromTime,
                                ToTime = string.IsNullOrWhiteSpace(emp.ToTime) ? dto.ToTime : emp.ToTime
                            });
                        }
                    }
                }
                else
                {
                    if (confirmedTransNo <= 0)
                    {
                        confirmedTransNo = await GetNextTransNoAsync(site);
                    }

                    master = new HrmDutyTimingMaster
                    {
                        TransNo = confirmedTransNo,
                        Site = site,
                        DepartmentCode = dto.DepartmentCode,
                        FromDate = fDateOnly,
                        ToDate = tDateOnly,
                        FromTime = dto.FromTime,
                        ToTime = dto.ToTime,
                        Remarks = dto.Remarks,
                        EnterBy = userId,
                        EnteryTime = now
                    };
                    _db.HrmDutyTimingMasters.Add(master);

                    // New transactions contain only selected employees.
                    foreach (var emp in selectedList)
                    {
                        _db.HrmDutyTimingChildren.Add(new HrmDutyTimingChild
                        {
                            TransNo = confirmedTransNo,
                            Site = site,
                            EmpCardNo = emp.EmpCardNo,
                            EmpName = emp.EmpName,
                            DepartmentCode = dto.DepartmentCode,
                            DesignationName = emp.DesignationName,
                            FromDate = fDateOnly,
                            ToDate = tDateOnly,
                            FromTime = string.IsNullOrWhiteSpace(emp.FromTime) ? dto.FromTime : emp.FromTime,
                            ToTime = string.IsNullOrWhiteSpace(emp.ToTime) ? dto.ToTime : emp.ToTime
                        });
                    }
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

        public async Task<List<DutyTimingTransactionSummaryDto>> GetRecentTransactionsAsync(string site, int count = 20)
        {
            var masters = await _db.HrmDutyTimingMasters
                .AsNoTracking()
                .Where(m => m.Site == site)
                .OrderByDescending(m => m.TransNo)
                .Take(count)
                .Select(m => new
                {
                    m.TransNo,
                    m.Site,
                    m.DepartmentCode,
                    m.FromDate,
                    m.ToDate,
                    m.FromTime,
                    m.ToTime,
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

            return masters.Select(m => new DutyTimingTransactionSummaryDto
            {
                TransNo = m.TransNo,
                Site = m.Site,
                DepartmentCode = m.DepartmentCode,
                DepartmentName = deptMap.TryGetValue(m.DepartmentCode, out var name) ? name : "",
                FromDate = m.FromDate,
                ToDate = m.ToDate,
                FromTime = m.FromTime,
                ToTime = m.ToTime,
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
                var master = await _db.HrmDutyTimingMasters
                    .FirstOrDefaultAsync(m => m.Site == site && m.TransNo == transNo);

                if (master == null)
                {
                    return false;
                }

                var children = await _db.HrmDutyTimingChildren
                    .Where(c => c.Site == site && c.TransNo == transNo)
                    .ToListAsync();

                _db.HrmDutyTimingChildren.RemoveRange(children);
                _db.HrmDutyTimingMasters.Remove(master);

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
