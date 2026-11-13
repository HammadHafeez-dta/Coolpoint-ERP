namespace SaftHR.API.Models;

public partial class HrmWeeklyRestDayChild
{
    public int SerialNo { get; set; }
    public int TransNo { get; set; }
    public string Site { get; set; } = null!;
    public int EmpCardNo { get; set; }
    public string? EmpName { get; set; }
    public int DepartmentCode { get; set; }
    public string? DesignationName { get; set; }
    public virtual HrmWeeklyRestDayMaster? Master { get; set; }
}
