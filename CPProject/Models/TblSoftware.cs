using System;
using System.Collections.Generic;

namespace SaftProject.Models;

public partial class TblSoftware
{
    public int SoftwareNo { get; set; }

    public string Site { get; set; } = null!;

    public string? SoftwareName { get; set; }
}
