namespace SaftHR.API.DTO.Define
{
    public class StatusRequestDto
    {
        public int StatusNo { get; set; }
        public string StatusName { get; set; } = "";
    }

    public class StatusResponseDto
    {
        public int StatusNo { get; set; }
        public string StatusName { get; set; } = "";
    }
}
