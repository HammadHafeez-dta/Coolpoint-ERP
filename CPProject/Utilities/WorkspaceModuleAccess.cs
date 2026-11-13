namespace SaftProject.Utilities;

public static class WorkspaceModuleAccess
{
    private static readonly IReadOnlyDictionary<string, string> CanonicalKeys =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["CRM"] = "CRM",
            ["Commercial CRM"] = "CRM",
            ["HRMS"] = "HRMS",
            ["HR"] = "HRMS",
            ["Human Resources"] = "HRMS",
            ["Human Resources (HRMS)"] = "HRMS",
        };

    public static List<string> NormalizeAssignedModules(string? moduleAccess)
    {
        var keys = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var value in (moduleAccess ?? string.Empty)
                     .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
        {
            if (!TryNormalize(value, out var canonical))
                throw new ArgumentException($"'{value}' is not an assignable CoolPoint workspace. Choose HRMS or CRM.");
            keys.Add(canonical);
        }

        return new[] { "HRMS", "CRM" }.Where(keys.Contains).ToList();
    }

    public static bool TryNormalize(string? value, out string canonical)
    {
        if (CanonicalKeys.TryGetValue(value?.Trim() ?? string.Empty, out var normalized))
        {
            canonical = normalized;
            return true;
        }

        canonical = string.Empty;
        return false;
    }
}
