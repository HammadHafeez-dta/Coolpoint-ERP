using System;
using System.Collections.Generic;

namespace SaftProject.Models;

public partial class TblUserRight
{
    public string UserId { get; set; } = null!;

    public string Site { get; set; } = null!;

    public string Name { get; set; } = null!;

    public string Year { get; set; } = null!;

    public string Software { get; set; } = null!;

    public bool? Enter { get; set; }

    public bool? Addition { get; set; }

    public bool? Delition { get; set; }

    public bool? Updation { get; set; }
}
