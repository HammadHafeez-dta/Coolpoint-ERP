namespace CPCRM.API.DTO;

public record OverviewBucket(string Date, decimal Amount, int Deals, int MissingValues);
public record OverviewDistribution(string Status, int Count);
public record OverviewFunnel(int Inquiries, int DealsCreated, int QuotationsSent, int DealsWon);
public record OverviewInquiry(int Id, string Title, string? Company, string LifecycleStatus, DateTime CreatedAt);
public record OverviewActivity(int Id, int LeadId, string Summary, string Type, string ActorUserId, DateTime OccurredAt, string InquiryTitle, string? Company);
public record SalesOverviewDto(
    string CurrencyCode, List<string> AvailableCurrencies, string From, string To, string TimeZone, DateTime AsOf,
    decimal OpenPipeline, int OpenOpportunities, decimal AcceptedValue, int WonDeals,
    int MissingWonValues, int MissingWonDates,
    List<OverviewBucket> Trend, OverviewFunnel Funnel, List<OverviewDistribution> InquiryDistribution, List<OverviewDistribution> DealDistribution,
    List<OverviewInquiry>? RecentInquiries, List<OverviewActivity>? RecentActivity);
