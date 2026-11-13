using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class HrmFinalSettlement
{
    public int TransactionNo { get; set; }

    public string Site { get; set; } = null!;

    public DateTime? TransactionDate { get; set; }

    public int? EmpCardNo { get; set; }

    public string? LeavingType { get; set; }

    public DateTime? LeavingDate { get; set; }

    public decimal? SalaryDays { get; set; }

    public DateTime? SalaryMonth { get; set; }

    public decimal? SalaryAmount { get; set; }

    public decimal? BadliDays { get; set; }

    public decimal? BadliAmount { get; set; }

    public decimal? OverTimeHours { get; set; }

    public decimal? OverTimeAmount { get; set; }

    public decimal? TotalSalary { get; set; }

    public decimal? GraduityPercent { get; set; }

    public decimal? GraduityDays { get; set; }

    public decimal? GraduityAmount { get; set; }

    public decimal? LeavesPayable { get; set; }

    public string? LeavesType { get; set; }

    public decimal? LeavesAmount { get; set; }

    public decimal? NoticeDays { get; set; }

    public decimal? NoticeAmount { get; set; }

    public decimal? SalaryAdvance { get; set; }

    public decimal? LoanAmount { get; set; }

    public decimal? Eobi { get; set; }

    public decimal? OtherPayable { get; set; }

    public decimal? PayableAmount { get; set; }

    public decimal? SalaryUnpaid { get; set; }

    public string? UnpaidSalaryMonths { get; set; }

    public string? LastPresent { get; set; }

    public decimal? OtherDeductions { get; set; }

    public string? EnterBy { get; set; }

    public DateTime? EnteryTime { get; set; }

    public string? EditBy { get; set; }

    public DateTime? EditTime { get; set; }

    public decimal? MobileAllowance { get; set; }

    public decimal? FuelAllowance { get; set; }

    public decimal? IncomeTax { get; set; }

    public decimal? FabricLoan { get; set; }

    public decimal? VehicleLoan { get; set; }

    public decimal? Commission { get; set; }

    public decimal? ProvidentFund { get; set; }

    public decimal? ProvidentFundProfit { get; set; }
}
