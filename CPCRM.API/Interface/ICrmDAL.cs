using CPCRM.API.Models;
namespace CPCRM.API.Interface;

public interface ICrmDAL
{
    IQueryable<CrmLead> Leads(string site);
    Task<CrmLead?> Lead(int id, string site);
    Task<CrmQuotation?> Quotation(int id, string site);
}
