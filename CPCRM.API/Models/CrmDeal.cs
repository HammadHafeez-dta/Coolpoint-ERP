namespace CPCRM.API.Models;

public class CrmDeal
{
    public int Id { get; set; }
    public string Site { get; set; } = "";
    public int LeadId { get; set; }
    public string Title { get; set; } = "";
    public string? OwnerUserId { get; set; }
    public string Stage { get; set; } = "New";
    public decimal Value { get; set; }
    public string CurrencyCode { get; set; } = "PKR";
    public decimal? WonValue { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ClosedAt { get; set; }
    public string? ClosedBy { get; set; }
    public string? LossReason { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
}
