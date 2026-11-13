using System;

namespace SaftHR.API.DTO.Transaction
{
    public class LeaveDeductionMasterDto
    {
        public int TransactionNo { get; set; }
        public DateTime TransactionDate { get; set; }
    }

    public class LeaveDeductionChildDto
    {
        public int TransactionNo { get; set; }
        public int EmpCardNo { get; set; }
        public string? Name { get; set; }
        public string? FatherName { get; set; }
        public string? DesignationName { get; set; }
        public string? DepartmentName { get; set; }
        public decimal LeavesDeducted { get; set; }
    }
}
