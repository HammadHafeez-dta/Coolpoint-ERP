using System;

namespace CPCRM.API.Models
{
    public class CrmLead
    {
        public int Id { get; set; }
        public string LifecycleStatus { get; set; } = "New";
        public string? OwnerUserId { get; set; }
        public string? Source { get; set; }
        public string CurrencyCode { get; set; } = "PKR";
        public DateTime? UpdatedAt { get; set; }
        public byte[] RowVersion { get; set; } = Array.Empty<byte>();
        public string LeadNumber { get; set; } = string.Empty;
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
        public string? Site { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? CreatedBy { get; set; }
        public DateTime? ExpectedCloseDate { get; set; }

        public virtual CrmCustomer? Customer { get; set; }
    }
}

