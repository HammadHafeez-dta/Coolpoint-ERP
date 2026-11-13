using System;

namespace SaftHR.API.DTO.Transaction
{
    public class AttendanceDto
    {
        public int EmpCard { get; set; }
        public string? EmpName { get; set; }
        public string? DepartmentName { get; set; }
        public string? DesignationName { get; set; }
        public DateTime AttendanceDate { get; set; }
        public DateTime? TimeIn { get; set; }
        public DateTime? TimeOut { get; set; }
        public int TotalSeconds { get; set; }
        public int TotalHours { get; set; }
        public int TotalLateMinutes { get; set; }
        public string? InOutNo { get; set; }
        public int LateArrival { get; set; }
        public int EarlyGoing { get; set; }
        public int WorkingHours { get; set; }
        public string? Remarks { get; set; }
        public bool Absent { get; set; }
        
        public DateTime? EmpJoiningDate { get; set; }
        public string? EmpShift { get; set; }
        public DateTime? InTimeDefine { get; set; }
        public string? AttendanceType { get; set; }
        public decimal TotalDays { get; set; }
        
        public bool Instatus { get; set; }
        public bool outStatus { get; set; }
        public string? Action { get; set; }
        public string? Reason { get; set; }

        // For Machine online
        public string? UserID { get; set; }
        public DateTime CheckTime { get; set; }
        public string? CheckType { get; set; }
        public string? SensorID { get; set; }
        public string? VerifyCode { get; set; }
    }

    public class MachineEmployeeDto
    {
        public string? BADGENUMBER { get; set; }
        public string? NAME { get; set; }
        public string? GENDER { get; set; }
        public string? TITLE { get; set; }
        public string? PAGER { get; set; }
        public DateTime? BIRTHDAY { get; set; }
        public DateTime? HIREDDAY { get; set; }
        public string? STREET { get; set; }
        public string? CITY { get; set; }
        public string? STATE { get; set; }
        public string? ZIP { get; set; }
        public string? OPHONE { get; set; }
        public string? FPHONE { get; set; }
        public short? VERIFICATIONMETHOD { get; set; }
        public short? DEFAULTDEPTID { get; set; }
        public short? SECURITYFLAGS { get; set; }
        public short? ATT { get; set; }
        public short? INLATE { get; set; }
        public short? OUTEARLY { get; set; }
        public short? OVERTIME { get; set; }
        public short? SEP { get; set; }
        public short? HOLIDAY { get; set; }
        public string? MINZU { get; set; }
        public string? PASSWORD { get; set; }
        public short? LUNCHDURATION { get; set; }
        public string? MVerifyPass { get; set; }
        public byte[]? PHOTO { get; set; }
        public string? SSN { get; set; }
    }
}
