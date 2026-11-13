using System.ComponentModel.DataAnnotations;

namespace CPCRM.API.DTO;

public class ProjectInput
{
    [Required, StringLength(250)] public string Title { get; set; } = "";
    [StringLength(200)] public string? CustomerName { get; set; }
}

public class ProjectTaskInput
{
    [Required, StringLength(250)] public string Title { get; set; } = "";
    [StringLength(4000)] public string? Description { get; set; }
    [Required, StringLength(100)] public string AssigneeUserId { get; set; } = "";
    public DateTime? DueDate { get; set; }
    public string Priority { get; set; } = "Medium";
    public string? RowVersion { get; set; }
}
public class ProjectTaskState
{
    [Required] public string Status { get; set; } = "";
    [Required] public string RowVersion { get; set; } = "";
}
