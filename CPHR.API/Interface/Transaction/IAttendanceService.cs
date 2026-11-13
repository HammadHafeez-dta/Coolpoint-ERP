using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SaftHR.API.Models.Machine;

namespace SaftHR.API.Interface.Transaction
{
    public interface IAttendanceService
    {
        Task ImportRawRecordsAsync(List<Checkinout> records);
    }
}
