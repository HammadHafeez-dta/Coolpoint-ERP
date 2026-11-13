using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SaftHR.API.Interface.Transaction;
using SaftHR.API.Models.Machine;

namespace SaftHR.API.Services
{
    public class AttendanceService : IAttendanceService
    {
        private readonly MachineDbContext _context;
        private readonly ILogger<AttendanceService> _logger;

        public AttendanceService(MachineDbContext context, ILogger<AttendanceService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task ImportRawRecordsAsync(List<Checkinout> records)
        {
            if (records == null || records.Count == 0) return;

            try
            {
                await _context.Checkinouts.AddRangeAsync(records);
                await _context.SaveChangesAsync();
                _logger.LogInformation("[AttendanceService] Successfully saved {Count} records to the CHECKINOUT table.", records.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[AttendanceService] Error saving records to database: {Message}", ex.Message);
                if (ex.InnerException != null)
                {
                    _logger.LogError("[AttendanceService] Inner Exception: {Message}", ex.InnerException.Message);
                }
                throw;
            }
        }
    }
}
