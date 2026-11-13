namespace SaftHR.API.DTO.Define
{
    public class LocationRequestDto
    {
        public int LocationNo { get; set; }
        public string LocationName { get; set; } = "";
    }

    public class LocationResponseDto
    {
        public int LocationNo { get; set; }
        public string LocationName { get; set; } = "";
    }
}
