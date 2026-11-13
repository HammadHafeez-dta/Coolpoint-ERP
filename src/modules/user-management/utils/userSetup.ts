import { normalizeAssignedModules } from "./moduleAccess";

export function userRightsLink(userNo: number, modules?: string | readonly string[], setup = true) {
  const assigned = normalizeAssignedModules(modules);
  const params = new URLSearchParams({ userNo: String(userNo) });
  if (setup) params.set("setup", "1");
  if (assigned.length) { params.set("software", assigned[0]); params.set("modules", assigned.join(",")); }
  return `/user-access/user-rights?${params}`;
}
