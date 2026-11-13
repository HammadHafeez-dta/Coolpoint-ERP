using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SaftHR.API.DTO.Transaction;

namespace SaftHR.API.Interface.Transaction
{
    public interface IDutyTimingDAL
    {
        Task<int> GetNextTransNoAsync(string site);
        Task<DutyTimingMasterDetailsDto> GetEmployeesForDutyTimingAsync(int departmentCode, DateTime fromDate, DateTime toDate, string fromTime, string toTime, string site);
        Task<DutyTimingMasterDetailsDto?> GetTransactionByNoAsync(int transNo, string site);
        Task<int> SaveDutyTimingTransactionAsync(SaveDutyTimingMasterDto dto, string site, string userId);
        Task<List<DutyTimingTransactionSummaryDto>> GetRecentTransactionsAsync(string site, int count = 20);
        Task<bool> DeleteTransactionAsync(int transNo, string site);
    }
}
