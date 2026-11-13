using System;

namespace SaftHR.API.Utilities
{
    public static class EveningShiftPolicy
    {
        public static readonly TimeSpan CutoffTime = new TimeSpan(15, 0, 0);

        private static readonly TimeZoneInfo PakistanTimeZone = ResolvePakistanTimeZone();

        private static TimeZoneInfo ResolvePakistanTimeZone()
        {
            try
            {
                return TimeZoneInfo.FindSystemTimeZoneById("Pakistan Standard Time");
            }
            catch (TimeZoneNotFoundException)
            {
                try
                {
                    return TimeZoneInfo.FindSystemTimeZoneById("Asia/Karachi");
                }
                catch
                {
                    return TimeZoneInfo.CreateCustomTimeZone(
                        "Pakistan Standard Time Fallback",
                        TimeSpan.FromHours(5),
                        "Pakistan Standard Time",
                        "Pakistan Standard Time");
                }
            }
            catch
            {
                return TimeZoneInfo.CreateCustomTimeZone(
                    "Pakistan Standard Time Fallback",
                    TimeSpan.FromHours(5),
                    "Pakistan Standard Time",
                    "Pakistan Standard Time");
            }
        }

        public static DateTime GetNowPakistan()
        {
            return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, PakistanTimeZone);
        }

        public static bool IsEveningShift(string? shift)
        {
            if (string.IsNullOrWhiteSpace(shift))
            {
                return false;
            }

            return string.Equals(shift.Trim(), "E", StringComparison.OrdinalIgnoreCase);
        }

        public static bool ShouldHideUnpunchedEvening(DateTime attendanceDate, DateTime? nowPkt = null)
        {
            var now = nowPkt ?? GetNowPakistan();
            return attendanceDate.Date == now.Date && now.TimeOfDay < CutoffTime;
        }
    }
}
