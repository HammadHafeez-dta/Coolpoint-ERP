using System.Threading.Tasks;

namespace SaftHR.API.Interface
{
    public interface ISiteInfoService
    {
        Task<string> GetSiteFullNameAsync(string? siteCode, string fallback = "CoolPoint");
        string GetSiteFullName(string? siteCode, string fallback = "CoolPoint");
    }
}
