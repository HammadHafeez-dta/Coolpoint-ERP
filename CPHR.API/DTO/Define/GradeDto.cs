namespace SaftHR.API.DTO.Define
{
    public class GradeRequestDto
    {
        public int GradeNo { get; set; }
        public string GradeName { get; set; } = "";
        public decimal MinimumSalary { get; set; }
        public decimal MaximumSalary { get; set; }
    }

    public class GradeResponseDto
    {
        public int GradeNo { get; set; }
        public string GradeName { get; set; } = "";
        public decimal MinimumSalary { get; set; }
        public decimal MaximumSalary { get; set; }
    }
}
