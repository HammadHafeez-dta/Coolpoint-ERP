using System;
using System.Collections.Generic;

namespace SaftProject.Models;

public partial class TblSite
{
    public string Site { get; set; } = null!;

    public string? Name { get; set; }

    public string? Address { get; set; }

    public string? Phone { get; set; }

    public string? Fax { get; set; }

    public string? SalesTaxNo { get; set; }

    public string? Ntn { get; set; }

    public byte[]? Logo { get; set; }

    public string? Email { get; set; }
}
