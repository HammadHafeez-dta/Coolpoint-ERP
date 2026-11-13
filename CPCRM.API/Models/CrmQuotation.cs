using System;
using System.Collections.Generic;

namespace CPCRM.API.Models
{
    public class CrmQuotation
    {
        public int Id { get; set; }
        public int? DealId { get; set; }
        public int Version { get; set; } = 1;
        public int? SupersedesQuotationId { get; set; }
        public string CurrencyCode { get; set; } = "PKR";
        public DateTime? SentAt { get; set; }
        public string? SentBy { get; set; }
        public DateTime? DecidedAt { get; set; }
        public string? DecidedBy { get; set; }
        public string? DecisionNote { get; set; }
        public byte[] RowVersion { get; set; } = Array.Empty<byte>();
        public string QuotationNo { get; set; } = string.Empty;
        public int? LeadId { get; set; }
        public int? CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string ProjectTitle { get; set; } = string.Empty;
        public decimal SubTotal { get; set; }
        public decimal TaxPercent { get; set; } = 18.0m;
        public decimal TaxAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = "Draft";
        public int? ValidityDays { get; set; } = 30;
        public string? Terms { get; set; }
        public string? Site { get; set; }
        public DateTime? QuotationDate { get; set; } = DateTime.UtcNow;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? CreatedBy { get; set; }

        public virtual CrmCustomer? Customer { get; set; }
        public virtual CrmLead? Lead { get; set; }
        public virtual ICollection<CrmQuotationItem> Items { get; set; } = new List<CrmQuotationItem>();
    }
}

