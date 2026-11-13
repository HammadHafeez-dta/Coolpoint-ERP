using System.ComponentModel.DataAnnotations;

namespace CPCRM.API.Models;

public class CrmProject
{
    public int Id { get; set; }
    public int? LeadId { get; set; }
    [MaxLength(50)] public string Site { get; set; } = "";
    [MaxLength(250)] public string Title { get; set; } = "";
    [MaxLength(200)] public string? CustomerName { get; set; }
    [MaxLength(100)] public string CreatedBy { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public byte[] RowVersion { get; set; } = [];
    public List<CrmProjectTask> Tasks { get; set; } = [];
}

public class CrmProjectTask
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    [MaxLength(50)] public string Site { get; set; } = "";
    [MaxLength(250)] public string Title { get; set; } = "";
    [MaxLength(4000)] public string? Description { get; set; }
    [MaxLength(100)] public string AssigneeUserId { get; set; } = "";
    [MaxLength(150)] public string AssigneeName { get; set; } = "";
    [MaxLength(20)] public string Status { get; set; } = "Todo";
    [MaxLength(10)] public string Priority { get; set; } = "Medium";
    public DateTime? DueDate { get; set; }
    [MaxLength(100)] public string CreatedBy { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    [MaxLength(100)] public string? UpdatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public byte[] RowVersion { get; set; } = [];
}

public class CrmProjectTaskEvent
{
    public int Id { get; set; }
    public int TaskId { get; set; }
    [MaxLength(50)] public string Site { get; set; } = "";
    [MaxLength(100)] public string ActorUserId { get; set; } = "";
    [MaxLength(30)] public string Type { get; set; } = "";
    [MaxLength(500)] public string Summary { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
