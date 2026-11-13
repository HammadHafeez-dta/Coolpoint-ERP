using System;

namespace SaftHR.API.DTO.Transaction
{
    // ── Monthly Salary ────────────────────────────────────────────────────────
    public class SalaryDto
    {
        public int EmpCardNo { get; set; }
        public int SalaryMonth { get; set; }
        public int SalaryYear { get; set; }
        public DateTime SalaryDate { get; set; }
        public decimal Salary { get; set; }
        
        public decimal TotalDays { get; set; }
        public decimal DaysAmount { get; set; }
        
        public decimal OverTimeDays { get; set; }
        public decimal OverTimeAmount { get; set; }
        
        public decimal OtherDays { get; set; }
        public decimal OtherAmount { get; set; }
        public decimal LdlcDays { get; set; }
        public decimal LdlcAmount { get; set; }
        
        public decimal TotalLate { get; set; }
        public decimal LateDeduction { get; set; }
        
        public decimal LongTermLoanBalance { get; set; }
        public decimal ProvidentFundLoanBalance { get; set; }
        
        public decimal BasicPay { get; set; }
        public decimal A01 { get; set; }
        public decimal A02 { get; set; }
        public decimal A03 { get; set; }
        public decimal A04 { get; set; }
        public decimal A05 { get; set; }
        public decimal A06 { get; set; }
        public decimal A07 { get; set; }
        public decimal A08 { get; set; }
        public decimal A09 { get; set; }
        public decimal A10 { get; set; }
        public decimal A11 { get; set; }
        public decimal A12 { get; set; }
        public decimal A13 { get; set; }
        
        public decimal GrossPay { get; set; }
        
        public decimal D01 { get; set; }
        public decimal D02 { get; set; }
        public decimal D03 { get; set; }
        public decimal D04 { get; set; }
        public decimal D05 { get; set; }
        public decimal D06 { get; set; }
        public decimal D07 { get; set; }
        public decimal D08 { get; set; }
        public decimal D09 { get; set; }
        public decimal D10 { get; set; }
        public decimal D11 { get; set; }
        
        public decimal PFSchoolShare { get; set; }
        public decimal EOBISchoolShare { get; set; }
        
        public decimal LeaveDeductions { get; set; }
        public decimal LeaveDeductionsAmount { get; set; }
        
        public decimal NetSalary { get; set; }
        public decimal TotalProvidentFund { get; set; }
        public decimal TotalDeductions { get; set; }
        
        public string? Scale { get; set; }
    }

    // ── Evening Salary ────────────────────────────────────────────────────────
    public class EveningSalaryMasterDto
    {
        public int TransactionNo { get; set; }
        public DateTime TransactionDate { get; set; }
    }

    public class EveningSalaryChildDto
    {
        public int TransactionNo { get; set; }
        public int EmpCardNo { get; set; }
        public string? Name { get; set; }
        public string? FatherName { get; set; }
        public string? DesignationName { get; set; }
        public string? DepartmentName { get; set; }
        public decimal Days { get; set; }
        public decimal Rate { get; set; }
        public decimal Amount { get; set; }
        public decimal Arrears { get; set; }
        public decimal Deduction { get; set; }
        public decimal NetPay { get; set; }
    }

    // ── Special Allowance ─────────────────────────────────────────────────────
    public class SpecialAllowanceMasterDto
    {
        public int TransactionNo { get; set; }
        public DateTime TransactionDate { get; set; }
    }

    public class SpecialAllowanceChildDto
    {
        public int TransactionNo { get; set; }
        public int EmpCardNo { get; set; }
        public string? Name { get; set; }
        public string? FatherName { get; set; }
        public string? DesignationName { get; set; }
        public string? DepartmentName { get; set; }
        public decimal Allowance { get; set; }
        public decimal Arrears { get; set; }
        public decimal Deduction { get; set; }
        public decimal NetPay { get; set; }
    }

    // ── OverTime ──────────────────────────────────────────────────────────────
    public class OverTimeMasterDto
    {
        public int OverTimeNo { get; set; }
        public DateTime OverTimeDate { get; set; }
        public bool OverTimeGazetted { get; set; }
    }

    public class OverTimeChildDto
    {
        public int OverTimeNo { get; set; }
        public int EmpCardNo { get; set; }
        public DateTime FromTime { get; set; }
        public DateTime ToTime { get; set; }
        public decimal OverTimeHours { get; set; }
        public decimal OverTimeAmount { get; set; }
    }

    // ── Update Salary Breakup ─────────────────────────────────────────────────
    public class UpdateSalaryBreakupMasterDto
    {
        public int TransactionNo { get; set; }
        public DateTime TransactionDate { get; set; }
    }

    public class UpdateSalaryBreakupChildDto
    {
        public int TransactionNo { get; set; }
        public int EmpCardNo { get; set; }
        public string? Name { get; set; }
        
        public decimal BasicPay { get; set; }
        public decimal twentyPerc { get; set; }
        public decimal HouseRent { get; set; }
        public decimal ThirtyFivePerc { get; set; }
        public decimal Conveyance { get; set; }
        public decimal ADH1 { get; set; }
        public decimal ADH2 { get; set; }
        public decimal ADH3 { get; set; }
        public decimal Allowance { get; set; }
        public decimal twentyPerc1 { get; set; }
        public decimal ProvidentFund { get; set; }
        public decimal EOBI { get; set; }
        
        public decimal GrossPay { get; set; }
        public decimal allowances { get; set; }
        
        public decimal D_Advance { get; set; }
        public decimal D_EOBI { get; set; }
        public decimal D_Loan { get; set; }
        public decimal D_Lvs { get; set; }
        public decimal D_ProvidentFund { get; set; }
        public decimal D_Tax { get; set; }
        public decimal NetPay { get; set; }
        public decimal PfSchoolShare { get; set; }
        public decimal EobiSchoolShare { get; set; }
    }

    // ── Process Salary DTOs ───────────────────────────────────────────────────
    public class ProcessSalaryRequestDto
    {
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public int? EmployeeId { get; set; }
        public string ProcessType { get; set; } = "All"; // "All" | "CardWise"
        public bool IncludeTokenDeductions { get; set; }
        public bool IncludeOvertime { get; set; }
    }

    public class ProcessSalaryResultDto
    {
        public int Processed { get; set; }
        public int Failed { get; set; }
        public List<string> Logs { get; set; } = new();
        public bool Success { get; set; }
    }

    public class DeleteSalaryRequestDto
    {
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public int? EmployeeId { get; set; }
        public string ProcessType { get; set; } = "All"; // "All" | "CardWise"
    }

    public class DeleteSalaryResultDto
    {
        public bool Success { get; set; }
        public int DeletedCount { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
