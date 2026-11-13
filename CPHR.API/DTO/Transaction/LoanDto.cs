using System;

namespace SaftHR.API.DTO.Transaction
{
    public class LoanDto
    {
        public int TransactionNo { get; set; }
        public DateTime TransactionDate { get; set; }
        public int EmpCardNo { get; set; }
        public string? LoanType { get; set; }
        public decimal LoanAmount { get; set; }
        public decimal InstalmentAmount { get; set; }
        public string? Status { get; set; }
        public decimal Instalments { get; set; }
        public DateTime StartingMonth { get; set; }
        
        public string? EmpName { get; set; }
        public string? DesignationName { get; set; }
        public string? DepartmentName { get; set; }
    }

    public class LoanDeductionDto
    {
        public int TransactionNo { get; set; }
        public DateTime TransactionDate { get; set; }
        public int EmpCardNo { get; set; }
        public int LoanTransactionNo { get; set; }
        public decimal LoanDeductionAmount { get; set; }
        public string? DeductionType { get; set; }
    }

    public class LoanLedgerDto
    {
        public int SerialNo { get; set; }
        public int LoanTransactionNo { get; set; }
        public int EmpCardNo { get; set; }
        public DateTime InstalmentMonth { get; set; }
        public decimal InstalmentAmount { get; set; }
        public string? IsPaid { get; set; }
    }

    public class LoanReturnDto
    {
        public int TransactionNo { get; set; }
        public DateTime TransactionDate { get; set; }
        public int EmpCardNo { get; set; }
        public string? LoanType { get; set; }
        public decimal LoanAmount { get; set; }
        public string? Status { get; set; }
        public decimal ReturnAmount { get; set; }
    }
}
