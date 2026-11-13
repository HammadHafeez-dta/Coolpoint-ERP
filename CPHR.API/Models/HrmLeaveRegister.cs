using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class HrmLeaveRegister
{
    public int EmpCardNo { get; set; }

    public string Site { get; set; } = null!;

    public int LeaveMonth { get; set; }

    public int LeaveYear { get; set; }

    public int ApplicationNo { get; set; }

    public DateTime? LeaveDate { get; set; }

    public decimal AlOpen { get; set; }

    public decimal AlAdd { get; set; }

    public decimal AlUse { get; set; }

    public decimal ClOpen { get; set; }

    public decimal ClAdd { get; set; }

    public decimal ClUse { get; set; }

    public decimal SlOpen { get; set; }

    public decimal SlAdd { get; set; }

    public decimal SlUse { get; set; }

    public decimal CplOpen { get; set; }

    public decimal CplAdd { get; set; }

    public decimal CplUse { get; set; }

    public string? EnterBy { get; set; }

    public DateTime? EnteryTime { get; set; }

    public string? EditBy { get; set; }

    public DateTime? EditTime { get; set; }

    public long SerialNo { get; set; }
}
