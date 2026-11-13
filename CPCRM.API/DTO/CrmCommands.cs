using System.ComponentModel.DataAnnotations;

namespace CPCRM.API.DTO;

public class LeadInput
{
    [Required, RegularExpression("^(New|Contacted|Qualified|Disqualified)$")]
    public string LifecycleStatus { get; set; } = "New";
    [Required, StringLength(250)] public string Title { get; set; } = "";
    [Required, StringLength(200)] public string CustomerName { get; set; } = "";
    [StringLength(150)] public string? ContactPerson { get; set; }
    [EmailAddress, StringLength(150)] public string? Email { get; set; }
    [StringLength(50)] public string? Phone { get; set; }
    [StringLength(100)] public string Category { get; set; } = "Industrial Chiller";
    [Range(0, 9999999999999999d)] public decimal EstimatedValue { get; set; }
    [RegularExpression("^[A-Z]{3}$")] public string CurrencyCode { get; set; } = "PKR";
    [StringLength(100)] public string? OwnerUserId { get; set; }
    [StringLength(100)] public string? Source { get; set; }
    [StringLength(30)] public string Priority { get; set; } = "Medium";
    [StringLength(10000)] public string? Notes { get; set; }
    public string? RowVersion { get; set; }
}
public class StateCommand
{
    [Required] public string RowVersion { get; set; } = "";
    [StringLength(40)] public string? Stage { get; set; }
    [StringLength(4000)] public string? Note { get; set; }
}
public class ActivityInput
{
    [RegularExpression("^(Note|Call)$")] public string Type { get; set; } = "Note";
    [Required, StringLength(4000)] public string Body { get; set; } = "";
}
public class DealInput
{
    [Required, StringLength(250)] public string Title { get; set; } = "";
    [Range(0, 9999999999999999d)] public decimal Value { get; set; }
}
public class QuotationInput
{
    [Required, StringLength(250)] public string ProjectTitle { get; set; } = "";
    [Range(0, 100)] public decimal TaxPercent { get; set; } = 18;
    [Range(1, 365)] public int ValidityDays { get; set; } = 30;
    [StringLength(10000)] public string? Terms { get; set; }
    [Required, MinLength(1), MaxLength(100)] public List<QuotationLineInput> Items { get; set; } = new();
    public string? RowVersion { get; set; }
}
public class QuotationLineInput
{
    [Required, StringLength(300)] public string ItemDescription { get; set; } = "";
    [StringLength(100)] public string? EquipmentModel { get; set; }
    [StringLength(100)] public string? Capacity { get; set; }
    [Range(1, 100000)] public int Quantity { get; set; } = 1;
    [Range(0, 9999999999d)] public decimal UnitPrice { get; set; }
}
