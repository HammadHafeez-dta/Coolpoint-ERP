using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class Bank
{
    public int BankCode { get; set; }

    public string? BankName { get; set; }

    public string? EnterBy { get; set; }
}
