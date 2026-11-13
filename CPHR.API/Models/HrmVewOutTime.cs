using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class HrmVewOutTime
{
    public int TransactionNo { get; set; }

    public int? DepartmentCode { get; set; }

    public string Site { get; set; } = null!;

    public string? DepartmentName { get; set; }

    public string? EnterBy { get; set; }

    public DateTime? EnteryTime { get; set; }

    public DateTime? AttendanceDate { get; set; }

    public DateTime? OutTime { get; set; }

    public string? Reason { get; set; }
}
