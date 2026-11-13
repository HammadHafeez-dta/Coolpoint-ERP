using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class HrmTempLateShortLeaveDetail
{
    public int? EmpCardNo { get; set; }

    public string? EmpName { get; set; }

    public DateTime? JoiningDate { get; set; }

    public int? DeptCode { get; set; }

    public string? DepartmentName { get; set; }

    public int? DesgCode { get; set; }

    public string? DesignationName { get; set; }

    public decimal? JanShortLeave { get; set; }

    public decimal? JanLates { get; set; }

    public decimal? FebShortLeave { get; set; }

    public decimal? FebLates { get; set; }

    public decimal? MarShortLeave { get; set; }

    public decimal? MarLates { get; set; }

    public decimal? AprShortLeave { get; set; }

    public decimal? AprLates { get; set; }

    public decimal? MayShortLeave { get; set; }

    public decimal? MayLates { get; set; }

    public decimal? JuneShortLeave { get; set; }

    public decimal? JuneLates { get; set; }

    public decimal? JulyShortLeave { get; set; }

    public decimal? JulyLates { get; set; }

    public decimal? AugShortLeave { get; set; }

    public decimal? AugLates { get; set; }

    public decimal? SepShortLeave { get; set; }

    public decimal? SepLates { get; set; }

    public decimal? OctShortLeave { get; set; }

    public decimal? OctLates { get; set; }

    public decimal? NovShortLeave { get; set; }

    public decimal? NovLates { get; set; }

    public decimal? DecShortLeave { get; set; }

    public decimal? DecLates { get; set; }

    public decimal? TotalShortLeave { get; set; }

    public decimal? TotalLates { get; set; }
}
