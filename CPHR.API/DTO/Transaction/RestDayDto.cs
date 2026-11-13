using System;
using System.Collections.Generic;

namespace SaftHR.API.DTO.Transaction
{
    public class RestDayChildItemDto
    {
        public int EmpCardNo { get; set; }
        public string EmpName { get; set; } = string.Empty;
        public int DepartmentCode { get; set; }
        public string DesignationName { get; set; } = string.Empty;
    }

    public class SaveRestDayMasterDto
    {
        public int TransNo { get; set; }
        public int DepartmentCode { get; set; }
        public DateTime RestDate { get; set; }
        public string RestDay { get; set; } = string.Empty;
        public string? Remarks { get; set; }
        public List<RestDayChildItemDto> SelectedEmployees { get; set; } = new();
    }

    public class SaveWeeklyRestDayScheduleDto
    {
        public int DepartmentCode { get; set; }
        public List<int> EmpCardNos { get; set; } = new();
        public string RestDay { get; set; } = string.Empty;
        public string? Remarks { get; set; }
    }

    public class RestDayEmployeeRowDto
    {
        public int EmpCardNo { get; set; }
        public string EmpName { get; set; } = string.Empty;
        public int DepartmentCode { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public string DesignationName { get; set; } = string.Empty;
        public DateTime RestDate { get; set; }
        public string RestDay { get; set; } = string.Empty;
        public string WeeklyRestDays { get; set; } = string.Empty;
        public bool IsSelected { get; set; } = true;
        public bool IsAssigned { get; set; } = false;
    }

    public class RestDayMasterDetailsDto
    {
        public int TransNo { get; set; }
        public string Site { get; set; } = string.Empty;
        public int DepartmentCode { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public DateTime RestDate { get; set; }
        public string RestDay { get; set; } = string.Empty;
        public string? Remarks { get; set; }
        public List<RestDayEmployeeRowDto> Employees { get; set; } = new();
    }

    public class RestDayTransactionSummaryDto
    {
        public int TransNo { get; set; }
        public string Site { get; set; } = string.Empty;
        public int DepartmentCode { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public DateTime RestDate { get; set; }
        public string RestDay { get; set; } = string.Empty;
        public int TotalEmployees { get; set; }
        public string? Remarks { get; set; }
        public string? EnterBy { get; set; }
        public DateTime? EnteryTime { get; set; }
    }
}
