import api from "@/shared/services/api";

export interface CrmLead {
  id: number; leadNumber: string; title: string; customerId?: number; customerName?: string;
  category: string; estimatedValue: number; stage: string; lifecycleStatus: string;
  currencyCode: string; priority: string; assignedEngineer?: string; ownerUserId?: string;
  contactPerson?: string; phone?: string; email?: string; notes?: string; source?: string;
  createdAt: string; updatedAt?: string; rowVersion: string;
}
export interface CreateLeadPayload {
  lifecycleStatus?: string;
  title: string; customerName: string; category: string; estimatedValue: number;
  stage?: string; priority: string; assignedEngineer?: string; ownerUserId?: string;
  contactPerson?: string; phone?: string; email?: string; notes?: string; source?: string;
  currencyCode?: string; rowVersion?: string;
}
export interface CrmCustomer {
  id: number; companyName: string; contactPerson?: string; email?: string;
  phone?: string; city?: string; industry?: string; isActive: boolean;
}
export interface CrmQuotationItem {
  id?: number; itemDescription: string; equipmentModel?: string; capacity?: string;
  quantity: number; unitPrice: number; totalPrice?: number;
}
export interface CrmQuotation {
  id: number; quotationNo: string; leadId?: number; dealId?: number; customerName: string;
  projectTitle: string; subTotal: number; taxPercent: number; taxAmount: number; totalAmount: number;
  status: string; version: number; supersedesQuotationId?: number; currencyCode: string;
  validityDays: number | null; quotationDate: string | null; terms?: string; sentAt?: string;
  decidedAt?: string; decidedBy?: string; decisionNote?: string; rowVersion: string;
  items: CrmQuotationItem[];
}
export interface CrmDeal {
  id: number; leadId: number; title: string; ownerUserId?: string; stage: string; value: number;
  currencyCode: string; wonValue?: number; rowVersion: string; lossReason?: string;
}
export interface CrmActivity {
  id: number; type: string; summary: string; body?: string; actorUserId: string;
  occurredAt: string; source: string; channel: string;
}
export interface CrmDashboardStats {
  totalPipelineValue: number; activeInquiriesCount: number; totalWonValue: number;
  wonCount: number; conversionRate: number; currencyCode?: string;
}
export interface Page<T> { items: T[]; totalCount: number; page: number; pageSize: number }
export interface LeadDetail { lead: CrmLead; deals: CrmDeal[]; quotations: CrmQuotation[]; projectId?: number }
export interface QuoteInput { projectTitle: string; taxPercent: number; validityDays: number; terms?: string; items: CrmQuotationItem[]; rowVersion?: string }

// API errors intentionally propagate. Business screens never substitute sample records.
export const crmService = {
  getDashboardStats: async (currency = "PKR") => (await api.get<CrmDashboardStats>("/crm/dashboard-stats", { params: { currency } })).data,
  getLeads: async () => (await api.get<CrmLead[]>("/crm/leads")).data,
  listLeads: async (params: Record<string, string | number>) => (await api.get<Page<CrmLead>>("/crm/leads", { params })).data,
  detail: async (id: number) => (await api.get<LeadDetail>(`/crm/leads/${id}/detail`)).data,
  owners: async () => (await api.get<{ userId: string; name: string }[]>("/crm/owners")).data,
  createLead: async (data: CreateLeadPayload) => (await api.post<CrmLead>("/crm/leads", data)).data,
  editLead: async (id: number, data: CreateLeadPayload) => (await api.patch<CrmLead>(`/crm/leads/${id}`, data)).data,
  updateLeadStage: async (id: number, stage: string) => { await api.patch(`/crm/leads/${id}/stage`, JSON.stringify(stage), { headers: { "Content-Type": "application/json" } }); },
  leadState: async (lead: CrmLead, stage: string) => api.post(`/crm/leads/${lead.id}/lifecycle`, { stage, rowVersion: lead.rowVersion }),
  activities: async (id: number, beforeId?: number) => (await api.get<{ items: CrmActivity[]; nextCursor: number | null }>(`/crm/leads/${id}/activities`, { params: { beforeId } })).data,
  activity: async (id: number, type: string, body: string) => api.post(`/crm/leads/${id}/activities`, { type, body }),
  deals: async (page = 1, stage?: string, currency?: string, scope?: string) => (await api.get<Page<CrmDeal>>("/crm/deals", { params: { page, pageSize: 25, stage, currency, scope } })).data,
  createDeal: async (id: number, title: string, value: number) => api.post(`/crm/leads/${id}/deals`, { title, value }),
  dealState: async (deal: CrmDeal, stage: string, note?: string) => api.post(`/crm/deals/${deal.id}/${stage === "Lost" ? "lose" : "stage"}`, { stage, note, rowVersion: deal.rowVersion }),
  getCustomers: async () => (await api.get<CrmCustomer[]>("/crm/customers")).data,
  getQuotations: async () => (await api.get<CrmQuotation[]>("/crm/quotations")).data,
  saveQuote: async (dealId: number, data: QuoteInput, quoteId?: number) => quoteId
    ? api.patch(`/crm/quotations/${quoteId}`, data) : api.post(`/crm/deals/${dealId}/quotations`, data),
  quoteState: async (q: CrmQuotation, action: string, note: string) => api.post(`/crm/quotations/${q.id}/${action}`, { rowVersion: q.rowVersion, note }),
};
