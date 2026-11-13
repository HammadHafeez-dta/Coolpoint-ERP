using System;

namespace SaftHR.API.Models;

public partial class HrmEmployeeRestDay
{
    public int RestDayId { get; set; }

    public string Site { get; set; } = null!;

    public int DepartmentCode { get; set; }

    public int EmpCardNo { get; set; }

    public string? EmpName { get; set; }

    public DateTime RestDate { get; set; }

    public string RestDay { get; set; } = null!;

    public string? Remarks { get; set; }

    public string? EnterBy { get; set; }

    public DateTime? EnteryTime { get; set; }

    public string? EditBy { get; set; }

    public DateTime? EditTime { get; set; }
}
