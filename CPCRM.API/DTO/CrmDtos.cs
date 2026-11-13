using System;
using System.Collections.Generic;

namespace CPCRM.API.DTO
{
    public class CrmCustomerDto
    {
        public int Id { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string? ContactPerson { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? City { get; set; }
        public string? Industry { get; set; }
        public bool IsActive { get; set; }
    }

    public class CreateCustomerDto
    {
        public string CompanyName { get; set; } = string.Empty;
        public string? ContactPerson { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? Industry { get; set; }
    }

    public class CrmLeadDto
    {
        public int Id { get; set; }
        public string LeadNumber { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public int? CustomerId { get; set; }
        public string? CustomerName { get; set; }
        public string Category { get; set; } = string.Empty;
        public decimal EstimatedValue { get; set; }
        public string Stage { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public string? AssignedEngineer { get; set; }
        public string? ContactPerson { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateLeadDto
    {
        public string Title { get; set; } = string.Empty;
        public int? CustomerId { get; set; }
        public string? CustomerName { get; set; }
        public string Category { get; set; } = "Industrial Chiller";
        public decimal EstimatedValue { get; set; }
        public string Stage { get; set; } = "New";
        public string Priority { get; set; } = "Medium";
        public string? AssignedEngineer { get; set; }
        public string? ContactPerson { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Notes { get; set; }
    }

    public class CrmQuotationDto
    {
        public int Id { get; set; }
        public string QuotationNo { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string ProjectTitle { get; set; } = string.Empty;
        public decimal SubTotal { get; set; }
        public decimal TaxPercent { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public int? ValidityDays { get; set; }
        public DateTime? QuotationDate { get; set; }
        public List<CrmQuotationItemDto> Items { get; set; } = new();
    }

    public class CrmQuotationItemDto
    {
        public int Id { get; set; }
        public string ItemDescription { get; set; } = string.Empty;
        public string? EquipmentModel { get; set; }
        public string? Capacity { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
    }

    public class CrmDashboardStatsDto
    {
        public decimal TotalPipelineValue { get; set; }
        public int ActiveInquiriesCount { get; set; }
        public decimal TotalWonValue { get; set; }
        public int WonCount { get; set; }
        public double ConversionRate { get; set; }
    }
}

