using System;
using System.Collections.Generic;

namespace SaftProject.Models;

public partial class TblUserType
{
    public int UserNo { get; set; }

    public string? Site { get; set; }

    public string? UserLevel { get; set; }

    public string? UserType { get; set; }
}
