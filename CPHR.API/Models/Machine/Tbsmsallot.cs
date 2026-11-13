using System;
using System.Collections.Generic;

namespace SaftHR.API.Models.Machine;

public partial class Tbsmsallot
{
    public int Reference { get; set; }

    public int Smsref { get; set; }

    public int Userref { get; set; }

    public string? Gentm { get; set; }
}
