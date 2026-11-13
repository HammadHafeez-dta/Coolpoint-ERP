using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class Employee
{
    public int EmpCardNo { get; set; }

    public string Site { get; set; } = null!;

    public int? EmpOldCardNo { get; set; }

    public byte[]? EmpPicture { get; set; }

    public string? EmpName { get; set; }

    public string? FirstName { get; set; }

    public string? MiddleName { get; set; }

    public string? LastName { get; set; }

    public string? EmpFatherName { get; set; }

    public string? EmpPrefix { get; set; }

    public int? LocationCode { get; set; }

    public string? Unit { get; set; }

    public string? City { get; set; }

    public string? Region { get; set; }

    public string? SalaryUnit { get; set; }

    public int? DeptCode { get; set; }

    public int? DesgCode { get; set; }

    public int? GradeId { get; set; }

    public string? Section { get; set; }

    public string? PositionTitle { get; set; }

    public string? EmpStatus { get; set; }

    public string? Category { get; set; }

    public string? Qualification { get; set; }

    public string? Certification { get; set; }

    public string? Experience { get; set; }

    public string? Experience2 { get; set; }

    public string? Address { get; set; }

    public string? TemporaryAddress { get; set; }

    public string? Remarks { get; set; }

    public string? Email { get; set; }

    public string? EmailPersonal { get; set; }

    public string? InTime { get; set; }

    public string? OutTime { get; set; }

    public string? ReportingTiming { get; set; }

    public decimal? WorkingHours { get; set; }

    public string? Cnic { get; set; }

    public string? Sex { get; set; }

    public string? Shift { get; set; }

    public DateTime? BirthDate { get; set; }

    public DateTime? JoiningDate { get; set; }

    public DateTime? ConfirmationDate { get; set; }

    public DateTime? ContractExpiryDate { get; set; }

    public DateTime? CardExpiryDate { get; set; }

    public string? BloodGroup { get; set; }

    public string? MaritalStatus { get; set; }

    public int? BankId { get; set; }

    public string? BankAccount { get; set; }

    public string? PhoneNo { get; set; }

    public string? EmergencyNo { get; set; }

    public string? ExtensionNo { get; set; }

    public string? Dependents { get; set; }

    public bool? IsEobi { get; set; }

    public string? EobiNo { get; set; }

    public bool? IsSs { get; set; }

    public string? SsNo { get; set; }

    public string? RestDay { get; set; }

    public bool? IsOverTime { get; set; }

    public bool? IsCompliance { get; set; }

    public int? RelaxationTime { get; set; }

    public bool? StuckOff { get; set; }

    public DateTime? StuckOffDate { get; set; }

    public bool? Status { get; set; }

    public string? LeftType { get; set; }

    public DateTime? ResignDate { get; set; }

    public string? EnterBy { get; set; }

    public DateTime? EnteryTime { get; set; }

    public string? EditBy { get; set; }

    public DateTime? EditTime { get; set; }

    public string? Scale { get; set; }

    public bool? IsSalaryBlocked { get; set; }

    public string? Religion { get; set; }
}
