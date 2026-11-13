using System;

namespace SaftProject.DTO.Login
{
    public class AuthenticateRequestDto
    {
        public string UserID { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string Site { get; set; } = null!;
        public bool RememberMe { get; set; }
    }

    public class UserResponseDto
    {
        public int UserNo { get; set; }
        public string? UserID { get; set; }
        public string? UserName { get; set; }
        public string? UserLevel { get; set; }
        public byte[]? UserPicture { get; set; }
        public bool? WebUser { get; set; }
        public int? TeacherId { get; set; }
        public string? TeacherName { get; set; }
    }

    public class UserSaveRequestDto
    {
        public int UserNo { get; set; }
        public string UserID { get; set; } = null!;
        public string UserName { get; set; } = null!;
        public string UserPassward { get; set; } = null!;
        public string UserLevel { get; set; } = null!;
        public byte[]? UserPicture { get; set; }
        public int? TeacherId { get; set; }
        public bool TeacherLinkSpecified { get; set; }
        public string? ModuleAccess { get; set; }
        public bool ModuleAccessSpecified { get; set; }
    }

    public class UserChildDto
    {
        public int UserNo { get; set; }
        public string? SoftwareName { get; set; }
        public string? Site { get; set; }
        public long SerialNo { get; set; }
    }

    public class UserRightSaveDto
    {
        public string UserID { get; set; } = null!;
        public string Year { get; set; } = null!;
        public string Software { get; set; } = null!;
        public string FormName { get; set; } = null!;
        public string Site { get; set; } = null!;
        public bool Enter { get; set; }
        public bool Addition { get; set; }
        public bool Deletion { get; set; }
        public bool Updation { get; set; }
    }

    public class UserRightResponseDto
    {
        public string UserID { get; set; } = null!;
        public string Year { get; set; } = null!;
        public string Software { get; set; } = null!;
        public string FormName { get; set; } = null!;
        public string Site { get; set; } = null!;
        public bool Enter { get; set; }
        public bool Addition { get; set; }
        public bool Deletion { get; set; }
        public bool Updation { get; set; }
        public string? MainName { get; set; }
        public string? RightsName { get; set; }
        public int Id { get; set; }
    }

    public class SiteDto
    {
        public string Site { get; set; } = null!;
        public string? Name { get; set; }
        public string? Address { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
    }

    public class FinancialYearDto
    {
        public string FinancialYear { get; set; } = null!;
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }

    public class SoftwareDto
    {
        public int SoftwareNo { get; set; }
        public string Site { get; set; } = null!;
        public string? SoftwareName { get; set; }
    }

    public class UserTypeDto
    {
        public int UserNo { get; set; }
        public string? Site { get; set; }
        public string? UserLevel { get; set; }
        public string? UserType { get; set; }
    }

    public class PasswordUpdateDto
    {
        public string UserID { get; set; } = null!;
        public string NewPassword { get; set; } = null!;
    }

    public class UserRightsCheckDto
    {
        public bool Addition { get; set; }
        public bool Updation { get; set; }
        public bool Deletion { get; set; }
    }

    public class FormNameDto
    {
        public int Id { get; set; }
        public string Software { get; set; } = null!;
        public string? MainName { get; set; }
        public string? RightsName { get; set; }
    }

    /// <summary>
    /// Payload for the POST /api/auth/rights/batch-save endpoint.
    /// Allows the Admin UI to save all user rights changes in one request.
    /// After saving, the server invalidates the user's permission cache.
    /// </summary>
    public class BatchSaveRightsDto
    {
        public string UserId { get; set; } = null!;
        public string Site   { get; set; } = null!;
        public List<UserRightSaveDto> Rights { get; set; } = new();
    }

    public class TeacherUserDto
    {
        public int TeacherId { get; set; }
        public string TeacherName { get; set; } = null!;
        public string? DesignationName { get; set; }
        public bool Status { get; set; }
        public string? DepartmentName { get; set; }
    }
}
