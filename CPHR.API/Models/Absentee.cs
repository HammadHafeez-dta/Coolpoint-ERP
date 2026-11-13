using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class Absentee
{
    public int? EmpCardNo { get; set; }

    public DateTime? AttendanceDate { get; set; }

    public long RecordNo { get; set; }
}
