using System;

namespace SaftHR.API.Utilities
{
    public static class WorkHoursCalculator
    {
        public static (decimal hours, int seconds) Calculate(DateTime? inDate, DateTime? outDate)
        {
            if (!IsValidPunch(inDate) || !IsValidPunch(outDate))
            {
                return (0m, 0);
            }

            if (outDate!.Value <= inDate!.Value)
            {
                return (0m, 0);
            }

            var timeDiff = outDate.Value - inDate.Value;
            var totalHours = (decimal)Math.Round(timeDiff.TotalHours, 2);
            var totalSeconds = (int)timeDiff.TotalSeconds;

            if (totalHours < 0m || totalHours > 24m || totalSeconds < 0 || totalSeconds > 86400)
            {
                return (0m, 0);
            }

            return (totalHours, totalSeconds);
        }

        public static bool IsValidPunch(DateTime? date)
        {
            if (!date.HasValue) return false;
            if (date.Value.Year <= 1900) return false;
            return true;
        }

        public static decimal SanitizeHours(decimal? storedHours)
        {
            if (!storedHours.HasValue) return 0m;
            if (storedHours.Value < 0m || storedHours.Value > 24m) return 0m;
            return storedHours.Value;
        }

        public static int SanitizeSeconds(int? storedSeconds)
        {
            if (!storedSeconds.HasValue) return 0;
            if (storedSeconds.Value < 0 || storedSeconds.Value > 86400) return 0;
            return storedSeconds.Value;
        }
    }
}
