namespace CPCRM.API.Models;

public class CrmActivity
{
    public int Id { get; set; }
    public string Site { get; set; } = "";
    public int LeadId { get; set; }
    public int? DealId { get; set; }
    public int? QuotationId { get; set; }
    public string Type { get; set; } = "";
    public string Channel { get; set; } = "Internal";
    public string Source { get; set; } = "System";
    public string Summary { get; set; } = "";
    public string? Body { get; set; }
    public string ActorUserId { get; set; } = "";
    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;
}
