namespace SaftHR.API.DTO.Define
{
    public class BankRequestDto
    {
        public int BankNo { get; set; }
        public string BankName { get; set; } = "";
    }

    public class BankResponseDto
    {
        public int BankNo { get; set; }
        public string BankName { get; set; } = "";
    }
}
