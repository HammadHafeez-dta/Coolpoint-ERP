using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace SaftProject.Models;

public partial class CommonDbContext : DbContext
{
    public CommonDbContext(DbContextOptions<CommonDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<TblFinancialYear> TblFinancialYears { get; set; }

    public virtual DbSet<TblFormName> TblFormNames { get; set; }

    public virtual DbSet<TblSite> TblSites { get; set; }

    public virtual DbSet<TblSoftware> TblSoftwares { get; set; }

    public virtual DbSet<TblUser> TblUsers { get; set; }

    public virtual DbSet<TblUserRight> TblUserRights { get; set; }

    public virtual DbSet<TblUserType> TblUserTypes { get; set; }

    public virtual DbSet<TblUsersChild> TblUsersChildren { get; set; }

    public virtual DbSet<VewUserRight> VewUserRights { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TblFinancialYear>(entity =>
        {
            entity.HasKey(e => e.FinancialYear);

            entity.ToTable("tbl_FinancialYears");

            entity.Property(e => e.FinancialYear)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("Financial_Year");
            entity.Property(e => e.EndDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("End_Date");
            entity.Property(e => e.StartDate)
                .HasColumnType("smalldatetime")
                .HasColumnName("Start_Date");
        });

        modelBuilder.Entity<TblFormName>(entity =>
        {
            entity.HasKey(e => new { e.Id, e.Software });

            entity.ToTable("tbl_FormNames");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.Software)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.MainName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Main_Name");
            entity.Property(e => e.RightsName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Rights_Name");
        });

        modelBuilder.Entity<TblSite>(entity =>
        {
            entity.HasKey(e => e.Site);

            entity.ToTable("tbl_Sites");

            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false)
                .HasDefaultValue("");
            entity.Property(e => e.Address)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.Email)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Fax)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Logo).HasColumnType("image");
            entity.Property(e => e.Name)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Ntn)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("NTN");
            entity.Property(e => e.Phone)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.SalesTaxNo)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Sales_Tax_No");
        });

        modelBuilder.Entity<TblSoftware>(entity =>
        {
            entity.HasKey(e => new { e.SoftwareNo, e.Site });

            entity.ToTable("tbl_Softwares");

            entity.Property(e => e.SoftwareNo).HasColumnName("Software_No");
            entity.Property(e => e.Site)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.SoftwareName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Software_Name");
        });

        modelBuilder.Entity<TblUser>(entity =>
        {
            entity.HasKey(e => e.UserNo);

            entity.ToTable("tbl_Users");

            entity.Property(e => e.UserNo)
                .ValueGeneratedNever()
                .HasColumnName("User_No");
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false);
            entity.Property(e => e.UserId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("User_ID");
            entity.Property(e => e.UserLevel)
                .HasMaxLength(1)
                .IsUnicode(false)
                .HasDefaultValue("")
                .IsFixedLength()
                .HasColumnName("User_Level");
            entity.Property(e => e.UserName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("User_Name");
            entity.Property(e => e.UserPassward)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("User_Passward");
            entity.Property(e => e.UserPicture)
                .HasColumnType("image")
                .HasColumnName("User_Picture");
            entity.Property(e => e.WebUser).HasColumnName("Web_User");
            entity.Property(e => e.TeacherId).HasColumnName("Teacher_ID");
            entity.Property(e => e.TeacherName)
                .HasMaxLength(150)
                .IsUnicode(true)
                .HasColumnName("Teacher_Name");
            entity.HasIndex(e => e.TeacherId)
                .IsUnique()
                .HasFilter("[Teacher_ID] IS NOT NULL")
                .HasDatabaseName("UX_tbl_Users_Teacher_ID");
        });

        modelBuilder.Entity<TblUserRight>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.Site, e.Name, e.Year, e.Software });

            entity.ToTable("tbl_UserRights");

            entity.Property(e => e.UserId)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("User_ID");
            entity.Property(e => e.Site)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Name)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Year)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Software)
                .HasMaxLength(50)
                .IsUnicode(false);
        });

        modelBuilder.Entity<TblUserType>(entity =>
        {
            entity.HasKey(e => e.UserNo);

            entity.ToTable("tbl_UserTypes");

            entity.Property(e => e.UserNo)
                .ValueGeneratedNever()
                .HasColumnName("User_No");
            entity.Property(e => e.Site)
                .HasMaxLength(3)
                .IsUnicode(false)
                .HasDefaultValue("");
            entity.Property(e => e.UserLevel)
                .HasMaxLength(1)
                .IsUnicode(false)
                .HasDefaultValue("")
                .IsFixedLength()
                .HasColumnName("User_Level");
            entity.Property(e => e.UserType)
                .HasMaxLength(15)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("User_Type");
        });

        modelBuilder.Entity<TblUsersChild>(entity =>
        {
            entity.HasKey(e => e.SerialNo);

            entity.ToTable("tbl_Users_Child");

            entity.Property(e => e.SerialNo).HasColumnName("Serial_No");
            entity.Property(e => e.Site)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.SoftwareName)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasDefaultValue("")
                .HasColumnName("Software_Name");
            entity.Property(e => e.UserNo).HasColumnName("User_No");
        });

        modelBuilder.Entity<VewUserRight>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vew_UserRights");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.MainName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Main_Name");
            entity.Property(e => e.Name)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.RightsName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Rights_Name");
            entity.Property(e => e.Site)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Software)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.UserId)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("User_ID");
            entity.Property(e => e.Year)
                .HasMaxLength(50)
                .IsUnicode(false);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
