namespace SaftHR.API.DTO.Define
{
    public class DesignationRequestDto
    {
        public int DesignationNo { get; set; }
        public string DesignationName { get; set; } = "";
        public int GradeID { get; set; }
    }

    public class DesignationResponseDto
    {
        public int DesignationNo { get; set; }
        public string DesignationName { get; set; } = "";
        public int GradeID { get; set; }
    }
}
