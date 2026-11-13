using Microsoft.EntityFrameworkCore;
using SaftHR.API.DTO.Transaction;
using SaftHR.API.Interface.Transaction;
using SaftHR.API.Models;

namespace SaftHR.API.DAL.Transaction
{
    public class LeaveDAL : ILeaveDAL
    {
        private readonly HRMSDbContext _db;

        public LeaveDAL(HRMSDbContext db)
        {
            _db = db;
        }

        // ── Leave Application (Master/Child/Register) ─────────────────────────

        public async Task<List<HrmLeaveType>> GetLeaveTypesAsync()
        {
            return await _db.HrmLeaveTypes.OrderBy(o => o.LeaveType).ToListAsync();
        }

        public async Task<List<object>> GetRecentLeavesAsync(string site, int count)
        {
            var leaves = await _db.HrmVewLeaveApplications
                .Where(u => u.Site == site)
                .OrderByDescending(u => u.TransNo)
                .Take(count)
                .ToListAsync();

            var leaveTypes = await _db.HrmLeaveTypes.ToDictionaryAsync(t => t.LeaveType, t => t.LeaveName ?? "");

            return leaves.Select(item => (object)new
            {
                serialNo = item.TransNo,
                applicationNo = item.TransNo,
                empCardNo = item.EmpCardNo ?? 0,
                empName = item.EmpName ?? "",
                leaveType = item.LeaveType ?? "",
                leaveName = (item.LeaveType != null && leaveTypes.ContainsKey(item.LeaveType)) ? leaveTypes[item.LeaveType] : (item.LeaveType ?? ""),
                fromDate = item.FromDate ?? DateTime.Now,
                toDate = item.ToDate ?? DateTime.Now,
                totalLeaves = item.LeaveRequired ?? 0,
                remarks = item.Reason ?? "",
                site = item.Site
            }).ToList();
        }

        public async Task<int> ApplicationMaxNOAsync(string site)
        {
            var max = await _db.HrmLeaveMasters
                .Where(u => u.Site == site)
                .Select(p => (int?)p.ApplicationNo)
                .MaxAsync() ?? 0;
            return max + 1;
        }

        public async Task SaveLeaveMasterAsync(LeaveRequestDto dto, string site, string userId)
        {
            var temp = await _db.HrmLeaveMasters
                .Where(u => u.ApplicationNo == dto.ApplicationNo && u.Site == site)
                .FirstOrDefaultAsync();

            if (temp == null)
            {
                temp = new HrmLeaveMaster
                {
                    ApplicationNo = dto.ApplicationNo,
                    ApplicationDate = dto.ApplicationDate,
                    Site = site,
                    EnterBy = userId,
                    EnteryTime = DateTime.Now
                };
                _db.HrmLeaveMasters.Add(temp);
            }
            else
            {
                temp.ApplicationDate = dto.ApplicationDate;
                temp.EditBy = userId;
                temp.EditTime = DateTime.Now;
            }

            await _db.SaveChangesAsync();
        }

        public async Task DeleteLeaveChildAsync(int applicationNo, string site)
        {
            await _db.Database.ExecuteSqlRawAsync(
                "DELETE FROM HRM_Leave_Child WHERE Application_No={0} AND Site={1}", applicationNo, site);
        }

        public async Task SaveLeaveChildAsync(LeaveRequestDto dto, string site)
        {
            var temp = new HrmLeaveChild
            {
                ApplicationNo = dto.ApplicationNo,
                EmpCardNo = dto.EmpCardNo,
                LeaveType = dto.LeaveType,
                FromDate = dto.FromDate,
                ToDate = dto.ToDate,
                TotalLeaves = dto.TotalLeaves,
                Remarks = dto.Remarks,
                Reason = dto.Reason,
                Site = site
            };
            _db.HrmLeaveChildren.Add(temp);
            await _db.SaveChangesAsync();
        }

        public async Task<bool> DeleteLeaveRegisterAsync(int applicationNo, string site)
        {
            try
            {
                await _db.Database.ExecuteSqlRawAsync(
                    "DELETE FROM HRM_Leave_Register WHERE Application_No={0} AND Site={1}", applicationNo, site);
                return true;
            }
            catch { return false; }
        }

        public async Task SaveLeaveRegisterAsync(LeaveRequestDto dto, string site, string userId)
        {
            var temp = new HrmLeaveRegister
            {
                EmpCardNo = dto.EmpCardNo,
                ApplicationNo = dto.ApplicationNo,
                LeaveMonth = dto.FromDate.Month,
                LeaveYear = dto.FromDate.Year,
                LeaveDate = dto.FromDate,
                
                AlOpen = 0, AlAdd = 0, ClOpen = 0, ClAdd = 0,
                SlOpen = 0, SlAdd = 0, CplAdd = 0,
                
                AlUse = dto.ALUsed,
                ClUse = dto.CLUsed,
                SlUse = dto.SLUsed,
                CplUse = dto.CPLUsed,
                
                Site = site,
                EnterBy = userId,
                EnteryTime = DateTime.Now
            };
            _db.HrmLeaveRegisters.Add(temp);
            await _db.SaveChangesAsync();
        }

        public async Task<LeaveResponseDto?> EditLeaveMasterAsync(int applicationNo, string site)
        {
            return await _db.HrmLeaveMasters
                .Where(u => u.ApplicationNo == applicationNo && u.Site == site)
                .OrderByDescending(u => u.ApplicationNo)
                .Select(temp => new LeaveResponseDto
                {
                    ApplicationNo = temp.ApplicationNo,
                    ApplicationDate = temp.ApplicationDate ?? DateTime.Now,
                })
                .FirstOrDefaultAsync();
        }

        public async Task<List<HrmVewLeaf>> EditLeaveChildAsync(int applicationNo, string site)
        {
            return await _db.HrmVewLeaves
                .Where(u => u.ApplicationNo == applicationNo && u.Site == site)
                .OrderBy(o => o.SerialNo)
                .ToListAsync();
        }

        public async Task<bool> DeleteLeaveRecordAsync(int applicationNo, string site)
        {
            try
            {
                await _db.Database.ExecuteSqlRawAsync("DELETE FROM HRM_Leave_Child WHERE Application_No={0} AND Site={1}", applicationNo, site);
                await _db.Database.ExecuteSqlRawAsync("DELETE FROM HRM_Leave_Master WHERE Application_No={0} AND Site={1}", applicationNo, site);
                await _db.Database.ExecuteSqlRawAsync("DELETE FROM HRM_Leave_Register WHERE Application_No={0} AND Site={1}", applicationNo, site);
                return true;
            }
            catch { return false; }
        }

        public async Task<LeaveResponseDto?> CheckLeaveAsync(DateTime attendanceDate, int empcard, string site)
        {
            return await _db.HrmVewLeaves
                .Where(u => attendanceDate >= u.FromDate && attendanceDate <= u.ToDate && u.EmpCardNo == empcard && u.Site == site)
                .OrderByDescending(u => u.EmpCardNo)
                .Select(temp => new LeaveResponseDto
                {
                    ApplicationNo = temp.ApplicationNo,
                    LeaveType = temp.LeaveType,
                })
                .FirstOrDefaultAsync();
        }

        public async Task<LeaveResponseDto?> CheckLeaveAsync(DateTime fromDate, DateTime toDate, string leaveType, int empcard, string site)
        {
            return await _db.HrmVewLeaves
                .Where(u => u.LeaveType == leaveType && fromDate >= u.FromDate && toDate <= u.ToDate && u.EmpCardNo == empcard && u.Site == site)
                .OrderByDescending(u => u.EmpCardNo)
                .Select(temp => new LeaveResponseDto
                {
                    ApplicationNo = temp.ApplicationNo,
                    LeaveType = temp.LeaveType,
                })
                .FirstOrDefaultAsync();
        }

        // ── Balances ──────────────────────────────────────────────────────────

        public async Task<decimal> GetALbalanceAsync(int cardno)
        {
            return await _db.HrmVewLeaveBalances
                .Where(u => u.EmpCardNo == cardno)
                .Select(p => p.AlBalance ?? 0)
                .FirstOrDefaultAsync();
        }

        public async Task<decimal> GetCLbalanceAsync(int cardno)
        {
            return await _db.HrmVewLeaveBalances
                .Where(u => u.EmpCardNo == cardno)
                .Select(p => p.ClBalance ?? 0)
                .FirstOrDefaultAsync();
        }

        public async Task<decimal> GetSLbalanceAsync(int cardno)
        {
            return await _db.HrmVewLeaveBalances
                .Where(u => u.EmpCardNo == cardno)
                .Select(p => p.SlBalance ?? 0)
                .FirstOrDefaultAsync();
        }

        public async Task<decimal> GetCPLbalanceAsync(int cardno)
        {
            return await _db.HrmVewLeaveBalances
                .Where(u => u.EmpCardNo == cardno)
                .Select(p => p.CplBalance ?? 0)
                .FirstOrDefaultAsync();
        }

        public async Task<decimal> CheckAvailedLeaveAsync(DateTime fromDate, DateTime toDate, int empcard, string site)
        {
            try
            {
                // The original code used a raw SQL query equivalent to this LINQ query.
                return await _db.HrmLeaveChildren
                    .Where(u => u.LeaveType == "AL" && u.EmpCardNo == empcard && 
                                u.FromDate.HasValue && u.FromDate.Value.Month == fromDate.Month && 
                                u.FromDate.Value.Year == fromDate.Year && u.Site == site)
                    .SumAsync(u => u.TotalLeaves ?? 0);
            }
            catch { return 0; }
        }

        // ── Leave Adjustments ─────────────────────────────────────────────────

        public async Task<LeaveAdjustmentDto?> GetLeaveAdjustmentAsync(int empcard, int leavemonth, int leaveyear, string site)
        {
            var existing = await _db.HrmLeaveRegisters
                .Where(u => u.EmpCardNo == empcard && u.LeaveMonth == leavemonth && u.LeaveYear == leaveyear && u.ApplicationNo == 0 && u.Site == site)
                .OrderByDescending(u => u.EmpCardNo)
                .Select(temp => new LeaveAdjustmentDto
                {
                    EmpCardNo = temp.EmpCardNo,
                    ALOpen = temp.AlOpen,
                    CLOpen = temp.ClOpen,
                    SLOpen = temp.SlOpen,
                    CPLOpen = temp.CplOpen,
                })
                .FirstOrDefaultAsync();

            if (existing != null)
            {
                return existing;
            }

            // Fallback: If no adjustment record exists, fetch current balances from HrmVewLeaveBalances
            var currentBal = await _db.HrmVewLeaveBalances
                .Where(u => u.EmpCardNo == empcard && u.Site == site)
                .FirstOrDefaultAsync();

            if (currentBal != null)
            {
                return new LeaveAdjustmentDto
                {
                    EmpCardNo = empcard,
                    ALOpen = currentBal.AlBalance ?? 0,
                    CLOpen = currentBal.ClBalance ?? 0,
                    SLOpen = currentBal.SlBalance ?? 0,
                    CPLOpen = currentBal.CplBalance ?? 0,
                };
            }

            return null;
        }

        public async Task<bool> UpdateLeaveAdjustmentAsync(LeaveAdjustmentDto dto, string site, string userId)
        {
            try
            {
                var temp = await _db.HrmLeaveRegisters
                    .Where(u => u.EmpCardNo == dto.EmpCardNo && u.LeaveMonth == dto.LeaveDate.Month && u.LeaveYear == dto.LeaveDate.Year && u.ApplicationNo == 0 && u.Site == site)
                    .FirstOrDefaultAsync();

                if (temp == null)
                {
                    temp = new HrmLeaveRegister
                    {
                        EmpCardNo = dto.EmpCardNo,
                        LeaveDate = dto.LeaveDate,
                        LeaveMonth = dto.LeaveDate.Month,
                        LeaveYear = dto.LeaveDate.Year,
                        ApplicationNo = 0,
                        AlOpen = dto.ALOpen,
                        ClOpen = dto.CLOpen,
                        SlOpen = dto.SLOpen,
                        CplOpen = dto.CPLOpen,
                        Site = site,
                        EnterBy = userId,
                        EnteryTime = DateTime.Now
                    };
                    _db.HrmLeaveRegisters.Add(temp);
                }
                else
                {
                    temp.LeaveDate = dto.LeaveDate;
                    temp.AlOpen = dto.ALOpen;
                    temp.ClOpen = dto.CLOpen;
                    temp.SlOpen = dto.SLOpen;
                    temp.CplOpen = dto.CPLOpen;
                    temp.EditBy = userId;
                    temp.EditTime = DateTime.Now;
                }

                await _db.SaveChangesAsync();
                return true;
            }
            catch { return false; }
        }

        // ── Gazetted Leaves ───────────────────────────────────────────────────

        public async Task<int> GazettedLeaveMaxNOAsync(string site)
        {
            var max = await _db.GazettedLeaves
                .Where(u => u.Site == site)
                .Select(p => (int?)p.LeaveId)
                .MaxAsync() ?? 0;
            return max + 1;
        }

        public async Task SaveGazettedLeaveAsync(GazettedLeaveDto dto, string site, string userId)
        {
            var temp = await _db.GazettedLeaves
                .Where(u => u.LeaveId == dto.ApplicationNo && u.Site == site)
                .FirstOrDefaultAsync();

            if (temp == null)
            {
                temp = new GazettedLeaf
                {
                    LeaveId = dto.ApplicationNo,
                    LeaveDate = dto.LeaveDate,
                    LeaveName = dto.LeaveType,
                    Site = site,
                    EnterBy = userId,
                    EnteryTime = DateTime.Now
                };
                _db.GazettedLeaves.Add(temp);
            }
            else
            {
                temp.LeaveDate = dto.LeaveDate;
                temp.LeaveName = dto.LeaveType;
                temp.EditBy = userId;
                temp.EditTime = DateTime.Now;
            }

            await _db.SaveChangesAsync();
        }

        public async Task<GazettedLeaveDto?> EditGazettedLeaveAsync(int srno, string site)
        {
            return await _db.GazettedLeaves
                .Where(u => u.LeaveId == srno && u.Site == site)
                .OrderByDescending(u => u.LeaveId)
                .Select(temp => new GazettedLeaveDto
                {
                    ApplicationNo = temp.LeaveId,
                    LeaveDate = temp.LeaveDate ?? DateTime.Now,
                    LeaveType = temp.LeaveName,
                })
                .FirstOrDefaultAsync();
        }

        public async Task<List<GazettedLeaveDto>> GetGazettedLeavesListAsync(string site)
        {
            return await _db.GazettedLeaves
                .Where(u => u.Site == site)
                .OrderByDescending(u => u.LeaveId)
                .Select(temp => new GazettedLeaveDto
                {
                    ApplicationNo = temp.LeaveId,
                    LeaveDate = temp.LeaveDate ?? DateTime.Now,
                    LeaveType = temp.LeaveName,
                })
                .ToListAsync();
        }

        public async Task<bool> CheckGazettedLeaveAsync(DateTime leavedate, string site)
        {
            var temp = await _db.GazettedLeaves.Where(u => u.LeaveDate == leavedate && u.Site == site).FirstOrDefaultAsync();
            return temp != null;
        }

        public async Task<string?> CheckGazettedLeaveNameAsync(DateTime leavedate, string site)
        {
            return await _db.GazettedLeaves
                .Where(u => u.LeaveDate == leavedate && u.Site == site)
                .Select(p => p.LeaveName)
                .FirstOrDefaultAsync();
        }

        // ── Leave Application Form (HRM_LeaveApplication) ─────────────────────

        public async Task<int> GetLeaveApplicationMaxNoAsync(string site)
        {
            var max = await _db.HrmLeaveApplications
                .Where(u => u.Site == site)
                .Select(p => (int?)p.TransNo)
                .MaxAsync() ?? 0;
            return max + 1;
        }

        public async Task SaveLeaveApplicationAsync(LeaveApplicationDto dto, string site, string userId)
        {
            var temp = await _db.HrmLeaveApplications
                .Where(u => u.TransNo == dto.TransactionNo && u.Site == site)
                .FirstOrDefaultAsync();

            if (temp == null)
            {
                temp = new HrmLeaveApplication
                {
                    TransNo = dto.TransactionNo,
                    TransDate = dto.TransactionDate,
                    Assignment = dto.Assignment,
                    LeaveDate = dto.LeaveDate,
                    EmpCardNo = dto.EmpCardNo,
                    FromDate = dto.FromDate,
                    LeaveRequired = dto.LeaveRequired,
                    LeaveType = dto.LeaveType,
                    ToDate = dto.ToDate,
                    MoreThanOne = dto.MoreThanOne,
                    Reason = dto.Reason,
                    Site = site,
                    EnterBy = userId,
                    EnteryTime = DateTime.Now
                };
                _db.HrmLeaveApplications.Add(temp);
            }
            else
            {
                temp.TransDate = dto.TransactionDate;
                temp.Assignment = dto.Assignment;
                temp.LeaveDate = dto.LeaveDate;
                temp.EmpCardNo = dto.EmpCardNo;
                temp.FromDate = dto.FromDate;
                temp.LeaveRequired = dto.LeaveRequired;
                temp.LeaveType = dto.LeaveType;
                temp.ToDate = dto.ToDate;
                temp.MoreThanOne = dto.MoreThanOne;
                temp.Reason = dto.Reason;
                temp.EditBy = userId;
                temp.EditTime = DateTime.Now;
            }

            await _db.SaveChangesAsync();
        }

        public async Task<LeaveApplicationDto?> EditLeaveApplicationAsync(int transNo, string site)
        {
            return await _db.HrmVewLeaveApplications
                .Where(u => u.TransNo == transNo && u.Site == site)
                .OrderByDescending(u => u.TransNo)
                .Select(temp => new LeaveApplicationDto
                {
                    TransactionNo = temp.TransNo,
                    TransactionDate = temp.TransDate ?? DateTime.Now,
                    Assignment = temp.Assignment ?? "",
                    LeaveDate = temp.LeaveDate ?? DateTime.Now,
                    EmpCardNo = temp.EmpCardNo ?? 0,
                    FromDate = temp.FromDate ?? DateTime.Now,
                    LeaveRequired = temp.LeaveRequired ?? 0,
                    LeaveType = temp.LeaveType ?? "",
                    MoreThanOne = temp.MoreThanOne ?? false,
                    ToDate = temp.ToDate ?? DateTime.Now,
                    Reason = temp.Reason,
                    EmpName = temp.EmpName ?? "",
                    DesignationName = temp.DesignationName,
                })
                .FirstOrDefaultAsync();
        }

        // ── Short Leave ───────────────────────────────────────────────────────

        public async Task<int> GetShortLeaveMaxNoAsync(string site)
        {
            var max = await _db.HrmShortLeaves
                .Where(u => u.Site == site)
                .Select(p => (int?)p.TransNo)
                .MaxAsync() ?? 0;
            return max + 1;
        }

        public async Task SaveShortLeaveAsync(ShortLeaveDto dto, string site, string userId)
        {
            var temp = await _db.HrmShortLeaves
                .Where(u => u.TransNo == dto.TransactionNo && u.Site == site)
                .FirstOrDefaultAsync();

            if (temp == null)
            {
                temp = new HrmShortLeave
                {
                    TransNo = dto.TransactionNo,
                    TransDate = dto.TransactionDate,
                    LeaveDate = dto.LeaveDate,
                    EmpCardNo = dto.EmpCardNo,
                    FromTime = dto.FromTime,
                    LeaveType = dto.LeaveType,
                    ToTime = dto.ToTime,
                    Reason = dto.Reason,
                    Site = site,
                    EnterBy = userId,
                    EnteryTime = DateTime.Now
                };
                _db.HrmShortLeaves.Add(temp);
            }
            else
            {
                temp.TransDate = dto.TransactionDate;
                temp.LeaveDate = dto.LeaveDate;
                temp.EmpCardNo = dto.EmpCardNo;
                temp.FromTime = dto.FromTime;
                temp.LeaveType = dto.LeaveType;
                temp.ToTime = dto.ToTime;
                temp.Reason = dto.Reason;
                temp.EditBy = userId;
                temp.EditTime = DateTime.Now;
            }

            await _db.SaveChangesAsync();
        }

        public async Task<ShortLeaveDto?> EditShortLeaveAsync(int transNo, string site)
        {
            return await _db.HrmVewShortLeaves
                .Where(u => u.TransNo == transNo && u.Site == site)
                .OrderByDescending(u => u.TransNo)
                .Select(temp => new ShortLeaveDto
                {
                    TransactionNo = temp.TransNo,
                    TransactionDate = temp.TransDate ?? DateTime.Now,
                    LeaveDate = temp.LeaveDate ?? DateTime.Now,
                    EmpCardNo = temp.EmpCardNo ?? 0,
                    FromTime = temp.FromTime ?? DateTime.Now,
                    LeaveType = temp.LeaveType ?? "",
                    ToTime = temp.Totime ?? DateTime.Now,
                    Reason = temp.Reason,
                    EmpName = temp.EmpName ?? "",
                })
                .FirstOrDefaultAsync();
        }

        // ── Leave Deductions ──────────────────────────────────────────────────

        public async Task<int> LeaveDeductionsMaxNoAsync(string site)
        {
            var max = await _db.HrmLeaveDeductionsMasters
                .Where(u => u.Site == site)
                .Select(p => (int?)p.TransactionNo)
                .MaxAsync() ?? 0;
            return max + 1;
        }

        public async Task SaveLeaveDeductionsChildAsync(LeaveDeductionChildDto dto, string site)
        {
            var temp = new HrmLeaveDeductionsChild
            {
                TransactionNo = dto.TransactionNo,
                Site = site,
                DepartmentName = dto.DepartmentName,
                DesignationName = dto.DesignationName,
                EmpCardNo = dto.EmpCardNo,
                FatherName = dto.FatherName,
                Name = dto.Name,
                Leaves = dto.LeavesDeducted
            };
            _db.HrmLeaveDeductionsChildren.Add(temp);
            await _db.SaveChangesAsync();
        }

        public async Task SaveLeaveDeductionsMasterAsync(LeaveDeductionMasterDto dto, string site, string userId)
        {
            var temp = await _db.HrmLeaveDeductionsMasters
                .Where(u => u.TransactionNo == dto.TransactionNo && u.Site == site)
                .FirstOrDefaultAsync();

            if (temp == null)
            {
                temp = new HrmLeaveDeductionsMaster
                {
                    TransactionNo = dto.TransactionNo,
                    Site = site,
                    TransactionDate = dto.TransactionDate,
                    EnterBy = userId,
                    EnteryTime = DateTime.Now
                };
                _db.HrmLeaveDeductionsMasters.Add(temp);
            }
            else
            {
                temp.TransactionDate = dto.TransactionDate;
                temp.EditBy = userId;
                temp.EditTime = DateTime.Now;
            }

            await _db.SaveChangesAsync();
        }

        public async Task<LeaveDeductionMasterDto?> GetLeaveDeductionsMasterInfoAsync(int transactionNo, string site)
        {
            return await _db.HrmVewLeaveDeducitons
                .Where(u => u.TransactionNo == transactionNo && u.Site == site)
                .OrderByDescending(u => u.RecNo)
                .Select(temp => new LeaveDeductionMasterDto
                {
                    TransactionNo = temp.TransactionNo,
                    TransactionDate = temp.TransactionDate ?? DateTime.Now,
                })
                .FirstOrDefaultAsync();
        }

        public async Task<List<HrmVewLeaveDeduciton>> GetLeaveDeductionsChildInfoAsync(int transactionNo, string site)
        {
            return await _db.HrmVewLeaveDeducitons
                .Where(u => u.TransactionNo == transactionNo && u.Site == site)
                .OrderBy(o => o.RecNo)
                .ToListAsync();
        }

        public async Task DeleteLeaveDeductionsChildAsync(int transactionNo, string site)
        {
            await _db.Database.ExecuteSqlRawAsync(
                "DELETE FROM HRM_LeaveDeductions_Child WHERE TransactionNo={0} AND Site={1}", transactionNo, site);
        }

        public async Task<decimal> GetLeaveDeductionsInfoAsync(int empCardNo, DateTime clearanceDate, string site)
        {
            return await _db.HrmVewLeaveDeducitons
                .Where(u => u.EmpCardNo == empCardNo && u.TransactionDate.HasValue && 
                            u.TransactionDate.Value.Month == clearanceDate.Month && 
                            u.TransactionDate.Value.Year == clearanceDate.Year && u.Site == site)
                .Select(temp => temp.Leaves ?? 0)
                .FirstOrDefaultAsync();
        }
    }
}
