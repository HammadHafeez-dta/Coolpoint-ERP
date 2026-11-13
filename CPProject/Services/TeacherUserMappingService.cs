using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SaftFMS.API.Interface.Transaction;
using SaftFMS.API.Models.FMS;
using SaftHR.API.Models;
using SaftProject.Models;

namespace SaftProject.Services
{
    public class TeacherUserMappingService : ITeacherUserMappingService
    {
        private readonly CommonDbContext _commonDb;
        private readonly FMSDbContext _fmsDb;
        private readonly HRMSDbContext _hrmsDb;
        private readonly ILogger<TeacherUserMappingService> _logger;

        public TeacherUserMappingService(
            CommonDbContext commonDb,
            FMSDbContext fmsDb,
            HRMSDbContext hrmsDb,
            ILogger<TeacherUserMappingService> logger)
        {
            _commonDb = commonDb;
            _fmsDb = fmsDb;
            _hrmsDb = hrmsDb;
            _logger = logger;
        }

        public async Task<int?> GetTeacherIdForUserAsync(int userNo, CancellationToken cancellationToken = default)
        {
            try
            {
                if (userNo <= 0) return null;

                var user = await _commonDb.TblUsers
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u => u.UserNo == userNo, cancellationToken);

                if (user?.TeacherId is not int teacherId) return null;

                // Check if the mapped teacher exists and is active in FMS or HRMS
                var teacher = await _fmsDb.SchTeachers
                    .AsNoTracking()
                    .FirstOrDefaultAsync(t => t.TeacherId == teacherId && (t.Status ?? false) == true, cancellationToken);

                if (teacher != null) return teacherId;

                var hrmsTeacher = await _hrmsDb.VewEmployees
                    .AsNoTracking()
                    .FirstOrDefaultAsync(e => e.EmpCardNo == teacherId
                        && (e.Status ?? false) == true
                        && (e.StuckOff ?? false) == false
                        && e.Category != null && e.Category.Contains("Teach") && !e.Category.Contains("Non"), cancellationToken);

                return hrmsTeacher != null ? teacherId : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking teacher mapping for UserNo {UserNo}. Returning null safely.", userNo);
                return null;
            }
        }

        public async Task<string?> GetTeacherNameForUserAsync(int userNo, CancellationToken cancellationToken = default)
        {
            try
            {
                if (userNo <= 0) return null;

                var user = await _commonDb.TblUsers
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u => u.UserNo == userNo, cancellationToken);

                if (user?.TeacherId is not int teacherId) return null;

                var teacher = await _fmsDb.SchTeachers
                    .AsNoTracking()
                    .FirstOrDefaultAsync(t => t.TeacherId == teacherId && (t.Status ?? false) == true, cancellationToken);

                if (teacher != null) return teacher.TeacherName?.Trim();

                var hrmsTeacher = await _hrmsDb.VewEmployees
                    .AsNoTracking()
                    .FirstOrDefaultAsync(e => e.EmpCardNo == teacherId
                        && (e.Status ?? false) == true
                        && (e.StuckOff ?? false) == false
                        && e.Category != null && e.Category.Contains("Teach") && !e.Category.Contains("Non"), cancellationToken);

                return hrmsTeacher?.EmpName?.Trim() ?? user.TeacherName?.Trim();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting teacher name for UserNo {UserNo}. Returning null safely.", userNo);
                return null;
            }
        }

        public async Task<List<int>> GetLinkedTeacherIdsAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                return await _commonDb.TblUsers
                    .AsNoTracking()
                    .Where(user => user.TeacherId.HasValue)
                    .Select(user => user.TeacherId!.Value)
                    .Distinct()
                    .ToListAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting linked teacher IDs. Returning empty list safely.");
                return new List<int>();
            }
        }
    }
}
