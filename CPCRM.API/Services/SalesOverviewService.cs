using CPCRM.API.DTO;
using CPCRM.API.Interface;
using CPCRM.API.Models;
using Microsoft.EntityFrameworkCore;

namespace CPCRM.API.Services;

public record OverviewDailyTotal(DateTime Day, decimal Amount, int Deals, int Missing);

// The operational cards/distributions are current snapshots. Date filters apply only to
// won-deal close events, inquiry creation and recorded activities. Currency applies throughout.
public record OverviewPeriod(DateOnly From, DateOnly To)
{
    public DateTime StartUtc => DateTime.SpecifyKind(From.ToDateTime(TimeOnly.MinValue).AddHours(-5), DateTimeKind.Utc);
    public DateTime EndUtc => DateTime.SpecifyKind(To.AddDays(1).ToDateTime(TimeOnly.MinValue).AddHours(-5), DateTimeKind.Utc);
    public void Validate()
    {
        if (To < From || To.DayNumber - From.DayNumber > 365)
            throw new ArgumentException("Choose a date range of 1 to 366 days, with the start before the end.");
    }
    public static List<OverviewBucket> Fill(OverviewPeriod period, IEnumerable<OverviewBucket> source)
    {
        period.Validate();
        var byDate = source.ToDictionary(x => x.Date);
        return Enumerable.Range(0, period.To.DayNumber - period.From.DayNumber + 1)
            .Select(i => period.From.AddDays(i).ToString("yyyy-MM-dd"))
            .Select(day => byDate.TryGetValue(day, out var value) ? value : new OverviewBucket(day, 0m, 0, 0)).ToList();
    }
}

public class SalesOverviewService(CRMDbContext db)
{
    public async Task<SalesOverviewDto> Get(CrmActor actor, string? currency, DateOnly? from, DateOnly? to,
        bool viewInquiries, bool viewDeals, bool viewQuotations)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow.AddHours(5));
        var period = new OverviewPeriod(from ?? today.AddDays(-29), to ?? today);
        period.Validate();
        currency = string.IsNullOrWhiteSpace(currency) ? null : currency.Trim().ToUpperInvariant();
        if (currency != null && (currency.Length != 3 || !currency.All(char.IsAsciiLetterUpper)))
            throw new ArgumentException("Choose a three-letter currency code.");
        var currencies = await db.CrmDeals.AsNoTracking().Where(x => x.Site == actor.Site).Select(x => x.CurrencyCode)
            .Union(db.CrmLeads.AsNoTracking().Where(x => x.Site == actor.Site).Select(x => x.CurrencyCode))
            .Distinct().OrderBy(x => x).ToListAsync();
        currencies = currencies.Where(x => !string.IsNullOrWhiteSpace(x)).ToList();
        if (currencies.Count == 0) currencies.Add("PKR");
        currency = string.IsNullOrWhiteSpace(currency) ? (currencies.Contains("PKR") ? "PKR" : currencies[0]) : currency.ToUpperInvariant();
        if (currency.Length != 3 || !currency.All(char.IsAsciiLetterUpper)) throw new ArgumentException("Choose a three-letter currency code.");
        // A previously selected currency may have become empty; keep that explicit zero-data filter available.
        if (!currencies.Contains(currency)) { currencies.Add(currency); currencies.Sort(StringComparer.Ordinal); }
        var deals = db.CrmDeals.AsNoTracking().Where(x => x.Site == actor.Site && x.CurrencyCode == currency);
        var leads = db.CrmLeads.AsNoTracking().Where(x => x.Site == actor.Site && x.CurrencyCode == currency);
        var open = deals.Where(x => x.Stage != "Won" && x.Stage != "Lost");
        var won = deals.Where(x => x.Stage == "Won");
        var openValue = await open.SumAsync(x => (decimal?)x.Value) ?? 0m;
        var openCount = await open.CountAsync();
        var wonValue = await won.SumAsync(x => x.WonValue) ?? 0m;
        var wonCount = await won.CountAsync();
        var missingValues = await won.CountAsync(x => x.WonValue == null);
        var missingDates = await won.CountAsync(x => x.ClosedAt == null);
        var rawTrend = await DailyWins(won, period).ToListAsync();
        var trend = OverviewPeriod.Fill(period, rawTrend.Select(x => new OverviewBucket(x.Day.ToString("yyyy-MM-dd"), x.Amount, x.Deals, x.Missing)));
        var inquiryDistribution = await leads.GroupBy(x => x.LifecycleStatus).Select(g => new OverviewDistribution(g.Key, g.Count())).ToListAsync();
        var dealDistribution = await deals.GroupBy(x => x.Stage).Select(g => new OverviewDistribution(g.Key, g.Count())).ToListAsync();
        var cohort = leads.Where(x => x.CreatedAt >= period.StartUtc && x.CreatedAt < period.EndUtc);
        var withDeals = cohort.Where(l => deals.Any(d => d.LeadId == l.Id && d.CreatedAt >= l.CreatedAt && d.CreatedAt < period.EndUtc));
        var withSent = MilestoneCohort(db, cohort, deals, actor.Site, currency, period, false);
        var withWins = MilestoneCohort(db, cohort, deals, actor.Site, currency, period, true);
        var funnel = new OverviewFunnel(await cohort.CountAsync(), await withDeals.CountAsync(), await withSent.CountAsync(), await withWins.CountAsync());
        List<OverviewInquiry>? recentInquiries = null;
        List<OverviewActivity>? recentActivity = null;
        if (viewInquiries)
        {
            recentInquiries = await leads.Where(x => x.CreatedAt >= period.StartUtc && x.CreatedAt < period.EndUtc)
                .OrderByDescending(x => x.CreatedAt).ThenByDescending(x => x.Id).Take(6)
                .Select(x => new OverviewInquiry(x.Id, x.Title, x.Customer != null ? x.Customer.CompanyName : x.CustomerName, x.LifecycleStatus, x.CreatedAt)).ToListAsync();
            var events = db.CrmActivities.AsNoTracking().Where(x => x.Site == actor.Site && x.OccurredAt >= period.StartUtc && x.OccurredAt < period.EndUtc);
            if (!viewDeals) events = events.Where(x => x.DealId == null);
            if (!viewQuotations) events = events.Where(x => x.QuotationId == null);
            recentActivity = await events.Join(leads, a => a.LeadId, l => l.Id, (a, l) => new { a, l })
                .OrderByDescending(x => x.a.OccurredAt).ThenByDescending(x => x.a.Id).Take(6)
                .Select(x => new OverviewActivity(x.a.Id, x.a.LeadId, x.a.Summary, x.a.Type, x.a.ActorUserId, x.a.OccurredAt,
                    x.l.Title, x.l.Customer != null ? x.l.Customer.CompanyName : x.l.CustomerName)).ToListAsync();
        }
        return new(currency, currencies, period.From.ToString("yyyy-MM-dd"), period.To.ToString("yyyy-MM-dd"), "Asia/Karachi", DateTime.UtcNow,
            openValue, openCount, wonValue, wonCount, missingValues, missingDates, trend, funnel, inquiryDistribution, dealDistribution, recentInquiries, recentActivity);
    }

    // Shared query selectors let tests verify actual SQL Server translation without connecting.
    public static IQueryable<OverviewDailyTotal> DailyWins(IQueryable<CrmDeal> won, OverviewPeriod period) => won
        .Where(x => x.ClosedAt >= period.StartUtc && x.ClosedAt < period.EndUtc)
        .GroupBy(x => x.ClosedAt!.Value.AddHours(5).Date)
        .Select(g => new OverviewDailyTotal(g.Key, g.Sum(x => x.WonValue) ?? 0m, g.Count(), g.Count(x => x.WonValue == null)));

    public static IQueryable<CrmLead> MilestoneCohort(CRMDbContext db, IQueryable<CrmLead> cohort, IQueryable<CrmDeal> deals,
        string site, string currency, OverviewPeriod period, bool wonOnly) => wonOnly
        ? cohort.Where(l => deals.Any(d => d.LeadId == l.Id && d.CreatedAt >= l.CreatedAt && d.Stage == "Won" && d.ClosedAt < period.EndUtc &&
            db.CrmQuotations.Any(q => q.DealId == d.Id && q.LeadId == l.Id && q.Site == site && q.CurrencyCode == currency &&
                q.SentAt >= d.CreatedAt && q.SentAt <= d.ClosedAt)))
        : cohort.Where(l => deals.Any(d => d.LeadId == l.Id && d.CreatedAt >= l.CreatedAt && d.CreatedAt < period.EndUtc &&
            db.CrmQuotations.Any(q => q.DealId == d.Id && q.LeadId == l.Id && q.Site == site && q.CurrencyCode == currency &&
                q.SentAt >= d.CreatedAt && q.SentAt < period.EndUtc)));
}
