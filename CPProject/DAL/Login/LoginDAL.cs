using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SaftProject.DTO.Login;
using SaftProject.Interface.Login;
using SaftProject.Interface;
using SaftProject.Models;
using SaftProject.Utilities;
using SaftFMS.API.Models.FMS;
using SaftHR.API.Models;
using SaftProject.Services;

namespace SaftProject.DAL.Login
{
    public class LoginDAL : ILoginDAL
    {
        private readonly CommonDbContext _db;
        private readonly FMSDbContext _fmsDb;
        private readonly HRMSDbContext _hrmsDb;
        private readonly IPermissionService _permissions;

        public LoginDAL(CommonDbContext db, FMSDbContext fmsDb, HRMSDbContext hrmsDb, IPermissionService permissions)
        {
            _db = db;
            _fmsDb = fmsDb;
            _hrmsDb = hrmsDb;
            _permissions = permissions;
        }

        // ══════════════════════════════════════════════════════════════════════
        // USERS
        // ══════════════════════════════════════════════════════════════════════

        public async Task<List<UserResponseDto>> GetAdminUsersAsync()
        {
            return await _db.TblUsers
                .Where(u => u.UserLevel == "A")
                .OrderBy(o => o.UserNo)
                .Select(u => new UserResponseDto
                {
                    UserNo = u.UserNo,
                    UserID = u.UserId,
                    UserName = u.UserName,
                    UserLevel = u.TeacherId.HasValue ? "U" : u.UserLevel,
                    UserPicture = u.UserPicture,
                    WebUser = u.WebUser,
                    TeacherId = u.TeacherId,
                    TeacherName = u.TeacherName
                })
                .ToListAsync();
        }

        public async Task<List<UserResponseDto>> GetLimitedUsersAsync()
        {
            return await _db.TblUsers
                .Where(u => u.UserLevel == "U")
                .OrderBy(o => o.UserNo)
                .Select(u => new UserResponseDto
                {
                    UserNo = u.UserNo,
                    UserID = u.UserId,
                    UserName = u.UserName,
                    UserLevel = u.TeacherId.HasValue ? "U" : u.UserLevel,
                    UserPicture = u.UserPicture,
                    WebUser = u.WebUser,
                    TeacherId = u.TeacherId,
                    TeacherName = u.TeacherName
                })
                .ToListAsync();
        }

        public async Task<List<UserResponseDto>> GetAllUsersAsync()
        {
            return await _db.TblUsers
                .OrderBy(o => o.UserNo)
                .Select(u => new UserResponseDto
                {
                    UserNo = u.UserNo,
                    UserID = u.UserId,
                    UserName = u.UserName,
                    UserLevel = u.TeacherId.HasValue ? "U" : u.UserLevel,
                    UserPicture = u.UserPicture,
                    WebUser = u.WebUser,
                    TeacherId = u.TeacherId,
                    TeacherName = u.TeacherName
                })
                .ToListAsync();
        }

        public async Task<List<UserChildDto>> GetUserChildsListAsync(string site)
        {
            return await _db.TblUsersChildren
                .Where(u => u.Site == site)
                .OrderBy(o => o.SerialNo)
                .Select(u => new UserChildDto
                {
                    UserNo = u.UserNo ?? 0,
                    SoftwareName = u.SoftwareName,
                    Site = u.Site,
                    SerialNo = u.SerialNo
                })
                .ToListAsync();
        }

        public async Task<UserResponseDto?> AuthenticateUserAsync(string userId, string password, string site)
        {
            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(password) || string.IsNullOrEmpty(site)) return null;

            string trimmedId = userId.Trim();
            string trimmedPassword = password.Trim();
            string encryptedInput = PasswordUtility.EncryptPassword(trimmedPassword);
            string trimmedSite = site.Trim();

            var temp = await _db.TblUsers
                .FirstOrDefaultAsync(u => u.UserId != null && u.UserId.Trim() == trimmedId &&
                                         (u.Site != null && u.Site.Trim() == trimmedSite || _db.TblUsersChildren.Any(c => c.UserNo == u.UserNo && c.Site != null && c.Site.Trim() == trimmedSite)) &&
                                         (u.UserPassward != null && (u.UserPassward.Trim() == trimmedPassword || u.UserPassward.Trim() == encryptedInput)));

            if (temp == null) return null;

            // A linked account is always a teacher account, so it must stay restricted
            // even if the teacher record can't be matched as active.
            return new UserResponseDto
            {
                UserNo = temp.UserNo,
                UserID = temp.UserId,
                UserName = temp.UserName,
                UserLevel = temp.TeacherId.HasValue ? "U" : temp.UserLevel,
                UserPicture = temp.UserPicture,
                WebUser = temp.WebUser,
                TeacherId = temp.TeacherId,
                TeacherName = temp.TeacherName
            };
        }

        public async Task<List<UserTypeDto>> GetUserTypesListAsync()
        {
            return await _db.TblUserTypes
                .Select(u => new UserTypeDto
                {
                    UserNo = u.UserNo,
                    Site = u.Site,
                    UserLevel = u.UserLevel,
                    UserType = u.UserType
                })
                .ToListAsync();
        }

        public async Task<int> GetUserMaxNoAsync(string site)
        {
            var max = await _db.TblUsers
                .Where(u => u.Site == site)
                .Select(p => (int?)p.UserNo)
                .MaxAsync() ?? 0;
            return max + 1;
        }

        public async Task<int> SaveUserAsync(UserSaveRequestDto entity, string site)
        {
            if (string.IsNullOrWhiteSpace(site))
                throw new ArgumentException("A site is required.");

            var normalizedUserId = entity.UserID?.Trim();
            if (string.IsNullOrWhiteSpace(normalizedUserId))
                throw new ArgumentException("User Login ID is required.");
            if (normalizedUserId.Length > 10)
                throw new ArgumentException("User Login ID cannot exceed 10 characters.");
            if (string.IsNullOrWhiteSpace(entity.UserName) || entity.UserName.Trim().Length > 50)
                throw new ArgumentException("A user name of 1 to 50 characters is required.");

            var duplicateLoginId = await _db.TblUsers
                .AsNoTracking()
                .AnyAsync(u => u.UserNo != entity.UserNo
                    && u.UserId != null
                    && u.UserId.Trim().ToLower() == normalizedUserId.ToLower());
            if (duplicateLoginId)
                throw new InvalidOperationException($"Login ID '{normalizedUserId}' is already in use. Choose a unique Login ID.");

            var temp = await _db.TblUsers
                .FirstOrDefaultAsync(u => u.UserNo == entity.UserNo);

            var existingTeacherId = temp?.TeacherId;
            var shouldUpdateTeacherLink = entity.TeacherLinkSpecified || entity.TeacherId is > 0;
            int? targetTeacherId = shouldUpdateTeacherLink
                ? entity.TeacherId is > 0 ? entity.TeacherId : null
                : existingTeacherId;
            var targetTeacherName = targetTeacherId == existingTeacherId ? temp?.TeacherName : null;

            List<string>? assignedModules = null;
            if (entity.ModuleAccessSpecified
                && (targetTeacherId.HasValue || string.Equals(entity.UserLevel?.Trim(), "U", StringComparison.OrdinalIgnoreCase)))
            {
                assignedModules = WorkspaceModuleAccess.NormalizeAssignedModules(entity.ModuleAccess);
                if (assignedModules.Count == 0)
                    throw new ArgumentException("Select HRMS, Commercial CRM, or both for a Limited user.");
            }

            if (targetTeacherId.HasValue && targetTeacherId != existingTeacherId)
            {
                var teacherId = targetTeacherId.Value;
                var teacherName = await _fmsDb.SchTeachers
                    .AsNoTracking()
                    .Where(t => t.TeacherId == teacherId && (t.Status ?? false) == true)
                    .Select(t => t.TeacherName)
                    .FirstOrDefaultAsync();

                if (string.IsNullOrWhiteSpace(teacherName))
                {
                    teacherName = await _hrmsDb.VewEmployees
                        .AsNoTracking()
                        .Where(e => e.EmpCardNo == teacherId
                            && (e.Status ?? false) == true
                            && (e.StuckOff ?? false) == false
                            && e.Category != null && e.Category.Contains("Teach") && !e.Category.Contains("Non"))
                        .Select(e => e.EmpName)
                        .FirstOrDefaultAsync();
                }

                if (string.IsNullOrWhiteSpace(teacherName))
                    throw new InvalidOperationException("Selected teacher does not exist or is not active.");

                var alreadyLinked = await _db.TblUsers
                    .AnyAsync(user => user.TeacherId == teacherId && user.UserNo != entity.UserNo);
                if (alreadyLinked)
                    throw new InvalidOperationException("This teacher is already linked to another user account.");

                targetTeacherName = teacherName.Trim();
            }

            var passwordToSave = entity.UserPassward?.Trim() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(passwordToSave))
            {
                if (temp == null)
                    throw new ArgumentException("A password is required for a new user.");

                if (string.IsNullOrWhiteSpace(temp.UserPassward))
                    throw new InvalidOperationException("The existing account has no stored password. Set a new password before saving.");

                passwordToSave = temp.UserPassward;
            }
            else if (!passwordToSave.Contains("-"))
            {
                passwordToSave = PasswordUtility.EncryptPassword(passwordToSave);
            }

            var isTeacherLinked = targetTeacherId.HasValue;
            var userLevelToSave = isTeacherLinked ? "U" : entity.UserLevel;

            if (temp == null)
            {
                // New user creation
                if (targetTeacherId.HasValue)
                {
                    temp = new TblUser
                    {
                        UserNo = entity.UserNo,
                        UserId = normalizedUserId,
                        UserName = entity.UserName.Trim(),
                        UserPassward = passwordToSave,
                        UserLevel = userLevelToSave,
                        WebUser = true,
                        UserPicture = entity.UserPicture,
                        Site = site,
                        TeacherId = targetTeacherId,
                        TeacherName = targetTeacherName
                    };

                    _db.TblUsers.Add(temp);
                    await _db.SaveChangesAsync();
                }
                else
                {
                    temp = new TblUser
                    {
                        UserNo = entity.UserNo,
                        UserId = normalizedUserId,
                        UserName = entity.UserName.Trim(),
                        UserPassward = passwordToSave,
                        UserLevel = userLevelToSave,
                        WebUser = true,
                        UserPicture = entity.UserPicture,
                        Site = site,
                        TeacherId = targetTeacherId,
                        TeacherName = targetTeacherName
                    };
                    _db.TblUsers.Add(temp);
                    await _db.SaveChangesAsync();
                }
            }
            else
            {
                // Keep the username, rights, and teacher link updates in one transaction.
                await using var transaction = await _db.Database.BeginTransactionAsync();
                if (!string.Equals(temp.UserId, normalizedUserId, StringComparison.Ordinal))
                {
                    var existingRights = await _db.TblUserRights
                        .AsNoTracking()
                        .Where(r => r.UserId == temp.UserId)
                        .ToListAsync();
                    var targetRights = await _db.TblUserRights
                        .AsNoTracking()
                        .Where(r => r.UserId == normalizedUserId)
                        .ToListAsync();

                    var hasConflictingRights = existingRights.Any(existing =>
                        targetRights.Any(target =>
                            string.Equals(existing.Site, target.Site, StringComparison.OrdinalIgnoreCase)
                            && string.Equals(existing.Name, target.Name, StringComparison.OrdinalIgnoreCase)
                            && string.Equals(existing.Year, target.Year, StringComparison.OrdinalIgnoreCase)
                            && string.Equals(existing.Software, target.Software, StringComparison.OrdinalIgnoreCase)));
                    if (hasConflictingRights)
                    {
                        throw new InvalidOperationException(
                            $"Login ID '{normalizedUserId}' already has user-rights records. Resolve those records before changing this username.");
                    }

                    await _db.TblUserRights
                        .Where(r => r.UserId == temp.UserId)
                        .ExecuteUpdateAsync(update => update
                            .SetProperty(r => r.UserId, normalizedUserId));
                }

                temp.UserId = normalizedUserId;
                temp.UserName = entity.UserName.Trim();
                temp.UserPassward = passwordToSave;
                temp.UserLevel = userLevelToSave;
                temp.UserPicture = entity.UserPicture;
                temp.Site = site;
                if (shouldUpdateTeacherLink)
                {
                    temp.TeacherId = targetTeacherId;
                    temp.TeacherName = targetTeacherName;
                }
                await _db.SaveChangesAsync();
                await transaction.CommitAsync();
            }

            // Only touched when the client explicitly sends a module selection; existing access is otherwise preserved.
            if (assignedModules is not null
                && string.Equals(userLevelToSave?.Trim(), "U", StringComparison.OrdinalIgnoreCase))
            {
                await using var childTx = await _db.Database.BeginTransactionAsync();
                await _db.Database.ExecuteSqlRawAsync("DELETE FROM tbl_Users_Child WHERE User_No = {0}", temp.UserNo);
                foreach (var module in assignedModules)
                {
                    _db.TblUsersChildren.Add(new TblUsersChild
                    {
                        UserNo = temp.UserNo,
                        SoftwareName = module,
                        Site = site
                    });
                }
                await _db.SaveChangesAsync();
                await childTx.CommitAsync();
            }

            return temp.UserNo;
        }

        public async Task<UserResponseDto?> EditUserAsync(int userNo)
        {
            var temp = await _db.TblUsers
                .OrderByDescending(u => u.UserNo)
                .FirstOrDefaultAsync(u => u.UserNo == userNo);

            if (temp == null) return null;

            return new UserResponseDto
            {
                UserNo = temp.UserNo,
                UserID = temp.UserId,
                UserName = temp.UserName,
                UserLevel = temp.TeacherId.HasValue ? "U" : temp.UserLevel,
                UserPicture = temp.UserPicture,
                WebUser = temp.WebUser,
                TeacherId = temp.TeacherId,
                TeacherName = temp.TeacherName
            };
        }

        public async Task<List<int>> GetLinkedTeacherIdsAsync()
        {
            return await _db.TblUsers
                .AsNoTracking()
                .Where(user => user.TeacherId.HasValue)
                .Select(user => user.TeacherId!.Value)
                .Distinct()
                .ToListAsync();
        }

        public async Task<int?> GetUserNoByTeacherIdAsync(int teacherId)
        {
            return await _db.TblUsers
                .AsNoTracking()
                .Where(user => user.TeacherId == teacherId)
                .Select(user => (int?)user.UserNo)
                .FirstOrDefaultAsync();
        }

        public async Task<int?> GetTeacherIdForUserAsync(int userNo)
        {
            if (userNo <= 0) return null;

            var user = await _db.TblUsers
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserNo == userNo);

            if (user?.TeacherId is not int teacherId) return null;

            var teacher = await _fmsDb.SchTeachers
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.TeacherId == teacherId && (t.Status ?? false) == true);

            if (teacher != null) return teacherId;

            var hrmsTeacher = await _hrmsDb.VewEmployees
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.EmpCardNo == teacherId
                    && (e.Status ?? false) == true
                    && (e.StuckOff ?? false) == false
                    && e.Category != null && e.Category.Contains("Teach") && !e.Category.Contains("Non"));

            return hrmsTeacher != null ? teacherId : null;
        }

        public async Task<List<TeacherUserDto>> GetTeachersAsync(string? site = null)
        {
            var hrmsQuery = _hrmsDb.VewEmployees.AsNoTracking();
            if (!string.IsNullOrEmpty(site))
            {
                hrmsQuery = hrmsQuery.Where(e => e.Site == site);
            }

            var activeHrms = await hrmsQuery
                .Where(e => (e.Status ?? false) == true
                    && (e.StuckOff ?? false) == false
                    && (e.LeftType == null || e.LeftType == "" || e.LeftType == "-" || e.LeftType.ToLower() == "null" || e.LeftType.ToLower() == "employee")
                    && e.Category != null && e.Category.Contains("Teach") && !e.Category.Contains("Non"))
                .Where(e => e.DesignationName != null && (
                    e.DesignationName.Contains("Teach") ||
                    e.DesignationName.Contains("Coord") ||
                    e.DesignationName.Contains("Principal") ||
                    e.DesignationName.Contains("Head") ||
                    e.DesignationName.Contains("Instructor")))
                .OrderBy(e => e.EmpName)
                .Select(e => new TeacherUserDto
                {
                    TeacherId = e.EmpCardNo,
                    TeacherName = (e.EmpName ?? "").Trim(),
                    DesignationName = e.DesignationName != null ? e.DesignationName.Trim() : null,
                    Status = (e.Status ?? false) == true,
                    DepartmentName = e.DepartmentName
                })
                .ToListAsync();

            if (activeHrms.Count > 0)
            {
                return activeHrms;
            }

            var fmsQuery = _fmsDb.SchTeachers.AsNoTracking();
            if (!string.IsNullOrEmpty(site))
            {
                fmsQuery = fmsQuery.Where(t => t.Site == site);
            }

            return await fmsQuery
                .Where(t => (t.Status ?? false) == true)
                .OrderBy(t => t.TeacherName)
                .Select(t => new TeacherUserDto
                {
                    TeacherId = t.TeacherId,
                    TeacherName = (t.TeacherName ?? "").Trim(),
                    DesignationName = "Teacher",
                    Status = true,
                    DepartmentName = null
                })
                .ToListAsync();
        }

        public async Task<bool> DeleteUserAsync(int userNo)
        {
            var user = await _db.TblUsers.FirstOrDefaultAsync(u => u.UserNo == userNo);
            if (user == null) return false;

            await using var transaction = await _db.Database.BeginTransactionAsync();
            var permissionSites = await _db.TblUserRights.Where(right => right.UserId == user.UserId)
                .Select(right => (string?)right.Site).ToListAsync();
            permissionSites.AddRange(await _db.TblUsersChildren.Where(child => child.UserNo == userNo).Select(child => child.Site).ToListAsync());
            permissionSites.Add(user.Site);
            await _db.TblUserRights
                .Where(right => right.UserId == user.UserId)
                .ExecuteDeleteAsync();
            await _db.TblUsersChildren
                .Where(child => child.UserNo == userNo)
                .ExecuteDeleteAsync();
            await _db.Database.ExecuteSqlRawAsync(
                "IF OBJECT_ID(N'dbo.tbl_UserTeacher', N'U') IS NOT NULL DELETE FROM dbo.tbl_UserTeacher WHERE User_No = {0}",
                userNo);

            _db.TblUsers.Remove(user);
            await _db.SaveChangesAsync();
            await transaction.CommitAsync();
            if (!string.IsNullOrWhiteSpace(user.UserId))
                foreach (var site in permissionSites.Where(site => !string.IsNullOrWhiteSpace(site)).Distinct(StringComparer.OrdinalIgnoreCase))
                    _permissions.InvalidateUserPermissions(user.UserId, site!);
            return true;
        }

        public async Task DeleteUserChildAsync(int userNo)
        {
            await _db.Database.ExecuteSqlRawAsync("DELETE FROM tbl_Users_Child WHERE User_No = {0}", userNo);
        }

        public async Task SaveUserChildAsync(UserChildDto entity)
        {
            var module = WorkspaceModuleAccess.NormalizeAssignedModules(entity.SoftwareName).SingleOrDefault()
                ?? throw new ArgumentException("Choose HRMS or Commercial CRM.");
            var child = new TblUsersChild
            {
                UserNo = entity.UserNo,
                SoftwareName = module,
                Site = entity.Site
            };
            _db.TblUsersChildren.Add(child);
            await _db.SaveChangesAsync();
        }

        public async Task<List<UserChildDto>> GetUserChildAsync(int userNo)
        {
            return await _db.TblUsersChildren
                .Where(u => u.UserNo == userNo)
                .OrderBy(o => o.SerialNo)
                .Select(u => new UserChildDto
                {
                    UserNo = u.UserNo ?? 0,
                    SoftwareName = u.SoftwareName,
                    Site = u.Site,
                    SerialNo = u.SerialNo
                })
                .ToListAsync();
        }

        // ══════════════════════════════════════════════════════════════════════
        // USER RIGHTS
        // ══════════════════════════════════════════════════════════════════════

        public async Task<List<FormNameDto>> GetFormNamesAsync(string software)
        {
            var forms = await _db.TblFormNames
                .Where(u => u.Software == software)
                .OrderBy(o => o.Id)
                .Select(f => new FormNameDto
                {
                    Id = f.Id,
                    Software = f.Software,
                    MainName = f.MainName,
                    RightsName = f.RightsName
                })
                .ToListAsync();
            return forms.Count == 0 && software.Trim().Equals("HRMS", StringComparison.OrdinalIgnoreCase)
                ? HrPermissionCatalog.Forms() : forms;
        }

        public async Task SaveUserRightsAsync(UserRightSaveDto entity)
        {
            if (entity.Software.Trim().Equals("HRMS", StringComparison.OrdinalIgnoreCase))
            {
                var rows = await _db.TblUserRights.Where(right => right.UserId == entity.UserID && right.Site == entity.Site && right.Software == "HRMS").ToListAsync();
                var matching = rows.Where(right => HrPagePermissions.Normalize(right.Name) == HrPagePermissions.Normalize(entity.FormName)).ToList();
                if (matching.Count == 0)
                {
                    var added = new TblUserRight { UserId = entity.UserID, Site = entity.Site, Software = "HRMS", Year = entity.Year, Name = entity.FormName.Trim() };
                    _db.TblUserRights.Add(added);
                    matching.Add(added);
                }
                foreach (var right in matching)
                {
                    right.Enter = entity.Enter; right.Addition = entity.Addition;
                    right.Updation = entity.Updation; right.Delition = entity.Deletion;
                }
                await _db.SaveChangesAsync();
                _permissions.InvalidateUserPermissions(entity.UserID, entity.Site);
                return;
            }
            var temp = await _db.TblUserRights
                .FirstOrDefaultAsync(u => u.UserId == entity.UserID &&
                                         u.Site == entity.Site &&
                                         u.Name == entity.FormName &&
                                         u.Year == entity.Year &&
                                         u.Software == entity.Software);

            if (temp == null)
            {
                temp = new TblUserRight
                {
                    UserId = entity.UserID,
                    Site = entity.Site,
                    Name = entity.FormName,
                    Year = entity.Year,
                    Software = entity.Software
                };
                _db.TblUserRights.Add(temp);
            }

            temp.Enter = entity.Enter;
            temp.Addition = entity.Addition;
            temp.Delition = entity.Deletion; // Note: Column name in DB model is Delition
            temp.Updation = entity.Updation;

            await _db.SaveChangesAsync();
        }

        public async Task<List<UserRightResponseDto>> GetUserRightsAsync(string software, string userId, string site, string year)
        {
            if (software.Trim().Equals("HRMS", StringComparison.OrdinalIgnoreCase))
                return await ReadSavedHrRightsAsync(userId, site);
            IQueryable<VewUserRight> query = _db.VewUserRights;

            if (software == "HRMS" || software == "FMS")
            {
                query = query.Where(u => u.UserId == userId && u.Site == site && u.Software == software);
            }
            else
            {
                query = query.Where(u => u.UserId == userId && u.Year == year && u.Site == site && u.Software == software);
            }

            return await query
                .OrderBy(o => o.Name)
                .Select(u => new UserRightResponseDto
                {
                    UserID = u.UserId,
                    Year = u.Year,
                    Software = u.Software,
                    FormName = u.Name,
                    Site = u.Site,
                    Enter = u.Enter ?? false,
                    Addition = u.Addition ?? false,
                    Deletion = u.Delition ?? false,
                    Updation = u.Updation ?? false,
                    MainName = u.MainName,
                    RightsName = u.RightsName,
                    Id = u.Id
                })
                .ToListAsync();
        }

        public async Task<List<UserRightResponseDto>> GetSavedRightsAsync(string userId, string year, string software, string site)
        {
            if (software.Trim().Equals("HRMS", StringComparison.OrdinalIgnoreCase))
                return await ReadSavedHrRightsAsync(userId, site);
            IQueryable<VewUserRight> query = _db.VewUserRights;

            if (software == "HRMS" || software == "FMS")
            {
                query = query.Where(u => u.UserId == userId && u.Software == software && u.Site == site);
            }
            else
            {
                query = query.Where(u => u.UserId == userId && u.Year == year && u.Software == software && u.Site == site);
            }

            return await query
                .OrderBy(o => o.Id)
                .Select(u => new UserRightResponseDto
                {
                    UserID = u.UserId,
                    Year = u.Year,
                    Software = u.Software,
                    FormName = u.Name,
                    Site = u.Site,
                    Enter = u.Enter ?? false,
                    Addition = u.Addition ?? false,
                    Deletion = u.Delition ?? false,
                    Updation = u.Updation ?? false,
                    MainName = u.MainName,
                    RightsName = u.RightsName,
                    Id = u.Id
                })
                .ToListAsync();
        }

        private async Task<List<UserRightResponseDto>> ReadSavedHrRightsAsync(string userId, string site)
        {
            var rights = await _db.TblUserRights.AsNoTracking().Where(right => right.UserId == userId && right.Site == site && right.Software == "HRMS").ToListAsync();
            var forms = await _db.TblFormNames.AsNoTracking().Where(form => form.Software == "HRMS").ToListAsync();
            return HrPermissionCatalog.Saved(rights, forms);
        }

        public async Task<UserRightsCheckDto?> CheckUserRightsAsync(string userId, string software, string site, string year, string mainFormName, string userLevel)
        {
            if (userLevel == "A")
            {
                return new UserRightsCheckDto
                {
                    Addition = true,
                    Updation = true,
                    Deletion = true
                };
            }

            IQueryable<VewUserRight> query = _db.VewUserRights;

            if (software == "FMS" || software == "HRMS")
            {
                query = query.Where(u => u.UserId == userId && u.Software == software && u.Site == site && u.MainName == mainFormName);
            }
            else
            {
                query = query.Where(u => u.UserId == userId && u.Software == software && u.Year == year && u.Site == site && u.MainName == mainFormName);
            }

            var temp = await query.OrderByDescending(u => u.UserId).FirstOrDefaultAsync();

            if (temp == null) return null;

            return new UserRightsCheckDto
            {
                Addition = temp.Addition ?? false,
                Updation = temp.Updation ?? false,
                Deletion = temp.Delition ?? false
            };
        }

        public async Task<bool> DeleteUserRightAsync(string userId, string year, string software, string site, string rightsName)
        {
            try
            {
                if (software == "HRMS" || software == "FMS")
                {
                    await _db.Database.ExecuteSqlRawAsync(
                        "DELETE FROM tbl_UserRights WHERE User_ID={0} AND Name={1} AND software={2} AND site={3}",
                        userId, rightsName, software, site);
                }
                else
                {
                    await _db.Database.ExecuteSqlRawAsync(
                        "DELETE FROM tbl_UserRights WHERE User_ID={0} AND Name={1} AND Year={2} AND software={3} AND site={4}",
                        userId, rightsName, year, software, site);
                }
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task DeleteUserRightsAsync(string userId, string year, string software, string site)
        {
            if (software == "HRMS" || software == "FMS")
            {
                await _db.Database.ExecuteSqlRawAsync(
                    "DELETE FROM tbl_UserRights WHERE User_ID={0} AND software={1} AND site={2}",
                    userId, software, site);
            }
            else
            {
                await _db.Database.ExecuteSqlRawAsync(
                    "DELETE FROM tbl_UserRights WHERE User_ID={0} AND Year={1} AND software={2} AND site={3}",
                    userId, year, software, site);
            }
        }

        // ══════════════════════════════════════════════════════════════════════
        // SITES
        // ══════════════════════════════════════════════════════════════════════

        public async Task<List<SiteDto>> GetAllSitesAsync()
        {
            return await _db.TblSites
                .Select(u => new SiteDto
                {
                    Site = u.Site,
                    Name = u.Name,
                    Address = u.Address,
                    Phone = u.Phone,
                    Email = u.Email
                })
                .ToListAsync();
        }

        public async Task<SiteDto?> InitializeSitesAsync(string siteShort)
        {
            if (string.IsNullOrEmpty(siteShort)) return null;

            return await _db.TblSites
                .Where(u => u.Site.Trim() == siteShort.Trim())
                .Select(u => new SiteDto
                {
                    Site = u.Site,
                    Name = u.Name,
                    Address = u.Address,
                    Phone = u.Phone,
                    Email = u.Email
                })
                .FirstOrDefaultAsync();
        }

        // ══════════════════════════════════════════════════════════════════════
        // FINANCIAL YEARS
        // ══════════════════════════════════════════════════════════════════════

        public async Task<List<FinancialYearDto>> GetFinancialYearsAsync()
        {
            return await _db.TblFinancialYears
                .OrderByDescending(o => o.FinancialYear)
                .Select(u => new FinancialYearDto
                {
                    FinancialYear = u.FinancialYear,
                    StartDate = u.StartDate,
                    EndDate = u.EndDate
                })
                .ToListAsync();
        }

        public async Task<FinancialYearDto?> InitializeFinancialYearAsync(string financialYear)
        {
            if (string.IsNullOrEmpty(financialYear)) return null;

            return await _db.TblFinancialYears
                .Where(u => u.FinancialYear.Trim() == financialYear.Trim())
                .Select(u => new FinancialYearDto
                {
                    FinancialYear = u.FinancialYear,
                    StartDate = u.StartDate,
                    EndDate = u.EndDate
                })
                .FirstOrDefaultAsync();
        }

        // ══════════════════════════════════════════════════════════════════════
        // SOFTWARES
        // ══════════════════════════════════════════════════════════════════════

        public async Task<List<SoftwareDto>> GetSoftwaresListAsync()
        {
            return await _db.TblSoftwares
                .OrderBy(o => o.SoftwareName)
                .Select(u => new SoftwareDto
                {
                    SoftwareNo = u.SoftwareNo,
                    SoftwareName = u.SoftwareName,
                    Site = u.Site
                })
                .ToListAsync();
        }
    }
}
