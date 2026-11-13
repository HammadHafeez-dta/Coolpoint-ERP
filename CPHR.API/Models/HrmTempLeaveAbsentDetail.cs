using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class HrmTempLeaveAbsentDetail
{
    public int? EmpCardNo { get; set; }

    public string? EmpName { get; set; }

    public DateTime? JoiningDate { get; set; }

    public int? DeptCode { get; set; }

    public string? DepartmentName { get; set; }

    public int? DesgCode { get; set; }

    public string? DesignationName { get; set; }

    public decimal? JanLeave { get; set; }

    public decimal? JanAbsent { get; set; }

    public decimal? FebLeave { get; set; }

    public decimal? FebAbsent { get; set; }

    public decimal? MarLeave { get; set; }

    public decimal? MarAbsent { get; set; }

    public decimal? AprLeave { get; set; }

    public decimal? AprAbsent { get; set; }

    public decimal? MayLeave { get; set; }

    public decimal? MayAbsent { get; set; }

    public decimal? JuneLeave { get; set; }

    public decimal? JuneAbsent { get; set; }

    public decimal? JulyLeave { get; set; }

    public decimal? JulyAbsent { get; set; }

    public decimal? AugLeave { get; set; }

    public decimal? AugAbsent { get; set; }

    public decimal? SepLeave { get; set; }

    public decimal? SepAbsent { get; set; }

    public decimal? OctLeave { get; set; }

    public decimal? OctAbsent { get; set; }

    public decimal? NovLeave { get; set; }

    public decimal? NovAbsent { get; set; }

    public decimal? DecLeave { get; set; }

    public decimal? DecAbsent { get; set; }

    public decimal? TotalLeave { get; set; }

    public decimal? TotalAbsent { get; set; }
}
