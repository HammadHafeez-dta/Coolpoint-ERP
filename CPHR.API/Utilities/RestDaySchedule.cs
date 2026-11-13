using System;
using System.Linq;

namespace SaftHR.API.Utilities
{
    public static class RestDaySchedule
    {
        public static bool IsExplicitSchedule(string? storedSchedule)
        {
            if (string.IsNullOrWhiteSpace(storedSchedule))
            {
                return false;
            }

            var value = storedSchedule.Trim();
            if (value.StartsWith("D:", StringComparison.OrdinalIgnoreCase))
            {
                return Enum.GetValues(typeof(DayOfWeek)).Cast<DayOfWeek>()
                    .Any(day => Includes(value, day));
            }

            // Multi-day delimited values are unambiguously explicit. A legacy
            // single weekday keeps its historical designation/Sunday defaults.
            return value.Split(new[] { ',', ';', '|' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(token => token.Trim())
                .Count(token => Enum.TryParse(token, true, out DayOfWeek _)) > 1;
        }

        public static bool Includes(string? storedSchedule, DayOfWeek day)
        {
            if (string.IsNullOrWhiteSpace(storedSchedule))
            {
                return false;
            }

            var value = storedSchedule.Trim();
            if (value.StartsWith("D:", StringComparison.OrdinalIgnoreCase))
            {
                return value.Substring(2)
                    .Split(',')
                    .Any(token => int.TryParse(token, out var dayIndex) && dayIndex == (int)day);
            }

            return value.Split(new[] { ',', ';', '|' }, StringSplitOptions.RemoveEmptyEntries)
                .Any(token =>
                {
                    var normalized = token.Trim();
                    return Enum.TryParse(normalized, true, out DayOfWeek parsed) && parsed == day;
                });
        }

        public static string Format(string? storedSchedule)
        {
            if (string.IsNullOrWhiteSpace(storedSchedule))
            {
                return string.Empty;
            }

            var days = Enum.GetValues(typeof(DayOfWeek)).Cast<DayOfWeek>()
                .Where(day => Includes(storedSchedule, day))
                .Select(day => day.ToString())
                .ToList();

            return days.Count > 0 ? string.Join(", ", days) : storedSchedule.Trim();
        }
    }
}
