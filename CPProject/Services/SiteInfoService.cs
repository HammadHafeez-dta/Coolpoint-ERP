using System;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using SaftHR.API.Interface;
using SaftProject.Models;

namespace SaftProject.Services
{
    public class SiteInfoService : ISiteInfoService
    {
        private readonly CommonDbContext _db;
        private readonly IMemoryCache _cache;

        public SiteInfoService(CommonDbContext db, IMemoryCache cache)
        {
            _db = db;
            _cache = cache;
        }

        public async Task<string> GetSiteFullNameAsync(string? siteCode, string fallback = "CoolPoint")
        {
            fallback = NormalizeSiteName(fallback);
            if (string.IsNullOrWhiteSpace(siteCode))
                return fallback;

            string key = siteCode.Trim();
            string cacheKey = $"site_fullname_{key.ToUpperInvariant()}";

            if (_cache.TryGetValue(cacheKey, out string? cachedName) && !string.IsNullOrWhiteSpace(cachedName))
            {
                return NormalizeSiteName(cachedName);
            }

            try
            {
                var site = await _db.TblSites
                    .AsNoTracking()
                    .FirstOrDefaultAsync(s => s.Site.Trim() == key);

                if (site != null && !string.IsNullOrWhiteSpace(site.Name))
                {
                    string fullName = NormalizeSiteName(site.Name);
                    _cache.Set(cacheKey, fullName, TimeSpan.FromHours(12));
                    return fullName;
                }
            }
            catch
            {
                // In case of database error or network issue, fallback gracefully
            }

            return fallback;
        }

        public string GetSiteFullName(string? siteCode, string fallback = "CoolPoint")
        {
            fallback = NormalizeSiteName(fallback);
            if (string.IsNullOrWhiteSpace(siteCode))
                return fallback;

            string key = siteCode.Trim();
            string cacheKey = $"site_fullname_{key.ToUpperInvariant()}";

            if (_cache.TryGetValue(cacheKey, out string? cachedName) && !string.IsNullOrWhiteSpace(cachedName))
            {
                return NormalizeSiteName(cachedName);
            }

            try
            {
                var site = _db.TblSites
                    .AsNoTracking()
                    .FirstOrDefault(s => s.Site.Trim() == key);

                if (site != null && !string.IsNullOrWhiteSpace(site.Name))
                {
                    string fullName = NormalizeSiteName(site.Name);
                    _cache.Set(cacheKey, fullName, TimeSpan.FromHours(12));
                    return fullName;
                }
            }
            catch
            {
                // Fallback gracefully
            }

            return fallback;
        }

        private static string NormalizeSiteName(string name)
        {
            string trimmedName = name.Trim();
            return Regex.IsMatch(trimmedName, @"\b(?:ST\.?\s*ANTHONY(?:'S)?|STANTHONY)\b", RegexOptions.IgnoreCase)
                ? "CoolPoint"
                : trimmedName;
        }
    }
}
