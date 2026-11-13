using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class ShiftTiming
{
    public int TransactionNo { get; set; }

    public string Site { get; set; } = null!;

    public DateTime? FromDate { get; set; }

    public DateTime? ToDate { get; set; }

    public int? DepartmentId { get; set; }

    public string? InTime { get; set; }

    public string? OutTime { get; set; }

    public string? EnterBy { get; set; }

    public DateTime? EnteryTime { get; set; }

    public string? EditBy { get; set; }

    public DateTime? EditTime { get; set; }
}
