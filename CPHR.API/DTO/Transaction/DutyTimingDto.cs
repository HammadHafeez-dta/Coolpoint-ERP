using System;
using System.Collections.Generic;

namespace SaftHR.API.DTO.Transaction
{
    public class DutyTimingChildItemDto
    {
        public int EmpCardNo { get; set; }
        public string EmpName { get; set; } = string.Empty;
        public int DepartmentCode { get; set; }
        public string DesignationName { get; set; } = string.Empty;
        public string FromTime { get; set; } = string.Empty;
        public string ToTime { get; set; } = string.Empty;
    }

    public class SaveDutyTimingMasterDto
    {
        public int TransNo { get; set; }
        public int DepartmentCode { get; set; }
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public string FromTime { get; set; } = string.Empty;
        public string ToTime { get; set; } = string.Empty;
        public string? Remarks { get; set; }
        public List<DutyTimingChildItemDto> SelectedEmployees { get; set; } = new();
        public List<int> RemoveEmployeeCardNos { get; set; } = new();
    }

    public class DutyTimingEmployeeRowDto
    {
        public int EmpCardNo { get; set; }
        public string EmpName { get; set; } = string.Empty;
        public int DepartmentCode { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public string DesignationName { get; set; } = string.Empty;
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public string FromTime { get; set; } = string.Empty;
        public string ToTime { get; set; } = string.Empty;
        public bool IsSelected { get; set; } = true;
        public bool IsAssigned { get; set; } = false;
    }

    public class DutyTimingMasterDetailsDto
    {
        public int TransNo { get; set; }
        public string Site { get; set; } = string.Empty;
        public int DepartmentCode { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public string FromTime { get; set; } = string.Empty;
        public string ToTime { get; set; } = string.Empty;
        public string? Remarks { get; set; }
        public string? ConflictWarning { get; set; }
        public List<DutyTimingEmployeeRowDto> Employees { get; set; } = new();
    }

    public class DutyTimingTransactionSummaryDto
    {
        public int TransNo { get; set; }
        public string Site { get; set; } = string.Empty;
        public int DepartmentCode { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public string FromTime { get; set; } = string.Empty;
        public string ToTime { get; set; } = string.Empty;
        public int TotalEmployees { get; set; }
        public string? Remarks { get; set; }
        public string? EnterBy { get; set; }
        public DateTime? EnteryTime { get; set; }
    }
}
