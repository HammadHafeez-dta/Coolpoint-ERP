import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { errorMessage, selectClass, inquiryLifecycleStates } from "../utils/crmUi";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/shared/components/ui/sheet";
import { crmService, type CrmLead, type CrmDeal, type CrmQuotation, type QuoteInput, type CreateLeadPayload } from "../services/crmService";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="grid gap-1.5 text-xs font-semibold text-foreground">{label}{children}</label>;
}

function Editor({ title, description, close, save, children }: { title: string; description: string; close: () => void; save: () => Promise<unknown>; children: ReactNode }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  return <Sheet open onOpenChange={open => { if (!open && !busy) close(); }}>
    <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
      <SheetHeader><SheetTitle>{title}</SheetTitle><SheetDescription>{description}</SheetDescription></SheetHeader>
      <form className="mt-6 space-y-5" onSubmit={async event => {
        event.preventDefault(); if (busy) return; setBusy(true); setError("");
        try { await save(); close(); } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
      }}>
        <fieldset disabled={busy} className="space-y-5">{children}</fieldset>
        {error && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2 border-t pt-4"><Button type="button" variant="outline" disabled={busy} onClick={close}>Cancel</Button><Button disabled={busy}>{busy ? "Saving…" : "Save"}</Button></div>
      </form>
    </SheetContent>
  </Sheet>;
}

export function LeadEditor({ lead, close, saved }: { lead?: CrmLead; close: () => void; saved: (lead: CrmLead) => Promise<unknown> }) {
  const [form, setForm] = useState<CreateLeadPayload>(lead ? { ...lead, customerName: lead.customerName || "" } : {
    title: "", customerName: "", category: "Industrial Chiller", estimatedValue: 0,
    currencyCode: "PKR", priority: "Medium", ownerUserId: "", contactPerson: "", email: "", phone: "", notes: "", source: "", lifecycleStatus: "New"
  });
  const owners = useQuery({ queryKey: ["crm", "owners"], queryFn: crmService.owners, retry: false });
  const text = (key: keyof CreateLeadPayload, label: string, required = false, type = "text", maxLength = 150) => <Field label={label}><Input type={type} required={required} maxLength={maxLength} value={String(form[key] ?? "")} onChange={e => setForm({ ...form, [key]: e.target.value })} /></Field>;
  return <Editor title={lead ? "Edit inquiry" : "New HVAC inquiry"} description="Keep the client, commercial scope and responsible owner together." close={close} save={async () => {
    const result = lead ? await crmService.editLead(lead.id, form) : await crmService.createLead(form); await saved(result);
  }}>
    {!lead && <Field label="Initial lifecycle"><select className={selectClass} value={form.lifecycleStatus || "New"} onChange={e => setForm({ ...form, lifecycleStatus: e.target.value })}>{inquiryLifecycleStates.map(status => <option key={status} value={status}>{status === "New" ? "New (default)" : status}</option>)}</select></Field>}
    {text("title", "Inquiry title", true, "text", 250)}{text("customerName", "Company", true, "text", 200)}
    <div className="grid sm:grid-cols-2 gap-4">{text("contactPerson", "Contact person")}{text("email", "Email", false, "email")}{text("phone", "Phone", false, "text", 50)}{text("source", "Source", false, "text", 100)}</div>
    <div className="grid sm:grid-cols-2 gap-4">
      <Field label="Equipment category"><select className={selectClass} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{[...new Set([form.category, "Industrial Chiller", "AHU / VRF", "Cold Storage", "Package Units", "Other"])].map(x => <option key={x}>{x}</option>)}</select></Field>
      <Field label="Owner"><select className={selectClass} value={form.ownerUserId || ""} onChange={e => setForm({ ...form, ownerUserId: e.target.value || undefined })}><option value="">Unassigned</option>{owners.data?.map(o => <option key={o.userId} value={o.userId}>{o.name}</option>)}</select></Field>
      <Field label="Estimated value"><Input type="number" min="0" step="0.01" required value={form.estimatedValue} onChange={e => setForm({ ...form, estimatedValue: Number(e.target.value) })} /></Field>
      <Field label="Currency"><Input required maxLength={3} pattern="[A-Z]{3}" value={form.currencyCode || "PKR"} onChange={e => setForm({ ...form, currencyCode: e.target.value.toUpperCase() })} /></Field>
      <Field label="Priority"><select className={selectClass} value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>{["Low", "Medium", "High"].map(x => <option key={x}>{x}</option>)}</select></Field>
    </div>
    {owners.isError && <p role="alert" className="text-sm text-destructive">Owners could not be loaded. <button type="button" className="underline" onClick={() => owners.refetch()}>Retry</button></p>}
    <Field label="Notes"><Textarea maxLength={10000} value={form.notes || ""} onChange={e => setForm({ ...form, notes: e.target.value })} /></Field>
  </Editor>;
}

export function DealEditor({ lead, close, saved }: { lead: CrmLead; close: () => void; saved: () => Promise<unknown> }) {
  const [title, setTitle] = useState(lead.title); const [value, setValue] = useState(lead.estimatedValue);
  return <Editor title="Create deal" description={`A separate sales opportunity in ${lead.currencyCode}.`} close={close} save={async () => { await crmService.createDeal(lead.id, title, value); await saved(); }}>
    <Field label="Deal title"><Input required maxLength={250} value={title} onChange={e => setTitle(e.target.value)} /></Field>
    <Field label="Estimated value"><Input required type="number" min="0" step="0.01" value={value} onChange={e => setValue(Number(e.target.value))} /></Field>
  </Editor>;
}

export function QuotationEditor({ deal, quotation, close, saved }: { deal: CrmDeal; quotation?: CrmQuotation; close: () => void; saved: () => Promise<unknown> }) {
  const [form, setForm] = useState<QuoteInput>(quotation ? { ...quotation, validityDays: quotation.validityDays ?? 30 } : {
    projectTitle: deal.title, taxPercent: 18, validityDays: 30, terms: "",
    items: [{ itemDescription: "", quantity: 1, unitPrice: 0 }]
  });
  const updateLine = (index: number, key: string, value: string | number) => setForm({ ...form, items: form.items.map((x, i) => i === index ? { ...x, [key]: value } : x) });
  return <Editor title={quotation ? `Edit quotation · revision ${quotation.version}` : "New project quotation"} description={`Draft commercial terms in ${deal.currencyCode}. Totals are calculated by the server.`} close={close} save={async () => { await crmService.saveQuote(deal.id, form, quotation?.id); await saved(); }}>
    <Field label="Project title"><Input required maxLength={250} value={form.projectTitle} onChange={e => setForm({ ...form, projectTitle: e.target.value })} /></Field>
    <div className="grid grid-cols-2 gap-4"><Field label="Tax (%)"><Input type="number" min="0" max="100" step="0.01" required value={form.taxPercent} onChange={e => setForm({ ...form, taxPercent: Number(e.target.value) })} /></Field><Field label="Validity (days)"><Input type="number" min="1" max="365" required value={form.validityDays} onChange={e => setForm({ ...form, validityDays: Number(e.target.value) })} /></Field></div>
    <div className="space-y-5"><h3 className="font-semibold text-sm">Equipment and services</h3>{form.items.map((line, i) => <div key={i} className="space-y-3 border-b pb-5">
      <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Line {i + 1}</span><Button type="button" size="icon" variant="ghost" aria-label={`Remove line ${i + 1}`} disabled={form.items.length === 1} onClick={() => setForm({ ...form, items: form.items.filter((_, n) => n !== i) })}><Trash2 size={15} /></Button></div>
      <Field label="Description"><Input required maxLength={300} value={line.itemDescription} onChange={e => updateLine(i, "itemDescription", e.target.value)} /></Field>
      <div className="grid grid-cols-2 gap-3"><Field label="Model"><Input maxLength={100} value={line.equipmentModel || ""} onChange={e => updateLine(i, "equipmentModel", e.target.value)} /></Field><Field label="Capacity"><Input maxLength={100} value={line.capacity || ""} onChange={e => updateLine(i, "capacity", e.target.value)} /></Field><Field label="Quantity"><Input type="number" required min="1" max="100000" value={line.quantity} onChange={e => updateLine(i, "quantity", Number(e.target.value))} /></Field><Field label="Unit price"><Input type="number" required min="0" max="9999999999" step="0.01" value={line.unitPrice} onChange={e => updateLine(i, "unitPrice", Number(e.target.value))} /></Field></div>
    </div>)}</div>
    <Button type="button" variant="outline" disabled={form.items.length >= 100} onClick={() => setForm({ ...form, items: [...form.items, { itemDescription: "", quantity: 1, unitPrice: 0 }] })}><Plus size={15} className="mr-2" />Add line</Button>
    <Field label="Commercial terms"><Textarea rows={4} maxLength={10000} value={form.terms || ""} onChange={e => setForm({ ...form, terms: e.target.value })} /></Field>
  </Editor>;
}
