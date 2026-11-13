using SaftHR.API.DTO.Transaction;
using SaftHR.API.Models;

namespace SaftHR.API.Interface.Transaction
{
    public interface ILoanDAL
    {
        Task<int> LoanMaxNOAsync(string site);
        Task<List<LoanType>> GetLoanTypesAsync();
        Task SaveLoansAsync(LoanDto dto, string site, string userId);
        Task<LoanDto?> GetLoanInfoAsync(int transactionNo, string site);
        Task<List<LoanDto>> GetLoansListAsync(string site);
        Task<bool> CheckEmpLongTermLoanAsync(int empcard, string site);
        Task<bool> CheckEmpProvidentFundLoanAsync(int empcard, string site);
        
        Task DeleteLoanLedgerAsync(int loanTransactionNo, string site);
        Task SaveLoanLedgerTempAsync(LoanLedgerDto dto, string site);
        Task DeleteLoanLedgerTempAsync();
        Task SaveLoanLedgerAsync(LoanLedgerDto dto, string site);
        
        Task<int> LoanDeductionsMaxNOAsync(string site);
        Task SaveLoanDeductionsAsync(LoanDeductionDto dto, string site, string userId);
        Task DeleteLoanDeductionsAsync(int transactionNo, string site);
        Task<LoanDeductionDto?> GetLoanDeductionsInfoAsync(int transactionNo, string site);
        Task<List<LoanDeduction>> GetLoansDeductionsAsync(int transactionNo, string site);
        
        Task<decimal> CheckEmpLoanInstalmentAsync(int empcard, string site);
        
        Task<int> LoanReturnMaxNOAsync(string site);
        Task SaveLoanReturnAsync(LoanReturnDto dto, string site, string userId);
        Task<LoanReturnDto?> GetPfLoanReturnInfoAsync(int transactionNo, string site);
    }
}
