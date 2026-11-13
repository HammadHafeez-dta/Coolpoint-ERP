import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { ArrowLeft, ArrowRight, CalendarDays, GripVertical, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { usePermissionsStore } from "@/modules/user-management/store/permissionsStore";
import { authService } from "@/modules/auth/services/authService";
import { errorMessage, selectClass } from "../utils/crmUi";
import { projectService, type ProjectBoard, type ProjectTask, type TaskInput, type TaskStatus } from "../services/projectService";

const columns: { status: TaskStatus; label: string }[] = [{ status: "Todo", label: "To do" }, { status: "InProgress", label: "In progress" }, { status: "Done", label: "Done" }];
const statusLabel = (status: string) => ({ NotStarted: "Not started", InProgress: "In progress", Completed: "Completed" }[status] || status);
const polling = { staleTime: 0, refetchInterval: 30_000, refetchIntervalInBackground: false, refetchOnWindowFocus: "always" as const };
function progress(tasks: ProjectTask[]) { return !tasks.length || tasks.every(t => t.status === "Todo") ? "NotStarted" : tasks.every(t => t.status === "Done") ? "Completed" : "InProgress"; }
function Failure({ error, retry }: { error: unknown; retry: () => unknown }) { return <div role="alert" className="rounded-xl border border-destructive/30 bg-card p-5"><p className="text-sm text-destructive">{errorMessage(error)}</p><Button variant="outline" className="mt-3" onClick={retry}>Try again</Button></div>; }
function Loading() { return <div role="status" aria-label="Loading projects" className="h-64 animate-pulse rounded-xl bg-muted motion-reduce:animate-none"><span className="sr-only">Loading projects</span></div>; }
function useProjectScope() { const bundle = usePermissionsStore(s => s.bundle); return { bundle, key: ["crm", "projects", authService.getSite(), bundle] as const }; }

export default function Projects({ projectId }: { projectId?: number }) {
  return projectId !== undefined ? <TaskBoard projectId={projectId} /> : <ProjectList />;
}
function ProjectList() {
  const { key } = useProjectScope(); const permissions = usePermissionsStore();
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState(""); const [page, setPage] = useState(1);
  const query = useQuery({ queryKey: [...key, "list", search, page], queryFn: () => projectService.list(search, page), ...polling });
  return <div className="space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-2xl font-bold tracking-tight">Projects</h2><p className="mt-2 text-sm text-muted-foreground">{permissions.isAdmin() ? "Create a project or start from a qualified inquiry. Assign work and follow its progress." : "Your assigned work, organised by project. Progress reflects only your tasks."}</p></div><div className="flex gap-2"><Button variant="outline" size="icon" aria-label="Refresh projects" disabled={query.isFetching} onClick={() => { void query.refetch(); }}><RefreshCw className={query.isFetching ? "animate-spin motion-reduce:animate-none" : ""} /></Button>{permissions.isAdmin() && <Button onClick={() => setCreating(true)}><Plus />Create project</Button>}</div></div>
    <Input aria-label="Search projects" placeholder="Search project or client" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="max-w-lg" />
    {query.isError ? <Failure error={query.error} retry={query.refetch} /> : query.isPending ? <Loading /> : <>
      {!query.data.items.length ? <div className="rounded-xl border bg-card p-8 text-center"><h3 className="font-semibold">{search ? "No matching projects" : "No projects yet"}</h3><p className="mt-2 text-sm text-muted-foreground">{search ? "Try another project or client name." : permissions.isAdmin() ? "Create a project above, or qualify an inquiry to create one automatically." : "Projects appear here when an administrator assigns you a task."}</p></div> : <ul className="grid gap-4 lg:grid-cols-2">{query.data.items.map(project => <li key={project.id} className="min-w-0"><Link to={`/crm/projects/${project.id}`} className="block h-full rounded-xl border bg-card p-5 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><div className="flex items-start justify-between gap-3"><h3 className="min-w-0 break-words font-semibold">{project.title}</h3><ArrowRight className="size-4 shrink-0 text-primary" aria-hidden="true" /></div><p className="mt-2 break-words text-sm text-muted-foreground">{project.customerName || "Client not recorded"}</p><div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-xs"><span className="rounded-md bg-muted px-2 py-1 font-medium">{project.personal ? "My progress: " : ""}{statusLabel(project.status)}</span><span className="tabular-nums text-muted-foreground">{project.doneTasks} / {project.totalTasks} {project.personal ? "of my tasks" : "tasks"} done</span></div></Link></li>)}</ul>}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground"><p>{query.data.totalCount} projects · Page {page} of {Math.max(1, Math.ceil(query.data.totalCount / 25))}</p><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button><Button variant="outline" size="sm" disabled={page * 25 >= query.data.totalCount} onClick={() => setPage(page + 1)}>Next</Button></div></div>
    </>}
    {creating && <ProjectCreator close={() => setCreating(false)} />}
  </div>;
}
function ProjectCreator({ close }: { close: () => void }) {
  const navigate = useNavigate(); const cache = useQueryClient();
  const [title, setTitle] = useState(""); const [customerName, setCustomerName] = useState("");
  const mutation = useMutation({ mutationFn: () => projectService.create({ title, customerName }), onSuccess: async project => {
    await cache.invalidateQueries({ queryKey: ["crm", "projects"] }); close(); navigate(`/crm/projects/${project.id}`);
  } });
  return <Dialog open onOpenChange={open => { if (!open && !mutation.isPending) close(); }}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>Create project</DialogTitle><DialogDescription>Start a standalone project without an inquiry. You can assign tasks after creating it.</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={event => { event.preventDefault(); if (title.trim() && !mutation.isPending) mutation.mutate(); }}>
    <label className="block text-sm font-medium">Project name<Input autoFocus required maxLength={250} value={title} onChange={event => setTitle(event.target.value)} className="mt-1" disabled={mutation.isPending} /></label>
    <label className="block text-sm font-medium">Client name <span className="font-normal text-muted-foreground">(optional)</span><Input maxLength={200} value={customerName} onChange={event => setCustomerName(event.target.value)} className="mt-1" disabled={mutation.isPending} /></label>
    {mutation.isError && <p role="alert" className="text-sm text-destructive">{errorMessage(mutation.error)}</p>}
    <div className="flex justify-end gap-2"><Button type="button" variant="outline" disabled={mutation.isPending} onClick={close}>Cancel</Button><Button type="submit" disabled={mutation.isPending || !title.trim()}>{mutation.isPending ? "Creating…" : "Create project"}</Button></div>
  </form></DialogContent></Dialog>;
}
function TaskBoard({ projectId }: { projectId: number }) {
  const { key } = useProjectScope(); const permissions = usePermissionsStore(); const cache = useQueryClient();
  const boardKey = [...key, "board", projectId];
  const query = useQuery({ queryKey: boardKey, queryFn: () => projectService.detail(projectId), enabled: Number.isInteger(projectId) && projectId > 0, ...polling });
  const [editor, setEditor] = useState<ProjectTask | "new" | null>(null);
  const [dragging, setDragging] = useState<number | null>(null); const [over, setOver] = useState<TaskStatus | null>(null);
  const [announcement, setAnnouncement] = useState(""); const [moveError, setMoveError] = useState("");
  const canMove = permissions.canEdit("CRM", "Projects"); const admin = permissions.isAdmin();
  const refresh = async () => { await cache.invalidateQueries({ queryKey: ["crm", "projects"] }); };
  const move = useMutation({
    mutationFn: ({ task, status }: { task: ProjectTask; status: TaskStatus }) => projectService.move(projectId, task, status),
    onMutate: async ({ task, status }) => {
      setMoveError(""); await cache.cancelQueries({ queryKey: boardKey });
      const previous = cache.getQueryData<ProjectBoard>(boardKey);
      if (previous) { const tasks = previous.tasks.map(t => t.id === task.id ? { ...t, status } : t); cache.setQueryData(boardKey, { ...previous, tasks, status: progress(tasks) }); }
      return { previous };
    },
    onError: (error, _input, context) => {
      if (context?.previous) cache.setQueryData(boardKey, context.previous);
      setMoveError(isAxiosError(error) && error.response?.status === 409 ? "This task changed while you were moving it. The latest board has been loaded; review it and try again." : `Task was not moved. ${errorMessage(error)}`);
    },
    onSuccess: (_task, input) => setAnnouncement(`${input.task.title} moved to ${columns.find(c => c.status === input.status)?.label}.`),
    onSettled: refresh,
  });
  const changeStatus = (task: ProjectTask, status: TaskStatus) => { if (canMove && !move.isPending && task.status !== status) move.mutate({ task, status }); };
  if (!Number.isInteger(projectId) || projectId <= 0) return <Failure error={new Error("Choose a valid project from the Projects list.")} retry={() => { window.location.href = "/crm/projects"; }} />;
  if (query.isError) return <Failure error={query.error} retry={query.refetch} />;
  if (!query.data) return <Loading />;
  const board = query.data;
  return <div className="space-y-5">
    <Link to="/crm/projects" className="inline-flex min-h-10 items-center gap-2 rounded-md text-sm text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><ArrowLeft className="size-4" />All projects</Link>
    <div className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0"><h2 className="break-words text-2xl font-bold tracking-tight">{board.title}</h2><p className="mt-2 break-words text-sm text-muted-foreground">{board.customerName || "Client not recorded"}</p><div className="mt-3 flex flex-wrap items-center gap-3 text-xs"><span className="rounded-md bg-muted px-2 py-1 font-medium">{board.personal ? "My progress: " : "Project: "}{statusLabel(board.status)}</span>{board.leadId && permissions.canView("CRM", "HVAC Inquiries") && <Link className="rounded-sm text-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" to={`/crm/leads/${board.leadId}`}>View source inquiry</Link>}</div></div><div className="flex gap-2"><Button variant="outline" size="icon" aria-label="Refresh task board" disabled={query.isFetching || move.isPending} onClick={() => { void query.refetch(); }}><RefreshCw className={query.isFetching ? "animate-spin motion-reduce:animate-none" : ""} /></Button>{admin && <Button onClick={() => setEditor("new")}><Plus />Create task</Button>}</div></div>
    <p className="text-xs leading-relaxed text-muted-foreground">{board.personal ? "Only your assigned tasks are shown. " : ""}{canMove ? "Drag a task between columns, or use its status menu. Changes save automatically." : "You have read-only access to these tasks."}</p>
    <p role="status" aria-live="polite" className="sr-only">{move.isPending ? "Saving task status…" : announcement}</p>
    {moveError && <div role="alert" className="rounded-lg border border-destructive/30 bg-card p-4 text-sm text-destructive">{moveError}</div>}
    <div className="grid items-start gap-4 xl:grid-cols-3">{columns.map(column => {
      const tasks = board.tasks.filter(task => task.status === column.status);
      return <section key={column.status} aria-label={`${column.label} tasks`} data-task-column={column.status}
        onDragOver={event => { if (dragging !== null && canMove && !move.isPending) { event.preventDefault(); event.dataTransfer.dropEffect = "move"; setOver(column.status); } }}
        onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOver(null); }}
        onDrop={event => { event.preventDefault(); const task = board.tasks.find(t => t.id === dragging); setDragging(null); setOver(null); if (task) changeStatus(task, column.status); }}
        className={`min-w-0 rounded-xl border p-3 transition-colors motion-reduce:transition-none ${over === column.status ? "border-primary bg-primary/5" : "bg-muted/40"}`}>
        <div className="flex items-center justify-between gap-3 px-1 pb-3 pt-1"><h3 className="text-sm font-semibold">{column.label}</h3><span className="text-xs tabular-nums text-muted-foreground">{tasks.length}</span></div>
        <ul className="min-h-28 space-y-3">{tasks.map(task => <li key={task.id}>
          <article data-task-id={task.id} aria-label={task.title} draggable={canMove && !move.isPending}
            onDragStart={event => { event.dataTransfer.setData("text/plain", String(task.id)); event.dataTransfer.effectAllowed = "move"; setDragging(task.id); }} onDragEnd={() => { setDragging(null); setOver(null); }}
            className={`min-w-0 rounded-lg border bg-card p-4 ${dragging === task.id ? "opacity-50" : ""}`}>
            <div className="flex items-start justify-between gap-2"><h4 className="min-w-0 break-words text-sm font-semibold">{task.title}</h4>{canMove && <GripVertical className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}</div>
            {task.description && <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-relaxed text-muted-foreground">{task.description}</p>}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs"><span className="rounded bg-muted px-2 py-1">{task.priority}</span>{task.dueDate && <span className="inline-flex items-center gap-1 text-muted-foreground"><CalendarDays className="size-3" aria-hidden="true" />{new Intl.DateTimeFormat("en-PK", { day: "numeric", month: "short", year: "numeric" }).format(new Date(task.dueDate.slice(0, 10) + "T12:00:00"))}</span>}</div>
            <p className="mt-3 break-words text-xs text-muted-foreground">Assigned to {task.assigneeName || task.assigneeUserId}</p>
            <div className="mt-4 flex items-center gap-2"><select aria-label={`Status for ${task.title}`} value={task.status} disabled={!canMove || move.isPending} className={`${selectClass} h-9 min-w-0 flex-1 text-xs disabled:opacity-60`} onChange={e => changeStatus(task, e.target.value as TaskStatus)}>{columns.map(c => <option key={c.status} value={c.status}>{c.label}</option>)}</select>{admin && <Button variant="outline" size="sm" disabled={move.isPending} onClick={() => setEditor(task)} aria-label={`Edit ${task.title}`}>Edit</Button>}</div>
          </article>
        </li>)}</ul>
        {!tasks.length && <p className="px-2 pb-4 text-xs text-muted-foreground">{dragging ? "Drop task here" : "No tasks"}</p>}
      </section>;
    })}</div>
    {editor && <TaskEditor projectId={projectId} task={editor === "new" ? undefined : editor} close={() => setEditor(null)} saved={refresh} />}
  </div>;
}
function TaskEditor({ projectId, task, close, saved }: { projectId: number; task?: ProjectTask; close: () => void; saved: () => Promise<void> }) {
  const { key } = useProjectScope();
  const assignees = useQuery({ queryKey: [...key, "assignees"], queryFn: projectService.assignees, staleTime: 0 });
  const [form, setForm] = useState<TaskInput>({ title: task?.title || "", description: task?.description || "", assigneeUserId: task?.assigneeUserId || "", priority: task?.priority || "Medium", dueDate: task?.dueDate?.slice(0, 10) || "", rowVersion: task?.rowVersion });
  const mutation = useMutation({ mutationFn: () => projectService.saveTask(projectId, { ...form, dueDate: form.dueDate ? form.dueDate + "T00:00:00" : null }, task?.id), onSuccess: async () => { await saved(); close(); } });
  const eligible = assignees.data?.some(user => user.userId === form.assigneeUserId);
  return <Dialog open onOpenChange={open => { if (!open && !mutation.isPending) close(); }}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl" onEscapeKeyDown={event => { if (mutation.isPending) event.preventDefault(); }} onPointerDownOutside={event => { if (mutation.isPending) event.preventDefault(); }}><DialogHeader><DialogTitle>{task ? "Edit task" : "Create task"}</DialogTitle><DialogDescription>Assign work to a limited user with Projects View and Edit access at this site.</DialogDescription></DialogHeader>
    <form className="space-y-4" onSubmit={event => { event.preventDefault(); if (eligible) mutation.mutate(); }}>
      <label className="block text-sm font-medium">Title<Input autoFocus required maxLength={250} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="mt-1" /></label>
      <label className="block text-sm font-medium">Description <span className="font-normal text-muted-foreground">(optional)</span><Textarea maxLength={4000} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="mt-1" /></label>
      <label className="block text-sm font-medium">Assign to<select required aria-label="Task assignee" className={`${selectClass} mt-1`} value={form.assigneeUserId} disabled={assignees.isPending || assignees.isError} onChange={e => setForm({ ...form, assigneeUserId: e.target.value })}><option value="">Select a limited user</option>{task && !eligible && <option value={task.assigneeUserId} disabled>{task.assigneeName} (access needs review)</option>}{assignees.data?.map(user => <option key={user.userId} value={user.userId}>{user.name} ({user.userId})</option>)}</select></label>
      {assignees.isPending && <p role="status" className="text-xs text-muted-foreground">Loading eligible users…</p>}
      {assignees.isError && <Failure error={assignees.error} retry={assignees.refetch} />}
      {assignees.isSuccess && !assignees.data.length && <p className="text-xs leading-relaxed text-muted-foreground">No eligible users. In UAM, give a limited web user CRM Projects View and Edit rights for this site, then retry.<Button type="button" variant="link" className="px-1 text-xs" onClick={() => { void assignees.refetch(); }}>Reload users</Button></p>}
      <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium">Due date <span className="font-normal text-muted-foreground">(optional)</span><Input type="date" value={form.dueDate || ""} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="mt-1" /></label><label className="block text-sm font-medium">Priority<select aria-label="Task priority" className={`${selectClass} mt-1`} value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>{["Low", "Medium", "High"].map(priority => <option key={priority}>{priority}</option>)}</select></label></div>
      {mutation.isError && <p role="alert" className="text-sm text-destructive">{errorMessage(mutation.error)}{isAxiosError(mutation.error) && mutation.error.response?.status === 409 ? " Close and reopen this task to review its latest details." : ""}</p>}
      <div className="flex justify-end gap-2"><Button type="button" variant="outline" disabled={mutation.isPending} onClick={close}>Cancel</Button><Button type="submit" disabled={mutation.isPending || !eligible || !form.title.trim()}>{mutation.isPending ? "Saving…" : task ? "Save task" : "Create task"}</Button></div>
    </form>
  </DialogContent></Dialog>;
}
