using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace SaftHR.API.Models;

public partial class HRMSDbContext : DbContext
{
    public HRMSDbContext(DbContextOptions<HRMSDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Absentee> Absentees { get; set; }

    public virtual DbSet<AttendanceRegister> AttendanceRegisters { get; set; }

    public virtual DbSet<Bank> Banks { get; set; }

    public virtual DbSet<DailyAttendance> DailyAttendances { get; set; }

    public virtual DbSet<Department> Departments { get; set; }

    public virtual DbSet<Designation> Designations { get; set; }

    public virtual DbSet<EmpOpeningBalance> EmpOpeningBalances { get; set; }

    public virtual DbSet<EmpSalary> EmpSalaries { get; set; }

    public virtual DbSet<Employee> Employees { get; set; }

    public virtual DbSet<GazettedLeaf> GazettedLeaves { get; set; }

    public virtual DbSet<Grade> Grades { get; set; }

    public virtual DbSet<HrmEveningSalaryChild> HrmEveningSalaryChildren { get; set; }

    public virtual DbSet<HrmEveningSalaryMaster> HrmEveningSalaryMasters { get; set; }

    public virtual DbSet<HrmFinalSettlement> HrmFinalSettlements { get; set; }

    public virtual DbSet<HrmEmployeeLogin> HrmEmployeeLogins { get; set; }

    public virtual DbSet<HrmRestDayMaster> HrmRestDayMasters { get; set; }

    public virtual DbSet<HrmRestDayChild> HrmRestDayChildren { get; set; }

    public virtual DbSet<HrmWeeklyRestDayMaster> HrmWeeklyRestDayMasters { get; set; }

    public virtual DbSet<HrmWeeklyRestDayChild> HrmWeeklyRestDayChildren { get; set; }

    public virtual DbSet<HrmDutyTimingMaster> HrmDutyTimingMasters { get; set; }

    public virtual DbSet<HrmDutyTimingChild> HrmDutyTimingChildren { get; set; }

    public virtual DbSet<HrmInTime> HrmInTimes { get; set; }

    public virtual DbSet<HrmLeaveApplication> HrmLeaveApplications { get; set; }

    public virtual DbSet<HrmLeaveChild> HrmLeaveChildren { get; set; }

    public virtual DbSet<HrmLeaveDeductionsChild> HrmLeaveDeductionsChildren { get; set; }

    public virtual DbSet<HrmLeaveDeductionsMaster> HrmLeaveDeductionsMasters { get; set; }

    public virtual DbSet<HrmLeaveMaster> HrmLeaveMasters { get; set; }

    public virtual DbSet<HrmLeaveRegister> HrmLeaveRegisters { get; set; }

    public virtual DbSet<HrmLeaveType> HrmLeaveTypes { get; set; }

    public virtual DbSet<HrmOutTime> HrmOutTimes { get; set; }

    public virtual DbSet<HrmPfLedger> HrmPfLedgers { get; set; }

    public virtual DbSet<HrmSalaryIncrement> HrmSalaryIncrements { get; set; }

    public virtual DbSet<HrmCategory> HrmCategories { get; set; }

    public virtual DbSet<HrmStatus> HrmStatuses { get; set; }

    public virtual DbSet<HrmScale> HrmScales { get; set; }

    public virtual DbSet<HrmShortLeave> HrmShortLeaves { get; set; }

    public virtual DbSet<HrmSpecialAllowanceChild> HrmSpecialAllowanceChildren { get; set; }

    public virtual DbSet<HrmSpecialAllowanceMaster> HrmSpecialAllowanceMasters { get; set; }

    public virtual DbSet<HrmTempAttendanceSummary> HrmTempAttendanceSummaries { get; set; }

    public virtual DbSet<HrmTempLateShortLeaveDetail> HrmTempLateShortLeaveDetails { get; set; }

    public virtual DbSet<HrmTempLeaveAbsentDetail> HrmTempLeaveAbsentDetails { get; set; }

    public virtual DbSet<HrmTempLeaveDetail> HrmTempLeaveDetails { get; set; }

    public virtual DbSet<HrmTempLoansBalance> HrmTempLoansBalances { get; set; }

    public virtual DbSet<HrmUpdateSalaryBreakupChild> HrmUpdateSalaryBreakupChildren { get; set; }

    public virtual DbSet<HrmUpdateSalaryBreakupMaster> HrmUpdateSalaryBreakupMasters { get; set; }

    public virtual DbSet<HrmVewEveningSalary> HrmVewEveningSalaries { get; set; }

    public virtual DbSet<HrmVewFinalSettlement> HrmVewFinalSettlements { get; set; }

    public virtual DbSet<HrmVewInTime> HrmVewInTimes { get; set; }

    public virtual DbSet<HrmVewLeaf> HrmVewLeaves { get; set; }

    public virtual DbSet<HrmVewLeaveApplication> HrmVewLeaveApplications { get; set; }

    public virtual DbSet<HrmVewLeaveBalance> HrmVewLeaveBalances { get; set; }

    public virtual DbSet<HrmVewLeaveDeduciton> HrmVewLeaveDeducitons { get; set; }

    public virtual DbSet<HrmVewLeaveRegister> HrmVewLeaveRegisters { get; set; }

    public virtual DbSet<HrmVewLeavesSum> HrmVewLeavesSums { get; set; }

    public virtual DbSet<HrmVewLoanDeduction> HrmVewLoanDeductions { get; set; }

    public virtual DbSet<HrmVewOutTime> HrmVewOutTimes { get; set; }

    public virtual DbSet<HrmVewSalaryIncrement> HrmVewSalaryIncrements { get; set; }

    public virtual DbSet<HrmVewShortLeave> HrmVewShortLeaves { get; set; }

    public virtual DbSet<HrmVewSpecialAllowance> HrmVewSpecialAllowances { get; set; }

    public virtual DbSet<HrmVewUpdateSalaryBreakup> HrmVewUpdateSalaryBreakups { get; set; }

    public virtual DbSet<Leaf> Leaves { get; set; }

    public virtual DbSet<Loan> Loans { get; set; }

    public virtual DbSet<LoanDeduction> LoanDeductions { get; set; }

    public virtual DbSet<LoanDeductionsPfAmount> LoanDeductionsPfAmounts { get; set; }

    public virtual DbSet<LoanLedgerTemp> LoanLedgerTemps { get; set; }

    public virtual DbSet<LoanType> LoanTypes { get; set; }

    public virtual DbSet<Location> Locations { get; set; }

    public virtual DbSet<MachineAttendance> MachineAttendances { get; set; }

    public virtual DbSet<MonthlySalary> MonthlySalaries { get; set; }

    public virtual DbSet<OverTimeChild> OverTimeChildren { get; set; }

    public virtual DbSet<OverTimeMaster> OverTimeMasters { get; set; }

    public virtual DbSet<SalaryUnit> SalaryUnits { get; set; }

    public virtual DbSet<Shift> Shifts { get; set; }

    public virtual DbSet<ShiftTiming> ShiftTimings { get; set; }

    public virtual DbSet<TempDailyAttenAll> TempDailyAttenAlls { get; set; }

    public virtual DbSet<TempPfLoanDetail> TempPfLoanDetails { get; set; }

    public virtual DbSet<TimeCard> TimeCards { get; set; }

    public virtual DbSet<VewAbsentee> VewAbsentees { get; set; }

    public virtual DbSet<VewAttendance> VewAttendances { get; set; }

    public virtual DbSet<VewAttendanceRegister> VewAttendanceRegisters { get; set; }

    public virtual DbSet<VewDailyAttendance> VewDailyAttendances { get; set; }

    public virtual DbSet<VewDesignation> VewDesignations { get; set; }

    public virtual DbSet<VewEmployee> VewEmployees { get; set; }

    public virtual DbSet<VewLeaf> VewLeaves { get; set; }

    public virtual DbSet<VewLeaveRegister> VewLeaveRegisters { get; set; }

    public virtual DbSet<VewLoan> VewLoans { get; set; }

    public virtual DbSet<VewLoanLedger> VewLoanLedgers { get; set; }

    public virtual DbSet<VewOverTime> VewOverTimes { get; set; }

    public virtual DbSet<VewSalary> VewSalaries { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Absentee>(entity =>
        {
            entity.HasKey(e => e.RecordNo);

            entity.Property(e => e.RecordNo).HasColumnName("Record_No");
            entity.Property(e => e.AttendanceDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Attendance_Date");
            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
        });

        modelBuilder.Entity<AttendanceRegister>(entity =>
        {
            entity.HasKey(e => e.RecordNo);

            entity.ToTable("Attendance_Register");

            entity.Property(e => e.RecordNo).HasColumnName("Record_No");
            entity.Property(e => e.AttendanceDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Attendance_Date");
            entity.Property(e => e.AttnedanceType)
                .HasMaxLength(5)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Attnedance_Type");
            entity.Property(e => e.EarlyGone)
                .HasDefaultValue(0)
                .HasColumnName("Early_Gone");
            entity.Property(e => e.EmpCardNo)
                .HasDefaultValue(0)
                .HasColumnName("Emp_CardNo");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(15)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Enter_By");
            entity.Property(e => e.GlapprovalStatus)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("GLApproval_Status");
            entity.Property(e => e.LateArrival)
                .HasDefaultValue(0)
                .HasColumnName("Late_Arrival");
            entity.Property(e => e.LeaveDeducted).HasColumnName("Leave_Deducted");
            entity.Property(e => e.OverTime)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Over_Time");
            entity.Property(e => e.OverTimeManual)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("OverTime_Manual");
            entity.Property(e => e.ShortTime)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Short_Time");
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false)
                .HasDefaultValue("");
            entity.Property(e => e.TotalDays)
                .HasDefaultValue(0m)
                .HasColumnType("numeric(10, 2)")
                .HasColumnName("Total_Days");
            entity.Property(e => e.TotalHours)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Total_Hours");
            entity.Property(e => e.TotalLate)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Total_Late");
            entity.Property(e => e.TotalSeconds)
                .HasDefaultValue(0)
                .HasColumnName("Total_Seconds");
        });

        modelBuilder.Entity<Bank>(entity =>
        {
            entity.HasKey(e => e.BankCode);

            entity.ToTable("Bank");

            entity.Property(e => e.BankCode)
                .ValueGeneratedNever()
                .HasColumnName("Bank_Code");
            entity.Property(e => e.BankName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Bank_Name");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Enter_By");
        });

        modelBuilder.Entity<DailyAttendance>(entity =>
        {
            entity.HasKey(e => e.RecordNo);

            entity.ToTable("Daily_Attendance");

            entity.Property(e => e.RecordNo).HasColumnName("Record_No");
            entity.Property(e => e.Absent).HasDefaultValue(false);
            entity.Property(e => e.AttendanceDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Attendance_Date");
            entity.Property(e => e.EarlyGoing)
                .HasDefaultValue(0)
                .HasColumnName("Early_Going");
            entity.Property(e => e.EmpCardNo)
                .HasDefaultValue(0)
                .HasColumnName("Emp_CardNo");
            entity.Property(e => e.Enterby)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("enterby");
            entity.Property(e => e.HoursToWork)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Hours_ToWork");
            entity.Property(e => e.InDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("In_Date");
            entity.Property(e => e.Inoutno)
                .HasDefaultValue(0)
                .HasColumnName("inoutno");
            entity.Property(e => e.LateArrival)
                .HasDefaultValue(0)
                .HasColumnName("Late_Arrival");
            entity.Property(e => e.LeaveDeducted).HasColumnName("Leave_Deducted");
            entity.Property(e => e.OutDate)
                .HasDefaultValueSql("('')")
                .HasColumnType("smalldatetime")
                .HasColumnName("Out_Date");
            entity.Property(e => e.OverTimeMinutes)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("OverTime_Minutes");
            entity.Property(e => e.Remarks)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasDefaultValue("");
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false)
                .HasDefaultValue("");
            entity.Property(e => e.TotalHours)
                .HasDefaultValueSql("('')")
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Total_Hours");
            entity.Property(e => e.TotalLate)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Total_Late");
            entity.Property(e => e.TotalSeconds)
                .HasDefaultValue(0)
                .HasColumnName("Total_Seconds");
        });

        modelBuilder.Entity<Department>(entity =>
        {
            entity.HasKey(e => new { e.DepartmentCode, e.Site });

            entity.ToTable("Department");

            entity.Property(e => e.DepartmentCode).HasColumnName("Department_Code");
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false);
            entity.Property(e => e.DepartmentName)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Department_Name");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Enter_By");
        });

        modelBuilder.Entity<Designation>(entity =>
        {
            entity.HasKey(e => new { e.DesignationCode, e.Site });

            entity.ToTable("Designation");

            entity.Property(e => e.DesignationCode).HasColumnName("Designation_Code");
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false);
            entity.Property(e => e.DesignationName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Designation_Name");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Enter_By");
            entity.Property(e => e.Grade).HasDefaultValue(0);
        });

        modelBuilder.Entity<EmpOpeningBalance>(entity =>
        {
            entity.HasKey(e => e.EmpCardNo);

            entity.ToTable("Emp_OpeningBalances");

            entity.Property(e => e.EmpCardNo)
                .ValueGeneratedNever()
                .HasColumnName("Emp_CardNo");
            entity.Property(e => e.EditBy)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Edit_By");
            entity.Property(e => e.EditTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Edit_Time");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Enter_By");
            entity.Property(e => e.EnteryTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Entery_Time");
            entity.Property(e => e.EobiOpening)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("EOBI_Opening");
            entity.Property(e => e.OpeningDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Opening_Date");
            entity.Property(e => e.ProvidantFundOpening)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("ProvidantFund_Opening");
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false)
                .HasColumnName("site");
            entity.Property(e => e.SocialSecurityOpening)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("SocialSecurity_Opening");
        });

        modelBuilder.Entity<EmpSalary>(entity =>
        {
            entity.HasKey(e => new { e.EmpCardNo, e.Site });

            entity.ToTable("Emp_Salary");

            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false)
                .HasColumnName("site");
            entity.Property(e => e.A01)
                .HasDefaultValue(0m)
                .HasColumnType("numeric(18, 2)");
            entity.Property(e => e.A02)
                .HasDefaultValue(0m)
                .HasColumnType("numeric(18, 2)");
            entity.Property(e => e.A03)
                .HasDefaultValue(0m)
                .HasColumnType("numeric(18, 2)");
            entity.Property(e => e.A04)
                .HasDefaultValue(0m)
                .HasColumnType("numeric(18, 2)");
            entity.Property(e => e.A05)
                .HasDefaultValue(0m)
                .HasColumnType("numeric(18, 2)");
            entity.Property(e => e.A06)
                .HasDefaultValue(0m)
                .HasColumnType("numeric(18, 2)");
            entity.Property(e => e.A07)
                .HasDefaultValue(0m)
                .HasColumnType("numeric(18, 2)");
            entity.Property(e => e.A08)
                .HasDefaultValue(0m)
                .HasColumnType("numeric(18, 2)");
            entity.Property(e => e.A09)
                .HasDefaultValue(0m)
                .HasColumnType("numeric(18, 2)");
            entity.Property(e => e.A10)
                .HasDefaultValue(0m)
                .HasColumnType("numeric(18, 2)");
            entity.Property(e => e.A11)
                .HasDefaultValue(0m)
                .HasColumnType("numeric(18, 2)");
            entity.Property(e => e.A12)
                .HasDefaultValue(0m)
                .HasColumnType("numeric(18, 2)");
            entity.Property(e => e.BasicPay)
                .HasDefaultValue(0m)
                .HasColumnType("numeric(18, 2)")
                .HasColumnName("Basic_Pay");
            entity.Property(e => e.D01)
                .HasDefaultValue(0m)
                .HasColumnType("numeric(18, 2)");
            entity.Property(e => e.D02)
                .HasDefaultValue(0m)
                .HasColumnType("numeric(18, 2)");
            entity.Property(e => e.D03)
                .HasDefaultValue(0m)
                .HasColumnType("numeric(18, 2)");
            entity.Property(e => e.D04)
                .HasDefaultValue(0m)
                .HasColumnType("numeric(18, 2)");
            entity.Property(e => e.D05)
                .HasDefaultValue(0m)
                .HasColumnType("numeric(18, 2)");
            entity.Property(e => e.D06)
                .HasDefaultValue(0m)
                .HasColumnType("numeric(18, 2)");
            entity.Property(e => e.D07)
                .HasDefaultValue(0m)
                .HasColumnType("numeric(18, 2)");
            entity.Property(e => e.D08)
                .HasDefaultValue(0m)
                .HasColumnType("numeric(18, 2)");
            entity.Property(e => e.D09)
                .HasDefaultValue(0m)
                .HasColumnType("numeric(18, 2)");
            entity.Property(e => e.D10)
                .HasDefaultValue(0m)
                .HasColumnType("numeric(18, 2)");
            entity.Property(e => e.D11)
                .HasDefaultValue(0m)
                .HasColumnType("numeric(18, 2)");
            entity.Property(e => e.D12)
                .HasDefaultValue(0m)
                .HasColumnType("numeric(18, 2)");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Enter_By");
            entity.Property(e => e.EobiSchoolShare)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("EOBI_SchoolShare");
            entity.Property(e => e.GrossPay)
                .HasDefaultValue(0m)
                .HasColumnType("numeric(18, 2)")
                .HasColumnName("Gross_Pay");
            entity.Property(e => e.NetPay)
                .HasDefaultValue(0m)
                .HasColumnType("numeric(18, 2)")
                .HasColumnName("Net_Pay");
            entity.Property(e => e.PfSchoolShare)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("PF_SchoolShare");
            entity.Property(e => e.SalLec)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Sal_Lec");
        });

        modelBuilder.Entity<Employee>(entity =>
        {
            entity.HasKey(e => new { e.EmpCardNo, e.Site });

            entity.ToTable("Employee");

            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false)
                .HasColumnName("site");
            entity.Property(e => e.Address)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasDefaultValue("");
            entity.Property(e => e.BankAccount)
                .HasMaxLength(50)
                .HasDefaultValue("")
                .HasColumnName("Bank_Account");
            entity.Property(e => e.BankId)
                .HasDefaultValue(0)
                .HasColumnName("Bank_ID");
            entity.Property(e => e.BirthDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Birth_Date");
            entity.Property(e => e.BloodGroup)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Blood_Group");
            entity.Property(e => e.Category)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("");
            entity.Property(e => e.Certification)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasDefaultValue("");
            entity.Property(e => e.Cnic)
                .HasMaxLength(50)
                .HasDefaultValue("")
                .HasColumnName("CNIC");
            entity.Property(e => e.ConfirmationDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Confirmation_Date");
            entity.Property(e => e.ContractExpiryDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Contract_ExpiryDate");
            entity.Property(e => e.CardExpiryDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Card_ExpiryDate");
            entity.Property(e => e.City)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("City");
            entity.Property(e => e.Dependents)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("");
            entity.Property(e => e.DeptCode)
                .HasDefaultValue(0)
                .HasColumnName("Dept_Code");
            entity.Property(e => e.DesgCode)
                .HasDefaultValue(0)
                .HasColumnName("Desg_Code");
            entity.Property(e => e.EditBy)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Edit_By");
            entity.Property(e => e.EditTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Edit_Time");
            entity.Property(e => e.Email)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("");
            entity.Property(e => e.EmailPersonal)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Email_Personal");
            entity.Property(e => e.EmergencyNo)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Emergency_No");
            entity.Property(e => e.EmpFatherName)
                .HasMaxLength(150)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Emp_FatherName");
            entity.Property(e => e.EmpPrefix)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("Emp_Prefix");
            entity.Property(e => e.EmpName)
                .HasMaxLength(150)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Emp_Name");
            entity.Property(e => e.FirstName)
                .HasMaxLength(150)
                .IsUnicode(false);
            entity.Property(e => e.MiddleName)
                .HasMaxLength(150)
                .IsUnicode(false);
            entity.Property(e => e.LastName)
                .HasMaxLength(150)
                .IsUnicode(false);
            entity.Property(e => e.EmpOldCardNo)
                .HasDefaultValue(0)
                .HasColumnName("Emp_OldCardNo");
            entity.Property(e => e.EmpPicture)
                .HasColumnType("image")
                .HasColumnName("Emp_Picture");
            entity.Property(e => e.EmpStatus)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Emp_Status");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Enter_By");
            entity.Property(e => e.EnteryTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Entery_Time");
            entity.Property(e => e.EobiNo)
                .HasMaxLength(13)
                .HasDefaultValue("")
                .HasColumnName("EOBI_No");
            entity.Property(e => e.Experience)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasDefaultValue("");
            entity.Property(e => e.Experience2)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("Experience_2");
            entity.Property(e => e.ExtensionNo)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Extension_No");
            entity.Property(e => e.InTime)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasDefaultValue("00:00")
                .HasColumnName("In_Time");
            entity.Property(e => e.IsEobi)
                .HasDefaultValue(false)
                .HasColumnName("is_EOBI");
            entity.Property(e => e.IsCompliance)
                .HasDefaultValue(false)
                .HasColumnName("is_Compliance");
            entity.Property(e => e.IsOverTime)
                .HasDefaultValue(false)
                .HasColumnName("is_Over_Time");
            entity.Property(e => e.IsSalaryBlocked).HasColumnName("Is_Salary_Blocked");
            entity.Property(e => e.IsSs)
                .HasDefaultValue(false)
                .HasColumnName("is_SS");
            entity.Property(e => e.JoiningDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Joining_Date");
            entity.Property(e => e.LeftType)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Left_Type");
            entity.Property(e => e.LocationCode)
                .HasDefaultValue(0)
                .HasColumnName("Location_Code");
            entity.Property(e => e.GradeId)
                .HasColumnName("Grade_ID");
            entity.Property(e => e.MaritalStatus)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Marital_Status");
            entity.Property(e => e.RelaxationTime)
                .HasColumnName("Relaxation_Time");
            entity.Property(e => e.OutTime)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasDefaultValue("00:00")
                .HasColumnName("Out_Time");
            entity.Property(e => e.ReportingTiming)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasDefaultValue("00:00")
                .HasColumnName("Reporting_Timing");
            entity.Property(e => e.PhoneNo)
                .HasMaxLength(150)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Phone_No");
            entity.Property(e => e.PositionTitle)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Position_Title");
            entity.Property(e => e.Qualification)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasDefaultValue("");
            entity.Property(e => e.Religion)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Remarks)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasDefaultValue("");
            entity.Property(e => e.ResignDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Resign_Date");
            entity.Property(e => e.RestDay)
                .HasMaxLength(15)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Rest_Day");
            entity.Property(e => e.Region)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Region");
            entity.Property(e => e.SalaryUnit)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Salary_Unit");
            entity.Property(e => e.Section)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Section");
            entity.Property(e => e.Scale)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Sex)
                .HasMaxLength(2)
                .IsUnicode(false)
                .HasDefaultValue("");
            entity.Property(e => e.Shift)
                .HasMaxLength(2)
                .IsUnicode(false)
                .HasDefaultValue("");
            entity.Property(e => e.SsNo)
                .HasMaxLength(13)
                .HasDefaultValue("")
                .HasColumnName("SS_No");
            entity.Property(e => e.Status).HasDefaultValue(true);
            entity.Property(e => e.TemporaryAddress)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("Temporary_Address");
            entity.Property(e => e.Unit)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("Unit");
            entity.Property(e => e.StuckOff)
                .HasDefaultValue(false)
                .HasColumnName("Stuck_Off");
            entity.Property(e => e.StuckOffDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Stuck_Off_Date");
            entity.Property(e => e.WorkingHours)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(9, 2)")
                .HasColumnName("Working_Hours");
        });

        modelBuilder.Entity<GazettedLeaf>(entity =>
        {
            entity.HasKey(e => e.LeaveId);

            entity.ToTable("Gazetted_Leaves");

            entity.Property(e => e.LeaveId)
                .ValueGeneratedNever()
                .HasColumnName("Leave_ID");
            entity.Property(e => e.EditBy)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Edit_By");
            entity.Property(e => e.EditTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Edit_Time");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Enter_By");
            entity.Property(e => e.EnteryTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Entery_Time");
            entity.Property(e => e.LeaveDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Leave_Date");
            entity.Property(e => e.LeaveName)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Leave_Name");
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("site");
        });

        modelBuilder.Entity<Grade>(entity =>
        {
            entity.HasKey(e => e.GradeCode);

            entity.ToTable("Grade");

            entity.Property(e => e.GradeCode)
                .ValueGeneratedNever()
                .HasColumnName("Grade_Code");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Enter_By");
            entity.Property(e => e.GradeName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Grade_Name");
            entity.Property(e => e.MaximumSalary)
                .HasDefaultValue(0m)
                .HasColumnType("numeric(18, 2)")
                .HasColumnName("Maximum_Salary");
            entity.Property(e => e.MinimumSalary)
                .HasDefaultValue(0m)
                .HasColumnType("numeric(18, 2)")
                .HasColumnName("Minimum_Salary");
        });

        modelBuilder.Entity<HrmEveningSalaryChild>(entity =>
        {
            entity.HasKey(e => e.RecNo);

            entity.ToTable("HRM_EveningSalary_Child");

            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.Salary).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.SalaryPerLecture)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("SalaryPer_Lecture");
            entity.Property(e => e.Site)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Subject)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.TotalLectures).HasColumnName("Total_Lectures");
            entity.Property(e => e.TransNo).HasColumnName("Trans_No");
        });

        modelBuilder.Entity<HrmEveningSalaryMaster>(entity =>
        {
            entity.HasKey(e => new { e.TransNo, e.Site });

            entity.ToTable("HRM_EveningSalary_Master");

            entity.Property(e => e.TransNo).HasColumnName("Trans_No");
            entity.Property(e => e.Site)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.EditBy)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Edit_By");
            entity.Property(e => e.EditTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Edit_Time");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Enter_By");
            entity.Property(e => e.EnteryTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Entery_Time");
            entity.Property(e => e.TransMonth)
                .HasColumnType("smalldatetime")
                .HasColumnName("Trans_Month");
        });

        modelBuilder.Entity<HrmFinalSettlement>(entity =>
        {
            entity.HasKey(e => new { e.TransactionNo, e.Site });

            entity.ToTable("HRM_Final_Settlement");

            entity.Property(e => e.TransactionNo).HasColumnName("Transaction_No");
            entity.Property(e => e.Site)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.BadliAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Badli_Amount");
            entity.Property(e => e.BadliDays)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Badli_Days");
            entity.Property(e => e.Commission).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.EditBy)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Edit_By");
            entity.Property(e => e.EditTime)
                .HasColumnType("datetime")
                .HasColumnName("Edit_Time");
            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Enter_By");
            entity.Property(e => e.EnteryTime)
                .HasColumnType("datetime")
                .HasColumnName("Entery_Time");
            entity.Property(e => e.Eobi)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("EOBI");
            entity.Property(e => e.FabricLoan)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Fabric_Loan");
            entity.Property(e => e.FuelAllowance)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Fuel_Allowance");
            entity.Property(e => e.GraduityAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Graduity_Amount");
            entity.Property(e => e.GraduityDays)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Graduity_Days");
            entity.Property(e => e.GraduityPercent)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Graduity_Percent");
            entity.Property(e => e.IncomeTax)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Income_Tax");
            entity.Property(e => e.LastPresent)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Last_Present");
            entity.Property(e => e.LeavesAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Leaves_Amount");
            entity.Property(e => e.LeavesPayable)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Leaves_Payable");
            entity.Property(e => e.LeavesType)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Leaves_Type");
            entity.Property(e => e.LeavingDate)
                .HasColumnType("datetime")
                .HasColumnName("Leaving_Date");
            entity.Property(e => e.LeavingType)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Leaving_Type");
            entity.Property(e => e.LoanAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Loan_Amount");
            entity.Property(e => e.MobileAllowance)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Mobile_Allowance");
            entity.Property(e => e.NoticeAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Notice_Amount");
            entity.Property(e => e.NoticeDays)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Notice_Days");
            entity.Property(e => e.OtherDeductions)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Other_Deductions");
            entity.Property(e => e.OtherPayable)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Other_Payable");
            entity.Property(e => e.OverTimeAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("OverTime_Amount");
            entity.Property(e => e.OverTimeHours)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("OverTime_Hours");
            entity.Property(e => e.PayableAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Payable_Amount");
            entity.Property(e => e.ProvidentFund)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Provident_Fund");
            entity.Property(e => e.ProvidentFundProfit)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Provident_Fund_Profit");
            entity.Property(e => e.SalaryAdvance)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Salary_Advance");
            entity.Property(e => e.SalaryAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Salary_Amount");
            entity.Property(e => e.SalaryDays)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Salary_Days");
            entity.Property(e => e.SalaryMonth)
                .HasColumnType("datetime")
                .HasColumnName("Salary_Month");
            entity.Property(e => e.SalaryUnpaid)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Salary_Unpaid");
            entity.Property(e => e.TotalSalary)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Total_Salary");
            entity.Property(e => e.TransactionDate)
                .HasColumnType("datetime")
                .HasColumnName("Transaction_Date");
            entity.Property(e => e.UnpaidSalaryMonths)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("Unpaid_SalaryMonths");
            entity.Property(e => e.VehicleLoan)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Vehicle_Loan");
        });

        modelBuilder.Entity<HrmInTime>(entity =>
        {
            entity.HasKey(e => e.SerialNo).HasName("PK_HRM_InTime_1");

            entity.ToTable("HRM_InTime");

            entity.Property(e => e.SerialNo).HasColumnName("Serial_No");
            entity.Property(e => e.AttendanceDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Attendance_Date");
            entity.Property(e => e.AttendanceType)
                .HasMaxLength(5)
                .IsUnicode(false)
                .HasColumnName("Attendance_Type");
            entity.Property(e => e.DepartmentCode).HasColumnName("Department_Code");
            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.EmpName)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("Emp_Name");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Enter_By");
            entity.Property(e => e.EnteryTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Entery_Time");
            entity.Property(e => e.InTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("In_Time");
            entity.Property(e => e.Reason)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false);
            entity.Property(e => e.TransactionNo).HasColumnName("Transaction_No");
        });

        modelBuilder.Entity<HrmLeaveApplication>(entity =>
        {
            entity.HasKey(e => new { e.TransNo, e.Site });

            entity.ToTable("HRM_LeaveApplication");

            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false);
            entity.Property(e => e.Assignment).IsUnicode(false);
            entity.Property(e => e.EditBy)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Edit_By");
            entity.Property(e => e.EditTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Edit_Time");
            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Enter_By");
            entity.Property(e => e.EnteryTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Entery_Time");
            entity.Property(e => e.FromDate).HasColumnType("smalldatetime");
            entity.Property(e => e.LeaveDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Leave_Date");
            entity.Property(e => e.LeaveRequired)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Leave_Required");
            entity.Property(e => e.LeaveType)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Leave_Type");
            entity.Property(e => e.MoreThanOne).HasColumnName("MoreThan_One");
            entity.Property(e => e.Reason).IsUnicode(false);
            entity.Property(e => e.ToDate).HasColumnType("smalldatetime");
            entity.Property(e => e.TransDate).HasColumnType("smalldatetime");
        });

        modelBuilder.Entity<HrmLeaveChild>(entity =>
        {
            entity.HasKey(e => e.SerialNo);

            entity.ToTable("HRM_Leave_Child");

            entity.Property(e => e.SerialNo).HasColumnName("Serial_No");
            entity.Property(e => e.ApplicationNo).HasColumnName("Application_No");
            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.FromDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("From_Date");
            entity.Property(e => e.LeaveApprovalStatus)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("LeaveApproval_Status");
            entity.Property(e => e.LeaveType)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Leave_Type");
            entity.Property(e => e.Reason)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.Remarks)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.ShortLeaveDeducted).HasColumnName("ShortLeave_Deducted");
            entity.Property(e => e.Site)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.ToDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("To_Date");
            entity.Property(e => e.TotalLeaves)
                .HasColumnType("numeric(18, 2)")
                .HasColumnName("Total_Leaves");
        });

        modelBuilder.Entity<HrmLeaveDeductionsChild>(entity =>
        {
            entity.HasKey(e => e.RecNo);

            entity.ToTable("HRM_LeaveDeductions_Child");

            entity.Property(e => e.DepartmentName)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.DesignationName)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.EmpCardNo).HasColumnName("EMP_CardNo");
            entity.Property(e => e.FatherName)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Leaves).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Name)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false);
        });

        modelBuilder.Entity<HrmLeaveDeductionsMaster>(entity =>
        {
            entity.HasKey(e => new { e.TransactionNo, e.Site });

            entity.ToTable("HRM_LeaveDeductions_Master");

            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false);
            entity.Property(e => e.EditBy)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("Edit_By");
            entity.Property(e => e.EditTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Edit_Time");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("Enter_By");
            entity.Property(e => e.EnteryTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Entery_Time");
            entity.Property(e => e.TransactionDate).HasColumnType("smalldatetime");
        });

        modelBuilder.Entity<HrmLeaveMaster>(entity =>
        {
            entity.HasKey(e => new { e.ApplicationNo, e.Site });

            entity.ToTable("HRM_Leave_Master");

            entity.Property(e => e.ApplicationNo).HasColumnName("Application_No");
            entity.Property(e => e.Site)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.ApplicationDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Application_Date");
            entity.Property(e => e.EditBy)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Edit_By");
            entity.Property(e => e.EditTime)
                .HasColumnType("datetime")
                .HasColumnName("Edit_Time");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Enter_By");
            entity.Property(e => e.EnteryTime)
                .HasColumnType("datetime")
                .HasColumnName("Entery_Time");
        });

        modelBuilder.Entity<HrmLeaveRegister>(entity =>
        {
            entity.HasKey(e => e.SerialNo).HasName("PK_HRM_Leave_Register_1");

            entity.ToTable("HRM_Leave_Register");

            entity.Property(e => e.SerialNo).HasColumnName("Serial_No");
            entity.Property(e => e.AlAdd)
                .HasColumnType("decimal(18, 6)")
                .HasColumnName("AL_Add");
            entity.Property(e => e.AlOpen)
                .HasColumnType("decimal(18, 6)")
                .HasColumnName("AL_Open");
            entity.Property(e => e.AlUse)
                .HasColumnType("decimal(18, 6)")
                .HasColumnName("AL_Use");
            entity.Property(e => e.ApplicationNo).HasColumnName("Application_No");
            entity.Property(e => e.ClAdd)
                .HasColumnType("decimal(18, 6)")
                .HasColumnName("CL_Add");
            entity.Property(e => e.ClOpen)
                .HasColumnType("decimal(18, 6)")
                .HasColumnName("CL_Open");
            entity.Property(e => e.ClUse)
                .HasColumnType("decimal(18, 6)")
                .HasColumnName("CL_Use");
            entity.Property(e => e.CplAdd)
                .HasColumnType("decimal(18, 6)")
                .HasColumnName("CPL_Add");
            entity.Property(e => e.CplOpen)
                .HasColumnType("decimal(18, 6)")
                .HasColumnName("CPL_Open");
            entity.Property(e => e.CplUse)
                .HasColumnType("decimal(18, 6)")
                .HasColumnName("CPL_Use");
            entity.Property(e => e.EditBy)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Edit_By");
            entity.Property(e => e.EditTime)
                .HasColumnType("datetime")
                .HasColumnName("Edit_Time");
            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Enter_By");
            entity.Property(e => e.EnteryTime)
                .HasColumnType("datetime")
                .HasColumnName("Entery_Time");
            entity.Property(e => e.LeaveDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Leave_date");
            entity.Property(e => e.LeaveMonth).HasColumnName("Leave_Month");
            entity.Property(e => e.LeaveYear).HasColumnName("Leave_Year");
            entity.Property(e => e.Site)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("");
            entity.Property(e => e.SlAdd)
                .HasColumnType("decimal(18, 6)")
                .HasColumnName("SL_Add");
            entity.Property(e => e.SlOpen)
                .HasColumnType("decimal(18, 6)")
                .HasColumnName("SL_Open");
            entity.Property(e => e.SlUse)
                .HasColumnType("decimal(18, 6)")
                .HasColumnName("SL_Use");
        });

        modelBuilder.Entity<HrmLeaveType>(entity =>
        {
            entity.HasKey(e => new { e.LeaveId, e.LeaveType }).HasName("PK_Leave_Types");

            entity.ToTable("HRM_Leave_Types");

            entity.Property(e => e.LeaveId).HasColumnName("Leave_ID");
            entity.Property(e => e.LeaveType)
                .HasMaxLength(25)
                .IsUnicode(false)
                .HasColumnName("Leave_Type");
            entity.Property(e => e.LeaveName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Leave_Name");
        });

        modelBuilder.Entity<HrmOutTime>(entity =>
        {
            entity.HasKey(e => e.SerialNo).HasName("PK_HRM_OutTime_1");

            entity.ToTable("HRM_OutTime");

            entity.Property(e => e.SerialNo).HasColumnName("Serial_No");
            entity.Property(e => e.AttendanceDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Attendance_Date");
            entity.Property(e => e.DepartmentCode).HasColumnName("Department_Code");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Enter_By");
            entity.Property(e => e.EnteryTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Entery_Time");
            entity.Property(e => e.OutTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Out_Time");
            entity.Property(e => e.Reason)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false);
            entity.Property(e => e.TransactionNo).HasColumnName("Transaction_No");
        });

        modelBuilder.Entity<HrmPfLedger>(entity =>
        {
            entity
                .HasNoKey()
                .ToTable("HRM_PF_Ledger");

            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.LoanAmount)
                .HasColumnType("numeric(18, 0)")
                .HasColumnName("Loan_Amount");
            entity.Property(e => e.LoanInstallment)
                .HasColumnType("numeric(18, 0)")
                .HasColumnName("Loan_Installment");
            entity.Property(e => e.PfType)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("PF_Type");
            entity.Property(e => e.ProvidantFund)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false);
            entity.Property(e => e.TransactionDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Transaction_Date");
        });

        modelBuilder.Entity<HrmSalaryIncrement>(entity =>
        {
            entity.HasKey(e => new { e.EmpCardNo, e.IncrementDate, e.Site }).HasName("PK_HRM_SalaryIncrement_1");

            entity.ToTable("HRM_SalaryIncrement");

            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.IncrementDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Increment_Date");
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false);
            entity.Property(e => e.A01)
                .HasDefaultValue(0m)
                .HasColumnType("numeric(18, 2)");
            entity.Property(e => e.A10)
                .HasDefaultValue(0m)
                .HasColumnType("numeric(18, 2)");
            entity.Property(e => e.CurrentBasicPay)
                .HasDefaultValue(0m)
                .HasColumnType("numeric(18, 2)")
                .HasColumnName("Current_BasicPay");
            entity.Property(e => e.CurrentGrossPay)
                .HasDefaultValue(0m)
                .HasColumnType("numeric(18, 2)")
                .HasColumnName("Current_GrossPay");
            entity.Property(e => e.D01)
                .HasDefaultValue(0m)
                .HasColumnType("numeric(18, 2)");
            entity.Property(e => e.EditBy)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Edit_By");
            entity.Property(e => e.EditTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Edit_Time");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Enter_By");
            entity.Property(e => e.EnteryTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Entery_Time");
            entity.Property(e => e.Increment)
                .HasDefaultValue(0m)
                .HasColumnType("numeric(18, 2)");
            entity.Property(e => e.OldBasicPay)
                .HasDefaultValue(0m)
                .HasColumnType("numeric(18, 2)")
                .HasColumnName("Old_BasicPay");
            entity.Property(e => e.OldGrossPay)
                .HasDefaultValue(0m)
                .HasColumnType("numeric(18, 2)")
                .HasColumnName("Old_GrossPay");
        });

        modelBuilder.Entity<HrmCategory>(entity =>
        {
            entity.HasKey(e => new { e.CategoryCode, e.Site }).HasName("PK_HRM_Category");

            entity.ToTable("HRM_Category");

            entity.Property(e => e.CategoryCode).HasColumnName("Category_Code");
            entity.Property(e => e.Site)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.CategoryName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Category_Name");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Enter_By");
        });

        modelBuilder.Entity<HrmStatus>(entity =>
        {
            entity.HasKey(e => new { e.StatusCode, e.Site }).HasName("PK_HRM_Status");

            entity.ToTable("HRM_Status");

            entity.Property(e => e.StatusCode).HasColumnName("Status_Code");
            entity.Property(e => e.Site)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.StatusName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Status_Name");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Enter_By");
        });

        modelBuilder.Entity<HrmScale>(entity =>
        {
            entity.HasKey(e => new { e.ScaleId, e.Site }).HasName("PK_HRM_Scale_1");

            entity.ToTable("HRM_Scale");

            entity.Property(e => e.ScaleId).HasColumnName("Scale_ID");
            entity.Property(e => e.Site)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.ScaleName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Scale_Name");
        });

        modelBuilder.Entity<HrmShortLeave>(entity =>
        {
            entity.HasKey(e => new { e.TransNo, e.Site });

            entity.ToTable("HRM_ShortLeave");

            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false);
            entity.Property(e => e.EditBy)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Edit_By");
            entity.Property(e => e.EditTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Edit_Time");
            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Enter_By");
            entity.Property(e => e.EnteryTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Entery_Time");
            entity.Property(e => e.FromTime).HasColumnType("smalldatetime");
            entity.Property(e => e.LeaveDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Leave_Date");
            entity.Property(e => e.LeaveType)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Leave_Type");
            entity.Property(e => e.Reason).IsUnicode(false);
            entity.Property(e => e.ToTime).HasColumnType("smalldatetime");
            entity.Property(e => e.TransDate).HasColumnType("smalldatetime");
        });

        modelBuilder.Entity<HrmSpecialAllowanceChild>(entity =>
        {
            entity.HasKey(e => e.RecNo);

            entity.ToTable("HRM_SpecialAllowance_Child");

            entity.Property(e => e.DepartmentName)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.DesignationName)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.EmpCardNo).HasColumnName("EMP_CardNo");
            entity.Property(e => e.FatherName)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Name)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false);
            entity.Property(e => e.SpecialAllowance).HasColumnType("decimal(18, 2)");
        });

        modelBuilder.Entity<HrmSpecialAllowanceMaster>(entity =>
        {
            entity.HasKey(e => new { e.TransactionNo, e.Site });

            entity.ToTable("HRM_SpecialAllowance_Master");

            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false);
            entity.Property(e => e.EditBy)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("Edit_By");
            entity.Property(e => e.EditTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Edit_Time");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("Enter_By");
            entity.Property(e => e.EnteryTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Entery_Time");
            entity.Property(e => e.TransactionDate).HasColumnType("smalldatetime");
        });

        modelBuilder.Entity<HrmTempAttendanceSummary>(entity =>
        {
            entity
                .HasNoKey()
                .ToTable("HRM_Temp_AttendanceSummary");

            entity.Property(e => e.AbsentDays).HasColumnName("Absent_Days");
            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.EmpName)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("Emp_Name");
            entity.Property(e => e.LateDays).HasColumnName("Late_Days");
            entity.Property(e => e.PresentDays).HasColumnName("Present_Days");
            entity.Property(e => e.WithoutInDays).HasColumnName("WithoutIn_Days");
        });

        modelBuilder.Entity<HrmTempLateShortLeaveDetail>(entity =>
        {
            entity
                .HasNoKey()
                .ToTable("HRM_Temp_LateShortLeaveDetail");

            entity.Property(e => e.AprLates)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Apr_Lates");
            entity.Property(e => e.AprShortLeave)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Apr_ShortLeave");
            entity.Property(e => e.AugLates)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Aug_Lates");
            entity.Property(e => e.AugShortLeave)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Aug_ShortLeave");
            entity.Property(e => e.DecLates)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Dec_Lates");
            entity.Property(e => e.DecShortLeave)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Dec_ShortLeave");
            entity.Property(e => e.DepartmentName)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("Department_Name");
            entity.Property(e => e.DeptCode).HasColumnName("Dept_Code");
            entity.Property(e => e.DesgCode).HasColumnName("Desg_Code");
            entity.Property(e => e.DesignationName)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("Designation_Name");
            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.EmpName)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("Emp_Name");
            entity.Property(e => e.FebLates)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Feb_Lates");
            entity.Property(e => e.FebShortLeave)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Feb_ShortLeave");
            entity.Property(e => e.JanLates)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Jan_Lates");
            entity.Property(e => e.JanShortLeave)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Jan_ShortLeave");
            entity.Property(e => e.JoiningDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Joining_Date");
            entity.Property(e => e.JulyLates)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("July_Lates");
            entity.Property(e => e.JulyShortLeave)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("July_ShortLeave");
            entity.Property(e => e.JuneLates)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("June_Lates");
            entity.Property(e => e.JuneShortLeave)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("June_ShortLeave");
            entity.Property(e => e.MarLates)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Mar_Lates");
            entity.Property(e => e.MarShortLeave)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Mar_ShortLeave");
            entity.Property(e => e.MayLates)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("May_Lates");
            entity.Property(e => e.MayShortLeave)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("May_ShortLeave");
            entity.Property(e => e.NovLates)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Nov_Lates");
            entity.Property(e => e.NovShortLeave)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Nov_ShortLeave");
            entity.Property(e => e.OctLates)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Oct_Lates");
            entity.Property(e => e.OctShortLeave)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Oct_ShortLeave");
            entity.Property(e => e.SepLates)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Sep_Lates");
            entity.Property(e => e.SepShortLeave)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Sep_ShortLeave");
            entity.Property(e => e.TotalLates)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Total_Lates");
            entity.Property(e => e.TotalShortLeave)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Total_ShortLeave");
        });

        modelBuilder.Entity<HrmTempLeaveAbsentDetail>(entity =>
        {
            entity
                .HasNoKey()
                .ToTable("HRM_Temp_LeaveAbsentDetail");

            entity.Property(e => e.AprAbsent)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Apr_Absent");
            entity.Property(e => e.AprLeave)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Apr_Leave");
            entity.Property(e => e.AugAbsent)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Aug_Absent");
            entity.Property(e => e.AugLeave)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Aug_Leave");
            entity.Property(e => e.DecAbsent)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Dec_Absent");
            entity.Property(e => e.DecLeave)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Dec_Leave");
            entity.Property(e => e.DepartmentName)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("Department_Name");
            entity.Property(e => e.DeptCode).HasColumnName("Dept_Code");
            entity.Property(e => e.DesgCode).HasColumnName("Desg_Code");
            entity.Property(e => e.DesignationName)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("Designation_Name");
            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.EmpName)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("Emp_Name");
            entity.Property(e => e.FebAbsent)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Feb_Absent");
            entity.Property(e => e.FebLeave)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Feb_Leave");
            entity.Property(e => e.JanAbsent)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Jan_Absent");
            entity.Property(e => e.JanLeave)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Jan_Leave");
            entity.Property(e => e.JoiningDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Joining_Date");
            entity.Property(e => e.JulyAbsent)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("July_Absent");
            entity.Property(e => e.JulyLeave)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("July_Leave");
            entity.Property(e => e.JuneAbsent)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("June_Absent");
            entity.Property(e => e.JuneLeave)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("June_Leave");
            entity.Property(e => e.MarAbsent)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Mar_Absent");
            entity.Property(e => e.MarLeave)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Mar_Leave");
            entity.Property(e => e.MayAbsent)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("May_Absent");
            entity.Property(e => e.MayLeave)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("May_Leave");
            entity.Property(e => e.NovAbsent)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Nov_Absent");
            entity.Property(e => e.NovLeave)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Nov_Leave");
            entity.Property(e => e.OctAbsent)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Oct_Absent");
            entity.Property(e => e.OctLeave)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Oct_Leave");
            entity.Property(e => e.SepAbsent)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Sep_Absent");
            entity.Property(e => e.SepLeave)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Sep_Leave");
            entity.Property(e => e.TotalAbsent)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Total_Absent");
            entity.Property(e => e.TotalLeave)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Total_Leave");
        });

        modelBuilder.Entity<HrmTempLeaveDetail>(entity =>
        {
            entity
                .HasNoKey()
                .ToTable("HRM_Temp_LeaveDetail");

            entity.Property(e => e.Balance).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.DepartmentName)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("Department_Name");
            entity.Property(e => e.DeptCode).HasColumnName("Dept_Code");
            entity.Property(e => e.DesgCode).HasColumnName("Desg_Code");
            entity.Property(e => e.DesignationName)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("Designation_Name");
            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.EmpName)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("Emp_Name");
            entity.Property(e => e.JoiningDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Joining_Date");
            entity.Property(e => e.LeavesAvailed)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Leaves_Availed");
            entity.Property(e => e.LeavesExceeded)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Leaves_Exceeded");
            entity.Property(e => e.ShortLeaves).HasColumnName("Short_Leaves");
            entity.Property(e => e.YearlyQuota)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Yearly_Quota");
        });

        modelBuilder.Entity<HrmTempLoansBalance>(entity =>
        {
            entity
                .HasNoKey()
                .ToTable("HRM_Temp_LoansBalances");

            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.EmpName)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("Emp_Name");
            entity.Property(e => e.LongTermLoan)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("LongTerm_Loan");
            entity.Property(e => e.LongTermLoanBalance)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("LongTerm_LoanBalance");
            entity.Property(e => e.LongTermLoanReturn)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("LongTerm_LoanReturn");
            entity.Property(e => e.PfLoan)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("PF_Loan");
            entity.Property(e => e.PfLoanBalance)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("PF_LoanBalance");
            entity.Property(e => e.PfLoanReturn)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("PF_Loan_Return");
        });

        modelBuilder.Entity<HrmUpdateSalaryBreakupChild>(entity =>
        {
            entity.HasKey(e => e.RecNo);

            entity.ToTable("HRM_UpdateSalaryBreakup_Child");

            entity.Property(e => e.Adh1)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("ADH1");
            entity.Property(e => e.Adh2)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("ADH2");
            entity.Property(e => e.Adh3)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("ADH3");
            entity.Property(e => e.Allowance).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Allowances).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.BasicPay)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Basic_Pay");
            entity.Property(e => e.Conveyance).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.DAdvance)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("D_Advance");
            entity.Property(e => e.DEobi)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("D_EOBI");
            entity.Property(e => e.DLoan)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("D_Loan");
            entity.Property(e => e.DLvs)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("D_Lvs");
            entity.Property(e => e.DProvidentFund)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("D_Provident_Fund");
            entity.Property(e => e.DTax)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("D_Tax");
            entity.Property(e => e.EmpCardNo).HasColumnName("EMP_CardNo");
            entity.Property(e => e.Eobi)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("EOBI");
            entity.Property(e => e.GrossPay)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Gross_Pay");
            entity.Property(e => e.HouseRent)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("House_Rent");
            entity.Property(e => e.Name)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.NetPay)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Net_Pay");
            entity.Property(e => e.ProvidentFund)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Provident_Fund");
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false);
            entity.Property(e => e.ThirtyFivePercent)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("ThirtyFive_Percent");
            entity.Property(e => e.TransactionNo).HasColumnName("Transaction_No");
            entity.Property(e => e.TwentyPercent)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Twenty_Percent");
            entity.Property(e => e.TwentyPercent1)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Twenty_Percent1");
        });

        modelBuilder.Entity<HrmUpdateSalaryBreakupMaster>(entity =>
        {
            entity.HasKey(e => new { e.TransactionNo, e.Site });

            entity.ToTable("HRM_UpdateSalaryBreakup_Master");

            entity.Property(e => e.TransactionNo).HasColumnName("Transaction_No");
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false);
            entity.Property(e => e.EditBy)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Edit_By");
            entity.Property(e => e.EditTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Edit_Time");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Enter_By");
            entity.Property(e => e.EnteryTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Entery_Time");
            entity.Property(e => e.TransactionDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Transaction_Date");
        });

        modelBuilder.Entity<HrmVewEveningSalary>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("HRM_vew_EveningSalary");

            entity.Property(e => e.BirthDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Birth_Date");
            entity.Property(e => e.DepartmentName)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("Department_Name");
            entity.Property(e => e.DeptCode).HasColumnName("Dept_Code");
            entity.Property(e => e.DesgCode).HasColumnName("Desg_Code");
            entity.Property(e => e.DesignationName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Designation_Name");
            entity.Property(e => e.EditBy)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Edit_By");
            entity.Property(e => e.EditTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Edit_Time");
            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.EmpFatherName)
                .HasMaxLength(150)
                .IsUnicode(false)
                .HasColumnName("Emp_FatherName");
            entity.Property(e => e.EmpName)
                .HasMaxLength(150)
                .IsUnicode(false)
                .HasColumnName("Emp_Name");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Enter_By");
            entity.Property(e => e.EnteryTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Entery_Time");
            entity.Property(e => e.JoiningDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Joining_Date");
            entity.Property(e => e.Salary).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.SalaryPerLecture)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("SalaryPer_Lecture");
            entity.Property(e => e.Site)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Subject)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.TotalLectures).HasColumnName("Total_Lectures");
            entity.Property(e => e.TransMonth)
                .HasColumnType("smalldatetime")
                .HasColumnName("Trans_Month");
            entity.Property(e => e.TransNo).HasColumnName("Trans_No");
        });

        modelBuilder.Entity<HrmVewFinalSettlement>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("HRM_vew_FinalSettlement");

            entity.Property(e => e.BadliAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Badli_Amount");
            entity.Property(e => e.BadliDays)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Badli_Days");
            entity.Property(e => e.BasicPay)
                .HasColumnType("numeric(18, 2)")
                .HasColumnName("Basic_Pay");
            entity.Property(e => e.Cnic)
                .HasMaxLength(50)
                .HasColumnName("CNIC");
            entity.Property(e => e.Commission).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.DepartmentName)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("Department_Name");
            entity.Property(e => e.DeptCode).HasColumnName("Dept_Code");
            entity.Property(e => e.DesgCode).HasColumnName("Desg_Code");
            entity.Property(e => e.DesignationName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Designation_Name");
            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.EmpFatherName)
                .HasMaxLength(150)
                .IsUnicode(false)
                .HasColumnName("Emp_FatherName");
            entity.Property(e => e.EmpName)
                .HasMaxLength(150)
                .IsUnicode(false)
                .HasColumnName("Emp_Name");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Enter_By");
            entity.Property(e => e.Eobi)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("EOBI");
            entity.Property(e => e.FabricLoan)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Fabric_Loan");
            entity.Property(e => e.FuelAllowance)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Fuel_Allowance");
            entity.Property(e => e.GraduityAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Graduity_Amount");
            entity.Property(e => e.GraduityDays)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Graduity_Days");
            entity.Property(e => e.GraduityPercent)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Graduity_Percent");
            entity.Property(e => e.GrossPay)
                .HasColumnType("numeric(18, 2)")
                .HasColumnName("Gross_Pay");
            entity.Property(e => e.IncomeTax)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Income_Tax");
            entity.Property(e => e.JoiningDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Joining_Date");
            entity.Property(e => e.LastPresent)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Last_Present");
            entity.Property(e => e.LeavesAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Leaves_Amount");
            entity.Property(e => e.LeavesPayable)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Leaves_Payable");
            entity.Property(e => e.LeavesType)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Leaves_Type");
            entity.Property(e => e.LeavingDate)
                .HasColumnType("datetime")
                .HasColumnName("Leaving_Date");
            entity.Property(e => e.LeavingType)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Leaving_Type");
            entity.Property(e => e.LoanAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Loan_Amount");
            entity.Property(e => e.MobileAllowance)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Mobile_Allowance");
            entity.Property(e => e.NoticeAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Notice_Amount");
            entity.Property(e => e.NoticeDays)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Notice_Days");
            entity.Property(e => e.OtherDeductions)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Other_Deductions");
            entity.Property(e => e.OtherPayable)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Other_Payable");
            entity.Property(e => e.OverTimeAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("OverTime_Amount");
            entity.Property(e => e.OverTimeHours)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("OverTime_Hours");
            entity.Property(e => e.PayableAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Payable_Amount");
            entity.Property(e => e.ProvidentFund)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Provident_Fund");
            entity.Property(e => e.ProvidentFundProfit)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Provident_Fund_Profit");
            entity.Property(e => e.SalaryAdvance)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Salary_Advance");
            entity.Property(e => e.SalaryAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Salary_Amount");
            entity.Property(e => e.SalaryDays)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Salary_Days");
            entity.Property(e => e.SalaryMonth)
                .HasColumnType("datetime")
                .HasColumnName("Salary_Month");
            entity.Property(e => e.SalaryUnpaid)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Salary_Unpaid");
            entity.Property(e => e.Shift)
                .HasMaxLength(2)
                .IsUnicode(false);
            entity.Property(e => e.Site)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.TotalSalary)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Total_Salary");
            entity.Property(e => e.TransactionDate)
                .HasColumnType("datetime")
                .HasColumnName("Transaction_Date");
            entity.Property(e => e.TransactionNo).HasColumnName("Transaction_No");
            entity.Property(e => e.UnpaidSalaryMonths)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("Unpaid_SalaryMonths");
            entity.Property(e => e.VehicleLoan)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Vehicle_Loan");
        });

        modelBuilder.Entity<HrmVewInTime>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("HRM_vew_InTime");

            entity.Property(e => e.AttendanceDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Attendance_Date");
            entity.Property(e => e.AttendanceType)
                .HasMaxLength(5)
                .IsUnicode(false)
                .HasColumnName("Attendance_Type");
            entity.Property(e => e.DepartmentCode).HasColumnName("Department_Code");
            entity.Property(e => e.DepartmentName)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("Department_Name");
            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.EmpName)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("Emp_Name");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Enter_By");
            entity.Property(e => e.EnteryTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Entery_Time");
            entity.Property(e => e.InTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("In_Time");
            entity.Property(e => e.Reason)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false);
            entity.Property(e => e.TransactionNo).HasColumnName("Transaction_No");
        });

        modelBuilder.Entity<HrmVewLeaf>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("HRM_vew_Leaves");

            entity.Property(e => e.ApplicationDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Application_Date");
            entity.Property(e => e.ApplicationNo).HasColumnName("Application_No");
            entity.Property(e => e.DeptCode).HasColumnName("Dept_Code");
            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.EmpFatherName)
                .HasMaxLength(150)
                .IsUnicode(false)
                .HasColumnName("Emp_FatherName");
            entity.Property(e => e.EmpName)
                .HasMaxLength(150)
                .IsUnicode(false)
                .HasColumnName("Emp_Name");
            entity.Property(e => e.EmpPicture)
                .HasColumnType("image")
                .HasColumnName("Emp_Picture");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Enter_By");
            entity.Property(e => e.EnteryTime)
                .HasColumnType("datetime")
                .HasColumnName("Entery_Time");
            entity.Property(e => e.FromDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("From_Date");
            entity.Property(e => e.LeaveApprovalStatus)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("LeaveApproval_Status");
            entity.Property(e => e.LeaveType)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Leave_Type");
            entity.Property(e => e.Reason)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.Remarks)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.SerialNo).HasColumnName("Serial_No");
            entity.Property(e => e.ShortLeaveDeducted).HasColumnName("ShortLeave_Deducted");
            entity.Property(e => e.Site)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.ToDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("To_Date");
            entity.Property(e => e.TotalLeaves)
                .HasColumnType("numeric(18, 2)")
                .HasColumnName("Total_Leaves");
        });

        modelBuilder.Entity<HrmVewLeaveApplication>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("HRM_vew_LeaveApplication");

            entity.Property(e => e.Assignment).IsUnicode(false);
            entity.Property(e => e.DepartmentName)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("Department_Name");
            entity.Property(e => e.DesignationName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Designation_Name");
            entity.Property(e => e.EditBy)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Edit_By");
            entity.Property(e => e.EditTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Edit_Time");
            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.EmpName)
                .HasMaxLength(150)
                .IsUnicode(false)
                .HasColumnName("Emp_Name");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Enter_By");
            entity.Property(e => e.EnteryTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Entery_Time");
            entity.Property(e => e.FromDate).HasColumnType("smalldatetime");
            entity.Property(e => e.LeaveDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Leave_Date");
            entity.Property(e => e.LeaveRequired)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Leave_Required");
            entity.Property(e => e.LeaveType)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Leave_Type");
            entity.Property(e => e.MoreThanOne).HasColumnName("MoreThan_One");
            entity.Property(e => e.Reason).IsUnicode(false);
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false);
            entity.Property(e => e.ToDate).HasColumnType("smalldatetime");
            entity.Property(e => e.TransDate).HasColumnType("smalldatetime");
        });

        modelBuilder.Entity<HrmVewLeaveBalance>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("HRM_vew_LeaveBalances");

            entity.Property(e => e.AlBalance)
                .HasColumnType("decimal(38, 6)")
                .HasColumnName("AL_Balance");
            entity.Property(e => e.ClBalance)
                .HasColumnType("decimal(38, 6)")
                .HasColumnName("CL_Balance");
            entity.Property(e => e.CplBalance)
                .HasColumnType("decimal(38, 6)")
                .HasColumnName("CPL_Balance");
            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.Site)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.SlBalance)
                .HasColumnType("decimal(38, 6)")
                .HasColumnName("SL_Balance");
        });

        modelBuilder.Entity<HrmVewLeaveDeduciton>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("HRM_vew_LeaveDeducitons");

            entity.Property(e => e.DepartmentName)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.DesignationName)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.EditBy)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("Edit_By");
            entity.Property(e => e.EditTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Edit_Time");
            entity.Property(e => e.EmpCardNo).HasColumnName("EMP_CardNo");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("Enter_By");
            entity.Property(e => e.EnteryTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Entery_Time");
            entity.Property(e => e.FatherName)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Leaves).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Name)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false);
            entity.Property(e => e.TransactionDate).HasColumnType("smalldatetime");
        });

        modelBuilder.Entity<HrmVewLeaveRegister>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("HRM_vew_LeaveRegister");

            entity.Property(e => e.AlAdd)
                .HasColumnType("decimal(18, 6)")
                .HasColumnName("AL_Add");
            entity.Property(e => e.AlOpen)
                .HasColumnType("decimal(18, 6)")
                .HasColumnName("AL_Open");
            entity.Property(e => e.AlUse)
                .HasColumnType("decimal(18, 6)")
                .HasColumnName("AL_Use");
            entity.Property(e => e.ClAdd)
                .HasColumnType("decimal(18, 6)")
                .HasColumnName("CL_Add");
            entity.Property(e => e.ClOpen)
                .HasColumnType("decimal(18, 6)")
                .HasColumnName("CL_Open");
            entity.Property(e => e.ClUse)
                .HasColumnType("decimal(18, 6)")
                .HasColumnName("CL_Use");
            entity.Property(e => e.CplAdd)
                .HasColumnType("decimal(18, 6)")
                .HasColumnName("CPL_Add");
            entity.Property(e => e.CplOpen)
                .HasColumnType("decimal(18, 6)")
                .HasColumnName("CPL_Open");
            entity.Property(e => e.CplUse)
                .HasColumnType("decimal(18, 6)")
                .HasColumnName("CPL_Use");
            entity.Property(e => e.DepartmentName)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("Department_Name");
            entity.Property(e => e.DeptCode).HasColumnName("Dept_Code");
            entity.Property(e => e.DesgCode).HasColumnName("Desg_Code");
            entity.Property(e => e.DesignationName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Designation_Name");
            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.EmpFatherName)
                .HasMaxLength(150)
                .IsUnicode(false)
                .HasColumnName("Emp_FatherName");
            entity.Property(e => e.EmpName)
                .HasMaxLength(150)
                .IsUnicode(false)
                .HasColumnName("Emp_Name");
            entity.Property(e => e.EmpPicture)
                .HasColumnType("image")
                .HasColumnName("Emp_Picture");
            entity.Property(e => e.JoiningDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Joining_Date");
            entity.Property(e => e.LeaveDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Leave_date");
            entity.Property(e => e.LeaveMonth).HasColumnName("Leave_Month");
            entity.Property(e => e.LeaveYear).HasColumnName("Leave_Year");
            entity.Property(e => e.Shift)
                .HasMaxLength(2)
                .IsUnicode(false);
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false);
            entity.Property(e => e.SlAdd)
                .HasColumnType("decimal(18, 6)")
                .HasColumnName("SL_Add");
            entity.Property(e => e.SlOpen)
                .HasColumnType("decimal(18, 6)")
                .HasColumnName("SL_Open");
            entity.Property(e => e.SlUse)
                .HasColumnType("decimal(18, 6)")
                .HasColumnName("SL_Use");
        });

        modelBuilder.Entity<HrmVewLeavesSum>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("HRM_vew_LeavesSum");

            entity.Property(e => e.AlAdd)
                .HasColumnType("decimal(38, 6)")
                .HasColumnName("AL_Add");
            entity.Property(e => e.AlOpen)
                .HasColumnType("decimal(38, 6)")
                .HasColumnName("AL_Open");
            entity.Property(e => e.AlUse)
                .HasColumnType("decimal(38, 6)")
                .HasColumnName("AL_Use");
            entity.Property(e => e.ClAdd)
                .HasColumnType("decimal(38, 6)")
                .HasColumnName("CL_Add");
            entity.Property(e => e.ClOpen)
                .HasColumnType("decimal(38, 6)")
                .HasColumnName("CL_Open");
            entity.Property(e => e.ClUse)
                .HasColumnType("decimal(38, 6)")
                .HasColumnName("CL_Use");
            entity.Property(e => e.CplAdd)
                .HasColumnType("decimal(38, 6)")
                .HasColumnName("CPL_Add");
            entity.Property(e => e.CplOpen)
                .HasColumnType("decimal(38, 6)")
                .HasColumnName("CPL_Open");
            entity.Property(e => e.CplUse)
                .HasColumnType("decimal(38, 6)")
                .HasColumnName("CPL_Use");
            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.Site)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.SlAdd)
                .HasColumnType("decimal(38, 6)")
                .HasColumnName("SL_Add");
            entity.Property(e => e.SlOpen)
                .HasColumnType("decimal(38, 6)")
                .HasColumnName("SL_Open");
            entity.Property(e => e.SlUse)
                .HasColumnType("decimal(38, 6)")
                .HasColumnName("SL_Use");
        });

        modelBuilder.Entity<HrmVewLoanDeduction>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("HRM_vew_LoanDeductions");

            entity.Property(e => e.DeductionAmount)
                .HasColumnType("numeric(18, 0)")
                .HasColumnName("Deduction_Amount");
            entity.Property(e => e.DeductionDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Deduction_Date");
            entity.Property(e => e.DepartmentName)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("Department_Name");
            entity.Property(e => e.DesignationName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Designation_Name");
            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.EmpFatherName)
                .HasMaxLength(150)
                .IsUnicode(false)
                .HasColumnName("Emp_FatherName");
            entity.Property(e => e.EmpName)
                .HasMaxLength(150)
                .IsUnicode(false)
                .HasColumnName("Emp_Name");
            entity.Property(e => e.LoanType)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Loan_Type");
            entity.Property(e => e.Shift)
                .HasMaxLength(2)
                .IsUnicode(false);
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false)
                .HasColumnName("site");
        });

        modelBuilder.Entity<HrmVewOutTime>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("HRM_vew_OutTime");

            entity.Property(e => e.AttendanceDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Attendance_Date");
            entity.Property(e => e.DepartmentCode).HasColumnName("Department_Code");
            entity.Property(e => e.DepartmentName)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("Department_Name");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Enter_By");
            entity.Property(e => e.EnteryTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Entery_Time");
            entity.Property(e => e.OutTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Out_Time");
            entity.Property(e => e.Reason)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false);
            entity.Property(e => e.TransactionNo).HasColumnName("Transaction_No");
        });

        modelBuilder.Entity<HrmVewSalaryIncrement>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("HRM_vew_SalaryIncrement");

            entity.Property(e => e.A01).HasColumnType("numeric(18, 2)");
            entity.Property(e => e.A10).HasColumnType("numeric(18, 2)");
            entity.Property(e => e.CurrentBasicPay)
                .HasColumnType("numeric(18, 2)")
                .HasColumnName("Current_BasicPay");
            entity.Property(e => e.CurrentGrossPay)
                .HasColumnType("numeric(18, 2)")
                .HasColumnName("Current_GrossPay");
            entity.Property(e => e.D01).HasColumnType("numeric(18, 2)");
            entity.Property(e => e.DepartmentName)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("Department_Name");
            entity.Property(e => e.DesignationName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Designation_Name");
            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.EmpFatherName)
                .HasMaxLength(150)
                .IsUnicode(false)
                .HasColumnName("Emp_FatherName");
            entity.Property(e => e.EmpName)
                .HasMaxLength(150)
                .IsUnicode(false)
                .HasColumnName("Emp_Name");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("Enter_By");
            entity.Property(e => e.Increment).HasColumnType("numeric(18, 2)");
            entity.Property(e => e.IncrementDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Increment_Date");
            entity.Property(e => e.OldBasicPay)
                .HasColumnType("numeric(18, 2)")
                .HasColumnName("Old_BasicPay");
            entity.Property(e => e.OldGrossPay)
                .HasColumnType("numeric(18, 2)")
                .HasColumnName("Old_GrossPay");
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false);
        });

        modelBuilder.Entity<HrmVewShortLeave>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("HRM_vew_ShortLeave");

            entity.Property(e => e.DepartmentName)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("Department_Name");
            entity.Property(e => e.DesignationName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Designation_Name");
            entity.Property(e => e.EditBy)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Edit_By");
            entity.Property(e => e.EditTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Edit_Time");
            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.EmpName)
                .HasMaxLength(150)
                .IsUnicode(false)
                .HasColumnName("Emp_Name");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Enter_By");
            entity.Property(e => e.EnteryTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Entery_Time");
            entity.Property(e => e.FromTime).HasColumnType("smalldatetime");
            entity.Property(e => e.LeaveDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Leave_Date");
            entity.Property(e => e.LeaveType)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Leave_Type");
            entity.Property(e => e.Reason).IsUnicode(false);
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false);
            entity.Property(e => e.Totime).HasColumnType("smalldatetime");
            entity.Property(e => e.TransDate).HasColumnType("smalldatetime");
        });

        modelBuilder.Entity<HrmVewSpecialAllowance>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("HRM_vew_SpecialAllowance");

            entity.Property(e => e.BankAccount)
                .HasMaxLength(50)
                .HasColumnName("Bank_Account");
            entity.Property(e => e.DepartmentName)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.DesignationName)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.EditBy)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("Edit_By");
            entity.Property(e => e.EditTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Edit_Time");
            entity.Property(e => e.EmpCardNo).HasColumnName("EMP_CardNo");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("Enter_By");
            entity.Property(e => e.EnteryTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Entery_Time");
            entity.Property(e => e.FatherName)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Name)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false);
            entity.Property(e => e.SpecialAllowance).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.TransactionDate).HasColumnType("smalldatetime");
        });

        modelBuilder.Entity<HrmVewUpdateSalaryBreakup>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("HRM_vew_UpdateSalaryBreakup");

            entity.Property(e => e.Adh1)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("ADH1");
            entity.Property(e => e.Adh2)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("ADH2");
            entity.Property(e => e.Adh3)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("ADH3");
            entity.Property(e => e.Allowance).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Allowances).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.BasicPay)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Basic_Pay");
            entity.Property(e => e.Conveyance).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.DAdvance)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("D_Advance");
            entity.Property(e => e.DEobi)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("D_EOBI");
            entity.Property(e => e.DLoan)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("D_Loan");
            entity.Property(e => e.DLvs)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("D_Lvs");
            entity.Property(e => e.DProvidentFund)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("D_Provident_Fund");
            entity.Property(e => e.DTax)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("D_Tax");
            entity.Property(e => e.EditBy)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Edit_By");
            entity.Property(e => e.EditTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Edit_Time");
            entity.Property(e => e.EmpCardNo).HasColumnName("EMP_CardNo");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Enter_By");
            entity.Property(e => e.EnteryTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Entery_Time");
            entity.Property(e => e.Eobi)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("EOBI");
            entity.Property(e => e.GrossPay)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Gross_Pay");
            entity.Property(e => e.HouseRent)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("House_Rent");
            entity.Property(e => e.Name)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.NetPay)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Net_Pay");
            entity.Property(e => e.ProvidentFund)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Provident_Fund");
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false);
            entity.Property(e => e.ThirtyFivePercent)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("ThirtyFive_Percent");
            entity.Property(e => e.TransactionDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Transaction_Date");
            entity.Property(e => e.TransactionNo).HasColumnName("Transaction_No");
            entity.Property(e => e.TwentyPercent)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Twenty_Percent");
            entity.Property(e => e.TwentyPercent1)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Twenty_Percent1");
        });

        modelBuilder.Entity<Leaf>(entity =>
        {
            entity.HasKey(e => new { e.EmpCardNo, e.AppNo, e.Site });

            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.AppNo).HasColumnName("App_No");
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false)
                .HasColumnName("site");
            entity.Property(e => e.AppDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("App_Date");
            entity.Property(e => e.CoveringCardNo).HasColumnName("Covering_CardNo");
            entity.Property(e => e.CoveringContactNo)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Covering_ContactNo");
            entity.Property(e => e.CoveringName)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("Covering_Name");
            entity.Property(e => e.CplDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("CPL_Date");
            entity.Property(e => e.EditBy)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("Edit_By");
            entity.Property(e => e.EditTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Edit_Time");
            entity.Property(e => e.EmpContactNo)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Emp_ContactNo");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("Enter_By");
            entity.Property(e => e.EnteryTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Entery_Time");
            entity.Property(e => e.FromDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("From_Date");
            entity.Property(e => e.LeaveAddress)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("Leave_Address");
            entity.Property(e => e.LeaveReason)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("Leave_Reason");
            entity.Property(e => e.LeaveType)
                .HasMaxLength(3)
                .IsUnicode(false)
                .HasColumnName("Leave_Type");
            entity.Property(e => e.Remarks)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.SerialNo)
                .ValueGeneratedOnAdd()
                .HasColumnName("Serial_No");
            entity.Property(e => e.ToDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("To_Date");
            entity.Property(e => e.TotalLeaves)
                .HasColumnType("numeric(18, 2)")
                .HasColumnName("Total_Leaves");
        });

        modelBuilder.Entity<Loan>(entity =>
        {
            entity.HasKey(e => e.AppNo).HasName("PK_advances");

            entity.Property(e => e.AppNo)
                .ValueGeneratedNever()
                .HasColumnName("App_No");
            entity.Property(e => e.EditBy)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("Edit_By");
            entity.Property(e => e.EditTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Edit_Time");
            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("Enter_By");
            entity.Property(e => e.EnteryTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Entery_Time");
            entity.Property(e => e.LoanAmount)
                .HasColumnType("numeric(18, 0)")
                .HasColumnName("Loan_Amount");
            entity.Property(e => e.LoanBalance)
                .HasColumnType("numeric(18, 0)")
                .HasColumnName("Loan_Balance");
            entity.Property(e => e.LoanClear).HasColumnName("Loan_Clear");
            entity.Property(e => e.LoanDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Loan_Date");
            entity.Property(e => e.LoanInstallment)
                .HasColumnType("numeric(18, 0)")
                .HasColumnName("Loan_Installment");
            entity.Property(e => e.LoanType)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Loan_Type");
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false)
                .HasColumnName("site");
        });

        modelBuilder.Entity<LoanDeduction>(entity =>
        {
            entity.HasKey(e => e.SerialNo);

            entity.ToTable("Loan_Deductions");

            entity.Property(e => e.SerialNo).HasColumnName("Serial_No");
            entity.Property(e => e.DeductionAmount)
                .HasColumnType("numeric(18, 0)")
                .HasColumnName("Deduction_Amount");
            entity.Property(e => e.DeductionDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Deduction_Date");
            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.LoanType)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Loan_Type");
        });

        modelBuilder.Entity<LoanDeductionsPfAmount>(entity =>
        {
            entity.HasKey(e => e.SerialNo);

            entity.ToTable("Loan_DeductionsPF_Amount");

            entity.Property(e => e.SerialNo).HasColumnName("Serial_No");
            entity.Property(e => e.DeductionAmount)
                .HasColumnType("numeric(18, 0)")
                .HasColumnName("Deduction_Amount");
            entity.Property(e => e.DeductionDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Deduction_Date");
            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.LoanType)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Loan_Type");
        });

        modelBuilder.Entity<LoanLedgerTemp>(entity =>
        {
            entity
                .HasNoKey()
                .ToTable("LoanLedgerTemp");

            entity.Property(e => e.AppNo).HasColumnName("App_No");
            entity.Property(e => e.EmpCardNo)
                .HasMaxLength(7)
                .IsUnicode(false)
                .HasColumnName("Emp_CardNo");
            entity.Property(e => e.LoanAmount)
                .HasColumnType("numeric(9, 2)")
                .HasColumnName("Loan_Amount");
            entity.Property(e => e.LoanDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Loan_Date");
            entity.Property(e => e.LoanInstallment)
                .HasColumnType("numeric(9, 2)")
                .HasColumnName("Loan_Installment");
            entity.Property(e => e.LoanType)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Loan_Type");
        });

        modelBuilder.Entity<LoanType>(entity =>
        {
            entity.HasKey(e => e.LoanId).HasName("PK_Advance_Types");

            entity.ToTable("Loan_Types");

            entity.Property(e => e.LoanId)
                .ValueGeneratedNever()
                .HasColumnName("Loan_ID");
            entity.Property(e => e.LoanType1)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Loan_Type");
        });

        modelBuilder.Entity<Location>(entity =>
        {
            entity.HasKey(e => e.LocationCode).HasName("PK_Location_1");

            entity.ToTable("Location");

            entity.Property(e => e.LocationCode)
                .ValueGeneratedNever()
                .HasColumnName("Location_Code");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Enter_By");
            entity.Property(e => e.LocationName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Location_Name");
        });

        modelBuilder.Entity<MachineAttendance>(entity =>
        {
            entity.HasKey(e => e.RecordNo);

            entity.ToTable("Machine_Attendance");

            entity.Property(e => e.RecordNo).HasColumnName("Record_No");
            entity.Property(e => e.Absent).HasDefaultValue(false);
            entity.Property(e => e.AttendanceDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Attendance_Date");
            entity.Property(e => e.AttendanceType)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Attendance_Type");
            entity.Property(e => e.EarlyGoing)
                .HasDefaultValue(0)
                .HasColumnName("Early_Going");
            entity.Property(e => e.EarlyGoingDeducted).HasColumnName("Early_Going_Deducted");
            entity.Property(e => e.EarlyGoneApprovalStatus)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("EarlyGoneApproval_Status");
            entity.Property(e => e.EarlyMinutes)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Early_Minutes");
            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.HoursToWork)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Hours_ToWork");
            entity.Property(e => e.InDate)
                .HasDefaultValueSql("('')")
                .HasColumnType("smalldatetime")
                .HasColumnName("In_Date");
            entity.Property(e => e.InImage)
                .HasColumnType("image")
                .HasColumnName("In_Image");
            entity.Property(e => e.InStatus).HasColumnName("In_Status");
            entity.Property(e => e.LateAllowed)
                .HasDefaultValue(0)
                .HasColumnName("Late_Allowed");
            entity.Property(e => e.LateArrival)
                .HasDefaultValue(0)
                .HasColumnName("Late_Arrival");
            entity.Property(e => e.LateArrivalApprovalStatus)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("LateArrivalApproval_Status");
            entity.Property(e => e.LateArrivalDeducted).HasColumnName("Late_Arrival_Deducted");
            entity.Property(e => e.LateEarlyReason)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("Late_Early_Reason");
            entity.Property(e => e.LateMinutes)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Late_Minutes");
            entity.Property(e => e.LeaveDeducted)
                .HasDefaultValue(0.0)
                .HasColumnName("Leave_Deducted");
            entity.Property(e => e.OutDate)
                .HasDefaultValueSql("('')")
                .HasColumnType("smalldatetime")
                .HasColumnName("Out_Date");
            entity.Property(e => e.OutImage)
                .HasColumnType("image")
                .HasColumnName("Out_Image");
            entity.Property(e => e.OutStatus).HasColumnName("Out_Status");
            entity.Property(e => e.OverTimeMinutes)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("OverTime_Minutes");
            entity.Property(e => e.Remarks)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasDefaultValue("");
        });

        modelBuilder.Entity<MonthlySalary>(entity =>
        {
            entity.HasKey(e => new { e.EmpCardNo, e.SalaryMonth, e.Site, e.SalaryYear });

            entity.ToTable("Monthly_Salary");

            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.SalaryMonth).HasColumnName("Salary_Month");
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false)
                .HasColumnName("site");
            entity.Property(e => e.SalaryYear).HasColumnName("Salary_Year");
            entity.Property(e => e.A01).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.A02).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.A03).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.A04).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.A05).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.A06).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.A07).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.A08).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.A09).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.A10).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.A11).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.A12).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.A13).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.BasicPay)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("BASIC_Pay");
            entity.Property(e => e.D01).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.D02).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.D03).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.D04).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.D05)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)");
            entity.Property(e => e.D06)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)");
            entity.Property(e => e.D07)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)");
            entity.Property(e => e.D08)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)");
            entity.Property(e => e.D09)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)");
            entity.Property(e => e.D10)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)");
            entity.Property(e => e.D11)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)");
            entity.Property(e => e.D12)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)");
            entity.Property(e => e.D13)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)");
            entity.Property(e => e.D14)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Days).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.DaysAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Days_Amount");
            entity.Property(e => e.EditBy)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("Edit_By");
            entity.Property(e => e.EditTime)
                .HasColumnType("datetime")
                .HasColumnName("Edit_Time");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("Enter_By");
            entity.Property(e => e.EnteryTime)
                .HasColumnType("datetime")
                .HasColumnName("Entery_Time");
            entity.Property(e => e.EobiSchoolShare)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("EOBI_SchoolShare");
            entity.Property(e => e.GrossPay)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("GROSS_Pay");
            entity.Property(e => e.LateDeduction)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Late_Deduction");
            entity.Property(e => e.LeaveDeducted)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Leave_Deducted");
            entity.Property(e => e.LeaveDeductionAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Leave_Deduction_Amount");
            entity.Property(e => e.LongTermLoanBalance)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("LongTerm_LoanBalance");
            entity.Property(e => e.NetPay)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("NET_Pay");
            entity.Property(e => e.OtherAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Other_Amount");
            entity.Property(e => e.OtherDays)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Other_Days");
            entity.Property(e => e.OverTimeAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("OverTime_Amount");
            entity.Property(e => e.OverTimeDays)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("OverTime_Days");
            entity.Property(e => e.PfSchoolShare)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("PF_SchoolShare");
            entity.Property(e => e.ProvidentFundLoanBalance)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Provident_FundLoanBalance");
            entity.Property(e => e.Remarks)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasDefaultValue("");
            entity.Property(e => e.Salary)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("salary");
            entity.Property(e => e.SalaryCreated).HasColumnName("Salary_Created");
            entity.Property(e => e.SalaryDate)
                .HasColumnType("datetime")
                .HasColumnName("Salary_Date");
            entity.Property(e => e.Scale)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.TotalDeductions)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Total_Deductions");
            entity.Property(e => e.TotalLate)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Total_Late");
            entity.Property(e => e.TotalProvidentFund)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Total_ProvidentFund");
        });

        modelBuilder.Entity<OverTimeChild>(entity =>
        {
            entity.HasKey(e => e.SerialNo);

            entity.ToTable("OverTime_Child");

            entity.Property(e => e.SerialNo).HasColumnName("Serial_No");
            entity.Property(e => e.EmpCardNo)
                .HasDefaultValueSql("('')")
                .HasColumnName("Emp_CardNo");
            entity.Property(e => e.FromTime)
                .HasColumnType("datetime")
                .HasColumnName("From_Time");
            entity.Property(e => e.OverTime)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)");
            entity.Property(e => e.OverTimeAmount)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("OverTime_Amount");
            entity.Property(e => e.OverTimeNo).HasColumnName("OverTime_No");
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false)
                .HasDefaultValue("");
            entity.Property(e => e.ToTime)
                .HasColumnType("datetime")
                .HasColumnName("To_Time");
        });

        modelBuilder.Entity<OverTimeMaster>(entity =>
        {
            entity.HasKey(e => new { e.OverTimeNo, e.Site });

            entity.ToTable("OverTime_Master");

            entity.Property(e => e.OverTimeNo).HasColumnName("OverTime_No");
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false)
                .HasDefaultValue("");
            entity.Property(e => e.EditBy)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Edit_By");
            entity.Property(e => e.EditTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Edit_Time");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Enter_By");
            entity.Property(e => e.EnteryTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Entery_Time");
            entity.Property(e => e.OverTimeDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("OverTime_Date");
            entity.Property(e => e.OverTimeGazetted).HasColumnName("OverTime_Gazetted");
        });

        modelBuilder.Entity<SalaryUnit>(entity =>
        {
            entity.HasKey(e => e.UnitId);

            entity.ToTable("Salary_Units");

            entity.Property(e => e.UnitId)
                .ValueGeneratedNever()
                .HasColumnName("Unit_ID");
            entity.Property(e => e.UnitName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Unit_Name");
        });

        modelBuilder.Entity<Shift>(entity =>
        {
            entity.HasKey(e => e.ShiftId).HasName("PK_Shifts_1");

            entity.Property(e => e.ShiftId)
                .ValueGeneratedNever()
                .HasColumnName("Shift_ID");
            entity.Property(e => e.ShiftName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Shift_Name");
            entity.Property(e => e.ShiftType)
                .HasMaxLength(1)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Shift_Type");
        });

        modelBuilder.Entity<ShiftTiming>(entity =>
        {
            entity.HasKey(e => new { e.TransactionNo, e.Site });

            entity.ToTable("Shift_Timing");

            entity.Property(e => e.TransactionNo).HasColumnName("Transaction_No");
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false);
            entity.Property(e => e.DepartmentId).HasColumnName("Department_ID");
            entity.Property(e => e.EditBy)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Edit_By");
            entity.Property(e => e.EditTime)
                .HasColumnType("datetime")
                .HasColumnName("Edit_Time");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Enter_By");
            entity.Property(e => e.EnteryTime)
                .HasColumnType("datetime")
                .HasColumnName("Entery_Time");
            entity.Property(e => e.FromDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("From_Date");
            entity.Property(e => e.InTime)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("In_Time");
            entity.Property(e => e.OutTime)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("Out_Time");
            entity.Property(e => e.ToDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("To_Date");
        });

        modelBuilder.Entity<TempDailyAttenAll>(entity =>
        {
            entity.HasKey(e => e.SerialNo);

            entity.ToTable("Temp_DailyAttenAll");

            entity.Property(e => e.SerialNo).HasColumnName("Serial_No");
            entity.Property(e => e.AttendanceDate)
                .HasDefaultValueSql("('')")
                .HasColumnType("smalldatetime")
                .HasColumnName("Attendance_Date");
            entity.Property(e => e.AttendanceStatus)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Attendance_Status");
            entity.Property(e => e.DeptName)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Dept_Name");
            entity.Property(e => e.DesgName)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Desg_Name");
            entity.Property(e => e.EmpCardNo)
                .HasDefaultValueSql("('')")
                .HasColumnName("Emp_CardNo");
            entity.Property(e => e.EmpName)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Emp_Name");
            entity.Property(e => e.Grade)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("");
            entity.Property(e => e.InDate)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("00:00")
                .HasColumnName("In_Date");
            entity.Property(e => e.InTime)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("In_Time");
            entity.Property(e => e.OutDate)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Out_Date");
            entity.Property(e => e.OutTime)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Out_Time");
            entity.Property(e => e.RestDay)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Rest_Day");
            entity.Property(e => e.Shift)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("");
            entity.Property(e => e.WorkingHours)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 0)")
                .HasColumnName("Working_Hours");
        });

        modelBuilder.Entity<TempPfLoanDetail>(entity =>
        {
            entity
                .HasNoKey()
                .ToTable("Temp_PF_LoanDetail");

            entity.Property(e => e.DepartmentCode).HasColumnName("Department_Code");
            entity.Property(e => e.Designation)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.EmpName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Emp_Name");
            entity.Property(e => e.EobiSchoolShare)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("EOBI_SchoolShare");
            entity.Property(e => e.MonthlyPfDeduction)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Monthly_PF_Deduction");
            entity.Property(e => e.MonthlyPfLoanReturn)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Monthly_PF_LoanReturn");
            entity.Property(e => e.PfSchoolShare)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("PF_SchoolShare");
            entity.Property(e => e.SalaryMonth).HasColumnName("Salary_Month");
            entity.Property(e => e.SalaryYear).HasColumnName("Salary_Year");
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false);
            entity.Property(e => e.TotalMonthlyDeduction)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Total_MonthlyDeduction");
        });

        modelBuilder.Entity<TimeCard>(entity =>
        {
            entity.HasKey(e => new { e.EmpCardNo, e.AttendanceDate });

            entity.ToTable("Time_Card");

            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.AttendanceDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Attendance_Date");
            entity.Property(e => e.AttnedanceType)
                .HasMaxLength(15)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Attnedance_Type");
            entity.Property(e => e.Daycount)
                .HasDefaultValue(0)
                .HasColumnName("daycount");
            entity.Property(e => e.DeptName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Dept_Name");
            entity.Property(e => e.DesgName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Desg_Name");
            entity.Property(e => e.EarlyGoing).HasColumnName("Early_Going");
            entity.Property(e => e.EmpName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Emp_Name");
            entity.Property(e => e.EmployeeType)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Employee_Type");
            entity.Property(e => e.GrossPay)
                .HasDefaultValue(0m)
                .HasColumnType("numeric(18, 2)")
                .HasColumnName("Gross_Pay");
            entity.Property(e => e.InDate)
                .HasDefaultValueSql("('')")
                .HasColumnType("smalldatetime")
                .HasColumnName("In_Date");
            entity.Property(e => e.InTime)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("In_Time");
            entity.Property(e => e.JoiningDate)
                .HasDefaultValueSql("('')")
                .HasColumnType("smalldatetime")
                .HasColumnName("Joining_Date");
            entity.Property(e => e.LateArrival)
                .HasDefaultValue(0)
                .HasColumnName("Late_Arrival");
            entity.Property(e => e.OutDate)
                .HasDefaultValueSql("('')")
                .HasColumnType("smalldatetime")
                .HasColumnName("Out_Date");
            entity.Property(e => e.Remarks)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasDefaultValue("");
            entity.Property(e => e.Shift)
                .HasMaxLength(3)
                .IsUnicode(false)
                .HasDefaultValue("");
        });

        modelBuilder.Entity<VewAbsentee>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vew_Absentees");

            entity.Property(e => e.AttendanceDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Attendance_Date");
            entity.Property(e => e.DepartmentName)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("Department_Name");
            entity.Property(e => e.DesignationName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Designation_Name");
            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.EmpName)
                .HasMaxLength(150)
                .IsUnicode(false)
                .HasColumnName("Emp_Name");
            entity.Property(e => e.InTime)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("In_Time");
            entity.Property(e => e.OutTime)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("Out_Time");
            entity.Property(e => e.RestDay)
                .HasMaxLength(15)
                .IsUnicode(false)
                .HasColumnName("Rest_Day");
            entity.Property(e => e.Shift)
                .HasMaxLength(2)
                .IsUnicode(false);
        });

        modelBuilder.Entity<VewAttendance>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vew_Attendance");

            entity.Property(e => e.AttendanceDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Attendance_Date");
            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.IsOverTime).HasColumnName("is_Over_Time");
            entity.Property(e => e.TotalSeconds).HasColumnName("Total_Seconds");
            entity.Property(e => e.WorkingHours)
                .HasColumnType("decimal(9, 2)")
                .HasColumnName("Working_Hours");
        });

        modelBuilder.Entity<VewAttendanceRegister>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vew_Attendance_Register");

            entity.Property(e => e.AttendanceDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Attendance_Date");
            entity.Property(e => e.AttnedanceType)
                .HasMaxLength(5)
                .IsUnicode(false)
                .HasColumnName("Attnedance_Type");
            entity.Property(e => e.DepartmentName)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("Department_Name");
            entity.Property(e => e.DeptCode).HasColumnName("Dept_Code");
            entity.Property(e => e.DesgCode).HasColumnName("Desg_Code");
            entity.Property(e => e.DesignationName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Designation_Name");
            entity.Property(e => e.EarlyGone).HasColumnName("Early_Gone");
            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.EmpName)
                .HasMaxLength(150)
                .IsUnicode(false)
                .HasColumnName("Emp_Name");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(15)
                .IsUnicode(false)
                .HasColumnName("Enter_By");
            entity.Property(e => e.GlapprovalStatus)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("GLApproval_Status");
            entity.Property(e => e.GradeName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Grade_Name");
            entity.Property(e => e.LateArrival).HasColumnName("Late_Arrival");
            entity.Property(e => e.LeaveDeducted).HasColumnName("Leave_Deducted");
            entity.Property(e => e.OverTime)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Over_Time");
            entity.Property(e => e.RecordNo).HasColumnName("Record_No");
            entity.Property(e => e.SalaryUnit)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Salary_Unit");
            entity.Property(e => e.Shift)
                .HasMaxLength(2)
                .IsUnicode(false);
            entity.Property(e => e.ShortTime)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Short_Time");
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false);
            entity.Property(e => e.TotalDays)
                .HasColumnType("numeric(10, 2)")
                .HasColumnName("Total_Days");
            entity.Property(e => e.TotalHours)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Total_Hours");
            entity.Property(e => e.TotalLate)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Total_Late");
            entity.Property(e => e.TotalSeconds).HasColumnName("Total_Seconds");
        });

        modelBuilder.Entity<VewDailyAttendance>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vew_Daily_Attendance");

            entity.Property(e => e.AttendanceDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Attendance_Date");
            entity.Property(e => e.AttendanceType)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("Attendance_Type");
            entity.Property(e => e.DepartmentName)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("Department_Name");
            entity.Property(e => e.DesignationName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Designation_Name");
            entity.Property(e => e.EarlyGoing).HasColumnName("Early_Going");
            entity.Property(e => e.EarlyGoingDeducted).HasColumnName("Early_Going_Deducted");
            entity.Property(e => e.EarlyGoneApprovalStatus)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("EarlyGoneApproval_Status");
            entity.Property(e => e.EarlyMinutes)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Early_Minutes");
            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.EmpName)
                .HasMaxLength(150)
                .IsUnicode(false)
                .HasColumnName("Emp_Name");
            entity.Property(e => e.InDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("In_Date");
            entity.Property(e => e.InImage)
                .HasColumnType("image")
                .HasColumnName("In_Image");
            entity.Property(e => e.InTime)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("In_Time");
            entity.Property(e => e.IsOverTime).HasColumnName("is_Over_Time");
            entity.Property(e => e.JoiningDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Joining_Date");
            entity.Property(e => e.LateAllowed).HasColumnName("Late_Allowed");
            entity.Property(e => e.LateArrival).HasColumnName("Late_Arrival");
            entity.Property(e => e.LateArrivalApprovalStatus)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("LateArrivalApproval_Status");
            entity.Property(e => e.LateArrivalDeducted).HasColumnName("Late_Arrival_Deducted");
            entity.Property(e => e.LateEarlyReason)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("Late_Early_Reason");
            entity.Property(e => e.LateMinutes)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Late_Minutes");
            entity.Property(e => e.OutDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Out_Date");
            entity.Property(e => e.OutImage)
                .HasColumnType("image")
                .HasColumnName("Out_Image");
            entity.Property(e => e.OutTime)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("Out_Time");
            entity.Property(e => e.RecordNo).HasColumnName("Record_No");
            entity.Property(e => e.Remarks)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.RestDay)
                .HasMaxLength(15)
                .IsUnicode(false)
                .HasColumnName("Rest_Day");
            entity.Property(e => e.Shift)
                .HasMaxLength(2)
                .IsUnicode(false);
            entity.Property(e => e.WorkingHours)
                .HasColumnType("decimal(9, 2)")
                .HasColumnName("Working_Hours");
        });

        modelBuilder.Entity<VewDesignation>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vew_Designation");

            entity.Property(e => e.DesignationCode).HasColumnName("Designation_Code");
            entity.Property(e => e.DesignationName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Designation_Name");
            entity.Property(e => e.GradeName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Grade_Name");
            entity.Property(e => e.MaximumSalary)
                .HasColumnType("numeric(18, 2)")
                .HasColumnName("Maximum_Salary");
            entity.Property(e => e.MinimumSalary)
                .HasColumnType("numeric(18, 2)")
                .HasColumnName("Minimum_Salary");
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false);
        });

        modelBuilder.Entity<VewEmployee>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vew_Employee");

            entity.Property(e => e.A01).HasColumnType("numeric(18, 2)");
            entity.Property(e => e.A02).HasColumnType("numeric(18, 2)");
            entity.Property(e => e.A03).HasColumnType("numeric(18, 2)");
            entity.Property(e => e.A04).HasColumnType("numeric(18, 2)");
            entity.Property(e => e.A05).HasColumnType("numeric(18, 2)");
            entity.Property(e => e.A06).HasColumnType("numeric(18, 2)");
            entity.Property(e => e.A07).HasColumnType("numeric(18, 2)");
            entity.Property(e => e.A08).HasColumnType("numeric(18, 2)");
            entity.Property(e => e.A09).HasColumnType("numeric(18, 2)");
            entity.Property(e => e.A10).HasColumnType("numeric(18, 2)");
            entity.Property(e => e.A11).HasColumnType("numeric(18, 2)");
            entity.Property(e => e.A12).HasColumnType("numeric(18, 2)");
            entity.Property(e => e.Address)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.BankAccount)
                .HasMaxLength(50)
                .HasColumnName("Bank_Account");
            entity.Property(e => e.BankId).HasColumnName("Bank_ID");
            entity.Property(e => e.BankName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Bank_Name");
            entity.Property(e => e.BasicPay)
                .HasColumnType("numeric(18, 2)")
                .HasColumnName("Basic_Pay");
            entity.Property(e => e.BirthDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Birth_Date");
            entity.Property(e => e.BloodGroup)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("Blood_Group");
            entity.Property(e => e.Category)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Certification)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.Cnic)
                .HasMaxLength(50)
                .HasColumnName("CNIC");
            entity.Property(e => e.ConfirmationDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Confirmation_Date");
            entity.Property(e => e.D01).HasColumnType("numeric(18, 2)");
            entity.Property(e => e.D02).HasColumnType("numeric(18, 2)");
            entity.Property(e => e.D03).HasColumnType("numeric(18, 2)");
            entity.Property(e => e.D04).HasColumnType("numeric(18, 2)");
            entity.Property(e => e.D05).HasColumnType("numeric(18, 2)");
            entity.Property(e => e.D06).HasColumnType("numeric(18, 2)");
            entity.Property(e => e.D07).HasColumnType("numeric(18, 2)");
            entity.Property(e => e.D08).HasColumnType("numeric(18, 2)");
            entity.Property(e => e.D09).HasColumnType("numeric(18, 2)");
            entity.Property(e => e.D10).HasColumnType("numeric(18, 2)");
            entity.Property(e => e.D11).HasColumnType("numeric(18, 2)");
            entity.Property(e => e.D12).HasColumnType("numeric(18, 2)");
            entity.Property(e => e.DepartmentName)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("Department_Name");
            entity.Property(e => e.Dependents)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.DeptCode).HasColumnName("Dept_Code");
            entity.Property(e => e.DesgCode).HasColumnName("Desg_Code");
            entity.Property(e => e.DesignationName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Designation_Name");
            entity.Property(e => e.Email)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.EmergencyNo)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Emergency_No");
            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.EmpFatherName)
                .HasMaxLength(150)
                .IsUnicode(false)
                .HasColumnName("Emp_FatherName");
            entity.Property(e => e.EmpName)
                .HasMaxLength(150)
                .IsUnicode(false)
                .HasColumnName("Emp_Name");
            entity.Property(e => e.FirstName)
                .HasMaxLength(150)
                .IsUnicode(false);
            entity.Property(e => e.MiddleName)
                .HasMaxLength(150)
                .IsUnicode(false);
            entity.Property(e => e.LastName)
                .HasMaxLength(150)
                .IsUnicode(false);
            entity.Property(e => e.EmpOldCardNo).HasColumnName("Emp_OldCardNo");
            entity.Property(e => e.EmpPicture)
                .HasColumnType("image")
                .HasColumnName("Emp_Picture");
            entity.Property(e => e.EmpStatus)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Emp_Status");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("Enter_By");
            entity.Property(e => e.EobiNo)
                .HasMaxLength(13)
                .HasColumnName("EOBI_No");
            entity.Property(e => e.EobiOpening)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("EOBI_Opening");
            entity.Property(e => e.EobiSchoolShare)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("EOBI_SchoolShare");
            entity.Property(e => e.Experience)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.ExtensionNo)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Extension_No");
            entity.Property(e => e.GradeName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Grade_Name");
            entity.Property(e => e.GrossPay)
                .HasColumnType("numeric(18, 2)")
                .HasColumnName("Gross_Pay");
            entity.Property(e => e.InTime)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("In_Time");
            entity.Property(e => e.IsEobi).HasColumnName("is_EOBI");
            entity.Property(e => e.IsOverTime).HasColumnName("is_Over_Time");
            entity.Property(e => e.IsSalaryBlocked).HasColumnName("Is_Salary_Blocked");
            entity.Property(e => e.IsSs).HasColumnName("is_SS");
            entity.Property(e => e.JoiningDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Joining_Date");
            entity.Property(e => e.LeftType)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Left_Type");
            entity.Property(e => e.LocationCode).HasColumnName("Location_Code");
            entity.Property(e => e.MaritalStatus)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Marital_Status");
            entity.Property(e => e.MaximumSalary)
                .HasColumnType("numeric(18, 2)")
                .HasColumnName("Maximum_Salary");
            entity.Property(e => e.MinimumSalary)
                .HasColumnType("numeric(18, 2)")
                .HasColumnName("Minimum_Salary");
            entity.Property(e => e.NetPay)
                .HasColumnType("numeric(18, 2)")
                .HasColumnName("Net_Pay");
            entity.Property(e => e.OpeningDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Opening_Date");
            entity.Property(e => e.OutTime)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("Out_Time");
            entity.Property(e => e.ReportingTiming)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("Reporting_Timing");
            entity.Property(e => e.PfSchoolShare)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("PF_SchoolShare");
            entity.Property(e => e.PhoneNo)
                .HasMaxLength(150)
                .IsUnicode(false)
                .HasColumnName("Phone_No");
            entity.Property(e => e.PositionTitle)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Position_Title");
            entity.Property(e => e.ProvidantFundOpening)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("ProvidantFund_Opening");
            entity.Property(e => e.Qualification)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.Religion)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Remarks)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.ResignDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Resign_Date");
            entity.Property(e => e.RestDay)
                .HasMaxLength(15)
                .IsUnicode(false)
                .HasColumnName("Rest_Day");
            entity.Property(e => e.SalLec)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Sal_Lec");
            entity.Property(e => e.SalaryUnit)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Salary_Unit");
            entity.Property(e => e.Scale)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Sex)
                .HasMaxLength(2)
                .IsUnicode(false);
            entity.Property(e => e.Shift)
                .HasMaxLength(2)
                .IsUnicode(false);
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false)
                .HasColumnName("site");
            entity.Property(e => e.SocialSecurityOpening)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("SocialSecurity_Opening");
            entity.Property(e => e.SsNo)
                .HasMaxLength(13)
                .HasColumnName("SS_No");
            entity.Property(e => e.StuckOff).HasColumnName("Stuck_Off");
            entity.Property(e => e.StuckOffDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Stuck_Off_Date");
            entity.Property(e => e.WorkingHours)
                .HasColumnType("decimal(9, 2)")
                .HasColumnName("Working_Hours");
        });

        modelBuilder.Entity<VewLeaf>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vew_Leaves");

            entity.Property(e => e.AppDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("App_Date");
            entity.Property(e => e.AppNo).HasColumnName("App_No");
            entity.Property(e => e.Category)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.CoveringCardNo).HasColumnName("Covering_CardNo");
            entity.Property(e => e.CoveringContactNo)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Covering_ContactNo");
            entity.Property(e => e.CoveringName)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("Covering_Name");
            entity.Property(e => e.CplDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("CPL_Date");
            entity.Property(e => e.DepartmentName)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("Department_Name");
            entity.Property(e => e.DesignationName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Designation_Name");
            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.EmpContactNo)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Emp_ContactNo");
            entity.Property(e => e.EmpFatherName)
                .HasMaxLength(150)
                .IsUnicode(false)
                .HasColumnName("Emp_FatherName");
            entity.Property(e => e.EmpName)
                .HasMaxLength(150)
                .IsUnicode(false)
                .HasColumnName("Emp_Name");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("Enter_By");
            entity.Property(e => e.FromDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("From_Date");
            entity.Property(e => e.GradeName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Grade_Name");
            entity.Property(e => e.LeaveAddress)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("Leave_Address");
            entity.Property(e => e.LeaveName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Leave_Name");
            entity.Property(e => e.LeaveReason)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("Leave_Reason");
            entity.Property(e => e.LeaveType)
                .HasMaxLength(3)
                .IsUnicode(false)
                .HasColumnName("Leave_Type");
            entity.Property(e => e.Remarks)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false)
                .HasColumnName("site");
            entity.Property(e => e.ToDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("To_Date");
            entity.Property(e => e.TotalLeaves)
                .HasColumnType("numeric(18, 2)")
                .HasColumnName("Total_Leaves");
        });

        modelBuilder.Entity<VewLeaveRegister>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vew_LeaveRegister");

            entity.Property(e => e.Aladd)
                .HasColumnType("decimal(18, 6)")
                .HasColumnName("ALadd");
            entity.Property(e => e.Alopen)
                .HasColumnType("decimal(18, 6)")
                .HasColumnName("ALopen");
            entity.Property(e => e.Aluse)
                .HasColumnType("decimal(18, 6)")
                .HasColumnName("ALuse");
            entity.Property(e => e.AppNo).HasColumnName("App_No");
            entity.Property(e => e.Category)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Cladd)
                .HasColumnType("decimal(18, 6)")
                .HasColumnName("CLadd");
            entity.Property(e => e.Clopen)
                .HasColumnType("decimal(18, 6)")
                .HasColumnName("CLopen");
            entity.Property(e => e.Cluse)
                .HasColumnType("decimal(18, 6)")
                .HasColumnName("CLuse");
            entity.Property(e => e.Cpladd)
                .HasColumnType("decimal(18, 6)")
                .HasColumnName("CPLadd");
            entity.Property(e => e.Cplopen)
                .HasColumnType("decimal(18, 6)")
                .HasColumnName("CPLopen");
            entity.Property(e => e.Cpluse)
                .HasColumnType("decimal(18, 6)")
                .HasColumnName("CPLuse");
            entity.Property(e => e.DepartmentName)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("Department_Name");
            entity.Property(e => e.DesignationName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Designation_Name");
            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.EmpFatherName)
                .HasMaxLength(150)
                .IsUnicode(false)
                .HasColumnName("Emp_FatherName");
            entity.Property(e => e.EmpName)
                .HasMaxLength(150)
                .IsUnicode(false)
                .HasColumnName("Emp_Name");
            entity.Property(e => e.GradeName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Grade_Name");
            entity.Property(e => e.JoiningDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Joining_Date");
            entity.Property(e => e.LeaveDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Leave_date");
            entity.Property(e => e.LeaveMonth).HasColumnName("Leave_Month");
            entity.Property(e => e.LeaveYear).HasColumnName("Leave_Year");
            entity.Property(e => e.LocationCode).HasColumnName("Location_Code");
            entity.Property(e => e.LocationName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Location_Name");
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false)
                .HasColumnName("site");
            entity.Property(e => e.Sladd)
                .HasColumnType("decimal(18, 6)")
                .HasColumnName("SLadd");
            entity.Property(e => e.Slopen)
                .HasColumnType("decimal(18, 6)")
                .HasColumnName("SLopen");
            entity.Property(e => e.Sluse)
                .HasColumnType("decimal(18, 6)")
                .HasColumnName("SLuse");
        });

        modelBuilder.Entity<VewLoan>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vew_Loan");

            entity.Property(e => e.AppNo).HasColumnName("App_No");
            entity.Property(e => e.DepartmentName)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("Department_Name");
            entity.Property(e => e.DesignationName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Designation_Name");
            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.EmpFatherName)
                .HasMaxLength(150)
                .IsUnicode(false)
                .HasColumnName("Emp_FatherName");
            entity.Property(e => e.EmpName)
                .HasMaxLength(150)
                .IsUnicode(false)
                .HasColumnName("Emp_Name");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("Enter_By");
            entity.Property(e => e.LoanAmount)
                .HasColumnType("numeric(18, 0)")
                .HasColumnName("Loan_Amount");
            entity.Property(e => e.LoanBalance)
                .HasColumnType("numeric(18, 0)")
                .HasColumnName("Loan_Balance");
            entity.Property(e => e.LoanClear).HasColumnName("Loan_Clear");
            entity.Property(e => e.LoanDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Loan_Date");
            entity.Property(e => e.LoanInstallment)
                .HasColumnType("numeric(18, 0)")
                .HasColumnName("Loan_Installment");
            entity.Property(e => e.LoanType)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Loan_Type");
            entity.Property(e => e.Shift)
                .HasMaxLength(2)
                .IsUnicode(false);
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false)
                .HasColumnName("site");
        });

        modelBuilder.Entity<VewLoanLedger>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vew_LoanLedger");

            entity.Property(e => e.AppNo).HasColumnName("App_No");
            entity.Property(e => e.DepartmentName)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("Department_Name");
            entity.Property(e => e.DesignationName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Designation_Name");
            entity.Property(e => e.EmpCardNo)
                .HasMaxLength(7)
                .IsUnicode(false)
                .HasColumnName("Emp_CardNo");
            entity.Property(e => e.EmpName)
                .HasMaxLength(150)
                .IsUnicode(false)
                .HasColumnName("Emp_Name");
            entity.Property(e => e.GrossPay)
                .HasColumnType("numeric(18, 2)")
                .HasColumnName("Gross_Pay");
            entity.Property(e => e.LoanAmount)
                .HasColumnType("numeric(9, 2)")
                .HasColumnName("Loan_Amount");
            entity.Property(e => e.LoanDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Loan_Date");
            entity.Property(e => e.LoanInstallment)
                .HasColumnType("numeric(9, 2)")
                .HasColumnName("Loan_Installment");
            entity.Property(e => e.LoanType)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Loan_Type");
            entity.Property(e => e.Shift)
                .HasMaxLength(2)
                .IsUnicode(false);
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false)
                .HasColumnName("site");
        });

        modelBuilder.Entity<VewOverTime>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("Vew_OverTime");

            entity.Property(e => e.DepartmentName)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("Department_Name");
            entity.Property(e => e.DesignationName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Designation_Name");
            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.EmpName)
                .HasMaxLength(150)
                .IsUnicode(false)
                .HasColumnName("Emp_Name");
            entity.Property(e => e.FromTime)
                .HasColumnType("datetime")
                .HasColumnName("From_Time");
            entity.Property(e => e.GradeName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Grade_Name");
            entity.Property(e => e.GrossPay)
                .HasColumnType("numeric(18, 2)")
                .HasColumnName("Gross_Pay");
            entity.Property(e => e.IsOverTime).HasColumnName("is_Over_Time");
            entity.Property(e => e.JoiningDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Joining_Date");
            entity.Property(e => e.OverTime).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.OverTimeAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("OverTime_Amount");
            entity.Property(e => e.OverTimeDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("OverTime_Date");
            entity.Property(e => e.OverTimeGazetted).HasColumnName("OverTime_Gazetted");
            entity.Property(e => e.OverTimeNo).HasColumnName("OverTime_No");
            entity.Property(e => e.SerialNo).HasColumnName("Serial_No");
            entity.Property(e => e.Shift)
                .HasMaxLength(2)
                .IsUnicode(false);
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false);
            entity.Property(e => e.ToTime)
                .HasColumnType("datetime")
                .HasColumnName("To_Time");
        });

        modelBuilder.Entity<VewSalary>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vew_Salary");

            entity.Property(e => e.A01).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.A02).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.A03).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.A04).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.A05).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.A06).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.A07).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.A08).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.A09).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.A10).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.A11).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.A12).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.A13).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Address)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.BankAccount)
                .HasMaxLength(50)
                .HasColumnName("Bank_Account");
            entity.Property(e => e.BasicPay)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("BASIC_Pay");
            entity.Property(e => e.BirthDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Birth_Date");
            entity.Property(e => e.Category)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Cnic)
                .HasMaxLength(50)
                .HasColumnName("CNIC");
            entity.Property(e => e.D01).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.D02).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.D03).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.D04).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.D05).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.D06).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.D07).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.D08).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.D09).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.D10).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.D11).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.D12).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.D13).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.D14).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Days).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.DaysAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Days_Amount");
            entity.Property(e => e.DepartmentName)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("Department_Name");
            entity.Property(e => e.DeptCode).HasColumnName("Dept_Code");
            entity.Property(e => e.DesgCode).HasColumnName("Desg_Code");
            entity.Property(e => e.DesignationName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Designation_Name");
            entity.Property(e => e.EditBy)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("Edit_By");
            entity.Property(e => e.EditTime)
                .HasColumnType("datetime")
                .HasColumnName("Edit_Time");
            entity.Property(e => e.Email)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.EmpFatherName)
                .HasMaxLength(150)
                .IsUnicode(false)
                .HasColumnName("Emp_FatherName");
            entity.Property(e => e.EmpName)
                .HasMaxLength(150)
                .IsUnicode(false)
                .HasColumnName("Emp_Name");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("Enter_By");
            entity.Property(e => e.EnteryTime)
                .HasColumnType("datetime")
                .HasColumnName("Entery_Time");
            entity.Property(e => e.EobiNo)
                .HasMaxLength(13)
                .HasColumnName("EOBI_No");
            entity.Property(e => e.EobiSchoolShare)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("EOBI_SchoolShare");
            entity.Property(e => e.GradeName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Grade_Name");
            entity.Property(e => e.GrossPay)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("GROSS_Pay");
            entity.Property(e => e.JoiningDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Joining_Date");
            entity.Property(e => e.LateDeduction)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Late_Deduction");
            entity.Property(e => e.LeaveDeducted)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Leave_Deducted");
            entity.Property(e => e.LeaveDeductionAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Leave_Deduction_Amount");
            entity.Property(e => e.LeftType)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Left_Type");
            entity.Property(e => e.LongTermLoanBalance)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("LongTerm_LoanBalance");
            entity.Property(e => e.NetPay)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("NET_Pay");
            entity.Property(e => e.OtherAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Other_Amount");
            entity.Property(e => e.OtherDays)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Other_Days");
            entity.Property(e => e.OverTimeAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("OverTime_Amount");
            entity.Property(e => e.OverTimeDays)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("OverTime_Days");
            entity.Property(e => e.PfSchoolShare)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("PF_SchoolShare");
            entity.Property(e => e.PositionTitle)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Position_Title");
            entity.Property(e => e.ProvidentFundLoanBalance)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Provident_FundLoanBalance");
            entity.Property(e => e.Qualification)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.Remarks)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.ResignDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Resign_Date");
            entity.Property(e => e.RestDay)
                .HasMaxLength(15)
                .IsUnicode(false)
                .HasColumnName("Rest_Day");
            entity.Property(e => e.Salary)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("salary");
            entity.Property(e => e.SalaryCreated).HasColumnName("Salary_Created");
            entity.Property(e => e.SalaryDate)
                .HasColumnType("datetime")
                .HasColumnName("Salary_Date");
            entity.Property(e => e.SalaryMonth).HasColumnName("Salary_Month");
            entity.Property(e => e.SalaryYear).HasColumnName("Salary_Year");
            entity.Property(e => e.Scale)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Shift)
                .HasMaxLength(2)
                .IsUnicode(false);
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false)
                .HasColumnName("site");
            entity.Property(e => e.StuckOff).HasColumnName("Stuck_Off");
            entity.Property(e => e.StuckOffDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Stuck_Off_Date");
            entity.Property(e => e.TotalDeductions)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Total_Deductions");
            entity.Property(e => e.TotalLate)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Total_Late");
            entity.Property(e => e.TotalProvidentFund)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Total_ProvidentFund");
            entity.Property(e => e.WorkingHours)
                .HasColumnType("decimal(9, 2)")
                .HasColumnName("Working_Hours");
        });

        modelBuilder.Entity<HrmCategory>(entity =>
        {
            entity.HasKey(e => new { e.CategoryCode, e.Site });

            entity.ToTable("HRM_Category");

            entity.Property(e => e.CategoryCode).HasColumnName("Category_Code");
            entity.Property(e => e.Site)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("");
            entity.Property(e => e.CategoryName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Category_Name");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Enter_By");
        });

        modelBuilder.Entity<HrmStatus>(entity =>
        {
            entity.HasKey(e => new { e.StatusCode, e.Site });

            entity.ToTable("HRM_Status");

            entity.Property(e => e.StatusCode).HasColumnName("Status_Code");
            entity.Property(e => e.Site)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("");
            entity.Property(e => e.StatusName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Status_Name");
            entity.Property(e => e.EnterBy)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Enter_By");
        });

        modelBuilder.Entity<HrmRestDayMaster>(entity =>
        {
            entity.HasKey(e => new { e.TransNo, e.Site });

            entity.ToTable("HRM_RestDay_Master");

            entity.Property(e => e.TransNo).HasColumnName("Trans_No");
            entity.Property(e => e.Site)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("");
            entity.Property(e => e.DepartmentCode).HasColumnName("Department_Code");
            entity.Property(e => e.RestDate)
                .HasColumnType("date")
                .HasColumnName("Rest_Date");
            entity.Property(e => e.RestDay)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("Rest_Day");
            entity.Property(e => e.Remarks)
                .HasMaxLength(250)
                .IsUnicode(false);
            entity.Property(e => e.EnterBy)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Enter_By");
            entity.Property(e => e.EnteryTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Entery_Time");
            entity.Property(e => e.EditBy)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Edit_By");
            entity.Property(e => e.EditTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Edit_Time");
        });

        modelBuilder.Entity<HrmRestDayChild>(entity =>
        {
            entity.HasKey(e => e.SerialNo);

            entity.ToTable("HRM_RestDay_Child");

            entity.Property(e => e.SerialNo).HasColumnName("Serial_No");
            entity.Property(e => e.TransNo).HasColumnName("Trans_No");
            entity.Property(e => e.Site)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("");
            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.EmpName)
                .HasMaxLength(250)
                .IsUnicode(false)
                .HasColumnName("Emp_Name");
            entity.Property(e => e.DepartmentCode).HasColumnName("Department_Code");
            entity.Property(e => e.DesignationName)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("Designation_Name");
            entity.Property(e => e.RestDate)
                .HasColumnType("date")
                .HasColumnName("Rest_Date");
            entity.Property(e => e.RestDay)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("Rest_Day");

            entity.HasOne(d => d.Master)
                .WithMany(p => p.Children)
                .HasForeignKey(d => new { d.TransNo, d.Site })
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_HRM_RestDay_Child_Master");
        });

        modelBuilder.Entity<HrmWeeklyRestDayMaster>(entity =>
        {
            entity.HasKey(e => new { e.TransNo, e.Site });
            entity.ToTable("HRM_WeeklyRestDay_Master");
            entity.Property(e => e.TransNo).HasColumnName("Trans_No");
            entity.Property(e => e.Site).HasMaxLength(50).IsUnicode(false);
            entity.Property(e => e.DepartmentCode).HasColumnName("Department_Code");
            entity.Property(e => e.RestDays).HasMaxLength(15).IsUnicode(false).HasColumnName("Rest_Days");
            entity.Property(e => e.Remarks).HasMaxLength(250).IsUnicode(false);
            entity.Property(e => e.EnterBy).HasMaxLength(50).IsUnicode(false).HasColumnName("Enter_By");
            entity.Property(e => e.EnteryTime).HasColumnType("smalldatetime").HasColumnName("Entery_Time");
        });

        modelBuilder.Entity<HrmWeeklyRestDayChild>(entity =>
        {
            entity.HasKey(e => e.SerialNo);
            entity.ToTable("HRM_WeeklyRestDay_Child");
            entity.Property(e => e.SerialNo).HasColumnName("Serial_No");
            entity.Property(e => e.TransNo).HasColumnName("Trans_No");
            entity.Property(e => e.Site).HasMaxLength(50).IsUnicode(false);
            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.EmpName).HasMaxLength(250).IsUnicode(false).HasColumnName("Emp_Name");
            entity.Property(e => e.DepartmentCode).HasColumnName("Department_Code");
            entity.Property(e => e.DesignationName).HasMaxLength(100).IsUnicode(false).HasColumnName("Designation_Name");
            entity.HasOne(e => e.Master)
                .WithMany(master => master.Children)
                .HasForeignKey(e => new { e.TransNo, e.Site })
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_HRM_WeeklyRestDay_Child_Master");
        });

        modelBuilder.Entity<HrmDutyTimingMaster>(entity =>
        {
            entity.HasKey(e => new { e.TransNo, e.Site });

            entity.ToTable("HRM_DutyTiming_Master");

            entity.Property(e => e.TransNo).HasColumnName("Trans_No");
            entity.Property(e => e.Site)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("");
            entity.Property(e => e.DepartmentCode).HasColumnName("Department_Code");
            entity.Property(e => e.FromDate)
                .HasColumnType("date")
                .HasColumnName("From_Date");
            entity.Property(e => e.ToDate)
                .HasColumnType("date")
                .HasColumnName("To_Date");
            entity.Property(e => e.FromTime)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("From_Time");
            entity.Property(e => e.ToTime)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("To_Time");
            entity.Property(e => e.Remarks)
                .HasMaxLength(250)
                .IsUnicode(false);
            entity.Property(e => e.EnterBy)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Enter_By");
            entity.Property(e => e.EnteryTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Entery_Time");
            entity.Property(e => e.EditBy)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Edit_By");
            entity.Property(e => e.EditTime)
                .HasColumnType("smalldatetime")
                .HasColumnName("Edit_Time");
        });

        modelBuilder.Entity<HrmDutyTimingChild>(entity =>
        {
            entity.HasKey(e => e.SerialNo);

            entity.ToTable("HRM_DutyTiming_Child");

            entity.Property(e => e.SerialNo).HasColumnName("Serial_No");
            entity.Property(e => e.TransNo).HasColumnName("Trans_No");
            entity.Property(e => e.Site)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("");
            entity.Property(e => e.EmpCardNo).HasColumnName("Emp_CardNo");
            entity.Property(e => e.EmpName)
                .HasMaxLength(250)
                .IsUnicode(false)
                .HasColumnName("Emp_Name");
            entity.Property(e => e.DepartmentCode).HasColumnName("Department_Code");
            entity.Property(e => e.DesignationName)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("Designation_Name");
            entity.Property(e => e.FromDate)
                .HasColumnType("date")
                .HasColumnName("From_Date");
            entity.Property(e => e.ToDate)
                .HasColumnType("date")
                .HasColumnName("To_Date");
            entity.Property(e => e.FromTime)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("From_Time");
            entity.Property(e => e.ToTime)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("To_Time");

            entity.HasOne(d => d.Master)
                .WithMany(p => p.Children)
                .HasForeignKey(d => new { d.TransNo, d.Site })
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_HRM_DutyTiming_Child_Master");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
