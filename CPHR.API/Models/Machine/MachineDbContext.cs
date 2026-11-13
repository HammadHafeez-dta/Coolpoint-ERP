using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace SaftHR.API.Models.Machine;

public partial class MachineDbContext : DbContext
{
    public MachineDbContext(DbContextOptions<MachineDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Acgroup> Acgroups { get; set; }

    public virtual DbSet<ActimeZone> ActimeZones { get; set; }

    public virtual DbSet<AcunlockComb> AcunlockCombs { get; set; }

    public virtual DbSet<AlarmLog> AlarmLogs { get; set; }

    public virtual DbSet<AttParam> AttParams { get; set; }

    public virtual DbSet<AuditedExc> AuditedExcs { get; set; }

    public virtual DbSet<Authdevice> Authdevices { get; set; }

    public virtual DbSet<Checkexact> Checkexacts { get; set; }

    public virtual DbSet<Checkinout> Checkinouts { get; set; }

    public virtual DbSet<Department> Departments { get; set; }

    public virtual DbSet<DeptUsedSch> DeptUsedSchs { get; set; }

    public virtual DbSet<EmOpLog> EmOpLogs { get; set; }

    public virtual DbSet<Excnote> Excnotes { get; set; }

    public virtual DbSet<FaceTemp> FaceTemps { get; set; }

    public virtual DbSet<Holiday> Holidays { get; set; }

    public virtual DbSet<LeaveClass> LeaveClasses { get; set; }

    public virtual DbSet<LeaveClass1> LeaveClass1s { get; set; }

    public virtual DbSet<Machine> Machines { get; set; }

    public virtual DbSet<MchVewAttendance> MchVewAttendances { get; set; }

    public virtual DbSet<NumRun> NumRuns { get; set; }

    public virtual DbSet<NumRunDeil> NumRunDeils { get; set; }

    public virtual DbSet<ReportItem> ReportItems { get; set; }

    public virtual DbSet<SchClass> SchClasses { get; set; }

    public virtual DbSet<Securitydetail> Securitydetails { get; set; }

    public virtual DbSet<ServerLog> ServerLogs { get; set; }

    public virtual DbSet<Shift> Shifts { get; set; }

    public virtual DbSet<SystemLog> SystemLogs { get; set; }

    public virtual DbSet<Tbkey> Tbkeys { get; set; }

    public virtual DbSet<Tbsmsallot> Tbsmsallots { get; set; }

    public virtual DbSet<Tbsmsinfo> Tbsmsinfos { get; set; }

    public virtual DbSet<Template> Templates { get; set; }

    public virtual DbSet<UserAcmachine> UserAcmachines { get; set; }

    public virtual DbSet<UserAcprivilege> UserAcprivileges { get; set; }

    public virtual DbSet<UserOfRun> UserOfRuns { get; set; }

    public virtual DbSet<UserSpeday> UserSpedays { get; set; }

    public virtual DbSet<UserTempSch> UserTempSches { get; set; }

    public virtual DbSet<UserUpdate> UserUpdates { get; set; }

    public virtual DbSet<UserUsedSclass> UserUsedSclasses { get; set; }

    public virtual DbSet<Userinfo> Userinfos { get; set; }

    public virtual DbSet<UsersMachine> UsersMachines { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Acgroup>(entity =>
        {
            entity.HasKey(e => e.GroupId).HasName("PK__ACGroup__149AF30A2BFE89A6");

            entity.ToTable("ACGroup");

            entity.Property(e => e.GroupId)
                .ValueGeneratedNever()
                .HasColumnName("GroupID");
            entity.Property(e => e.Holidayvaild).HasColumnName("holidayvaild");
            entity.Property(e => e.Name)
                .HasMaxLength(30)
                .IsUnicode(false);
            entity.Property(e => e.TimeZone1).HasDefaultValue((short)0);
            entity.Property(e => e.TimeZone2).HasDefaultValue((short)0);
            entity.Property(e => e.TimeZone3).HasDefaultValue((short)0);
            entity.Property(e => e.Verifystyle).HasColumnName("verifystyle");
        });

        modelBuilder.Entity<ActimeZone>(entity =>
        {
            entity.HasKey(e => e.TimeZoneId).HasName("PK__ACTimeZo__78D387CF282DF8C2");

            entity.ToTable("ACTimeZones");

            entity.Property(e => e.TimeZoneId)
                .ValueGeneratedNever()
                .HasColumnName("TimeZoneID");
            entity.Property(e => e.FriEnd).HasColumnType("datetime");
            entity.Property(e => e.FriStart).HasColumnType("datetime");
            entity.Property(e => e.MonEnd).HasColumnType("datetime");
            entity.Property(e => e.MonStart).HasColumnType("datetime");
            entity.Property(e => e.Name)
                .HasMaxLength(30)
                .IsUnicode(false);
            entity.Property(e => e.SatEnd).HasColumnType("datetime");
            entity.Property(e => e.SatStart).HasColumnType("datetime");
            entity.Property(e => e.SunEnd).HasColumnType("datetime");
            entity.Property(e => e.SunStart).HasColumnType("datetime");
            entity.Property(e => e.ThursEnd).HasColumnType("datetime");
            entity.Property(e => e.ThursStart).HasColumnType("datetime");
            entity.Property(e => e.TuesEnd).HasColumnType("datetime");
            entity.Property(e => e.TuesStart).HasColumnType("datetime");
            entity.Property(e => e.WedEnd).HasColumnType("datetime");
            entity.Property(e => e.WedStart).HasColumnType("datetime");
        });

        modelBuilder.Entity<AcunlockComb>(entity =>
        {
            entity.HasKey(e => e.UnlockCombId).HasName("PK__ACUnlock__1F6C457043D61337");

            entity.ToTable("ACUnlockComb");

            entity.Property(e => e.UnlockCombId)
                .ValueGeneratedNever()
                .HasColumnName("UnlockCombID");
            entity.Property(e => e.Name)
                .HasMaxLength(30)
                .IsUnicode(false);
        });

        modelBuilder.Entity<AlarmLog>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__AlarmLog__3214EC273D2915A8");

            entity.ToTable("AlarmLog");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.EnrollNumber)
                .HasMaxLength(30)
                .IsUnicode(false);
            entity.Property(e => e.LogTime)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.MachineAlias)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.Operator)
                .HasMaxLength(20)
                .IsUnicode(false);
        });

        modelBuilder.Entity<AttParam>(entity =>
        {
            entity.HasKey(e => e.Paraname).HasName("PK__AttParam__889D235F6D0D32F4");

            entity.ToTable("AttParam");

            entity.Property(e => e.Paraname)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("PARANAME");
            entity.Property(e => e.Paratype)
                .HasMaxLength(2)
                .IsUnicode(false)
                .HasColumnName("PARATYPE");
            entity.Property(e => e.Paravalue)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("PARAVALUE");
        });

        modelBuilder.Entity<AuditedExc>(entity =>
        {
            entity.HasKey(e => e.Aeid).HasName("PK__AuditedE__40737CF310566F31");

            entity.ToTable("AuditedExc");

            entity.Property(e => e.Aeid).HasColumnName("AEID");
            entity.Property(e => e.CheckTime).HasColumnType("datetime");
            entity.Property(e => e.NewExcId).HasColumnName("NewExcID");
            entity.Property(e => e.Uname)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("UName");
            entity.Property(e => e.Utime)
                .HasColumnType("datetime")
                .HasColumnName("UTime");
        });

        modelBuilder.Entity<Authdevice>(entity =>
        {
            entity.HasKey(e => new { e.Userid, e.MachineId }).HasName("AUTHKEY");

            entity.ToTable("AUTHDEVICE");

            entity.Property(e => e.Userid).HasColumnName("USERID");
            entity.Property(e => e.MachineId).HasColumnName("MachineID");
            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("ID");
        });

        modelBuilder.Entity<Checkexact>(entity =>
        {
            entity.HasKey(e => e.Exactid).HasName("EXACTID");

            entity.ToTable("CHECKEXACT");

            entity.Property(e => e.Exactid).HasColumnName("EXACTID");
            entity.Property(e => e.Checktime)
                .HasDefaultValueSql("((0))")
                .HasColumnType("datetime")
                .HasColumnName("CHECKTIME");
            entity.Property(e => e.Checktype)
                .HasMaxLength(2)
                .IsUnicode(false)
                .HasDefaultValueSql("((0))")
                .HasColumnName("CHECKTYPE");
            entity.Property(e => e.Date)
                .HasColumnType("datetime")
                .HasColumnName("DATE");
            entity.Property(e => e.Incount)
                .HasDefaultValue((short)0)
                .HasColumnName("INCOUNT");
            entity.Property(e => e.Isadd)
                .HasDefaultValue((short)0)
                .HasColumnName("ISADD");
            entity.Property(e => e.Iscount)
                .HasDefaultValue((short)0)
                .HasColumnName("ISCOUNT");
            entity.Property(e => e.Isdelete)
                .HasDefaultValue((short)0)
                .HasColumnName("ISDELETE");
            entity.Property(e => e.Ismodify)
                .HasDefaultValue((short)0)
                .HasColumnName("ISMODIFY");
            entity.Property(e => e.Modifyby)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasDefaultValue("Temp-Supervisor")
                .HasColumnName("MODIFYBY");
            entity.Property(e => e.Userid)
                .HasDefaultValue(0)
                .HasColumnName("USERID");
            entity.Property(e => e.Yuyin)
                .HasMaxLength(25)
                .IsUnicode(false)
                .HasColumnName("YUYIN");
        });

        modelBuilder.Entity<Checkinout>(entity =>
        {
            entity.HasKey(e => new { e.Userid, e.Checktime }).HasName("USERCHECKTIME");

            entity.ToTable("CHECKINOUT");

            entity.Property(e => e.Userid).HasColumnName("USERID");
            entity.Property(e => e.Checktime)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("CHECKTIME");
            entity.Property(e => e.Checktype)
                .HasMaxLength(1)
                .IsUnicode(false)
                .HasDefaultValue("I")
                .HasColumnName("CHECKTYPE");
            entity.Property(e => e.Memoinfo)
                .HasMaxLength(30)
                .IsUnicode(false);
            entity.Property(e => e.Sensorid)
                .HasMaxLength(5)
                .IsUnicode(false)
                .HasColumnName("SENSORID");
            entity.Property(e => e.Sn)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("sn");
            entity.Property(e => e.UserExtFmt).HasDefaultValue((short)0);
            entity.Property(e => e.Verifycode)
                .HasDefaultValue(0)
                .HasColumnName("VERIFYCODE");
            entity.Property(e => e.WorkCode).HasDefaultValue(0);
        });

        modelBuilder.Entity<Department>(entity =>
        {
            entity.HasKey(e => e.Deptid).HasName("DEPTID");

            entity.ToTable("DEPARTMENTS");

            entity.HasIndex(e => e.Deptname, "DEPTNAME");

            entity.Property(e => e.Deptid).HasColumnName("DEPTID");
            entity.Property(e => e.Att)
                .HasDefaultValue((short)1)
                .HasColumnName("ATT");
            entity.Property(e => e.AutoSchPlan).HasDefaultValue((short)1);
            entity.Property(e => e.DefaultSchId).HasDefaultValue(1);
            entity.Property(e => e.Deptname)
                .HasMaxLength(30)
                .IsUnicode(false)
                .HasColumnName("DEPTNAME");
            entity.Property(e => e.Holiday).HasDefaultValue((short)1);
            entity.Property(e => e.InLate).HasDefaultValue((short)1);
            entity.Property(e => e.InheritDeptRule).HasDefaultValue((short)1);
            entity.Property(e => e.InheritDeptSch).HasDefaultValue((short)1);
            entity.Property(e => e.InheritDeptSchClass).HasDefaultValue((short)1);
            entity.Property(e => e.InheritParentSch).HasDefaultValue((short)1);
            entity.Property(e => e.MinAutoSchInterval).HasDefaultValue(24);
            entity.Property(e => e.OutEarly).HasDefaultValue((short)1);
            entity.Property(e => e.OverTime).HasDefaultValue((short)1);
            entity.Property(e => e.RegisterOt)
                .HasDefaultValue((short)1)
                .HasColumnName("RegisterOT");
            entity.Property(e => e.Supdeptid)
                .HasDefaultValue(1)
                .HasColumnName("SUPDEPTID");
        });

        modelBuilder.Entity<DeptUsedSch>(entity =>
        {
            entity.HasKey(e => new { e.DeptId, e.SchId }).HasName("DEPT_USED_SCH");
        });

        modelBuilder.Entity<EmOpLog>(entity =>
        {
            entity
                .HasNoKey()
                .ToTable("EmOpLog");

            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("ID");
            entity.Property(e => e.ManipulationId).HasColumnName("manipulationID");
            entity.Property(e => e.OperateTime).HasColumnType("datetime");
            entity.Property(e => e.SensorId)
                .HasMaxLength(5)
                .IsUnicode(false);
            entity.Property(e => e.Userid).HasColumnName("USERID");
        });

        modelBuilder.Entity<Excnote>(entity =>
        {
            entity
                .HasNoKey()
                .ToTable("EXCNOTES");

            entity.HasIndex(e => new { e.Userid, e.Attdate }, "EXCNOTE").IsUnique();

            entity.Property(e => e.Attdate)
                .HasColumnType("datetime")
                .HasColumnName("ATTDATE");
            entity.Property(e => e.Notes)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("NOTES");
            entity.Property(e => e.Userid).HasColumnName("USERID");
        });

        modelBuilder.Entity<FaceTemp>(entity =>
        {
            entity.HasKey(e => e.Templateid).HasName("PK__FaceTemp__9EE4AD5356E8E7AB");

            entity.ToTable("FaceTemp");

            entity.HasIndex(e => e.Faceid, "FACEID");

            entity.HasIndex(e => e.Templateid, "TEMPLATEID");

            entity.HasIndex(e => e.Userno, "USERNO");

            entity.HasIndex(e => e.Valid, "VALID");

            entity.Property(e => e.Templateid).HasColumnName("TEMPLATEID");
            entity.Property(e => e.Activetime)
                .HasDefaultValue(0)
                .HasColumnName("ACTIVETIME");
            entity.Property(e => e.Faceid)
                .HasDefaultValue(0)
                .HasColumnName("FACEID");
            entity.Property(e => e.Pin)
                .HasDefaultValue(0)
                .HasColumnName("pin");
            entity.Property(e => e.Reserve)
                .HasDefaultValue(0)
                .HasColumnName("RESERVE");
            entity.Property(e => e.Size)
                .HasDefaultValue(0)
                .HasColumnName("SIZE");
            entity.Property(e => e.Template)
                .HasColumnType("image")
                .HasColumnName("TEMPLATE");
            entity.Property(e => e.Userno)
                .HasMaxLength(24)
                .IsUnicode(false)
                .HasColumnName("USERNO");
            entity.Property(e => e.Valid)
                .HasDefaultValue(0)
                .HasColumnName("VALID");
            entity.Property(e => e.Vfcount)
                .HasDefaultValue(0)
                .HasColumnName("VFCOUNT");
        });

        modelBuilder.Entity<Holiday>(entity =>
        {
            entity.HasKey(e => e.Holidayid).HasName("HOLID");

            entity.ToTable("HOLIDAYS");

            entity.HasIndex(e => e.Holidayname, "HOLIDAYNAME").IsUnique();

            entity.Property(e => e.Holidayid).HasColumnName("HOLIDAYID");
            entity.Property(e => e.DeptId)
                .HasDefaultValue((short)1)
                .HasColumnName("DeptID");
            entity.Property(e => e.Duration).HasColumnName("DURATION");
            entity.Property(e => e.Holidayday)
                .HasDefaultValue((short)1)
                .HasColumnName("HOLIDAYDAY");
            entity.Property(e => e.Holidaymonth).HasColumnName("HOLIDAYMONTH");
            entity.Property(e => e.Holidayname)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("HOLIDAYNAME");
            entity.Property(e => e.Holidaytype).HasColumnName("HOLIDAYTYPE");
            entity.Property(e => e.Holidayyear).HasColumnName("HOLIDAYYEAR");
            entity.Property(e => e.Minzu)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("MINZU");
            entity.Property(e => e.Starttime)
                .HasColumnType("datetime")
                .HasColumnName("STARTTIME");
            entity.Property(e => e.Xinbie)
                .HasMaxLength(4)
                .IsUnicode(false)
                .HasColumnName("XINBIE");
        });

        modelBuilder.Entity<LeaveClass>(entity =>
        {
            entity.HasKey(e => e.LeaveId).HasName("PK__LeaveCla__796DB9594D94879B");

            entity.ToTable("LeaveClass");

            entity.Property(e => e.LeaveName)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.MinUnit).HasDefaultValue(1.0);
            entity.Property(e => e.RemaindCount).HasDefaultValue((short)1);
            entity.Property(e => e.RemaindProc).HasDefaultValue((short)1);
            entity.Property(e => e.ReportSymbol)
                .HasMaxLength(4)
                .IsUnicode(false)
                .HasDefaultValue("-");
            entity.Property(e => e.Unit).HasDefaultValue((short)1);
        });

        modelBuilder.Entity<LeaveClass1>(entity =>
        {
            entity.HasKey(e => e.LeaveId).HasName("PK__LeaveCla__796DB95959063A47");

            entity.ToTable("LeaveClass1");

            entity.Property(e => e.Calc).HasColumnType("text");
            entity.Property(e => e.LeaveName)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.MinUnit).HasDefaultValue(1.0);
            entity.Property(e => e.RemaindCount).HasDefaultValue((short)1);
            entity.Property(e => e.RemaindProc).HasDefaultValue((short)2);
            entity.Property(e => e.ReportSymbol)
                .HasMaxLength(4)
                .IsUnicode(false)
                .HasDefaultValue("-");
        });

        modelBuilder.Entity<Machine>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Machines__3214EC27160F4887");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.CommPassword)
                .HasMaxLength(12)
                .IsUnicode(false);
            entity.Property(e => e.DateFormat).HasDefaultValue((short)-1);
            entity.Property(e => e.Fingercount)
                .HasDefaultValue((short)-1)
                .HasColumnName("fingercount");
            entity.Property(e => e.FirmwareVersion)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.Idle).HasDefaultValue((short)-1);
            entity.Property(e => e.InOutRecordWarn).HasDefaultValue((short)-1);
            entity.Property(e => e.Ip)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("IP");
            entity.Property(e => e.IsIfChangeConfigServer2).HasDefaultValue(0);
            entity.Property(e => e.LockControl).HasDefaultValue((short)-1);
            entity.Property(e => e.MachineAlias)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.MachineNumber).HasDefaultValue(1);
            entity.Property(e => e.Managercount)
                .HasDefaultValue((short)-1)
                .HasColumnName("managercount");
            entity.Property(e => e.PhotoStamp)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasDefaultValueSql("((0))");
            entity.Property(e => e.Port).HasDefaultValue(1);
            entity.Property(e => e.ProduceKind).HasDefaultValue(1);
            entity.Property(e => e.ProductType)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.Purpose).HasDefaultValue((short)1);
            entity.Property(e => e.SecretCount).HasDefaultValue((short)-1);
            entity.Property(e => e.SerialPort).HasDefaultValue(1);
            entity.Property(e => e.Sn)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("sn");
            entity.Property(e => e.Uilanguage)
                .HasDefaultValue((short)-1)
                .HasColumnName("UILanguage");
            entity.Property(e => e.Usercount)
                .HasDefaultValue((short)-1)
                .HasColumnName("usercount");
            entity.Property(e => e.Voice).HasDefaultValue((short)-1);
        });

        modelBuilder.Entity<MchVewAttendance>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("MCH_vew_Attendance");

            entity.Property(e => e.Badgenumber)
                .HasMaxLength(24)
                .IsUnicode(false)
                .HasColumnName("BADGENUMBER");
            entity.Property(e => e.Checktime)
                .HasColumnType("datetime")
                .HasColumnName("CHECKTIME");
            entity.Property(e => e.Checktype)
                .HasMaxLength(1)
                .IsUnicode(false)
                .HasColumnName("CHECKTYPE");
            entity.Property(e => e.Memoinfo)
                .HasMaxLength(30)
                .IsUnicode(false);
            entity.Property(e => e.Name)
                .HasMaxLength(40)
                .IsUnicode(false)
                .HasColumnName("NAME");
            entity.Property(e => e.Sensorid)
                .HasMaxLength(5)
                .IsUnicode(false)
                .HasColumnName("SENSORID");
            entity.Property(e => e.Sn)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("sn");
            entity.Property(e => e.Userid).HasColumnName("USERID");
            entity.Property(e => e.Verifycode).HasColumnName("VERIFYCODE");
        });

        modelBuilder.Entity<NumRun>(entity =>
        {
            entity.HasKey(e => e.NumRunid).HasName("NUMID");

            entity.ToTable("NUM_RUN");

            entity.Property(e => e.NumRunid).HasColumnName("NUM_RUNID");
            entity.Property(e => e.Cyle)
                .HasDefaultValue((short)1)
                .HasColumnName("CYLE");
            entity.Property(e => e.Enddate)
                .HasDefaultValue(new DateTime(2099, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified))
                .HasColumnType("datetime")
                .HasColumnName("ENDDATE");
            entity.Property(e => e.Name)
                .HasMaxLength(30)
                .IsUnicode(false)
                .HasColumnName("NAME");
            entity.Property(e => e.Oldid)
                .HasDefaultValue(-1)
                .HasColumnName("OLDID");
            entity.Property(e => e.Startdate)
                .HasDefaultValue(new DateTime(1900, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified))
                .HasColumnType("datetime")
                .HasColumnName("STARTDATE");
            entity.Property(e => e.Units)
                .HasDefaultValue((short)1)
                .HasColumnName("UNITS");
        });

        modelBuilder.Entity<NumRunDeil>(entity =>
        {
            entity.HasKey(e => new { e.NumRunid, e.Sdays, e.Starttime }).HasName("NUMID2");

            entity.ToTable("NUM_RUN_DEIL");

            entity.Property(e => e.NumRunid).HasColumnName("NUM_RUNID");
            entity.Property(e => e.Sdays).HasColumnName("SDAYS");
            entity.Property(e => e.Starttime)
                .HasColumnType("datetime")
                .HasColumnName("STARTTIME");
            entity.Property(e => e.Edays).HasColumnName("EDAYS");
            entity.Property(e => e.Endtime)
                .HasColumnType("datetime")
                .HasColumnName("ENDTIME");
            entity.Property(e => e.Schclassid)
                .HasDefaultValue(-1)
                .HasColumnName("SCHCLASSID");
        });

        modelBuilder.Entity<ReportItem>(entity =>
        {
            entity.HasKey(e => e.Riid).HasName("PK__ReportIt__464E992E0C85DE4D");

            entity.ToTable("ReportItem");

            entity.Property(e => e.Riid).HasColumnName("RIID");
            entity.Property(e => e.Formula).HasColumnType("image");
            entity.Property(e => e.Notes).HasColumnType("image");
            entity.Property(e => e.Riindex).HasColumnName("RIIndex");
            entity.Property(e => e.Riname)
                .HasMaxLength(12)
                .IsUnicode(false)
                .HasColumnName("RIName");
            entity.Property(e => e.UnitName)
                .HasMaxLength(6)
                .IsUnicode(false);
        });

        modelBuilder.Entity<SchClass>(entity =>
        {
            entity.HasKey(e => e.SchClassid).HasName("PK__SchClass__FFE76E83656C112C");

            entity.ToTable("SchClass");

            entity.Property(e => e.SchClassid).HasColumnName("schClassid");
            entity.Property(e => e.AutoBind).HasDefaultValue((short)1);
            entity.Property(e => e.CheckIn).HasDefaultValue(1);
            entity.Property(e => e.CheckInTime1).HasColumnType("datetime");
            entity.Property(e => e.CheckInTime2).HasColumnType("datetime");
            entity.Property(e => e.CheckOut).HasDefaultValue(1);
            entity.Property(e => e.CheckOutTime1).HasColumnType("datetime");
            entity.Property(e => e.CheckOutTime2).HasColumnType("datetime");
            entity.Property(e => e.Color).HasDefaultValue(16715535);
            entity.Property(e => e.EndTime).HasColumnType("datetime");
            entity.Property(e => e.SchName)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("schName");
            entity.Property(e => e.SensorId)
                .HasMaxLength(5)
                .IsUnicode(false)
                .HasColumnName("SensorID");
            entity.Property(e => e.StartTime).HasColumnType("datetime");
            entity.Property(e => e.WorkDay).HasDefaultValue(1.0);
            entity.Property(e => e.WorkMins).HasDefaultValue(0.0);
        });

        modelBuilder.Entity<Securitydetail>(entity =>
        {
            entity.HasKey(e => e.Securitydetailid).HasName("NAMEID2");

            entity.ToTable("SECURITYDETAILS");

            entity.Property(e => e.Securitydetailid).HasColumnName("SECURITYDETAILID");
            entity.Property(e => e.Deptid).HasColumnName("DEPTID");
            entity.Property(e => e.Enrollfingers).HasColumnName("ENROLLFINGERS");
            entity.Property(e => e.Report)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("REPORT");
            entity.Property(e => e.Reportview).HasColumnName("REPORTVIEW");
            entity.Property(e => e.Schedule).HasColumnName("SCHEDULE");
            entity.Property(e => e.Userid).HasColumnName("USERID");
            entity.Property(e => e.Userinfo).HasColumnName("USERINFO");
        });

        modelBuilder.Entity<ServerLog>(entity =>
        {
            entity
                .HasNoKey()
                .ToTable("ServerLog");

            entity.Property(e => e.EnrollNumber)
                .HasMaxLength(30)
                .IsUnicode(false);
            entity.Property(e => e.Event)
                .HasMaxLength(30)
                .IsUnicode(false)
                .HasColumnName("EVENT");
            entity.Property(e => e.Eventtime)
                .HasColumnType("datetime")
                .HasColumnName("EVENTTIME");
            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("ID");
            entity.Property(e => e.Operator)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("OPERATOR");
            entity.Property(e => e.Parameter).HasColumnName("parameter");
            entity.Property(e => e.Sensorid)
                .HasMaxLength(5)
                .IsUnicode(false)
                .HasColumnName("SENSORID");
            entity.Property(e => e.Userid).HasColumnName("USERID");
        });

        modelBuilder.Entity<Shift>(entity =>
        {
            entity.HasKey(e => e.Shiftid).HasName("SHIFTS");

            entity.ToTable("SHIFT");

            entity.Property(e => e.Shiftid).HasColumnName("SHIFTID");
            entity.Property(e => e.Cycle)
                .HasDefaultValue((short)0)
                .HasColumnName("CYCLE");
            entity.Property(e => e.Enddate)
                .HasDefaultValue(new DateTime(1900, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified))
                .HasColumnType("datetime")
                .HasColumnName("ENDDATE");
            entity.Property(e => e.Name)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("NAME");
            entity.Property(e => e.Runnum)
                .HasDefaultValue((short)0)
                .HasColumnName("RUNNUM");
            entity.Property(e => e.Sch1)
                .HasDefaultValue(0)
                .HasColumnName("SCH1");
            entity.Property(e => e.Sch10)
                .HasDefaultValue(0)
                .HasColumnName("SCH10");
            entity.Property(e => e.Sch11)
                .HasDefaultValue(0)
                .HasColumnName("SCH11");
            entity.Property(e => e.Sch12)
                .HasDefaultValue(0)
                .HasColumnName("SCH12");
            entity.Property(e => e.Sch2)
                .HasDefaultValue(0)
                .HasColumnName("SCH2");
            entity.Property(e => e.Sch3)
                .HasDefaultValue(0)
                .HasColumnName("SCH3");
            entity.Property(e => e.Sch4)
                .HasDefaultValue(0)
                .HasColumnName("SCH4");
            entity.Property(e => e.Sch5)
                .HasDefaultValue(0)
                .HasColumnName("SCH5");
            entity.Property(e => e.Sch6)
                .HasDefaultValue(0)
                .HasColumnName("SCH6");
            entity.Property(e => e.Sch7)
                .HasDefaultValue(0)
                .HasColumnName("SCH7");
            entity.Property(e => e.Sch8)
                .HasDefaultValue(0)
                .HasColumnName("SCH8");
            entity.Property(e => e.Sch9)
                .HasDefaultValue(0)
                .HasColumnName("SCH9");
            entity.Property(e => e.Startdate)
                .HasDefaultValue(new DateTime(1900, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified))
                .HasColumnType("datetime")
                .HasColumnName("STARTDATE");
            entity.Property(e => e.Units)
                .HasDefaultValue((short)0)
                .HasColumnName("UNITS");
            entity.Property(e => e.Ushiftid)
                .HasDefaultValue(-1)
                .HasColumnName("USHIFTID");
        });

        modelBuilder.Entity<SystemLog>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__SystemLo__3214EC273864608B");

            entity.ToTable("SystemLog");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.LogDescr)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.LogTime)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.MachineAlias)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.Operator)
                .HasMaxLength(20)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Tbkey>(entity =>
        {
            entity
                .HasNoKey()
                .ToTable("TBKEY");

            entity.Property(e => e.Onekey).HasColumnName("ONEKEY");
            entity.Property(e => e.PreName)
                .HasMaxLength(12)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Tbsmsallot>(entity =>
        {
            entity.HasKey(e => e.Reference).HasName("PK__TBSMSALL__CAA2317D4F47C5E3");

            entity.ToTable("TBSMSALLOT");

            entity.Property(e => e.Reference)
                .ValueGeneratedNever()
                .HasColumnName("REFERENCE");
            entity.Property(e => e.Gentm)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("GENTM");
            entity.Property(e => e.Smsref).HasColumnName("SMSREF");
            entity.Property(e => e.Userref).HasColumnName("USERREF");
        });

        modelBuilder.Entity<Tbsmsinfo>(entity =>
        {
            entity.HasKey(e => e.Reference).HasName("PK__TBSMSINF__CAA2317D4B7734FF");

            entity.ToTable("TBSMSINFO");

            entity.HasIndex(e => e.Smsid, "UK_SMSINFOCode").IsUnique();

            entity.Property(e => e.Reference)
                .ValueGeneratedNever()
                .HasColumnName("REFERENCE");
            entity.Property(e => e.Gentm)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("GENTM");
            entity.Property(e => e.Smscontent)
                .HasColumnType("text")
                .HasColumnName("SMSCONTENT");
            entity.Property(e => e.Smsid)
                .HasMaxLength(16)
                .IsUnicode(false)
                .HasColumnName("SMSID");
            entity.Property(e => e.Smsindex).HasColumnName("SMSINDEX");
            entity.Property(e => e.Smsstarttm)
                .HasMaxLength(32)
                .IsUnicode(false)
                .HasColumnName("SMSSTARTTM");
            entity.Property(e => e.Smstmleng).HasColumnName("SMSTMLENG");
            entity.Property(e => e.Smstype).HasColumnName("SMSTYPE");
        });

        modelBuilder.Entity<Template>(entity =>
        {
            entity.HasKey(e => e.Templateid).HasName("TEMPLATED");

            entity.ToTable("TEMPLATE");

            entity.HasIndex(e => new { e.Userid, e.Fingerid }, "USERFINGER").IsUnique();

            entity.Property(e => e.Templateid).HasColumnName("TEMPLATEID");
            entity.Property(e => e.Bitmappicture)
                .HasColumnType("image")
                .HasColumnName("BITMAPPICTURE");
            entity.Property(e => e.Bitmappicture2)
                .HasColumnType("image")
                .HasColumnName("BITMAPPICTURE2");
            entity.Property(e => e.Bitmappicture3)
                .HasColumnType("image")
                .HasColumnName("BITMAPPICTURE3");
            entity.Property(e => e.Bitmappicture4)
                .HasColumnType("image")
                .HasColumnName("BITMAPPICTURE4");
            entity.Property(e => e.DivisionFp)
                .HasDefaultValue((short)0)
                .HasColumnName("DivisionFP");
            entity.Property(e => e.Emachinenum)
                .HasMaxLength(3)
                .IsUnicode(false)
                .HasColumnName("EMACHINENUM");
            entity.Property(e => e.Fingerid).HasColumnName("FINGERID");
            entity.Property(e => e.Flag).HasDefaultValue((short)1);
            entity.Property(e => e.Template1)
                .HasColumnType("image")
                .HasColumnName("TEMPLATE");
            entity.Property(e => e.Template11)
                .HasColumnType("image")
                .HasColumnName("TEMPLATE1");
            entity.Property(e => e.Template2)
                .HasColumnType("image")
                .HasColumnName("TEMPLATE2");
            entity.Property(e => e.Template3)
                .HasColumnType("image")
                .HasColumnName("TEMPLATE3");
            entity.Property(e => e.Template4)
                .HasColumnType("image")
                .HasColumnName("TEMPLATE4");
            entity.Property(e => e.Userid).HasColumnName("USERID");
            entity.Property(e => e.Usetype).HasColumnName("USETYPE");
        });

        modelBuilder.Entity<UserAcmachine>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.Deviceid }).HasName("UserAC_Machines");

            entity.ToTable("UserACMachines");

            entity.Property(e => e.UserId).HasColumnName("UserID");
        });

        modelBuilder.Entity<UserAcprivilege>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.DeviceId }).HasName("pk_privilege");

            entity.ToTable("UserACPrivilege");

            entity.Property(e => e.UserId).HasColumnName("UserID");
            entity.Property(e => e.DeviceId).HasColumnName("DeviceID");
            entity.Property(e => e.AcgroupId).HasColumnName("ACGroupID");
            entity.Property(e => e.Verifystyle).HasColumnName("verifystyle");
        });

        modelBuilder.Entity<UserOfRun>(entity =>
        {
            entity.HasKey(e => new { e.Userid, e.NumOfRunId, e.Startdate, e.Enddate }).HasName("USER_ST_NUM");

            entity.ToTable("USER_OF_RUN");

            entity.Property(e => e.Userid).HasColumnName("USERID");
            entity.Property(e => e.NumOfRunId).HasColumnName("NUM_OF_RUN_ID");
            entity.Property(e => e.Startdate)
                .HasDefaultValue(new DateTime(1900, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified))
                .HasColumnType("datetime")
                .HasColumnName("STARTDATE");
            entity.Property(e => e.Enddate)
                .HasDefaultValue(new DateTime(2099, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified))
                .HasColumnType("datetime")
                .HasColumnName("ENDDATE");
            entity.Property(e => e.IsnotofRun)
                .HasDefaultValue(0)
                .HasColumnName("ISNOTOF_RUN");
            entity.Property(e => e.OrderRun).HasColumnName("ORDER_RUN");
        });

        modelBuilder.Entity<UserSpeday>(entity =>
        {
            entity.HasKey(e => new { e.Userid, e.Startspecday, e.Dateid }).HasName("USER_SEP");

            entity.ToTable("USER_SPEDAY");

            entity.Property(e => e.Userid).HasColumnName("USERID");
            entity.Property(e => e.Startspecday)
                .HasDefaultValue(new DateTime(1900, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified))
                .HasColumnType("datetime")
                .HasColumnName("STARTSPECDAY");
            entity.Property(e => e.Dateid)
                .HasDefaultValue((short)-1)
                .HasColumnName("DATEID");
            entity.Property(e => e.Date)
                .HasColumnType("datetime")
                .HasColumnName("DATE");
            entity.Property(e => e.Endspecday)
                .HasDefaultValue(new DateTime(2099, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified))
                .HasColumnType("datetime")
                .HasColumnName("ENDSPECDAY");
            entity.Property(e => e.Yuanying)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("YUANYING");
        });

        modelBuilder.Entity<UserTempSch>(entity =>
        {
            entity.HasKey(e => new { e.Userid, e.Cometime, e.Leavetime }).HasName("USER_TEMP");

            entity.ToTable("USER_TEMP_SCH");

            entity.Property(e => e.Userid).HasColumnName("USERID");
            entity.Property(e => e.Cometime)
                .HasColumnType("datetime")
                .HasColumnName("COMETIME");
            entity.Property(e => e.Leavetime)
                .HasColumnType("datetime")
                .HasColumnName("LEAVETIME");
            entity.Property(e => e.Flag)
                .HasDefaultValue((short)1)
                .HasColumnName("FLAG");
            entity.Property(e => e.Overtime).HasColumnName("OVERTIME");
            entity.Property(e => e.Schclassid)
                .HasDefaultValue(-1)
                .HasColumnName("SCHCLASSID");
            entity.Property(e => e.Type)
                .HasDefaultValue((short)0)
                .HasColumnName("TYPE");
        });

        modelBuilder.Entity<UserUpdate>(entity =>
        {
            entity.HasKey(e => e.UpdateId).HasName("PK__UserUpda__7A0CF3C571D1E811");

            entity.Property(e => e.BadgeNumber)
                .HasMaxLength(20)
                .IsUnicode(false);
        });

        modelBuilder.Entity<UserUsedSclass>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.SchId }).HasName("USER_USED_SCL");

            entity.ToTable("UserUsedSClasses");
        });

        modelBuilder.Entity<Userinfo>(entity =>
        {
            entity.HasKey(e => e.Userid);

            entity.ToTable("USERINFO");

            entity.HasIndex(e => e.Badgenumber, "BADGENUMBER").IsUnique();

            entity.Property(e => e.Userid).HasColumnName("USERID");
            entity.Property(e => e.Att)
                .HasDefaultValue((short)1)
                .HasColumnName("ATT");
            entity.Property(e => e.AutoSchPlan).HasDefaultValue((short)1);
            entity.Property(e => e.Badgenumber)
                .HasMaxLength(24)
                .IsUnicode(false)
                .HasColumnName("BADGENUMBER");
            entity.Property(e => e.Birthday)
                .HasColumnType("datetime")
                .HasColumnName("BIRTHDAY");
            entity.Property(e => e.CardNo)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.City)
                .HasMaxLength(2)
                .IsUnicode(false)
                .HasColumnName("CITY");
            entity.Property(e => e.Defaultdeptid)
                .HasDefaultValue((short)1)
                .HasColumnName("DEFAULTDEPTID");
            entity.Property(e => e.Emprivilege)
                .HasDefaultValue((short)0)
                .HasColumnName("EMPRIVILEGE");
            entity.Property(e => e.Fphone)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("FPHONE");
            entity.Property(e => e.Gender)
                .HasMaxLength(8)
                .IsUnicode(false)
                .HasColumnName("GENDER");
            entity.Property(e => e.Hiredday)
                .HasColumnType("datetime")
                .HasColumnName("HIREDDAY");
            entity.Property(e => e.Holiday)
                .HasDefaultValue((short)1)
                .HasColumnName("HOLIDAY");
            entity.Property(e => e.InheritDeptRule).HasDefaultValue((short)1);
            entity.Property(e => e.InheritDeptSch).HasDefaultValue((short)1);
            entity.Property(e => e.InheritDeptSchClass).HasDefaultValue((short)1);
            entity.Property(e => e.Inlate)
                .HasDefaultValue((short)1)
                .HasColumnName("INLATE");
            entity.Property(e => e.Lunchduration)
                .HasDefaultValue((short)1)
                .HasColumnName("LUNCHDURATION");
            entity.Property(e => e.MinAutoSchInterval).HasDefaultValue(24);
            entity.Property(e => e.Minzu)
                .HasMaxLength(8)
                .IsUnicode(false)
                .HasColumnName("MINZU");
            entity.Property(e => e.MverifyPass)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("MVerifyPass");
            entity.Property(e => e.Name)
                .HasMaxLength(40)
                .IsUnicode(false)
                .HasColumnName("NAME");
            entity.Property(e => e.Notes).HasColumnType("image");
            entity.Property(e => e.Ophone)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("OPHONE");
            entity.Property(e => e.Outearly)
                .HasDefaultValue((short)1)
                .HasColumnName("OUTEARLY");
            entity.Property(e => e.Overtime)
                .HasDefaultValue((short)1)
                .HasColumnName("OVERTIME");
            entity.Property(e => e.Pager)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("PAGER");
            entity.Property(e => e.Password)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("PASSWORD");
            entity.Property(e => e.Photo)
                .HasColumnType("image")
                .HasColumnName("PHOTO");
            entity.Property(e => e.Privilege)
                .HasDefaultValue(0)
                .HasColumnName("privilege");
            entity.Property(e => e.RegisterOt)
                .HasDefaultValue((short)1)
                .HasColumnName("RegisterOT");
            entity.Property(e => e.Securityflags).HasColumnName("SECURITYFLAGS");
            entity.Property(e => e.Sep)
                .HasDefaultValue((short)1)
                .HasColumnName("SEP");
            entity.Property(e => e.Ssn)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("SSN");
            entity.Property(e => e.State)
                .HasMaxLength(2)
                .IsUnicode(false)
                .HasColumnName("STATE");
            entity.Property(e => e.Street)
                .HasMaxLength(80)
                .IsUnicode(false)
                .HasColumnName("STREET");
            entity.Property(e => e.Title)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("TITLE");
            entity.Property(e => e.Verificationmethod).HasColumnName("VERIFICATIONMETHOD");
            entity.Property(e => e.Zip)
                .HasMaxLength(12)
                .IsUnicode(false)
                .HasColumnName("ZIP");
        });

        modelBuilder.Entity<UsersMachine>(entity =>
        {
            entity.HasNoKey();

            entity.Property(e => e.Deviceid).HasColumnName("DEVICEID");
            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("ID");
            entity.Property(e => e.Userid).HasColumnName("USERID");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
