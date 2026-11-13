using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SaftHR.API.DTO.Transaction;
using SaftHR.API.Interface.Transaction;
using SaftHR.API.Models;
using SaftHR.API.Models.Machine;
using SaftHR.API.Utilities;

namespace SaftHR.API.DAL.Transaction
{
    public class AttendanceDAL : IAttendanceDAL
    {
        private readonly HRMSDbContext _db;
        private readonly MachineDbContext? _machineDb;
        private readonly IConfiguration? _config;
        private readonly ILogger<AttendanceDAL>? _logger;

        public AttendanceDAL(HRMSDbContext db, MachineDbContext? machineDb = null, IConfiguration? config = null, ILogger<AttendanceDAL>? logger = null)
        {
            _db = db;
            _machineDb = machineDb;
            _config = config;
            _logger = logger;
        }

        public async Task<int> SaveDailyAttendanceAsync(AttendanceDto dto, string site, string userId)
        {
            var temp = await _db.DailyAttendances
                .Where(u => u.EmpCardNo == dto.EmpCard && u.AttendanceDate == dto.AttendanceDate)
                .FirstOrDefaultAsync();

            if (temp == null)
            {
                temp = new DailyAttendance
                {
                    EmpCardNo = dto.EmpCard,
                    AttendanceDate = dto.AttendanceDate,
                    InDate = dto.TimeIn,
                    OutDate = dto.TimeOut,
                    TotalSeconds = dto.TotalSeconds,
                    TotalHours = dto.TotalHours,
                    TotalLate = dto.TotalLateMinutes,
                    Inoutno = string.IsNullOrEmpty(dto.InOutNo) ? null : int.Parse(dto.InOutNo),
                    LateArrival = dto.LateArrival,
                    EarlyGoing = dto.EarlyGoing,
                    HoursToWork = dto.WorkingHours,
                    Remarks = dto.Remarks,
                    Absent = dto.Absent,
                    Site = site,
                    Enterby = userId
                };
                _db.DailyAttendances.Add(temp);
            }
            else
            {
                temp.InDate = dto.TimeIn;
                temp.OutDate = dto.TimeOut;
                temp.TotalSeconds = dto.TotalSeconds;
                temp.TotalHours = dto.TotalHours;
                temp.TotalLate = dto.TotalLateMinutes;
                temp.Inoutno = string.IsNullOrEmpty(dto.InOutNo) ? null : int.Parse(dto.InOutNo);
                temp.LateArrival = dto.LateArrival;
                temp.EarlyGoing = dto.EarlyGoing;
                temp.HoursToWork = dto.WorkingHours;
                temp.Remarks = dto.Remarks;
                temp.Absent = dto.Absent;
            }

            await _db.SaveChangesAsync();
            return temp.EmpCardNo ?? 0;
        }

        public async Task<List<MachineAttendance>> GetEmployeeAttendanceMachineAsync(DateTime attendate, int empcard)
        {
            return await _db.MachineAttendances
                .Where(u => u.AttendanceDate.HasValue && u.AttendanceDate.Value.Month == attendate.Month && u.EmpCardNo == empcard)
                .OrderBy(o => o.AttendanceDate)
                .ToListAsync();
        }

        public async Task<List<VewDailyAttendance>> GetEmployeeAttendanceLateEarlyAsync(DateTime attendate)
        {
            return await _db.VewDailyAttendances
                .Where(u => u.AttendanceDate == attendate && 
                           (((u.LateArrival ?? 0) == 1 && (u.LateArrivalDeducted ?? false) == false) || 
                            ((u.EarlyGoing ?? 0) == 1 && (u.EarlyGoingDeducted ?? false) == false)))
                .OrderBy(o => o.EmpCardNo)
                .ToListAsync();
        }

        public async Task DeleteAbsenteesAsync()
        {
            await _db.Database.ExecuteSqlRawAsync("TRUNCATE TABLE Absentees");
        }

        public async Task<int> SaveAbsenteesAsync(AttendanceDto dto)
        {
            var temp = await _db.Absentees
                .Where(u => u.EmpCardNo == dto.EmpCard && u.AttendanceDate == dto.AttendanceDate)
                .FirstOrDefaultAsync();

            if (temp == null)
            {
                temp = new Absentee
                {
                    EmpCardNo = dto.EmpCard,
                    AttendanceDate = dto.AttendanceDate
                };
                _db.Absentees.Add(temp);
                await _db.SaveChangesAsync();
            }

            return temp.EmpCardNo ?? 0;
        }

        public async Task DeleteTimeCardAsync()
        {
            await _db.Database.ExecuteSqlRawAsync("TRUNCATE TABLE Time_Card");
        }

        public async Task<int> SaveTimeCardAsync(AttendanceDto dto)
        {
            var temp = await _db.TimeCards
                .Where(u => u.EmpCardNo == dto.EmpCard && u.AttendanceDate == dto.AttendanceDate)
                .FirstOrDefaultAsync();

            if (temp == null)
            {
                temp = new TimeCard
                {
                    EmpCardNo = dto.EmpCard,
                    EmpName = dto.EmpName,
                    DeptName = dto.DepartmentName,
                    DesgName = dto.DesignationName,
                    JoiningDate = dto.EmpJoiningDate,
                    Shift = dto.EmpShift,
                    InTime = dto.InTimeDefine?.ToString("yyyy-MM-dd HH:mm:ss"),
                    InDate = dto.TimeIn ?? dto.InTimeDefine,
                    OutDate = dto.TimeOut,
                    AttendanceDate = dto.AttendanceDate,
                    AttnedanceType = dto.AttendanceType,
                    LateArrival = dto.LateArrival,
                    EarlyGoing = dto.EarlyGoing,
                    Remarks = dto.Remarks,
                    Daycount = (int)dto.TotalDays
                };
                _db.TimeCards.Add(temp);
                await _db.SaveChangesAsync();
            }

            return temp.EmpCardNo;
        }

        public async Task<List<VewDailyAttendance>> GetEmployeeAttendanceListAsync(DateTime attndate, int empcard)
        {
            return await _db.VewDailyAttendances
                .Where(u => u.EmpCardNo == empcard && u.AttendanceDate == attndate)
                .OrderBy(o => o.AttendanceDate)
                .ToListAsync();
        }

        public async Task<AttendanceDto?> CheckEmployeeDailyAttendanceAsync(DateTime attendate, int empcard)
        {
            return await _db.DailyAttendances
                .Where(u => u.AttendanceDate == attendate && u.EmpCardNo == empcard)
                .OrderBy(u => u.AttendanceDate)
                .Select(temp => new AttendanceDto
                {
                    AttendanceDate = temp.AttendanceDate ?? DateTime.Now,
                    TimeIn = temp.InDate,
                    TimeOut = temp.OutDate,
                    LateArrival = temp.LateArrival ?? 0,
                    Absent = temp.Absent ?? false,
                    Remarks = temp.Remarks ?? "",
                    EarlyGoing = temp.EarlyGoing ?? 0
                })
                .FirstOrDefaultAsync();
        }

        public async Task<bool> DeleteAttendanceAsync(AttendanceDto dto)
        {
            var temp = await _db.MachineAttendances
                .Where(u => u.EmpCardNo == dto.EmpCard && u.AttendanceDate == dto.AttendanceDate)
                .FirstOrDefaultAsync();

            if (temp != null)
            {
                _db.MachineAttendances.Remove(temp);
                await _db.SaveChangesAsync();
                return true;
            }
            return false;
        }

        public async Task DeleteFromTempDailyAttenAllAsync()
        {
            await _db.Database.ExecuteSqlRawAsync("TRUNCATE TABLE Temp_DailyAttenAll");
        }

        public async Task DeleteFromMachineAttendanceAsync(int empCardNo, bool cardWise, DateTime fromDate, DateTime toDate, string site)
        {
            var siteEmployees = _db.Employees.Where(u => u.Site == site).Select(u => u.EmpCardNo);
            var query = _db.MachineAttendances.Where(u =>
                u.AttendanceDate >= fromDate && u.AttendanceDate <= toDate
                && u.AttendanceType == "Machine"
                && u.EmpCardNo.HasValue
                && siteEmployees.Contains(u.EmpCardNo.Value));
            if (cardWise)
                query = query.Where(u => u.EmpCardNo == empCardNo);
            await query.ExecuteDeleteAsync();
        }

        public async Task DeleteFromDailyAttendanceAsync(int empCardNo, bool cardWise, DateTime fromDate, DateTime toDate, string site)
        {
            if (cardWise)
            {
                await _db.Database.ExecuteSqlRawAsync("DELETE FROM Daily_Attendance WHERE Emp_CardNo={0} AND Attendance_Date BETWEEN {1} AND {2} AND Site={3}", empCardNo, fromDate, toDate, site);
            }
            else
            {
                await _db.Database.ExecuteSqlRawAsync("DELETE FROM Daily_Attendance WHERE Attendance_Date BETWEEN {0} AND {1} AND Site={2}", fromDate, toDate, site);
            }
        }

        public async Task DeleteFromAttendanceRegisterAsync(int empCardNo, bool cardWise, DateTime fromDate, DateTime toDate, string site)
        {
            if (cardWise)
            {
                await _db.Database.ExecuteSqlRawAsync("DELETE FROM Attendance_Register WHERE Emp_CardNo={0} AND Attendance_Date BETWEEN {1} AND {2} AND Site={3}", empCardNo, fromDate, toDate, site);
            }
            else
            {
                await _db.Database.ExecuteSqlRawAsync("DELETE FROM Attendance_Register WHERE Attendance_Date BETWEEN {0} AND {1} AND Site={2}", fromDate, toDate, site);
            }
        }

        public async Task<bool> CheckEmployeeINAsync(DateTime attendate, int empcardno)
        {
            var temp = await _db.MachineAttendances
                .Where(u => u.AttendanceDate == attendate && u.EmpCardNo == empcardno && u.InStatus == true)
                .Select(p => p.EmpCardNo)
                .FirstOrDefaultAsync();
            return temp != null;
        }

        public async Task<int> GetEmployeeWorkingHoursAsync(DateTime attendate, int empcardno)
        {
            return await _db.AttendanceRegisters
                .Where(u => u.AttendanceDate == attendate && u.EmpCardNo == empcardno)
                .SumAsync(p => p.TotalSeconds ?? 0);
        }

        public async Task<int> UpdateManualAttendanceINAsync(AttendanceDto dto)
        {
            var temp = await _db.MachineAttendances
                .Where(u => u.EmpCardNo == dto.EmpCard && u.AttendanceDate == dto.AttendanceDate)
                .FirstOrDefaultAsync();

            if (temp == null)
            {
                temp = new MachineAttendance
                {
                    EmpCardNo = dto.EmpCard,
                    AttendanceDate = dto.AttendanceDate,
                    InDate = dto.TimeIn,
                    InStatus = dto.Instatus,
                    Action = !string.IsNullOrWhiteSpace(dto.Action),
                    AttendanceType = dto.AttendanceType,
                    Remarks = dto.Remarks
                };
                _db.MachineAttendances.Add(temp);
            }
            else
            {
                temp.InDate = dto.TimeIn;
                temp.InStatus = dto.Instatus;
                temp.Action = !string.IsNullOrWhiteSpace(dto.Action);
                temp.AttendanceType = dto.AttendanceType;
                temp.Remarks = dto.Remarks;
            }

            await _db.SaveChangesAsync();
            return temp.EmpCardNo ?? 0;
        }

        public async Task<int> UpdateManualAttendanceOUTAsync(AttendanceDto dto)
        {
            var temp = await _db.MachineAttendances
                .Where(u => u.EmpCardNo == dto.EmpCard && u.AttendanceDate == dto.AttendanceDate)
                .FirstOrDefaultAsync();

            if (temp == null)
            {
                temp = new MachineAttendance
                {
                    EmpCardNo = dto.EmpCard,
                    AttendanceDate = dto.AttendanceDate,
                    OutDate = dto.TimeOut,
                    OutStatus = dto.outStatus,
                    Action = !string.IsNullOrWhiteSpace(dto.Action),
                    AttendanceType = dto.AttendanceType,
                    Remarks = dto.Remarks
                };
                _db.MachineAttendances.Add(temp);
            }
            else
            {
                temp.OutDate = dto.TimeOut;
                temp.OutStatus = dto.outStatus;
                temp.Action = !string.IsNullOrWhiteSpace(dto.Action);
                temp.AttendanceType = dto.AttendanceType;
                temp.Remarks = dto.Remarks;
            }

            await _db.SaveChangesAsync();
            return temp.EmpCardNo ?? 0;
        }

        public async Task UpdateLateEarlyReasonAsync(AttendanceDto dto)
        {
            var temp = await _db.MachineAttendances
                .Where(u => u.EmpCardNo == dto.EmpCard && u.AttendanceDate == dto.AttendanceDate)
                .FirstOrDefaultAsync();

            if (temp == null)
            {
                temp = new MachineAttendance
                {
                    EmpCardNo = dto.EmpCard,
                    AttendanceDate = dto.AttendanceDate,
                    LateEarlyReason = dto.Reason
                };
                _db.MachineAttendances.Add(temp);
            }
            else
            {
                temp.LateEarlyReason = dto.Reason;
            }

            await _db.SaveChangesAsync();
        }

        public async Task<List<DailyAttendance>> GetDailyInOutAsync(DateTime attendate)
        {
            return await _db.DailyAttendances
                .Where(u => u.AttendanceDate == attendate)
                .OrderBy(o => o.EmpCardNo)
                .ToListAsync();
        }

        public async Task<AttendanceDto?> GetDailyInOutAsync(DateTime attendate, int empcardno)
        {
            return await _db.DailyAttendances
                .Where(u => u.AttendanceDate == attendate && u.EmpCardNo == empcardno)
                .OrderBy(u => u.AttendanceDate)
                .Select(temp => new AttendanceDto
                {
                    AttendanceDate = temp.AttendanceDate ?? DateTime.Now,
                    TimeIn = temp.InDate,
                    TimeOut = temp.OutDate,
                    LateArrival = temp.LateArrival ?? 0,
                    EarlyGoing = temp.EarlyGoing ?? 0,
                    Absent = temp.Absent ?? false
                })
                .FirstOrDefaultAsync();
        }

        public async Task SaveAttendanceRegisterAsync(AttendanceDto dto, string site, string userId)
        {
            var temp = await _db.AttendanceRegisters
                .Where(u => u.EmpCardNo == dto.EmpCard && u.AttendanceDate == dto.AttendanceDate && u.Site == site)
                .FirstOrDefaultAsync();

            if (temp == null)
            {
                temp = new AttendanceRegister
                {
                    EmpCardNo = dto.EmpCard,
                    AttendanceDate = dto.AttendanceDate,
                    AttnedanceType = dto.AttendanceType,
                    LateArrival = dto.LateArrival,
                    EarlyGone = dto.EarlyGoing,
                    TotalSeconds = dto.TotalSeconds,
                    TotalHours = dto.TotalHours,
                    TotalLate = dto.TotalLateMinutes,
                    TotalDays = dto.TotalDays,
                    Site = site,
                    EnterBy = userId
                };
                _db.AttendanceRegisters.Add(temp);
            }
            else
            {
                temp.AttnedanceType = dto.AttendanceType;
                temp.LateArrival = dto.LateArrival;
                temp.EarlyGone = dto.EarlyGoing;
                temp.TotalSeconds = dto.TotalSeconds;
                temp.TotalHours = dto.TotalHours;
                temp.TotalLate = dto.TotalLateMinutes;
                temp.TotalDays = dto.TotalDays;
                temp.EnterBy = userId;
            }

            await _db.SaveChangesAsync();
        }

        public async Task UpdateAttendanceRegisterAsync(AttendanceDto dto, string site, string userId)
        {
            var temp = await _db.AttendanceRegisters
                .Where(u => u.EmpCardNo == dto.EmpCard && u.AttendanceDate == dto.AttendanceDate && u.Site == site)
                .FirstOrDefaultAsync();

            if (temp == null)
            {
                temp = new AttendanceRegister
                {
                    EmpCardNo = dto.EmpCard,
                    AttendanceDate = dto.AttendanceDate,
                    AttnedanceType = dto.AttendanceType,
                    TotalDays = dto.TotalDays,
                    Site = site,
                    EnterBy = userId
                };
                _db.AttendanceRegisters.Add(temp);
            }
            else
            {
                temp.AttnedanceType = dto.AttendanceType;
                temp.TotalDays = dto.TotalDays;
                temp.EnterBy = userId;
            }

            await _db.SaveChangesAsync();
        }

        public async Task<List<AttendanceRegister>> GetEmployeeAttendanceAsync(DateTime fromDate, DateTime toDate, int empcard, string site)
        {
            return await _db.AttendanceRegisters
                .Where(u => u.EmpCardNo == empcard && u.AttendanceDate >= fromDate.Date && u.AttendanceDate <= toDate.Date && u.Site == site)
                .OrderBy(o => o.AttendanceDate)
                .ToListAsync();
        }

        public async Task<bool> UpdateMachineAttendanceAsync(DateTime fromDate, DateTime toDate, int? empCardNo, bool cardWise, string site)
        {
            try
            {
                fromDate = fromDate.Date;
                toDate = toDate.Date;

                // 1. Delete existing records for the period
                await DeleteFromMachineAttendanceAsync(empCardNo ?? 0, cardWise, fromDate, toDate, site);
                await DeleteFromDailyAttendanceAsync(empCardNo ?? 0, cardWise, fromDate, toDate, site);
                await DeleteFromAttendanceRegisterAsync(empCardNo ?? 0, cardWise, fromDate, toDate, site);

                // 2. Fetch raw data from StAnthony_Machine database
                string? machineConnStr = _config?.GetConnectionString("MachineConnection");
                if (string.IsNullOrWhiteSpace(machineConnStr) && _machineDb != null)
                {
                    machineConnStr = _machineDb.Database.GetDbConnection().ConnectionString;
                }
                if (string.IsNullOrWhiteSpace(machineConnStr))
                {
                    var connectionString = _db.Database.GetDbConnection().ConnectionString;
                    var builder = new Microsoft.Data.SqlClient.SqlConnectionStringBuilder(connectionString);
                    builder.InitialCatalog = "StAnthony_Machine";
                    machineConnStr = builder.ConnectionString;
                }

                var machineLogs = new List<MCH_vew_Attendance>();
                try
                {
                    using (var conn = new Microsoft.Data.SqlClient.SqlConnection(machineConnStr))
                    {
                        await conn.OpenAsync();
                        // Join with USERINFO to obtain BADGENUMBER (the employee's card number)
                        var sql = @"
                            SELECT 
                                ISNULL(u.BADGENUMBER, CAST(c.USERID AS VARCHAR(24))) AS BADGENUMBER,
                                c.CHECKTIME, 
                                ISNULL(c.SENSORID, '') AS SENSORID, 
                                ISNULL(c.VERIFYCODE, 0) AS VERIFYCODE, 
                                ISNULL(c.CHECKTYPE, 'I') AS CHECKTYPE 
                            FROM CHECKINOUT c
                            LEFT JOIN USERINFO u ON c.USERID = u.USERID
                            WHERE CONVERT(date, c.CHECKTIME) BETWEEN @from AND @to";

                        if (cardWise && empCardNo.HasValue)
                        {
                            sql += " AND (u.BADGENUMBER = @cardStr OR c.USERID = @cardNo)";
                        }
                        sql += " ORDER BY c.CHECKTIME ASC";

                        using (var cmd = new Microsoft.Data.SqlClient.SqlCommand(sql, conn))
                        {
                            cmd.Parameters.AddWithValue("@from", fromDate.ToString("yyyy-MM-dd"));
                            cmd.Parameters.AddWithValue("@to", toDate.ToString("yyyy-MM-dd"));
                            if (cardWise && empCardNo.HasValue)
                            {
                                cmd.Parameters.AddWithValue("@cardNo", empCardNo.Value);
                                cmd.Parameters.AddWithValue("@cardStr", empCardNo.Value.ToString());
                            }

                            using (var reader = await cmd.ExecuteReaderAsync())
                            {
                                while (await reader.ReadAsync())
                                {
                                    var badgeStr = reader.IsDBNull(0) ? "" : reader.GetValue(0).ToString() ?? "";
                                    var checkTime = reader.GetDateTime(1);
                                    var sensorStr = reader.IsDBNull(2) ? "" : reader.GetValue(2).ToString() ?? "";
                                    int verifyCode = 0;
                                    if (!reader.IsDBNull(3))
                                    {
                                        int.TryParse(reader.GetValue(3).ToString(), out verifyCode);
                                    }
                                    var checkTypeStr = reader.IsDBNull(4) ? "" : reader.GetValue(4).ToString() ?? "";

                                    machineLogs.Add(new MCH_vew_Attendance
                                    {
                                        BADGENUMBER = badgeStr,
                                        NAME = "",
                                        CHECKTIME = checkTime,
                                        SENSORID = sensorStr,
                                        VERIFYCODE = verifyCode,
                                        CHECKTYPE = checkTypeStr
                                    });
                                }
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger?.LogError(ex, "Failed to query machine database at connection {ConnStr}", machineConnStr);
                    System.Diagnostics.Debug.WriteLine($"Failed to query machine database: {ex.Message}");
                }

                // 3. Pre-fetch all necessary lookup datasets in bulk into memory
                var employeesList = await _db.Employees
                    .Where(u => (u.Status ?? false) == true && u.Site == site)
                    .ToListAsync();

                if (cardWise && empCardNo.HasValue)
                {
                    employeesList = employeesList.Where(u => u.EmpCardNo == empCardNo.Value).ToList();
                }

                var empCardNos = employeesList.Select(e => e.EmpCardNo).ToList();

                var gazettedLeaveDates = (await _db.GazettedLeaves
                    .Where(u => u.LeaveDate.HasValue && u.LeaveDate.Value >= fromDate && u.LeaveDate.Value <= toDate && u.Site == site)
                    .Select(u => u.LeaveDate!.Value.Date)
                    .ToListAsync())
                    .ToHashSet();

                var inTimesSpecs = await _db.HrmInTimes
                    .Where(u => u.EmpCardNo.HasValue && empCardNos.Contains(u.EmpCardNo.Value) && u.AttendanceDate >= fromDate && u.AttendanceDate <= toDate && u.Site == site)
                    .ToListAsync();

                var leavesSpecs = await _db.HrmVewLeaves
                    .Where(u => u.FromDate <= toDate && u.ToDate >= fromDate && u.EmpCardNo.HasValue && empCardNos.Contains(u.EmpCardNo.Value) && u.Site == site)
                    .ToListAsync();

                // 1. Fetch Rest Day records (Priority 1 for Rest Day)
                var restDayRecords = await _db.HrmRestDayChildren
                    .AsNoTracking()
                    .Where(r => r.Site == site && empCardNos.Contains(r.EmpCardNo) && r.RestDate >= fromDate && r.RestDate <= toDate)
                    .ToListAsync();

                var restDayLookup = restDayRecords
                    .Select(r => (r.EmpCardNo, r.RestDate.Date))
                    .ToHashSet();

                // 2. Fetch Duty Timing records (Priority 2 for In/Out timing rules when not a Rest Day)
                var dutyTimingRecords = await _db.HrmDutyTimingChildren
                    .AsNoTracking()
                    .Include(d => d.Master)
                    .Where(d => d.Site == site && empCardNos.Contains(d.EmpCardNo) && d.FromDate <= toDate && d.ToDate >= fromDate)
                    .ToListAsync();

                var machineAttDict = new Dictionary<(int empCardNo, DateTime date), MachineAttendance>();

                foreach (var log in machineLogs)
                {
                    if (!int.TryParse(log.BADGENUMBER, out int cardNo)) continue;
                    var emp = employeesList.FirstOrDefault(e => e.EmpCardNo == cardNo);
                    if (emp == null) continue;

                    DateTime checkTime = log.CHECKTIME;
                    DateTime attendanceDate = checkTime.Date;

                    // Priority 1: Check Rest Day (HrmRestDayChild -> Employee Master RestDay -> Designation default)
                    bool hasExplicitRestDays = RestDaySchedule.IsExplicitSchedule(emp.RestDay);
                    bool isRestDay = restDayLookup.Contains((emp.EmpCardNo, attendanceDate)) ||
                                     (hasExplicitRestDays
                                         ? RestDaySchedule.Includes(emp.RestDay, attendanceDate.DayOfWeek)
                                         : RestDaySchedule.Includes(emp.RestDay, attendanceDate.DayOfWeek) ||
                                           emp.DesgCode == 1 && attendanceDate.DayOfWeek == DayOfWeek.Saturday);

                    // Priority 2: Check Duty Timing (HrmDutyTimingChild -> HrmInTimes -> Employee Master InTime/OutTime)
                    string inTimeDefine = emp.InTime ?? "00:00";
                    string outTimeDefine = emp.OutTime ?? "00:00";

                    var dutyTiming = dutyTimingRecords
                        .Where(d => d.EmpCardNo == emp.EmpCardNo && attendanceDate >= d.FromDate.Date && attendanceDate <= d.ToDate.Date)
                        // A later save may intentionally override an older timing, even
                        // when it edits a lower transaction number. Fall back to TransNo
                        // for legacy rows without audit timestamps and same-minute ties.
                        .OrderByDescending(d => d.Master?.EditTime ?? d.Master?.EnteryTime ?? DateTime.MinValue)
                        .ThenByDescending(d => d.TransNo)
                        .FirstOrDefault();

                    if (dutyTiming != null)
                    {
                        if (!string.IsNullOrWhiteSpace(dutyTiming.FromTime))
                            inTimeDefine = dutyTiming.FromTime;
                        if (!string.IsNullOrWhiteSpace(dutyTiming.ToTime))
                            outTimeDefine = dutyTiming.ToTime;
                    }
                    else
                    {
                        var inTimeSpec = inTimesSpecs
                            .Where(u => u.EmpCardNo == emp.EmpCardNo && u.AttendanceDate == attendanceDate && u.AttendanceType == "IN")
                            .OrderBy(o => o.SerialNo)
                            .FirstOrDefault();
                        if (inTimeSpec != null && inTimeSpec.InTime.HasValue)
                        {
                            inTimeDefine = inTimeSpec.InTime.Value.ToString(@"hh\:mm");
                        }

                        var outTimeSpec = inTimesSpecs
                            .Where(u => u.EmpCardNo == emp.EmpCardNo && u.AttendanceDate == attendanceDate && u.AttendanceType == "OUT")
                            .OrderBy(o => o.SerialNo)
                            .FirstOrDefault();
                        if (outTimeSpec != null && outTimeSpec.InTime.HasValue)
                        {
                            outTimeDefine = outTimeSpec.InTime.Value.ToString(@"hh\:mm");
                        }
                    }

                    var definedInTime = ParseTimeOfDay(inTimeDefine, cardNo, "InTime");
                    var definedOutTime = ParseTimeOfDay(outTimeDefine, cardNo, "OutTime");

                    var ts_relaxation = new TimeSpan(0, 1, 0);
                    if ((emp.DeptCode == 3 || emp.DeptCode == 6) && attendanceDate.DayOfWeek == DayOfWeek.Saturday)
                    {
                        ts_relaxation = new TimeSpan(0, 35, 0);
                    }

                    bool hasLeave = leavesSpecs.Any(u => attendanceDate >= u.FromDate && attendanceDate <= u.ToDate && u.EmpCardNo == emp.EmpCardNo);
                    bool isGazetted = gazettedLeaveDates.Contains(attendanceDate);

                    var key = (cardNo, attendanceDate);
                    if (!machineAttDict.TryGetValue(key, out var tempAtt))
                    {
                        int lateArrival = 0;
                        decimal lateMinutes = 0;

                        if (!hasLeave && !isGazetted && !isRestDay)
                        {
                            if (checkTime.TimeOfDay > definedInTime.Add(ts_relaxation))
                            {
                                lateArrival = 1;
                                var ts_late = checkTime.TimeOfDay - definedInTime;
                                lateMinutes = (decimal)ts_late.TotalMinutes;
                            }
                        }

                        tempAtt = new MachineAttendance
                        {
                            EmpCardNo = cardNo,
                            AttendanceDate = attendanceDate,
                            InDate = checkTime,
                            InStatus = true,
                            Action = false,
                            AttendanceType = "Machine",
                            LateArrival = lateArrival,
                            LateMinutes = lateMinutes,
                            EarlyMinutes = 0
                        };
                        machineAttDict[key] = tempAtt;
                        _db.MachineAttendances.Add(tempAtt);
                    }
                    else
                    {
                        int earlyGoing = 0;
                        decimal earlyMinutes = 0;

                        if (!isGazetted && !isRestDay)
                        {
                            if (definedOutTime > checkTime.TimeOfDay)
                            {
                                earlyGoing = 1;
                                var ts_early = definedOutTime - checkTime.TimeOfDay;
                                earlyMinutes = (decimal)ts_early.TotalMinutes;
                            }
                        }

                        tempAtt.OutDate = checkTime;
                        tempAtt.OutStatus = true;
                        tempAtt.Action = true;
                        tempAtt.EarlyGoing = earlyGoing;
                        tempAtt.EarlyMinutes = earlyMinutes;
                    }
                }

                // Batch save all machine attendances once
                await _db.SaveChangesAsync();

                // 4. Update Daily_Attendance
                var updatedMachineAtt = machineAttDict.Values.ToList();
                var dailyAttDict = new Dictionary<(int empCardNo, DateTime date), DailyAttendance>();

                foreach (var att in updatedMachineAtt)
                {
                    var emp = employeesList.FirstOrDefault(e => e.EmpCardNo == att.EmpCardNo);
                    if (emp == null || !att.EmpCardNo.HasValue || !att.AttendanceDate.HasValue) continue;

                    var (totalHours, totalSeconds) = WorkHoursCalculator.Calculate(att.InDate, att.OutDate);

                    var dailyAtt = new DailyAttendance
                    {
                        EmpCardNo = att.EmpCardNo,
                        AttendanceDate = att.AttendanceDate,
                        InDate = att.InDate,
                        OutDate = att.OutDate,
                        TotalSeconds = totalSeconds,
                        TotalHours = totalHours,
                        TotalLate = (att.LateMinutes ?? 0) + (att.EarlyMinutes ?? 0),
                        LateArrival = att.LateArrival,
                        EarlyGoing = att.EarlyGoing,
                        HoursToWork = emp.WorkingHours,
                        Remarks = att.Remarks,
                        Absent = att.Absent ?? false,
                        Site = site,
                        Enterby = "System"
                    };
                    dailyAttDict[(att.EmpCardNo.Value, att.AttendanceDate.Value)] = dailyAtt;
                    _db.DailyAttendances.Add(dailyAtt);
                }
                await _db.SaveChangesAsync();

                // 5. Build AttendanceRegister
                var daysDiff = (toDate - fromDate).Days + 1;
                var nowPkt = EveningShiftPolicy.GetNowPakistan();
                foreach (var emp in employeesList)
                {
                    for (int i = 0; i < daysDiff; i++)
                    {
                        var currentDate = fromDate.AddDays(i);
                        dailyAttDict.TryGetValue((emp.EmpCardNo, currentDate), out var dailyAtt);

                        var attRegister = new AttendanceRegister
                        {
                            EmpCardNo = emp.EmpCardNo,
                            AttendanceDate = currentDate,
                            TotalSeconds = 0,
                            TotalHours = 0,
                            TotalLate = 0,
                            Site = site,
                            EnterBy = "System"
                        };

                        // Priority 1: Check Rest Day (HrmRestDayChild -> Employee Master RestDay -> Designation default)
                        bool hasExplicitRestDays = RestDaySchedule.IsExplicitSchedule(emp.RestDay);
                        bool isRestDay = restDayLookup.Contains((emp.EmpCardNo, currentDate)) ||
                                         (hasExplicitRestDays
                                             ? RestDaySchedule.Includes(emp.RestDay, currentDate.DayOfWeek)
                                             : RestDaySchedule.Includes(emp.RestDay, currentDate.DayOfWeek) ||
                                               emp.DesgCode == 1 && currentDate.DayOfWeek == DayOfWeek.Saturday);
                        var isGazetted = gazettedLeaveDates.Contains(currentDate);
                        var leaveRecord = leavesSpecs
                            .Where(u => currentDate >= u.FromDate && currentDate <= u.ToDate && u.EmpCardNo == emp.EmpCardNo)
                            .OrderByDescending(u => u.EmpCardNo)
                            .FirstOrDefault();

                        bool employedOnDate = emp.JoiningDate.HasValue && emp.JoiningDate.Value.Date < currentDate
                            && (!emp.StuckOffDate.HasValue || emp.StuckOffDate.Value.Date > currentDate);
                        if (dailyAtt != null)
                        {
                            attRegister.LateArrival = dailyAtt.LateArrival;
                            attRegister.EarlyGone = dailyAtt.EarlyGoing;
                            attRegister.TotalLate = dailyAtt.TotalLate;

                            var (totalHours, totalSeconds) = WorkHoursCalculator.Calculate(dailyAtt.InDate, dailyAtt.OutDate);
                            bool hasInPunch = dailyAtt.InDate.HasValue && dailyAtt.InDate.Value.Year > 1900;
                            bool hasOutPunch = dailyAtt.OutDate.HasValue && dailyAtt.OutDate.Value.Year > 1900;
                            if (hasInPunch && !hasOutPunch)
                            {
                                attRegister.AttnedanceType = "CNO";
                                attRegister.TotalDays = 1;
                                attRegister.TotalSeconds = 0;
                                attRegister.TotalHours = 0;
                            }
                            else
                            {
                                if (isRestDay && employedOnDate)
                                {
                                    attRegister.AttnedanceType = "RP";
                                    attRegister.TotalDays = 1;
                                }
                                else if (isGazetted && employedOnDate)
                                {
                                    attRegister.AttnedanceType = "GL";
                                    attRegister.TotalDays = 1;
                                }

                                if (totalSeconds > 12600)
                                {
                                    attRegister.AttnedanceType = "P";
                                    attRegister.TotalDays = 1;
                                    attRegister.TotalSeconds = totalSeconds;
                                    attRegister.TotalHours = totalHours;
                                }
                                else
                                {
                                    attRegister.AttnedanceType = "A";
                                    attRegister.TotalDays = 0;
                                    attRegister.TotalSeconds = 0;
                                    attRegister.TotalHours = 0;
                                }
                            }
                        }
                        else if (isRestDay && employedOnDate)
                        {
                            attRegister.AttnedanceType = "R";
                            attRegister.TotalDays = 1;
                        }
                        else if (leaveRecord != null)
                        {
                            attRegister.AttnedanceType = leaveRecord.LeaveType ?? "";
                            attRegister.TotalDays = 1;
                        }
                        else if (isGazetted && employedOnDate)
                        {
                            attRegister.AttnedanceType = "GL";
                            attRegister.TotalDays = 1;
                        }
                        else
                        {
                            attRegister.AttnedanceType = "A";
                            attRegister.TotalDays = 0;
                            attRegister.TotalSeconds = 0;
                            attRegister.TotalHours = 0;
                        }

                        if (dailyAtt != null && dailyAtt.Absent == true)
                        {
                            attRegister.AttnedanceType = "A";
                            attRegister.TotalDays = 0;
                            attRegister.TotalSeconds = 0;
                            attRegister.TotalHours = 0;
                        }

                        // Evening shift employees before 3:00 PM on today with no real punch are not written as absent
                        var hasRealPunch = dailyAtt != null && (dailyAtt.InDate.HasValue || dailyAtt.OutDate.HasValue);
                        if (!hasRealPunch
                            && attRegister.AttnedanceType == "A"
                            && EveningShiftPolicy.IsEveningShift(emp.Shift)
                            && EveningShiftPolicy.ShouldHideUnpunchedEvening(currentDate, nowPkt))
                        {
                            continue;
                        }

                        _db.AttendanceRegisters.Add(attRegister);
                    }
                }
                await _db.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "UpdateMachineAttendanceAsync failed for site={Site}, fromDate={From}, toDate={To}, empCardNo={CardNo}, cardWise={CardWise}", site, fromDate, toDate, empCardNo, cardWise);
                System.Diagnostics.Debug.WriteLine($"UpdateMachineAttendanceAsync error: {ex}");
                return false;
            }
        }

        public async Task<List<VewDailyAttendance>> GetDailyAttendanceReportAsync(DateTime date, string? search, string site)
        {
            /* Previous implementation (commented out for easy revert):
            var employeeIdsInSite = _db.Employees.Where(e => e.Site == site && e.Status == true).Select(e => e.EmpCardNo);
            var query = _db.VewDailyAttendances.Where(u => u.AttendanceDate == date.Date && employeeIdsInSite.Contains(u.EmpCardNo));

            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.ToLower();
                query = query.Where(u => (u.EmpName != null && u.EmpName.ToLower().Contains(search)) ||
                                        (u.DepartmentName != null && u.DepartmentName.ToLower().Contains(search)) ||
                                        (u.DesignationName != null && u.DesignationName.ToLower().Contains(search)) ||
                                        u.EmpCardNo.ToString().Contains(search));
            }

            return await query.OrderBy(o => o.EmpCardNo).ToListAsync();
            */

            // New Implementation: Include all active employees; employees without a punch for today are marked as Absent
            var activeEmployees = await _db.VewEmployees
                .Where(e => e.Site == site && e.Status == true)
                .Select(e => new { e.EmpCardNo, e.EmpName, e.DepartmentName, e.DesignationName, e.Shift })
                .ToListAsync();

            var activeEmpCardNos = activeEmployees.Select(e => e.EmpCardNo).ToList();

            var existingLogs = await _db.VewDailyAttendances
                .Where(u => u.AttendanceDate == date.Date && activeEmpCardNos.Contains(u.EmpCardNo))
                .ToListAsync();

            foreach (var log in existingLogs)
            {
                if (log.InDate.HasValue && log.InDate.Value.Year <= 1900)
                {
                    log.InDate = null;
                    log.InTime = null;
                }
                if (log.OutDate.HasValue && log.OutDate.Value.Year <= 1900)
                {
                    log.OutDate = null;
                    log.OutTime = null;
                }
            }

            var loggedEmpCardNos = existingLogs.Select(l => l.EmpCardNo).ToHashSet();

            var combinedList = new List<VewDailyAttendance>(existingLogs);

            var nowPkt = EveningShiftPolicy.GetNowPakistan();
            bool hideUnpunchedEvening = EveningShiftPolicy.ShouldHideUnpunchedEvening(date, nowPkt);

            foreach (var emp in activeEmployees)
            {
                if (!loggedEmpCardNos.Contains(emp.EmpCardNo))
                {
                    if (hideUnpunchedEvening && EveningShiftPolicy.IsEveningShift(emp.Shift))
                    {
                        continue;
                    }

                    combinedList.Add(new VewDailyAttendance
                    {
                        EmpCardNo = emp.EmpCardNo,
                        EmpName = emp.EmpName,
                        DepartmentName = emp.DepartmentName,
                        DesignationName = emp.DesignationName,
                        Shift = emp.Shift,
                        AttendanceDate = date.Date,
                        Absent = true,
                        InDate = null,
                        OutDate = null,
                        InTime = null,
                        OutTime = null,
                        Remarks = "Absent (No Log)"
                    });
                }
            }

            IEnumerable<VewDailyAttendance> resultQuery = combinedList;

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.ToLower();
                resultQuery = resultQuery.Where(u => (u.EmpName != null && u.EmpName.ToLower().Contains(s)) ||
                                                    (u.DepartmentName != null && u.DepartmentName.ToLower().Contains(s)) ||
                                                    (u.DesignationName != null && u.DesignationName.ToLower().Contains(s)) ||
                                                    u.EmpCardNo.ToString().Contains(s));
            }

            return resultQuery.OrderBy(o => string.IsNullOrWhiteSpace(o.DepartmentName) ? "ZZZZ" : o.DepartmentName).ThenBy(o => o.EmpCardNo).ToList();
        }

        public async Task<List<VewAttendanceRegister>> GetAttendanceHistoryReportAsync(DateTime fromDate, DateTime toDate, string? search, string site)
        {
            var query = _db.VewAttendanceRegisters.Where(u => u.AttendanceDate >= fromDate.Date && u.AttendanceDate <= toDate.Date && u.Site == site);

            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.ToLower();
                query = query.Where(u => (u.EmpName != null && u.EmpName.ToLower().Contains(search)) ||
                                        (u.DepartmentName != null && u.DepartmentName.ToLower().Contains(search)) ||
                                        (u.DesignationName != null && u.DesignationName.ToLower().Contains(search)) ||
                                        (u.EmpCardNo != null &&                                         u.EmpCardNo.Value.ToString().Contains(search)));
            }

            var list = await query.OrderBy(o => o.AttendanceDate).ThenBy(o => o.EmpCardNo).ToListAsync();
            foreach (var item in list)
            {
                item.TotalHours = WorkHoursCalculator.SanitizeHours(item.TotalHours);
                item.TotalSeconds = WorkHoursCalculator.SanitizeSeconds(item.TotalSeconds);
            }

            return list;
        }

        private TimeSpan ParseTimeOfDay(string? timeStr, int cardNo, string fieldName)
        {
            if (string.IsNullOrWhiteSpace(timeStr))
                return TimeSpan.Zero;

            var trimmed = timeStr.Trim();

            // Try standard TimeSpan (e.g., "07:40", "07:40:00", "7:40")
            if (TimeSpan.TryParse(trimmed, out var ts))
            {
                return ts;
            }

            // Try DateTime parsing for 12-hour AM/PM formats (e.g. "07:40 AM", "7:40 PM", "07:40 am")
            string[] formats = {
                "h:mm tt", "hh:mm tt", "h:mm:ss tt", "hh:mm:ss tt",
                "h:mmtt", "hh:mmtt", "H:mm", "HH:mm", "H:mm:ss", "HH:mm:ss"
            };

            if (DateTime.TryParseExact(trimmed, formats, System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out var dt))
            {
                return dt.TimeOfDay;
            }

            if (DateTime.TryParse(trimmed, System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out var generalDt))
            {
                return generalDt.TimeOfDay;
            }

            _logger?.LogWarning("Employee {CardNo}: could not parse {FieldName} '{TimeStr}', defaulting to 00:00", cardNo, fieldName, timeStr);
            return TimeSpan.Zero;
        }

        private class MCH_vew_Attendance
        {
            public string BADGENUMBER { get; set; } = "";
            public string NAME { get; set; } = "";
            public DateTime CHECKTIME { get; set; }
            public string SENSORID { get; set; } = "";
            public int VERIFYCODE { get; set; }
            public string CHECKTYPE { get; set; } = "";
        }
    }
}
