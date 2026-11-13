namespace SaftHR.API.DTO.Define
{
    public class CategoryRequestDto
    {
        public int CategoryNo { get; set; }
        public string CategoryName { get; set; } = "";
    }

    public class CategoryResponseDto
    {
        public int CategoryNo { get; set; }
        public string CategoryName { get; set; } = "";
    }
}
