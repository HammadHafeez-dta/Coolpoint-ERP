using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SaftHR.API.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SaftHR.API.Controller.Transaction
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class LeaveApprovalController : ControllerBase
    {
        private readonly HRMSDbContext _db;

        public LeaveApprovalController(HRMSDbContext db)
        {
            _db = db;
        }

        // Resolves the active site from JWT site claim or falls back to query param / headers
        private string ResolveSite(string? querySite = null)
        {
            var claimSite = User.FindFirst("Site")?.Value;
            return !string.IsNullOrWhiteSpace(claimSite) ? claimSite
                 : !string.IsNullOrWhiteSpace(querySite) ? querySite
                 : "SAFT";
        }

        // LeaveApprovalList DTO
        public class LeaveApprovalListDto
        {
            public long SerialNo { get; set; }
            public int ApplicationNo { get; set; }
            public int EmpCardNo { get; set; }
            public string EmpName { get; set; } = "";
            public string LeaveType { get; set; } = "";
            public DateTime? LeaveDate { get; set; }
            public DateTime? FromDate { get; set; }
            public DateTime? ToDate { get; set; }
            public decimal TotalLeaves { get; set; }
            public string LeaveName { get; set; } = "";
            public string LeaveApprovalStatus { get; set; } = "";
        }

        // LeaveApprovalDetail DTO
        public class LeaveApprovalDetailDto
        {
            public int ApplicationNo { get; set; }
            public DateTime ApplicationDate { get; set; }
            public int EmpCardNo { get; set; }
            public string EmpName { get; set; } = "";
            public string FatherName { get; set; } = "";
            public string DepartmentName { get; set; } = "";
            public string DesignationName { get; set; } = "";
            public DateTime? JoiningDate { get; set; }
            public string LeaveType { get; set; } = "";
            public string LeaveName { get; set; } = "";
            public DateTime? FromDate { get; set; }
            public DateTime? ToDate { get; set; }
            public decimal TotalLeaves { get; set; }
            public string Remarks { get; set; } = "";
            public LeaveBalanceDto Balances { get; set; } = new LeaveBalanceDto();
        }

        public class LeaveBalanceDto
        {
            public int EmpCardNo { get; set; }
            public decimal AlBalance { get; set; }
            public decimal ClBalance { get; set; }
            public decimal SlBalance { get; set; }
            public decimal CplBalance { get; set; }
            public string Site { get; set; } = "";
        }

        public class LeaveApprovalActionDto
        {
            public int ApplicationNo { get; set; }
            public int EmpCardNo { get; set; }
            public bool Approved { get; set; }
            public bool Rejected { get; set; }
        }

        [HttpGet]
        public async Task<IActionResult> GetLeaves([FromQuery] string status, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate, [FromQuery] string? search, [FromQuery] string? site = null)
        {
            var resolvedSite = ResolveSite(site);
            var query = _db.HrmVewLeaves.AsNoTracking().Where(u => u.Site == resolvedSite);

            query = SaftHR.API.Services.LeaveApprovalQueries.Filter(query, status, fromDate, toDate);

            var results = await query.ToListAsync();

            // Map and load leave names
            var leaveTypes = await _db.HrmLeaveTypes.ToDictionaryAsync(t => t.LeaveType, t => t.LeaveName ?? "");

            var mappedList = results.Select(temp => new LeaveApprovalListDto
            {
                SerialNo = temp.SerialNo,
                ApplicationNo = temp.ApplicationNo,
                EmpCardNo = temp.EmpCardNo ?? 0,
                EmpName = temp.EmpName ?? "",
                LeaveType = temp.LeaveType ?? "",
                LeaveDate = temp.ApplicationDate,
                FromDate = temp.FromDate,
                ToDate = temp.ToDate,
                TotalLeaves = temp.TotalLeaves ?? 0,
                LeaveName = (temp.LeaveType != null && leaveTypes.ContainsKey(temp.LeaveType)) ? leaveTypes[temp.LeaveType] : "",
                LeaveApprovalStatus = string.IsNullOrWhiteSpace(temp.LeaveApprovalStatus) ? "Pending" : temp.LeaveApprovalStatus
            });

            if (!string.IsNullOrEmpty(search))
            {
                mappedList = mappedList.Where(u => u.EmpName.Contains(search, StringComparison.OrdinalIgnoreCase) || 
                                                   u.EmpCardNo.ToString().Contains(search) || 
                                                   u.ApplicationNo.ToString().Contains(search));
            }

            return Ok(mappedList.ToList());
        }

        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingLeaves([FromQuery] string? site = null)
        {
            return await GetLeaves("Pending", null, null, null, site);
        }

        [HttpGet("{applicationNo}/{empCardNo}")]
        public async Task<IActionResult> GetLeaveDetail(int applicationNo, int empCardNo, [FromQuery] string? site = null)
        {
            var resolvedSite = ResolveSite(site);
            var item = await _db.HrmVewLeaves
                .FirstOrDefaultAsync(u => u.ApplicationNo == applicationNo && u.EmpCardNo == empCardNo && u.Site == resolvedSite);

            if (item == null) return NotFound();

            var leaveTypes = await _db.HrmLeaveTypes.ToDictionaryAsync(t => t.LeaveType, t => t.LeaveName ?? "");
            
            // Join with employee define to get father name, joining date, etc.
            var empInfo = await _db.Employees
                .Where(e => e.EmpCardNo == empCardNo && e.Site == resolvedSite)
                .Select(e => new { e.EmpFatherName, e.JoiningDate })
                .FirstOrDefaultAsync();

            // Get dept and designation name
            var deptName = await _db.Departments.Where(d => d.DepartmentCode == item.DeptCode && d.Site == resolvedSite).Select(d => d.DepartmentName).FirstOrDefaultAsync() ?? "";
            
            // Let's retrieve designation from employee record
            var desigName = await _db.Employees
                .Where(e => e.EmpCardNo == empCardNo && e.Site == resolvedSite)
                .Join(_db.Designations, e => e.DesgCode, d => d.DesignationCode, (e, d) => d.DesignationName)
                .FirstOrDefaultAsync() ?? "";

            // Get Balances
            var balView = await _db.HrmVewLeaveBalances.FirstOrDefaultAsync(u => u.EmpCardNo == empCardNo);

            var detail = new LeaveApprovalDetailDto
            {
                ApplicationNo = item.ApplicationNo,
                ApplicationDate = item.ApplicationDate ?? DateTime.Now,
                EmpCardNo = item.EmpCardNo ?? 0,
                EmpName = item.EmpName ?? "",
                FatherName = empInfo?.EmpFatherName ?? item.EmpFatherName ?? "",
                DepartmentName = deptName,
                DesignationName = desigName,
                JoiningDate = empInfo?.JoiningDate,
                LeaveType = item.LeaveType ?? "",
                LeaveName = (item.LeaveType != null && leaveTypes.ContainsKey(item.LeaveType)) ? leaveTypes[item.LeaveType] : "",
                FromDate = item.FromDate,
                ToDate = item.ToDate,
                TotalLeaves = item.TotalLeaves ?? 0,
                Remarks = item.Remarks ?? "",
                Balances = new LeaveBalanceDto
                {
                    EmpCardNo = empCardNo,
                    AlBalance = balView?.AlBalance ?? 0,
                    ClBalance = balView?.ClBalance ?? 0,
                    SlBalance = balView?.SlBalance ?? 0,
                    CplBalance = balView?.CplBalance ?? 0,
                    Site = resolvedSite
                }
            };

            return Ok(detail);
        }

        [HttpGet("balance/{empCardNo}")]
        public async Task<IActionResult> GetEmployeeBalance(int empCardNo, [FromQuery] string? site = null)
        {
            var resolvedSite = ResolveSite(site);
            var balView = await _db.HrmVewLeaveBalances.FirstOrDefaultAsync(u => u.EmpCardNo == empCardNo);

            var balance = new LeaveBalanceDto
            {
                EmpCardNo = empCardNo,
                AlBalance = balView?.AlBalance ?? 0,
                ClBalance = balView?.ClBalance ?? 0,
                SlBalance = balView?.SlBalance ?? 0,
                CplBalance = balView?.CplBalance ?? 0,
                Site = resolvedSite
            };

            return Ok(balance);
        }

        [HttpPost("update-status")]
        public async Task<IActionResult> UpdateStatus([FromBody] LeaveApprovalActionDto action, [FromQuery] string? site = null)
        {
            var resolvedSite = ResolveSite(site);
            var record = await _db.HrmLeaveChildren
                .FirstOrDefaultAsync(u => u.ApplicationNo == action.ApplicationNo && u.EmpCardNo == action.EmpCardNo && u.Site == resolvedSite);

            if (record == null) return NotFound();

            if (action.Approved)
            {
                record.LeaveApprovalStatus = "Approved";
            }
            else if (action.Rejected)
            {
                record.LeaveApprovalStatus = "Rejected";
            }

            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete("{applicationNo:int}/{empCardNo:int}")]
        public async Task<IActionResult> DeleteLeaveRequest(int applicationNo, int empCardNo, [FromQuery] string? site = null)
        {
            var resolvedSite = ResolveSite(site);
            await using var transaction = await _db.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);

            var records = await _db.HrmLeaveChildren
                .Where(u => u.ApplicationNo == applicationNo && u.EmpCardNo == empCardNo && u.Site == resolvedSite)
                .ToListAsync();

            if (records.Count == 0) return NotFound();

            if (records.Any(u => u.ShortLeaveDeducted == true))
            {
                return Conflict(new { message = "This leave cannot be deleted because payroll has already deducted it." });
            }

            var registerEntries = await _db.HrmLeaveRegisters
                .Where(u => u.ApplicationNo == applicationNo && u.EmpCardNo == empCardNo && u.Site == resolvedSite)
                .ToListAsync();

            _db.HrmLeaveRegisters.RemoveRange(registerEntries);
            _db.HrmLeaveChildren.RemoveRange(records);
            await _db.SaveChangesAsync();

            var hasRemainingRequests = await _db.HrmLeaveChildren
                .AnyAsync(u => u.ApplicationNo == applicationNo && u.Site == resolvedSite);
            if (!hasRemainingRequests)
            {
                var master = await _db.HrmLeaveMasters
                    .FirstOrDefaultAsync(u => u.ApplicationNo == applicationNo && u.Site == resolvedSite);
                if (master != null)
                {
                    _db.HrmLeaveMasters.Remove(master);
                    await _db.SaveChangesAsync();
                }
            }

            await transaction.CommitAsync();
            return NoContent();
        }
    }
}
