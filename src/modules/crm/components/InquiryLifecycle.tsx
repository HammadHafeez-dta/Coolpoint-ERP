import { useState, type ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { useToast } from "@/shared/components/ui/use-toast";
import { usePermissionsStore } from "@/modules/user-management/store/permissionsStore";
import { crmService, type CrmLead } from "../services/crmService";
import { errorMessage, inquiryLifecycleStates } from "../utils/crmUi";

export function InquiryLifecycle({ lead, children }: { lead: CrmLead; children: ReactNode }) {
  const permissions = usePermissionsStore(); const cache = useQueryClient(); const { toast } = useToast();
  const [confirm, setConfirm] = useState(false);
  const mutation = useMutation({
    mutationFn: (status: string) => crmService.leadState(lead, status),
    onSuccess: async () => {
      setConfirm(false);
      await cache.invalidateQueries({ queryKey: ["crm"] });
      toast({ title: "Inquiry lifecycle updated" });
    },
    onError: error => {
      toast({ title: "Lifecycle update failed", description: errorMessage(error), variant: "destructive" });
    },
  });
  if (!permissions.canEdit("CRM", "HVAC Inquiries")) return <>{children}</>;
  return <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" aria-label={`Change lifecycle for ${lead.title}`} disabled={mutation.isPending}
          className="inline-flex items-center gap-1 rounded-md text-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60">
          {mutation.isPending ? <span className="px-2 py-1 text-xs" role="status">Saving…</span> : children}
          <ChevronDown size={13} aria-hidden="true" className="mr-1" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" onClick={event => event.stopPropagation()}>
        <DropdownMenuLabel className="text-xs text-muted-foreground">Change lifecycle</DropdownMenuLabel>
        {inquiryLifecycleStates.map(status => <DropdownMenuItem key={status} disabled={status === lead.lifecycleStatus} className="focus:bg-primary/10 focus:text-foreground" onSelect={() => {
          mutation.reset();
          if (status === "Disqualified") setConfirm(true);
          else mutation.mutate(status);
        }}><span className="mr-2 inline-flex w-3.5">{status === lead.lifecycleStatus && <Check size={14} aria-hidden="true" />}</span>{status === "New" ? "New (default)" : status}</DropdownMenuItem>)}
      </DropdownMenuContent>
    </DropdownMenu>
    <Dialog open={confirm} onOpenChange={open => { if (!mutation.isPending) setConfirm(open); }}>
      <DialogContent onClick={event => event.stopPropagation()}>
        <DialogHeader><DialogTitle>Disqualify inquiry?</DialogTitle><DialogDescription>Mark “{lead.title}” as disqualified. Existing deals and quotation history will stay unchanged.</DialogDescription></DialogHeader>
        {mutation.isError && <p role="alert" className="text-sm text-destructive">{errorMessage(mutation.error)}</p>}
        <div className="flex justify-end gap-2"><Button variant="outline" disabled={mutation.isPending} onClick={() => setConfirm(false)}>Cancel</Button><Button disabled={mutation.isPending} onClick={() => mutation.mutate("Disqualified")}>{mutation.isPending ? "Saving…" : "Disqualify inquiry"}</Button></div>
      </DialogContent>
    </Dialog>
  </>;
}
