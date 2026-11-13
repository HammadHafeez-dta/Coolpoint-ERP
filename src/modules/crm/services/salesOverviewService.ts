import api from "@/shared/services/api";

export interface OverviewBucket { date: string; amount: number; deals: number; missingValues: number }
export interface OverviewDistribution { status: string; count: number }
export interface OverviewInquiry { id: number; title: string; company?: string; lifecycleStatus: string; createdAt: string }
export interface OverviewActivity { id: number; leadId: number; summary: string; type: string; actorUserId: string; occurredAt: string; inquiryTitle: string; company?: string }
export interface SalesOverviewData {
  currencyCode: string; availableCurrencies: string[]; from: string; to: string; timeZone: string; asOf: string;
  openPipeline: number; openOpportunities: number; acceptedValue: number; wonDeals: number;
  missingWonValues: number; missingWonDates: number;
  trend: OverviewBucket[]; funnel: { inquiries: number; dealsCreated: number; quotationsSent: number; dealsWon: number };
  inquiryDistribution: OverviewDistribution[]; dealDistribution: OverviewDistribution[];
  recentInquiries: OverviewInquiry[] | null; recentActivity: OverviewActivity[] | null;
}

export const salesOverviewService = {
  get: async (filters: { currency?: string; from: string; to: string }, signal?: AbortSignal) =>
    (await api.get<SalesOverviewData>("/crm/sales-overview", { params: filters, signal })).data,
};
