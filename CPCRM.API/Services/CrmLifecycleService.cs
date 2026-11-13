using System.Data;
using CPCRM.API.DTO;
using CPCRM.API.Interface;
using CPCRM.API.Models;
using Microsoft.EntityFrameworkCore;

namespace CPCRM.API.Services;

public class CrmConflict(string message) : Exception(message);
public class CrmMissing() : Exception("CRM record not found.");

public class CrmLifecycleService(CRMDbContext db, ICrmDAL dal)
{
    public static void Expected(byte[] current, string? expected)
    {
        if (Convert.ToBase64String(current) != expected)
            throw new CrmConflict("This record has changed. Refresh and review the latest version.");
    }
    public static object LeadView(CrmLead x) => new {
        x.Id, x.LeadNumber, x.Title, x.CustomerId, CustomerName = x.Customer?.CompanyName ?? x.CustomerName,
        x.Category, x.EstimatedValue, x.Stage, x.LifecycleStatus, x.Priority, x.AssignedEngineer,
        x.ContactPerson, x.Email, x.Phone, x.Notes, x.Source, x.OwnerUserId, x.CurrencyCode,
        x.CreatedAt, x.UpdatedAt, x.RowVersion
    };
    public static object QuoteView(CrmQuotation q) => new {
        q.Id, q.QuotationNo, q.LeadId, q.DealId, q.CustomerName, q.ProjectTitle,
        q.Status, q.Version, q.SupersedesQuotationId, q.CurrencyCode, q.SubTotal, q.TaxPercent,
        q.TaxAmount, q.TotalAmount, q.ValidityDays, q.Terms, q.QuotationDate, q.SentAt,
        q.SentBy, q.DecidedAt, q.DecidedBy, q.DecisionNote, q.RowVersion,
        Items = q.Items.Select(i => new { i.Id, i.ItemDescription, i.EquipmentModel, i.Capacity, i.Quantity, i.UnitPrice, i.TotalPrice })
    };
    public async Task<CrmLead> Lead(int id, string site) => await dal.Lead(id, site) ?? throw new CrmMissing();
    public async Task<CrmQuotation> Quote(int id, string site) => await dal.Quotation(id, site) ?? throw new CrmMissing();
    public void Event(CrmActor a, int leadId, string type, string summary, int? dealId = null,
        int? quotationId = null, string? body = null, bool manual = false) => db.CrmActivities.Add(new() {
        Site = a.Site, LeadId = leadId, DealId = dealId, QuotationId = quotationId,
        Type = type, Summary = summary, Body = body, ActorUserId = a.UserId,
        Source = manual ? "Manual" : "System", Channel = type == "Call" ? "Phone" : "Internal"
    });

    public async Task<object> Leads(CrmActor a, string? search, string? status, string? owner, int? page, int pageSize, string? currency = null)
    {
        var query = dal.Leads(a.Site).AsNoTracking();
        if (!string.IsNullOrWhiteSpace(search)) query = query.Where(x => x.Title.Contains(search) ||
            (x.ContactPerson != null && x.ContactPerson.Contains(search)) ||
            (x.Customer != null && x.Customer.CompanyName.Contains(search)) || (x.Email != null && x.Email.Contains(search)));
        if (!string.IsNullOrWhiteSpace(status)) query = query.Where(x => x.LifecycleStatus == status);
        if (!string.IsNullOrWhiteSpace(owner)) query = query.Where(x => x.OwnerUserId == owner);
        if (!string.IsNullOrWhiteSpace(currency)) query = query.Where(x => x.CurrencyCode == currency);
        var total = await query.CountAsync();
        var size = Math.Clamp(pageSize, 1, 100); var number = Math.Max(page ?? 1, 1);
        var rows = await query.OrderByDescending(x => x.CreatedAt).ThenByDescending(x => x.Id)
            .Skip((number - 1) * size).Take(page.HasValue ? size : 100).ToListAsync();
        var items = rows.Select(LeadView).ToList();
        return page.HasValue ? new { items, totalCount = total, page = number, pageSize = size } : items;
    }
    public async Task<object> Detail(int id, CrmActor a, bool viewDeals = true, bool viewQuotations = true, bool viewProjects = true)
    {
        var lead = await Lead(id, a.Site);
        var deals = await db.CrmDeals.AsNoTracking().Where(x => x.Site == a.Site && x.LeadId == id).OrderBy(x => x.Id).ToListAsync();
        var quotes = await db.CrmQuotations.AsNoTracking().Include(x => x.Items).Where(x => x.Site == a.Site && x.LeadId == id)
            .OrderByDescending(x => x.Id).ToListAsync();
        var projectId = viewProjects ? await db.CrmProjects.Where(p => p.LeadId == id && p.Site == a.Site
            && (CrmProjectService.IsAdmin(a) || p.Tasks.Any(t => t.AssigneeUserId == a.UserId))).Select(p => (int?)p.Id).SingleOrDefaultAsync() : null;
        return new { lead = LeadView(lead), deals = viewDeals ? deals : new List<CrmDeal>(), quotations = viewQuotations ? quotes.Select(QuoteView) : Array.Empty<object>(), projectId };
    }
    private static void Apply(CrmLead lead, LeadInput dto)
    {
        lead.Title = dto.Title.Trim(); lead.ContactPerson = dto.ContactPerson?.Trim();
        lead.Email = dto.Email?.Trim(); lead.Phone = dto.Phone?.Trim(); lead.Category = dto.Category;
        lead.EstimatedValue = dto.EstimatedValue; lead.CurrencyCode = dto.CurrencyCode;
        lead.OwnerUserId = dto.OwnerUserId; lead.Source = dto.Source; lead.Notes = dto.Notes;
        lead.Priority = dto.Priority; lead.UpdatedAt = DateTime.UtcNow;
    }
    public async Task<object> SaveLead(int? id, LeadInput dto, CrmActor a)
    {
        await using var tx = await db.Database.BeginTransactionAsync();
        var lead = id.HasValue ? await Lead(id.Value, a.Site) : new CrmLead {
            LeadNumber = $"CP-{DateTime.UtcNow:yyyy}-{Guid.NewGuid():N}", Site = a.Site, CreatedBy = a.UserId
        };
        if (id.HasValue) Expected(lead.RowVersion, dto.RowVersion);
        Apply(lead, dto);
        if (!id.HasValue) {
            CrmRules.LeadTransition("New", dto.LifecycleStatus);
            lead.LifecycleStatus = dto.LifecycleStatus;
        }
        var name = dto.CustomerName.Trim();
        var customer = await db.CrmCustomers.FirstOrDefaultAsync(x => x.Site == a.Site && x.CompanyName == name);
        lead.Customer = customer ?? new CrmCustomer { CompanyName = name, Site = a.Site,
            ContactPerson = dto.ContactPerson, Email = dto.Email, Phone = dto.Phone, CreatedBy = a.UserId, CreatedAt = DateTime.UtcNow, IsActive = true };
        lead.CustomerName = name;
        if (!id.HasValue) db.CrmLeads.Add(lead);
        await db.SaveChangesAsync();
        Event(a, lead.Id, id.HasValue ? "LeadUpdated" : "LeadCreated", id.HasValue ? "Inquiry updated" : "Inquiry created");
        if (!id.HasValue && lead.LifecycleStatus != "New")
            Event(a, lead.Id, "LeadLifecycleChanged", $"Initial inquiry lifecycle assigned: {lead.LifecycleStatus}");
        await db.SaveChangesAsync();
        await CrmProjectService.EnsureQualified(db, lead, a);
        await tx.CommitAsync();
        return LeadView(lead);
    }
    public async Task<object> LeadState(int id, StateCommand input, CrmActor a)
    {
        await using var tx = await db.Database.BeginTransactionAsync();
        var lead = await Lead(id, a.Site); Expected(lead.RowVersion, input.RowVersion);
        CrmRules.LeadTransition(lead.LifecycleStatus, input.Stage);
        if (lead.LifecycleStatus == input.Stage) {
            await CrmProjectService.EnsureQualified(db, lead, a);
            await tx.CommitAsync(); return LeadView(lead);
        }
        lead.LifecycleStatus = input.Stage!; lead.UpdatedAt = DateTime.UtcNow;
        Event(a, id, "LeadLifecycleChanged", $"Inquiry marked {input.Stage}", body: input.Note);
        await db.SaveChangesAsync();
        await CrmProjectService.EnsureQualified(db, lead, a);
        await tx.CommitAsync(); return LeadView(lead);
    }
    public async Task<CrmDeal> CreateDeal(int id, DealInput input, CrmActor a)
    {
        await using var tx = await db.Database.BeginTransactionAsync();
        var lead = await Lead(id, a.Site);
        if (lead.CurrencyCode == "UNK") throw new CrmConflict("Set the inquiry's currency before creating a deal.");
        if (lead.LifecycleStatus == "Disqualified") throw new CrmConflict("A disqualified inquiry cannot open a deal.");
        var deal = new CrmDeal { Site = a.Site, LeadId = id, Title = input.Title.Trim(), Value = input.Value,
            OwnerUserId = lead.OwnerUserId, CurrencyCode = lead.CurrencyCode, Stage = lead.LifecycleStatus };
        db.CrmDeals.Add(deal); await db.SaveChangesAsync();
        Event(a, id, "DealCreated", "Deal created", deal.Id);
        await db.SaveChangesAsync(); await tx.CommitAsync(); return deal;
    }
    // Every deal/quotation command locks the same parent first, avoiding competing winners.
    private async Task<CrmDeal> LockedDeal(int id, string site) => await db.CrmDeals
        .FromSqlInterpolated($"SELECT * FROM dbo.CRM_Deals WITH (UPDLOCK, HOLDLOCK) WHERE Id={id} AND Site={site}")
        .SingleOrDefaultAsync() ?? throw new CrmMissing();
    private static void Open(CrmDeal deal)
    {
        if (deal.Stage is "Won" or "Lost") throw new CrmConflict("The deal is closed.");
    }
    public async Task<CrmDeal> DealState(int id, StateCommand input, CrmActor a, bool lose)
    {
        await using var tx = await db.Database.BeginTransactionAsync();
        var deal = await LockedDeal(id, a.Site); Open(deal); Expected(deal.RowVersion, input.RowVersion);
        var next = lose ? "Lost" : input.Stage;
        if (!lose && next == "Lost") throw new CrmConflict("Use the explicit mark-lost action to close a deal.");
        CrmRules.DealTransition(deal.Stage, next);
        deal.Stage = next!; deal.UpdatedAt = DateTime.UtcNow;
        if (lose) { deal.ClosedAt = DateTime.UtcNow; deal.ClosedBy = a.UserId; deal.LossReason = input.Note; }
        Event(a, deal.LeadId, "DealStageChanged", $"Deal marked {next}", deal.Id, body: input.Note);
        await db.SaveChangesAsync(); await tx.CommitAsync(); return deal;
    }
    public async Task<object> SaveQuotation(int dealId, int? quoteId, QuotationInput input, CrmActor a)
    {
        await using var tx = await db.Database.BeginTransactionAsync();
        var deal = await LockedDeal(dealId, a.Site); Open(deal);
        if (deal.Stage == "New") throw new CrmConflict("Contact or qualify the deal before creating a quotation.");
        var lead = await Lead(deal.LeadId, a.Site);
        var q = quoteId.HasValue ? await Quote(quoteId.Value, a.Site) : new CrmQuotation {
            QuotationNo = $"QT-{DateTime.UtcNow:yyyy}-{Guid.NewGuid():N}", DealId = deal.Id, LeadId = lead.Id,
            CustomerId = lead.CustomerId, CustomerName = lead.Customer?.CompanyName ?? lead.CustomerName ?? "",
            CurrencyCode = deal.CurrencyCode, Site = a.Site, CreatedBy = a.UserId
        };
        if (q.Status != "Draft" || q.DealId != dealId) throw new CrmConflict("Only a draft for this deal can be edited.");
        if (quoteId.HasValue) Expected(q.RowVersion, input.RowVersion);
        q.ProjectTitle = input.ProjectTitle.Trim(); q.TaxPercent = input.TaxPercent;
        q.ValidityDays = input.ValidityDays; q.Terms = input.Terms;
        db.CrmQuotationItems.RemoveRange(q.Items); q.Items.Clear();
        foreach (var line in input.Items) q.Items.Add(new CrmQuotationItem {
            ItemDescription = line.ItemDescription.Trim(), EquipmentModel = line.EquipmentModel,
            Capacity = line.Capacity, Quantity = line.Quantity, UnitPrice = decimal.Round(line.UnitPrice, 2, MidpointRounding.AwayFromZero),
            TotalPrice = decimal.Round(line.UnitPrice, 2, MidpointRounding.AwayFromZero) * line.Quantity
        });
        q.SubTotal = q.Items.Sum(x => x.TotalPrice);
        q.TaxAmount = decimal.Round(q.SubTotal * q.TaxPercent / 100, 2, MidpointRounding.AwayFromZero);
        q.TotalAmount = q.SubTotal + q.TaxAmount;
        if (q.TotalAmount > 9999999999999999.99m) throw new ArgumentException("Quotation exceeds the supported monetary limit.");
        if (!quoteId.HasValue) db.CrmQuotations.Add(q);
        await db.SaveChangesAsync(); Event(a, lead.Id, "QuotationSaved", quoteId.HasValue ? "Quotation draft updated" : "Quotation draft created", deal.Id, q.Id);
        await db.SaveChangesAsync(); await tx.CommitAsync(); return QuoteView(q);
    }
    public async Task<object> QuotationState(int id, string action, StateCommand input, CrmActor a)
    {
        var parentId = await db.CrmQuotations.AsNoTracking().Where(x => x.Id == id && x.Site == a.Site)
            .Select(x => x.DealId).SingleOrDefaultAsync();
        if (parentId == null) throw new CrmConflict("Link this legacy quotation to a deal before changing its state.");
        await using var tx = await db.Database.BeginTransactionAsync();
        var deal = await LockedDeal(parentId.Value, a.Site);
        var q = await Quote(id, a.Site);
        if (q.LeadId != deal.LeadId || q.CurrencyCode != deal.CurrencyCode || q.CurrencyCode == "UNK")
            throw new CrmConflict("Quotation and deal must belong to the same inquiry and currency.");
        // Safe command replay returns durable state, without adding history again.
        var target = action switch { "send" => "Sent", "accept" => "Accepted", "reject" => "Rejected", "request-revision" => "RevisionRequested", _ => throw new ArgumentException("Unknown action.") };
        if (q.Status == target) return new { quotation = QuoteView(q), deal };
        Open(deal); Expected(q.RowVersion, input.RowVersion);
        if (action == "send") {
            if (deal.Stage == "New") throw new CrmConflict("Contact or qualify the deal before sending a quotation.");
            if (q.Status != "Draft" || q.Items.Count == 0 || q.TotalAmount <= 0) throw new CrmConflict("Only a complete draft can be sent.");
            if (await db.CrmQuotations.AnyAsync(x => x.DealId == deal.Id && x.Site == a.Site && x.Status == "Sent"))
                throw new CrmConflict("Resolve the current sent quotation first.");
            q.SentAt = DateTime.UtcNow; q.SentBy = a.UserId; deal.Stage = "ProposalSent";
            if (q.SupersedesQuotationId is int prior) {
                var predecessor = await Quote(prior, a.Site);
                if (predecessor.Status != "RevisionRequested") throw new CrmConflict("The predecessor is not awaiting revision.");
                predecessor.Status = "Superseded";
            }
        } else {
            if (q.Status != "Sent") throw new CrmConflict("Only a sent quotation can receive a decision.");
            q.DecidedAt = DateTime.UtcNow; q.DecidedBy = a.UserId; q.DecisionNote = input.Note;
            if (action == "accept") {
                deal.Stage = "Won"; deal.WonValue = q.TotalAmount; deal.ClosedAt = DateTime.UtcNow; deal.ClosedBy = a.UserId;
                var others = await db.CrmQuotations.Where(x => x.DealId == deal.Id && x.Id != id &&
                    (x.Status == "Sent" || x.Status == "Draft" || x.Status == "RevisionRequested")).ToListAsync();
                foreach (var other in others) { other.Status = "Superseded"; Event(a, deal.LeadId, "QuotationSuperseded", "Quotation superseded by accepted offer", deal.Id, other.Id); }
            }
            if (action == "request-revision") {
                var successor = new CrmQuotation {
                    QuotationNo = $"QT-{DateTime.UtcNow:yyyy}-{Guid.NewGuid():N}", DealId = deal.Id, LeadId = q.LeadId,
                    CustomerId = q.CustomerId, CustomerName = q.CustomerName, ProjectTitle = q.ProjectTitle,
                    Version = q.Version + 1, SupersedesQuotationId = q.Id, Site = a.Site, CreatedBy = a.UserId,
                    CurrencyCode = q.CurrencyCode, SubTotal = q.SubTotal, TaxPercent = q.TaxPercent, TaxAmount = q.TaxAmount,
                    TotalAmount = q.TotalAmount, ValidityDays = q.ValidityDays, Terms = q.Terms,
                    Items = q.Items.Select(i => new CrmQuotationItem { ItemDescription = i.ItemDescription,
                        EquipmentModel = i.EquipmentModel, Capacity = i.Capacity, Quantity = i.Quantity, UnitPrice = i.UnitPrice, TotalPrice = i.TotalPrice }).ToList()
                };
                db.CrmQuotations.Add(successor);
                await db.SaveChangesAsync(); Event(a, deal.LeadId, "RevisionCreated", $"Revision {successor.Version} draft created", deal.Id, successor.Id);
            }
        }
        q.Status = target; deal.UpdatedAt = DateTime.UtcNow;
        Event(a, deal.LeadId, "Quotation" + target, $"Quotation marked {target}", deal.Id, q.Id, input.Note);
        if (action is "send" or "accept") Event(a, deal.LeadId, "DealStageChanged", $"Deal marked {deal.Stage}", deal.Id);
        await db.SaveChangesAsync(); await tx.CommitAsync(); return new { quotation = QuoteView(q), deal };
    }
}
