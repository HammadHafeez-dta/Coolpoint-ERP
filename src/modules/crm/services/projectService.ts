import api from "@/shared/services/api";

export type TaskStatus = "Todo" | "InProgress" | "Done";
export type ProjectStatus = "NotStarted" | "InProgress" | "Completed";
export interface ProjectTask {
  id: number; projectId: number; title: string; description?: string;
  assigneeUserId: string; assigneeName: string; status: TaskStatus;
  priority: "Low" | "Medium" | "High"; dueDate?: string; rowVersion: string;
  createdAt: string; updatedAt?: string;
}
export interface ProjectSummary {
  id: number; title: string; customerName?: string; leadId?: number;
  status: ProjectStatus; personal: boolean; totalTasks: number; doneTasks: number;
}
export interface ProjectBoard extends Omit<ProjectSummary, "totalTasks" | "doneTasks"> { tasks: ProjectTask[] }
export interface TaskInput { title: string; description?: string; assigneeUserId: string; priority: string; dueDate?: string | null; rowVersion?: string }
export const projectService = {
  create: async (input: { title: string; customerName?: string }) => (await api.post<{ id: number }>("/crm/projects", input)).data,
  list: async (search: string, page: number) => (await api.get<{ items: ProjectSummary[]; totalCount: number; page: number; pageSize: number }>("/crm/projects", { params: { search, page, pageSize: 25 } })).data,
  detail: async (id: number) => (await api.get<ProjectBoard>(`/crm/projects/${id}`)).data,
  assignees: async () => (await api.get<{ userId: string; name: string }[]>("/crm/projects/assignees")).data,
  saveTask: async (projectId: number, input: TaskInput, taskId?: number) => (await (taskId ? api.patch<ProjectTask>(`/crm/projects/${projectId}/tasks/${taskId}`, input) : api.post<ProjectTask>(`/crm/projects/${projectId}/tasks`, input))).data,
  move: async (projectId: number, task: ProjectTask, status: TaskStatus) => (await api.post<ProjectTask>(`/crm/projects/${projectId}/tasks/${task.id}/status`, { status, rowVersion: task.rowVersion })).data,
};
