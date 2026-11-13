using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class HrmVewEveningSalary
{
    public int TransNo { get; set; }

    public string Site { get; set; } = null!;

    public DateTime? TransMonth { get; set; }

    public string? EnterBy { get; set; }

    public DateTime? EnteryTime { get; set; }

    public string? EditBy { get; set; }

    public DateTime? EditTime { get; set; }

    public int? EmpCardNo { get; set; }

    public string? Subject { get; set; }

    public decimal? SalaryPerLecture { get; set; }

    public int? TotalLectures { get; set; }

    public decimal? Salary { get; set; }

    public int RecNo { get; set; }

    public string? EmpName { get; set; }

    public string? EmpFatherName { get; set; }

    public int? DeptCode { get; set; }

    public string? DepartmentName { get; set; }

    public int? DesgCode { get; set; }

    public DateTime? BirthDate { get; set; }

    public DateTime? JoiningDate { get; set; }

    public string? DesignationName { get; set; }
}
