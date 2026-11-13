using System;
using System.Collections.Generic;

namespace SaftProject.Models;

public partial class TblUser
{
    public int UserNo { get; set; }

    public string? UserId { get; set; }

    public string? Site { get; set; }

    public string? UserName { get; set; }

    public string? UserPassward { get; set; }

    public string? UserLevel { get; set; }

    public byte[]? UserPicture { get; set; }

    public bool? WebUser { get; set; }

    public int? TeacherId { get; set; }

    public string? TeacherName { get; set; }
}
