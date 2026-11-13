using System;
using System.Collections.Generic;

namespace SaftProject.Models;

public partial class TblFormName
{
    public int Id { get; set; }

    public string Software { get; set; } = null!;

    public string? RightsName { get; set; }

    public string? MainName { get; set; }
}
