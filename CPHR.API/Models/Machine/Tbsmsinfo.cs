using System;
using System.Collections.Generic;

namespace SaftHR.API.Models.Machine;

public partial class Tbsmsinfo
{
    public int Reference { get; set; }

    public string Smsid { get; set; } = null!;

    public int Smsindex { get; set; }

    public int? Smstype { get; set; }

    public string? Smscontent { get; set; }

    public string? Smsstarttm { get; set; }

    public int? Smstmleng { get; set; }

    public string? Gentm { get; set; }
}
