using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class VewLeaveRegister
{
    public int EmpCardNo { get; set; }

    public string? EmpName { get; set; }

    public string? EmpFatherName { get; set; }

    public string? DesignationName { get; set; }

    public string? DepartmentName { get; set; }

    public DateTime? JoiningDate { get; set; }

    public string Site { get; set; } = null!;

    public int AppNo { get; set; }

    public int LeaveMonth { get; set; }

    public int LeaveYear { get; set; }

    public decimal Alopen { get; set; }

    public decimal Aladd { get; set; }

    public decimal Aluse { get; set; }

    public DateTime? LeaveDate { get; set; }

    public decimal Clopen { get; set; }

    public decimal Cladd { get; set; }

    public decimal Cluse { get; set; }

    public decimal Slopen { get; set; }

    public decimal Sladd { get; set; }

    public decimal Sluse { get; set; }

    public int? LocationCode { get; set; }

    public string? LocationName { get; set; }

    public string? GradeName { get; set; }

    public string? Category { get; set; }

    public decimal Cpladd { get; set; }

    public decimal Cpluse { get; set; }

    public decimal Cplopen { get; set; }
}
