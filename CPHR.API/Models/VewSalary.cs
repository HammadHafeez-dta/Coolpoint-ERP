using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class VewSalary
{
    public int EmpCardNo { get; set; }

    public int SalaryMonth { get; set; }

    public string Site { get; set; } = null!;

    public int SalaryYear { get; set; }

    public DateTime? SalaryDate { get; set; }

    public decimal? Salary { get; set; }

    public decimal? Days { get; set; }

    public decimal? DaysAmount { get; set; }

    public string? Remarks { get; set; }

    public decimal? BasicPay { get; set; }

    public decimal? A01 { get; set; }

    public decimal? A02 { get; set; }

    public decimal? A03 { get; set; }

    public decimal? A04 { get; set; }

    public decimal? A05 { get; set; }

    public decimal? A06 { get; set; }

    public decimal? A07 { get; set; }

    public decimal? A08 { get; set; }

    public decimal? A09 { get; set; }

    public decimal? A10 { get; set; }

    public decimal? A11 { get; set; }

    public decimal? A12 { get; set; }

    public decimal? GrossPay { get; set; }

    public decimal? D01 { get; set; }

    public decimal? D02 { get; set; }

    public decimal? D03 { get; set; }

    public decimal? D04 { get; set; }

    public decimal? D05 { get; set; }

    public decimal? D06 { get; set; }

    public decimal? D07 { get; set; }

    public decimal? D08 { get; set; }

    public decimal? D09 { get; set; }

    public decimal? D10 { get; set; }

    public decimal? D11 { get; set; }

    public decimal? D12 { get; set; }

    public decimal? D13 { get; set; }

    public decimal? D14 { get; set; }

    public decimal? NetPay { get; set; }

    public decimal? TotalDeductions { get; set; }

    public DateTime? EnteryTime { get; set; }

    public DateTime? EditTime { get; set; }

    public string? EnterBy { get; set; }

    public string? EditBy { get; set; }

    public string? EmpName { get; set; }

    public string? EmpFatherName { get; set; }

    public int? DeptCode { get; set; }

    public string? DepartmentName { get; set; }

    public int? DesgCode { get; set; }

    public string? Qualification { get; set; }

    public string? DesignationName { get; set; }

    public string? Shift { get; set; }

    public DateTime? JoiningDate { get; set; }

    public string? Category { get; set; }

    public string? RestDay { get; set; }

    public bool? Status { get; set; }

    public bool? StuckOff { get; set; }

    public DateTime? StuckOffDate { get; set; }

    public DateTime? ResignDate { get; set; }

    public int? Grade { get; set; }

    public string? LeftType { get; set; }

    public string? BankAccount { get; set; }

    public decimal? WorkingHours { get; set; }

    public string? EobiNo { get; set; }

    public DateTime? BirthDate { get; set; }

    public string? Cnic { get; set; }

    public string? Email { get; set; }

    public string? GradeName { get; set; }

    public decimal? OverTimeDays { get; set; }

    public decimal? OverTimeAmount { get; set; }

    public decimal? OtherDays { get; set; }

    public decimal? OtherAmount { get; set; }

    public string? Address { get; set; }

    public string? PositionTitle { get; set; }

    public decimal? TotalLate { get; set; }

    public decimal? LateDeduction { get; set; }

    public decimal? LongTermLoanBalance { get; set; }

    public decimal? ProvidentFundLoanBalance { get; set; }

    public decimal? TotalProvidentFund { get; set; }

    public decimal? LeaveDeducted { get; set; }

    public decimal? LeaveDeductionAmount { get; set; }

    public string? Scale { get; set; }

    public decimal? A13 { get; set; }

    public bool? SalaryCreated { get; set; }

    public decimal? PfSchoolShare { get; set; }

    public decimal? EobiSchoolShare { get; set; }
}
