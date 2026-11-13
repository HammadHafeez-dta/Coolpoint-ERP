using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class HrmInTime
{
    public int TransactionNo { get; set; }

    public string Site { get; set; } = null!;

    public int? DepartmentCode { get; set; }

    public DateTime? AttendanceDate { get; set; }

    public DateTime? InTime { get; set; }

    public string? EnterBy { get; set; }

    public DateTime? EnteryTime { get; set; }

    public int SerialNo { get; set; }

    public string? Reason { get; set; }

    public int? EmpCardNo { get; set; }

    public string? EmpName { get; set; }

    public string? AttendanceType { get; set; }
}
