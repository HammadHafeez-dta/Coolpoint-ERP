using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class HrmVewLeaveRegister
{
    public int EmpCardNo { get; set; }

    public string Site { get; set; } = null!;

    public string? Shift { get; set; }

    public byte[]? EmpPicture { get; set; }

    public string? EmpName { get; set; }

    public string? EmpFatherName { get; set; }

    public int? DeptCode { get; set; }

    public string? DepartmentName { get; set; }

    public int? DesgCode { get; set; }

    public string? DesignationName { get; set; }

    public decimal? AlOpen { get; set; }

    public decimal? AlAdd { get; set; }

    public decimal? AlUse { get; set; }

    public decimal? ClOpen { get; set; }

    public decimal? ClAdd { get; set; }

    public decimal? ClUse { get; set; }

    public decimal? SlOpen { get; set; }

    public decimal? SlAdd { get; set; }

    public decimal? SlUse { get; set; }

    public decimal? CplOpen { get; set; }

    public decimal? CplAdd { get; set; }

    public decimal? CplUse { get; set; }

    public DateTime? LeaveDate { get; set; }

    public DateTime? JoiningDate { get; set; }

    public int? LeaveMonth { get; set; }

    public int? LeaveYear { get; set; }
}
