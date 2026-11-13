using CPCRM.API.Interface;
using CPCRM.API.Models;
using Microsoft.EntityFrameworkCore;
namespace CPCRM.API.DAL;

// Scoped read repository. Lifecycle writes are coordinated by one transactional service.
public class CrmDAL(CRMDbContext db) : ICrmDAL
{
    public IQueryable<CrmLead> Leads(string site) => db.CrmLeads.Include(x => x.Customer).Where(x => x.Site == site);
    public Task<CrmLead?> Lead(int id, string site) => Leads(site).SingleOrDefaultAsync(x => x.Id == id);
    public Task<CrmQuotation?> Quotation(int id, string site) => db.CrmQuotations.Include(x => x.Items)
        .SingleOrDefaultAsync(x => x.Id == id && x.Site == site);
}
