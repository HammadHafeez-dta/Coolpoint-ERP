using System;
using System.Collections.Generic;

namespace SaftHR.API.DTO.Transaction
{
    // ── Leave Application (Master/Child/Register) ─────────────────────────────
    public class LeaveRequestDto
    {
        public int ApplicationNo { get; set; }
        public DateTime ApplicationDate { get; set; }
        public int EmpCardNo { get; set; }
        public string? LeaveType { get; set; }
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public decimal TotalLeaves { get; set; }
        public string? Remarks { get; set; }
        public string? Reason { get; set; }

        public decimal ALUsed { get; set; }
        public decimal CLUsed { get; set; }
        public decimal SLUsed { get; set; }
        public decimal CPLUsed { get; set; }
    }

    public class LeaveResponseDto
    {
        public int ApplicationNo { get; set; }
        public DateTime ApplicationDate { get; set; }
        public string? LeaveType { get; set; }
    }

    // ── Leave Adjustments (Leave Register) ────────────────────────────────────
    public class LeaveAdjustmentDto
    {
        public int EmpCardNo { get; set; }
        public DateTime LeaveDate { get; set; }
        public decimal ALOpen { get; set; }
        public decimal CLOpen { get; set; }
        public decimal SLOpen { get; set; }
        public decimal CPLOpen { get; set; }
    }

    // ── Gazetted Leave ────────────────────────────────────────────────────────
    public class GazettedLeaveDto
    {
        public int ApplicationNo { get; set; }
        public DateTime LeaveDate { get; set; }
        public string? LeaveType { get; set; }
    }

    // ── Leave Application (HRM_LeaveApplication) ──────────────────────────────
    public class LeaveApplicationDto
    {
        public int TransactionNo { get; set; }
        public DateTime TransactionDate { get; set; }
        public string? Assignment { get; set; }
        public DateTime LeaveDate { get; set; }
        public int EmpCardNo { get; set; }
        public string? EmpName { get; set; }
        public string? DesignationName { get; set; }
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public string? LeaveType { get; set; }
        public decimal LeaveRequired { get; set; }
        public bool MoreThanOne { get; set; }
        public string? Reason { get; set; }
    }

    // ── Short Leave ───────────────────────────────────────────────────────────
    public class ShortLeaveDto
    {
        public int TransactionNo { get; set; }
        public DateTime TransactionDate { get; set; }
        public DateTime LeaveDate { get; set; }
        public int EmpCardNo { get; set; }
        public string? EmpName { get; set; }
        public DateTime FromTime { get; set; }
        public DateTime ToTime { get; set; }
        public string? LeaveType { get; set; }
        public string? Reason { get; set; }
    }
}
