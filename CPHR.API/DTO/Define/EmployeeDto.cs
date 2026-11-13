namespace SaftHR.API.DTO.Define
{
    public class EmployeeRequestDto
    {
        public int EmpCardNo { get; set; }
        public int EmpOldCardNo { get; set; }
        public string EmpName { get; set; } = "";
        public string? FirstName { get; set; }
        public string? MiddleName { get; set; }
        public string? LastName { get; set; }
        public string EmpFatherName { get; set; } = "";
        public string EmpCategory { get; set; } = "";
        public int? LocationCode { get; set; }
        public string? Unit { get; set; }
        public string? City { get; set; }
        public string? Region { get; set; }
        public string? EmpPrefix { get; set; }
        public string SalaryUnit { get; set; } = "";
        public int DepartmentCode { get; set; }
        public int DesignationCode { get; set; }
        public int? GradeID { get; set; }
        public string? Section { get; set; }
        public string? Religion { get; set; }
        public string PositionTitle { get; set; } = "";
        public string Qualification { get; set; } = "";
        public string Certification { get; set; } = "";
        public string Experience { get; set; } = "";
        public string? Experience2 { get; set; }
        public string Address { get; set; } = "";
        public string? TemporaryAddress { get; set; }
        public string Remarks { get; set; } = "";
        public string Email { get; set; } = "";
        public string? EmailPersonal { get; set; }
        public string InTime { get; set; } = "";
        public string OutTime { get; set; } = "";
        public string ReportingTiming { get; set; } = "";
        public decimal WorkingHours { get; set; }
        public string EmpSex { get; set; } = "";
        public string EmpCNIC { get; set; } = "";
        public string EmpShift { get; set; } = "";
        public DateTime BirthDate { get; set; }
        public DateTime JoiningDate { get; set; }
        public DateTime ConfirmationDate { get; set; }
        public DateTime? ContractExpiryDate { get; set; }
        public DateTime? CardExpiryDate { get; set; }
        public bool ClearContractExpiryDate { get; set; }
        public bool ClearCardExpiryDate { get; set; }
        public string BloodGroup { get; set; } = "";
        public string MaritalStatus { get; set; } = "";
        public int BankID { get; set; }
        public string BankAccount { get; set; } = "";
        public string EmpType { get; set; } = "";
        public string PhoneNo { get; set; } = "";
        public string EmergencyNo { get; set; } = "";
        public string ExtensionNo { get; set; } = "";
        public string Dependents { get; set; } = "";
        public bool IsEOBI { get; set; }
        public string EOBINo { get; set; } = "";
        public bool IsSS { get; set; }
        public string SSNo { get; set; } = "";
        public string RestDay { get; set; } = "";
        public bool OverTime { get; set; }
        public bool? IsCompliance { get; set; }
        public int? RelaxationTime { get; set; }
        public bool Status { get; set; }
        public byte[]? EmpPicture { get; set; }
        public string Scale { get; set; } = "";
    }

    public class EmployeeResponseDto
    {
        public int EmpCardNo { get; set; }
        public int EmpOldCardNo { get; set; }
        public string EmpName { get; set; } = "";
        public string? FirstName { get; set; }
        public string? MiddleName { get; set; }
        public string? LastName { get; set; }
        public string EmpFatherName { get; set; } = "";
        public string EmpCategory { get; set; } = "";
        public int LocationCode { get; set; }
        public string Unit { get; set; } = "";
        public string City { get; set; } = "";
        public string Region { get; set; } = "";
        public string EmpPrefix { get; set; } = "";
        public string SalaryUnit { get; set; } = "";
        public int DepartmentCode { get; set; }
        public string DepartmentName { get; set; } = "";
        public int DesignationCode { get; set; }
        public string DesignationName { get; set; } = "";
        public string? Religion { get; set; }
        public string PositionTitle { get; set; } = "";
        public string Qualification { get; set; } = "";
        public string Certification { get; set; } = "";
        public string Experience { get; set; } = "";
        public string Experience2 { get; set; } = "";
        public string Address { get; set; } = "";
        public string TemporaryAddress { get; set; } = "";
        public string Remarks { get; set; } = "";
        public string Email { get; set; } = "";
        public string EmailPersonal { get; set; } = "";
        public string InTime { get; set; } = "";
        public string OutTime { get; set; } = "";
        public string ReportingTiming { get; set; } = "";
        public decimal WorkingHours { get; set; }
        public string EmpSex { get; set; } = "";
        public string EmpCNIC { get; set; } = "";
        public string EmpShift { get; set; } = "";
        public DateTime BirthDate { get; set; }
        public DateTime JoiningDate { get; set; }
        public DateTime ConfirmationDate { get; set; }
        public DateTime? ContractExpiryDate { get; set; }
        public DateTime? CardExpiryDate { get; set; }
        public string BloodGroup { get; set; } = "";
        public string MaritalStatus { get; set; } = "";
        public int BankID { get; set; }
        public string BankName { get; set; } = "";
        public string BankAccount { get; set; } = "";
        public string EmpType { get; set; } = "";
        public string PhoneNo { get; set; } = "";
        public string EmergencyNo { get; set; } = "";
        public string ExtensionNo { get; set; } = "";
        public string Dependents { get; set; } = "";
        public bool IsEOBI { get; set; }
        public string EOBINo { get; set; } = "";
        public bool IsSS { get; set; }
        public string SSNo { get; set; } = "";
        public string RestDay { get; set; } = "";
        public bool OverTime { get; set; }
        public bool IsCompliance { get; set; }
        public int RelaxationTime { get; set; }
        public bool Status { get; set; }
        public string Section { get; set; } = "";
        public string Scale { get; set; } = "";
        public string LeftType { get; set; } = "";
        public bool StruckOff { get; set; }
        public DateTime StruckOffDate { get; set; }
        public int GradeID { get; set; }
        public string Grade { get; set; } = "";
        public decimal GrossPay { get; set; }
        public bool IsSalaryBlocked { get; set; }
        public byte[]? EmpPicture { get; set; }
    }

    public class EmployeeSalaryDto
    {
        public int EmpCardNo { get; set; }
        public decimal GrossPay { get; set; }
        public decimal BasicPay { get; set; }
        public decimal SalLec { get; set; }
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
        public decimal? D12 { get; set; }
        public decimal NetPay { get; set; }
        public decimal PFSchoolShare { get; set; }
        public decimal EOBISchoolShare { get; set; }
    }

    public class EmployeeSalaryIncrementDto
    {
        public int EmpCardNo { get; set; }
        public DateTime IncrementDate { get; set; }
        public decimal Increment { get; set; }
        public decimal OldBasicPay { get; set; }
        public decimal BasicPay { get; set; }
        public decimal A01 { get; set; }
        public decimal A10 { get; set; }
        public decimal D01 { get; set; }
        public decimal OldGrossPay { get; set; }
        public decimal GrossPay { get; set; }
    }

    public class EmployeeOpeningBalancesDto
    {
        public int EmpCardNo { get; set; }
        public DateTime OpeningDate { get; set; }
        public decimal EOBIOpening { get; set; }
        public decimal SSOpening { get; set; }
        public decimal PFundOpening { get; set; }
    }

    public class EmployeeStruckOffDto
    {
        public int EmpCardNo { get; set; }
        public string LeftType { get; set; } = "";
        public bool StruckOff { get; set; }
        public DateTime StruckOffDate { get; set; }
        public bool Deactivate { get; set; }
    }

    public class EmployeeTimingsDto
    {
        public int DepartmentCode { get; set; }
        public string InTime { get; set; } = "";
        public string OutTime { get; set; } = "";
        public string ReportingTiming { get; set; } = "";
        public int WorkingHours { get; set; }
    }

    public class EmployeeRestDayDto
    {
        public int DepartmentCode { get; set; }
        public string RestDay { get; set; } = "";
    }

    public class EmployeeSalaryBlockDto
    {
        public int EmpCardNo { get; set; }
        public bool IsSalaryBlocked { get; set; }
    }

    public class EmployeeListRequestDto
    {
        public string Type { get; set; } = "";
        public int Id { get; set; }
        public string Name { get; set; } = "";
    }

    public class ContractExpiryAlertDto
    {
        public int EmpCardNo { get; set; }
        public string EmpName { get; set; } = "";
        public string EmpStatus { get; set; } = "";
        public DateTime JoiningDate { get; set; }
        public DateTime ExpiryDate { get; set; }
        public int DaysRemaining { get; set; }
        public string DepartmentName { get; set; } = "";
        public string DesignationName { get; set; } = "";
    }
}
