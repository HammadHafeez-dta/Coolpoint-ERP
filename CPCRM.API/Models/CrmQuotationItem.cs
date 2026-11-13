namespace CPCRM.API.Models
{
    public class CrmQuotationItem
    {
        public int Id { get; set; }
        public int QuotationId { get; set; }
        public string ItemDescription { get; set; } = string.Empty;
        public string? EquipmentModel { get; set; }
        public string? Capacity { get; set; }
        public int Quantity { get; set; } = 1;
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }

        public virtual CrmQuotation? Quotation { get; set; }
    }
}

