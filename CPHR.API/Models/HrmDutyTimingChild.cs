using System;

namespace SaftHR.API.Models;

public partial class HrmDutyTimingChild
{
    public int SerialNo { get; set; }

    public int TransNo { get; set; }

    public string Site { get; set; } = null!;

    public int EmpCardNo { get; set; }

    public string? EmpName { get; set; }

    public int? DepartmentCode { get; set; }

    public string? DesignationName { get; set; }

    public DateTime FromDate { get; set; }

    public DateTime ToDate { get; set; }

    public string FromTime { get; set; } = null!;

    public string ToTime { get; set; } = null!;

    public virtual HrmDutyTimingMaster? Master { get; set; }
}
