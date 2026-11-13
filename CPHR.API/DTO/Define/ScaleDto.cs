namespace SaftHR.API.DTO.Define
{
    public class ScaleRequestDto
    {
        public int ScaleId { get; set; }
        public string ScaleName { get; set; } = "";
    }

    public class ScaleResponseDto
    {
        public int ScaleId { get; set; }
        public string? ScaleName { get; set; }
        public string? Site { get; set; }
    }
}
