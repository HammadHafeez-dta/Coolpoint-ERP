using System;
using System.Collections.Generic;

namespace CPCRM.API.Models
{
    public class CrmCustomer
    {
        public int Id { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string? ContactPerson { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? Industry { get; set; }
        public string? Site { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? CreatedBy { get; set; }

        public virtual ICollection<CrmLead> Leads { get; set; } = new List<CrmLead>();
        public virtual ICollection<CrmQuotation> Quotations { get; set; } = new List<CrmQuotation>();
    }
}

