using SaftHR.API.DTO.Transaction;

namespace SaftHR.API.Interface.Transaction
{
    public interface ISettlementDAL
    {
        Task<int> FinalSettlementMaxNOAsync(string site);
        Task<int> CheckSettlementAsync(int cardNo, string site);
        Task<decimal> GetOverTimeAsync(int cardNo, DateTime fromDate, DateTime toDate, string site);
        Task SaveFinalSettlementAsync(FinalSettlementDto dto, string site, string userId);
        Task<FinalSettlementDto?> EditFinalSettlementAsync(int settlementNo, string site);
        Task<FinalSettlementDto?> EditFinalSettlementCardNoAsync(int cardNo, string site);
        Task<List<FinalSettlementDto>> GetFinalSettlementsListAsync(string site);
    }
}
