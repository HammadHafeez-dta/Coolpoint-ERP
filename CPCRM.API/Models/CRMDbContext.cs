using System;
using Microsoft.EntityFrameworkCore;

namespace CPCRM.API.Models
{
    public class CRMDbContext : DbContext
    {
        public CRMDbContext(DbContextOptions<CRMDbContext> options) : base(options)
        {
        }

        public virtual DbSet<CrmCustomer> CrmCustomers { get; set; } = null!;
        public virtual DbSet<CrmLead> CrmLeads { get; set; } = null!;
        public virtual DbSet<CrmQuotation> CrmQuotations { get; set; } = null!;
        public virtual DbSet<CrmQuotationItem> CrmQuotationItems { get; set; } = null!;
        public DbSet<CrmDeal> CrmDeals { get; set; } = null!;
        public DbSet<CrmActivity> CrmActivities { get; set; } = null!;
        public DbSet<CrmProject> CrmProjects { get; set; } = null!;
        public DbSet<CrmProjectTask> CrmProjectTasks { get; set; } = null!;
        public DbSet<CrmProjectTaskEvent> CrmProjectTaskEvents { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<CrmProject>(e => {
                e.ToTable("CRM_Projects"); e.HasKey(x => x.Id);
                e.HasAlternateKey(x => new { x.Id, x.Site });
                e.HasIndex(x => x.LeadId).IsUnique().HasFilter("[LeadId] IS NOT NULL");
                e.HasIndex(x => new { x.Site, x.CreatedAt });
                e.Property(x => x.RowVersion).IsRowVersion();
                e.HasOne<CrmLead>().WithMany().HasForeignKey(x => x.LeadId).OnDelete(DeleteBehavior.Restrict);
                e.HasMany(x => x.Tasks).WithOne().HasForeignKey(x => new { x.ProjectId, x.Site })
                    .HasPrincipalKey(x => new { x.Id, x.Site }).OnDelete(DeleteBehavior.Restrict);
            });
            modelBuilder.Entity<CrmProjectTask>(e => {
                e.ToTable("CRM_ProjectTasks"); e.HasKey(x => x.Id);
                e.HasAlternateKey(x => new { x.Id, x.Site });
                e.HasIndex(x => new { x.Site, x.AssigneeUserId, x.ProjectId });
                e.Property(x => x.RowVersion).IsRowVersion();
                e.Property(x => x.DueDate).HasColumnType("datetime2");
            });
            modelBuilder.Entity<CrmProjectTaskEvent>(e => {
                e.ToTable("CRM_ProjectTaskEvents"); e.HasKey(x => x.Id);
                e.HasOne<CrmProjectTask>().WithMany().HasForeignKey(x => new { x.TaskId, x.Site })
                    .HasPrincipalKey(x => new { x.Id, x.Site }).OnDelete(DeleteBehavior.Restrict);
            });
            modelBuilder.Entity<CrmLead>().Property(x => x.RowVersion).IsRowVersion();
            modelBuilder.Entity<CrmQuotation>().Property(x => x.RowVersion).IsRowVersion();
            modelBuilder.Entity<CrmDeal>(e => {
                e.ToTable("CRM_Deals"); e.HasKey(x => x.Id);
                e.Property(x => x.Value).HasColumnType("decimal(18,2)");
                e.Property(x => x.WonValue).HasColumnType("decimal(18,2)");
                e.Property(x => x.RowVersion).IsRowVersion();
                e.HasOne<CrmLead>().WithMany().HasForeignKey(x => x.LeadId).OnDelete(DeleteBehavior.Restrict);
            });
            modelBuilder.Entity<CrmActivity>(e => {
                e.ToTable("CRM_Activities"); e.HasKey(x => x.Id);
                e.HasOne<CrmLead>().WithMany().HasForeignKey(x => x.LeadId).OnDelete(DeleteBehavior.Restrict);
                e.HasOne<CrmDeal>().WithMany().HasForeignKey(x => x.DealId).OnDelete(DeleteBehavior.Restrict);
                e.HasOne<CrmQuotation>().WithMany().HasForeignKey(x => x.QuotationId).OnDelete(DeleteBehavior.Restrict);
            });
            modelBuilder.Entity<CrmQuotation>().HasOne<CrmDeal>().WithMany().HasForeignKey(x => x.DealId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CrmCustomer>(entity =>
            {
                entity.ToTable("CRM_Customers");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.CompanyName).HasMaxLength(200).IsRequired();
                entity.Property(e => e.ContactPerson).HasMaxLength(150);
                entity.Property(e => e.Email).HasMaxLength(150);
                entity.Property(e => e.Phone).HasMaxLength(50);
                entity.Property(e => e.City).HasMaxLength(100);
                entity.Property(e => e.Industry).HasMaxLength(100);
                entity.Property(e => e.Site).HasMaxLength(50);
                entity.Property(e => e.CreatedBy).HasMaxLength(100);
            });

            modelBuilder.Entity<CrmLead>(entity =>
            {
                entity.ToTable("CRM_Leads");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.LeadNumber).HasMaxLength(50).IsRequired();
                entity.Property(e => e.Title).HasMaxLength(250).IsRequired();
                entity.Property(e => e.CustomerName).HasMaxLength(200);
                entity.Property(e => e.Notes).HasColumnType("nvarchar(max)");
                entity.Property(e => e.Category).HasMaxLength(100);
                entity.Property(e => e.EstimatedValue).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Stage).HasMaxLength(50);
                entity.Property(e => e.Priority).HasMaxLength(30);
                entity.Property(e => e.AssignedEngineer).HasMaxLength(150);
                entity.Property(e => e.ContactPerson).HasMaxLength(150);
                entity.Property(e => e.Phone).HasMaxLength(50);
                entity.Property(e => e.Email).HasMaxLength(150);
                entity.Property(e => e.Site).HasMaxLength(50);
                entity.Property(e => e.CreatedBy).HasMaxLength(100);

                entity.HasOne(d => d.Customer)
                    .WithMany(p => p.Leads)
                    .HasForeignKey(d => d.CustomerId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<CrmQuotation>(entity =>
            {
                entity.ToTable("CRM_Quotations");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.QuotationNo).HasMaxLength(50).IsRequired();
                entity.Property(e => e.CustomerName).HasMaxLength(200).IsRequired();
                entity.Property(e => e.ProjectTitle).HasMaxLength(250).IsRequired();
                entity.Property(e => e.SubTotal).HasColumnType("decimal(18,2)");
                entity.Property(e => e.TaxPercent).HasColumnType("decimal(5,2)");
                entity.Property(e => e.TaxAmount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.TotalAmount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Status).HasMaxLength(50);
                entity.Property(e => e.Site).HasMaxLength(50);
                entity.Property(e => e.CreatedBy).HasMaxLength(100);

                entity.HasOne(d => d.Customer)
                    .WithMany(p => p.Quotations)
                    .HasForeignKey(d => d.CustomerId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(d => d.Lead)
                    .WithMany()
                    .HasForeignKey(d => d.LeadId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<CrmQuotationItem>(entity =>
            {
                entity.ToTable("CRM_QuotationItems");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ItemDescription).HasMaxLength(300).IsRequired();
                entity.Property(e => e.EquipmentModel).HasMaxLength(100);
                entity.Property(e => e.Capacity).HasMaxLength(100);
                entity.Property(e => e.UnitPrice).HasColumnType("decimal(18,2)");
                entity.Property(e => e.TotalPrice).HasColumnType("decimal(18,2)");

                entity.HasOne(d => d.Quotation)
                    .WithMany(p => p.Items)
                    .HasForeignKey(d => d.QuotationId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}

