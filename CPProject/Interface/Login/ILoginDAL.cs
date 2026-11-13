using System.Collections.Generic;
using System.Threading.Tasks;
using SaftProject.DTO.Login;

namespace SaftProject.Interface.Login
{
    public interface ILoginDAL
    {
        // Users
        Task<List<UserResponseDto>> GetAdminUsersAsync();
        Task<List<UserResponseDto>> GetLimitedUsersAsync();
        Task<List<UserResponseDto>> GetAllUsersAsync();
        Task<List<UserChildDto>> GetUserChildsListAsync(string site);
        Task<UserResponseDto?> AuthenticateUserAsync(string userId, string password, string site);
        Task<List<UserTypeDto>> GetUserTypesListAsync();
        Task<int> GetUserMaxNoAsync(string site);
        Task<int> SaveUserAsync(UserSaveRequestDto entity, string site);
        Task<UserResponseDto?> EditUserAsync(int userNo);
        Task<bool> DeleteUserAsync(int userNo);
        Task DeleteUserChildAsync(int userNo);
        Task SaveUserChildAsync(UserChildDto entity);
        Task<List<UserChildDto>> GetUserChildAsync(int userNo);
        Task<List<int>> GetLinkedTeacherIdsAsync();
        Task<int?> GetUserNoByTeacherIdAsync(int teacherId);
        Task<int?> GetTeacherIdForUserAsync(int userNo);
        Task<List<TeacherUserDto>> GetTeachersAsync(string? site = null);

        // User Rights
        Task<List<FormNameDto>> GetFormNamesAsync(string software);
        Task SaveUserRightsAsync(UserRightSaveDto entity);
        Task<List<UserRightResponseDto>> GetUserRightsAsync(string software, string userId, string site, string year);
        Task<List<UserRightResponseDto>> GetSavedRightsAsync(string userId, string year, string software, string site);
        Task<UserRightsCheckDto?> CheckUserRightsAsync(string userId, string software, string site, string year, string mainFormName, string userLevel);
        Task<bool> DeleteUserRightAsync(string userId, string year, string software, string site, string rightsName);
        Task DeleteUserRightsAsync(string userId, string year, string software, string site);

        // Sites
        Task<List<SiteDto>> GetAllSitesAsync();
        Task<SiteDto?> InitializeSitesAsync(string siteShort);

        // Financial Years
        Task<List<FinancialYearDto>> GetFinancialYearsAsync();
        Task<FinancialYearDto?> InitializeFinancialYearAsync(string financialYear);

        // Softwares
        Task<List<SoftwareDto>> GetSoftwaresListAsync();
    }
}
