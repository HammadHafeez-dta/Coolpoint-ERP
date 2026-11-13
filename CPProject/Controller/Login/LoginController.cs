using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using SaftProject.DTO.Login;
using SaftProject.Attributes;
using SaftProject.Interface;
using SaftProject.Interface.Login;
using SaftProject.Utilities;
using SaftProject.Models;
using Microsoft.EntityFrameworkCore;

namespace SaftProject.Controller.Login
{
    [ApiController]
    [Route("api/auth")]
    [Authorize]   // ← all endpoints in this controller require a valid JWT by default
    public class LoginController : ControllerBase
    {
        private readonly ILoginDAL         _dal;
        private readonly IConfiguration    _config;
        private readonly IPermissionService _permissionService;

        public LoginController(ILoginDAL dal, IConfiguration config, IPermissionService permissionService)
        {
            _dal               = dal;
            _config            = config;
            _permissionService = permissionService;
        }

        // ══════════════════════════════════════════════════════════════════════
        // AUTHENTICATION & SECURITY ENDPOINTS  (Public — no token required)
        // ══════════════════════════════════════════════════════════════════════

        /// <summary>
        /// Authenticate a user and receive a JWT Bearer token.
        /// </summary>
        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] AuthenticateRequestDto request)
        {
            if (string.IsNullOrEmpty(request.Site))
            {
                return BadRequest(new { message = "Site selection is required." });
            }

            var user = await _dal.AuthenticateUserAsync(request.UserID, request.Password, request.Site);
            if (user == null)
            {
                return Unauthorized(new { message = "Invalid User ID, Password, or Site." });
            }

            var siteInfo = await _dal.InitializeSitesAsync(request.Site);
            var siteName = siteInfo?.Name?.Trim();
            var token = JwtUtility.GenerateToken(user, request.Site, siteName, _config, request.RememberMe);

            return Ok(new
            {
                token,
                userNo    = user.UserNo,
                userID    = user.UserID,
                userName  = user.UserName,
                userLevel = user.UserLevel,
                webUser   = user.WebUser,
                teacherId = user.TeacherId,
                site      = request.Site,
                siteName
            });
        }

        [AllowAnonymous]
        [HttpPost("password/encrypt")]
        public IActionResult Encrypt([FromBody] string password)
        {
            var encrypted = PasswordUtility.EncryptPassword(password);
            return Ok(new { encrypted });
        }

        [AllowAnonymous]
        [HttpPost("password/decrypt")]
        public IActionResult Decrypt([FromBody] string encryptedPassword)
        {
            var decrypted = PasswordUtility.DeEncryptPassword(encryptedPassword);
            return Ok(new { decrypted });
        }

        // ══════════════════════════════════════════════════════════════════════
        // USER ENDPOINTS  (Protected — valid token required)
        // ══════════════════════════════════════════════════════════════════════

        [AdminOnly]
        [HttpGet("users/admin")]
        public async Task<IActionResult> GetAdminUsers()
        {
            var result = await _dal.GetAdminUsersAsync();
            return Ok(result);
        }

        [AdminOnly]
        [HttpGet("users/limited")]
        public async Task<IActionResult> GetLimitedUsers()
        {
            var result = await _dal.GetLimitedUsersAsync();
            return Ok(result);
        }

        [AdminOnly]
        [HttpGet("users/all")]
        public async Task<IActionResult> GetAllUsers()
        {
            var result = await _dal.GetAllUsersAsync();
            return Ok(result);
        }

        [AdminOnly]
        [HttpGet("users/childs-list")]
        public async Task<IActionResult> GetUserChildsList([FromQuery] string site)
        {
            var result = await _dal.GetUserChildsListAsync(site);
            return Ok(result);
        }

        [AdminOnly]
        [HttpGet("user-types")]
        public async Task<IActionResult> GetUserTypes()
        {
            var result = await _dal.GetUserTypesListAsync();
            return Ok(result);
        }

        [AdminOnly]
        [HttpGet("users/maxno")]
        public async Task<IActionResult> GetUserMaxNo([FromQuery] string site)
        {
            var result = await _dal.GetUserMaxNoAsync(site);
            return Ok(result);
        }

        [AdminOnly]
        [HttpGet("users/linked-teachers")]
        public async Task<IActionResult> GetLinkedTeachers()
        {
            var result = await _dal.GetLinkedTeacherIdsAsync();
            return Ok(result);
        }

        [AdminOnly]
        [HttpGet("users/by-teacher/{teacherId:int}")]
        public async Task<IActionResult> GetUserByTeacher(int teacherId)
        {
            if (teacherId <= 0) return BadRequest(new { message = "A valid teacher ID is required." });

            var userNo = await _dal.GetUserNoByTeacherIdAsync(teacherId);
            if (userNo == null) return NotFound(new { message = "No user account is linked to this teacher." });

            return Ok(new { userNo });
        }

        [AdminOnly]
        [HttpGet("users/teachers")]
        [HttpGet("teachers")]
        public async Task<IActionResult> GetTeachers([FromQuery] string? site = null)
        {
            var result = await _dal.GetTeachersAsync(site);
            return Ok(result);
        }

        [AdminOnly]
        [HttpPost("users/save")]
        public async Task<IActionResult> SaveUser([FromBody] UserSaveRequestDto user, [FromQuery] string site)
        {
            try
            {
                var userNo = await _dal.SaveUserAsync(user, site);
                _permissionService.InvalidateUserPermissions(user.UserID.Trim(), site);
                return Ok(new { message = "User saved successfully.", userNo });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [AdminOnly]
        [HttpGet("users/edit/{userNo}")]
        public async Task<IActionResult> EditUser(int userNo)
        {
            var user = await _dal.EditUserAsync(userNo);
            if (user == null) return NotFound();
            return Ok(user);
        }

        [AdminOnly]
        [HttpDelete("users/{userNo}")]
        public async Task<IActionResult> DeleteUser(int userNo)
        {
            var success = await _dal.DeleteUserAsync(userNo);
            if (!success) return NotFound(new { message = $"User #{userNo} was not found." });
            return Ok(new { message = "User deleted successfully." });
        }

        [AdminOnly]
        [HttpDelete("users/child/{userNo}")]
        public async Task<IActionResult> DeleteUserChild(int userNo)
        {
            await _dal.DeleteUserChildAsync(userNo);
            return Ok(new { message = "User children deleted successfully." });
        }

        [AdminOnly]
        [HttpPost("users/child/save")]
        public async Task<IActionResult> SaveUserChild([FromBody] UserChildDto childDto)
        {
            try
            {
                await _dal.SaveUserChildAsync(childDto);
                return Ok(new { message = "User child saved successfully." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [AdminOnly]
        [HttpGet("users/child/{userNo}")]
        public async Task<IActionResult> GetUserChild(int userNo)
        {
            var result = await _dal.GetUserChildAsync(userNo);
            return Ok(result);
        }

        // ══════════════════════════════════════════════════════════════════════
        // RIGHTS ENDPOINTS
        // ══════════════════════════════════════════════════════════════════════

        [AdminOnly]
        [HttpGet("rights/form-names")]
        public async Task<IActionResult> GetFormNames([FromQuery] string software)
        {
            var result = await _dal.GetFormNamesAsync(software);
            return Ok(result);
        }

        [AdminOnly]
        [HttpPost("rights/save")]
        public async Task<IActionResult> SaveUserRights([FromBody] UserRightSaveDto right)
        {
            await _dal.SaveUserRightsAsync(right);
            return Ok(new { message = "User rights saved successfully." });
        }

        [AdminOnly]
        [HttpGet("rights")]
        public async Task<IActionResult> GetUserRights([FromQuery] string software, [FromQuery] string userId, [FromQuery] string site, [FromQuery] string year)
        {
            var result = await _dal.GetUserRightsAsync(software, userId, site, year);
            return Ok(result);
        }

        [AdminOnly]
        [HttpGet("rights/saved")]
        public async Task<IActionResult> GetSavedRights([FromQuery] string userId, [FromQuery] string year, [FromQuery] string software, [FromQuery] string site)
        {
            var result = await _dal.GetSavedRightsAsync(userId, year, software, site);
            return Ok(result);
        }

        [AdminOnly]
        [HttpGet("rights/check")]
        public async Task<IActionResult> CheckUserRights([FromQuery] string userId, [FromQuery] string software, [FromQuery] string site, [FromQuery] string year, [FromQuery] string mainFormName, [FromQuery] string userLevel)
        {
            var result = await _dal.CheckUserRightsAsync(userId, software, site, year, mainFormName, userLevel);
            if (result == null) return NotFound(new { message = "Rights not found for specified user and screen." });
            return Ok(result);
        }

        [AdminOnly]
        [HttpDelete("rights/delete-single")]
        public async Task<IActionResult> DeleteUserRight([FromQuery] string userId, [FromQuery] string year, [FromQuery] string software, [FromQuery] string site, [FromQuery] string rightsName)
        {
            var success = await _dal.DeleteUserRightAsync(userId, year, software, site, rightsName);
            if (!success) return BadRequest(new { message = "Failed to delete user right." });
            return Ok(new { message = "User right deleted." });
        }

        [AdminOnly]
        [HttpDelete("rights/delete-all")]
        public async Task<IActionResult> DeleteUserRights([FromQuery] string userId, [FromQuery] string year, [FromQuery] string software, [FromQuery] string site)
        {
            await _dal.DeleteUserRightsAsync(userId, year, software, site);
            return Ok(new { message = "All user rights deleted for specified environment." });
        }

        // ══════════════════════════════════════════════════════════════════════
        // SITES ENDPOINTS
        // ══════════════════════════════════════════════════════════════════════

        [AllowAnonymous]
        [HttpGet("sites/all")]
        public async Task<IActionResult> GetAllSites()
        {
            var result = await _dal.GetAllSitesAsync();
            return Ok(result);
        }

        [HttpGet("sites/initialize")]
        public async Task<IActionResult> InitializeSites([FromQuery] string siteShort)
        {
            var result = await _dal.InitializeSitesAsync(siteShort);
            if (result == null) return NotFound();
            return Ok(result);
        }

        // ══════════════════════════════════════════════════════════════════════
        // FINANCIAL YEARS ENDPOINTS
        // ══════════════════════════════════════════════════════════════════════

        [HttpGet("years/all")]
        public async Task<IActionResult> GetFinancialYears()
        {
            var result = await _dal.GetFinancialYearsAsync();
            return Ok(result);
        }

        [HttpGet("years/initialize")]
        public async Task<IActionResult> InitializeFinancialYear([FromQuery] string financialYear)
        {
            var result = await _dal.InitializeFinancialYearAsync(financialYear);
            if (result == null) return NotFound();
            return Ok(result);
        }

        // ══════════════════════════════════════════════════════════════════════
        // SOFTWARES ENDPOINTS
        // ══════════════════════════════════════════════════════════════════════

        [AdminOnly]
        [HttpGet("softwares/all")]
        public async Task<IActionResult> GetSoftwaresList()
        {
            var result = await _dal.GetSoftwaresListAsync();
            return Ok(result);
        }

        // ══════════════════════════════════════════════════════════════════
        // PERMISSION BUNDLE ENDPOINTS  (New — for User Rights System)
        // ══════════════════════════════════════════════════════════════════

        /// <summary>
        /// Returns the full permission bundle for the currently authenticated user.
        /// Called by the frontend on login to hydrate the local permission store.
        /// </summary>
        [HttpGet("rights/my-permissions")]
        public async Task<IActionResult> GetMyPermissions()
        {
            var userId    = User.FindFirst("sub")?.Value
                         ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                         ?? "";
            var site      = User.FindFirst("Site")?.Value ?? "";
            var userLevel = User.FindFirst("UserLevel")?.Value ?? "";

            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "User identity could not be resolved." });

            var bundle = await _permissionService.GetUserPermissionBundleAsync(userId, site, userLevel);
            return Ok(bundle);
        }

        /// <summary>
        /// Batch-saves an array of user rights and immediately invalidates the cache
        /// for that user so changes take effect on the next request.
        /// </summary>
        [AdminOnly]
        [HttpPost("rights/batch-save")]
        public async Task<IActionResult> BatchSaveUserRights([FromBody] BatchSaveRightsDto request, [FromServices] CommonDbContext common)
        {
            if (!await common.TblUsers.AnyAsync(user => user.UserId == request.UserId))
                return NotFound(new { message = "This account was not found or has been deleted. Return to Existing Users." });
            if (request.Rights.Any(right => !string.Equals(right.UserID, request.UserId, StringComparison.OrdinalIgnoreCase)
                || !string.Equals(right.Site, request.Site, StringComparison.OrdinalIgnoreCase)))
                return BadRequest(new { message = "Save permissions for one user and site at a time." });
            await using var transaction = await common.Database.BeginTransactionAsync();
            foreach (var right in request.Rights)
            {
                await _dal.SaveUserRightsAsync(right);
            }
            await transaction.CommitAsync();

            // Invalidate the permission cache so changes take effect immediately
            _permissionService.InvalidateUserPermissions(request.UserId, request.Site);

            return Ok(new { message = $"User rights saved successfully for user '{request.UserId}'." });
        }
    }
}
