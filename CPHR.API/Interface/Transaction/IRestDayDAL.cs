using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SaftHR.API.DTO.Transaction;

namespace SaftHR.API.Interface.Transaction
{
    public interface IRestDayDAL
    {
        Task<int> GetNextTransNoAsync(string site);
        Task<int> GetNextWeeklyTransNoAsync(string site);
        Task<RestDayMasterDetailsDto> GetEmployeesForRestDayAsync(int departmentCode, DateTime restDate, string site);
        Task<RestDayMasterDetailsDto?> GetTransactionByNoAsync(int transNo, string site);
        Task<int> SaveRestDayTransactionAsync(SaveRestDayMasterDto dto, string site, string userId);
        Task<int> SaveWeeklyRestDayScheduleAsync(SaveWeeklyRestDayScheduleDto dto, string site, string userId);
        Task<List<RestDayTransactionSummaryDto>> GetRecentTransactionsAsync(string site, int count = 20);
        Task<bool> DeleteTransactionAsync(int transNo, string site);
    }
}
