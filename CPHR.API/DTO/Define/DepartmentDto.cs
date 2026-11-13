namespace SaftHR.API.DTO.Define
{
    public class DepartmentRequestDto
    {
        public int DepartmentNo { get; set; }
        public string DepartmentName { get; set; } = "";
    }

    public class DepartmentResponseDto
    {
        public int DepartmentNo { get; set; }
        public string DepartmentName { get; set; } = "";
    }
}
