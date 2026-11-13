namespace SaftHR.API.DTO.Define
{
    public class ShiftRequestDto
    {
        public int ShiftNo { get; set; }
        public string ShiftType { get; set; } = "";
        public string ShiftName { get; set; } = "";
    }

    public class ShiftResponseDto
    {
        public int ShiftNo { get; set; }
        public string ShiftType { get; set; } = "";
        public string ShiftName { get; set; } = "";
    }
}
