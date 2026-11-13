using System;

namespace SaftHR.API.DTO.Transaction
{
    public class FinalSettlementDto
    {
        public int TransactionNo { get; set; }
        public DateTime TransactionDate { get; set; }
        public int EmpCardNo { get; set; }
        public string? EmpName { get; set; }
        public string? Department { get; set; }
        public string? Designation { get; set; }
        public string? EmpFatherName { get; set; }
        public string? CNIC { get; set; }
        public DateTime JoiningDate { get; set; }
        
        public decimal GrossPay { get; set; }
        public decimal BasicPay { get; set; }
        
        public string? LeavingType { get; set; }
        public DateTime LeavingDate { get; set; }
        
        public decimal SalaryDays { get; set; }
        public DateTime SalaryMonth { get; set; }
        public decimal SalaryAmount { get; set; }
        public decimal OverTimeHours { get; set; }
        public decimal OverTimeAmount { get; set; }
        
        public decimal TotalSalary { get; set; }
        public decimal OtherPayable { get; set; }
        
        public decimal GraduityPercent { get; set; }
        public decimal GraduityDays { get; set; }
        public decimal GraduityAmount { get; set; }
        
        public decimal LeavesPayable { get; set; }
        public string? LeavesType { get; set; }
        public decimal LeavesAmount { get; set; }
        
        public decimal NoticeDays { get; set; }
        public decimal NoticeDaysAmount { get; set; }
        
        public decimal IncomeTax { get; set; }
        public decimal SalaryAdvance { get; set; }
        public decimal LoanAdvance { get; set; }
        public decimal EOBI { get; set; }
        public decimal OtherDeductions { get; set; }
        public decimal PayableAmount { get; set; }
        
        public decimal ProvidentFund { get; set; }
        public decimal ProvidentFundProfit { get; set; }
        public decimal MobileAllowance { get; set; }
        public decimal FuelAllowance { get; set; }
        public decimal FabricLoan { get; set; }
        public decimal VehicleLoan { get; set; }
        public decimal Commission { get; set; }
    }
}
