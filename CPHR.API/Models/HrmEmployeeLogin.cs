using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SaftHR.API.Models
{
    [Table("HrmEmployeeLogin")]
    public partial class HrmEmployeeLogin
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int EmpCardNo { get; set; }

        [Required]
        [StringLength(20)]
        public string Cnic { get; set; } = null!;

        [StringLength(30)]
        public string? PhoneNo { get; set; }

        [Required]
        [StringLength(255)]
        public string PinHash { get; set; } = null!;

        [Required]
        [StringLength(50)]
        public string Site { get; set; } = "SAFT";

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? LastLoginAt { get; set; }
    }
}
