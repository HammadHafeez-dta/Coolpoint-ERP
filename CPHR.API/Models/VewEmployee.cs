using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class VewEmployee
{
    public int EmpCardNo { get; set; }

    public string? EmpName { get; set; }

    public string? FirstName { get; set; }

    public string? MiddleName { get; set; }

    public string? LastName { get; set; }

    public string? EmpFatherName { get; set; }

    public int? DeptCode { get; set; }

    public string? DepartmentName { get; set; }

    public int? DesgCode { get; set; }

    public string? Qualification { get; set; }

    public string? Experience { get; set; }

    public string? Address { get; set; }

    public string? Remarks { get; set; }

    public string? Email { get; set; }

    public string? Cnic { get; set; }

    public string? Sex { get; set; }

    public string? Shift { get; set; }

    public DateTime? BirthDate { get; set; }

    public DateTime? JoiningDate { get; set; }

    public string? PhoneNo { get; set; }

    public string? EmergencyNo { get; set; }

    public bool? IsEobi { get; set; }

    public string? EobiNo { get; set; }

    public bool? IsSs { get; set; }

    public string? SsNo { get; set; }

    public string? RestDay { get; set; }

    public bool? IsOverTime { get; set; }

    public string? EnterBy { get; set; }

    public bool? StuckOff { get; set; }

    public DateTime? StuckOffDate { get; set; }

    public bool? Status { get; set; }

    public DateTime? ResignDate { get; set; }

    public decimal? GrossPay { get; set; }

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

    public decimal? NetPay { get; set; }

    public string Site { get; set; } = null!;

    public string? LeftType { get; set; }

    public string? InTime { get; set; }

    public string? OutTime { get; set; }

    public string? ReportingTiming { get; set; }

    public decimal? WorkingHours { get; set; }

    public string? BankAccount { get; set; }

    public byte[]? EmpPicture { get; set; }

    public string? DesignationName { get; set; }

    public int? Grade { get; set; }

    public string? GradeName { get; set; }

    public decimal? MinimumSalary { get; set; }

    public decimal? MaximumSalary { get; set; }

    public string? Category { get; set; }

    public string? EmpStatus { get; set; }

    public string? PositionTitle { get; set; }

    public int? BankId { get; set; }

    public string? BankName { get; set; }

    public string? SalaryUnit { get; set; }

    public DateTime? ConfirmationDate { get; set; }

    public string? BloodGroup { get; set; }

    public string? MaritalStatus { get; set; }

    public string? ExtensionNo { get; set; }

    public string? Dependents { get; set; }

    public string? Certification { get; set; }

    public int? EmpOldCardNo { get; set; }

    public DateTime? OpeningDate { get; set; }

    public decimal? EobiOpening { get; set; }

    public decimal? SocialSecurityOpening { get; set; }

    public decimal? ProvidantFundOpening { get; set; }

    public string? Scale { get; set; }

    public int? LocationCode { get; set; }

    public bool? IsSalaryBlocked { get; set; }

    public string? Religion { get; set; }

    public decimal? SalLec { get; set; }

    public decimal? PfSchoolShare { get; set; }

    public decimal? EobiSchoolShare { get; set; }
}
