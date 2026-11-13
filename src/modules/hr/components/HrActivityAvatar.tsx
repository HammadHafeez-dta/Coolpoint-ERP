import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { usePermissionsStore } from "@/modules/user-management/store/permissionsStore";
import { authService } from "@/modules/auth/services/authService";
import { hrDashboardService } from "../services/hrDashboardService";

export function HrActivityAvatar({ employeeId, name }: { employeeId?: number | null; name: string }) {
  const permissions = usePermissionsStore();
  const canViewPhoto = permissions.canView("HRMS", "Employee");
  const photo = useQuery({
    queryKey: ["hr-employee-photo", authService.getSite(), permissions.bundle?.userId, employeeId, canViewPhoto],
    queryFn: ({ signal }) => hrDashboardService.photo(employeeId!, signal),
    enabled: employeeId != null && canViewPhoto,
    staleTime: 5 * 60_000, gcTime: 5 * 60_000, retry: false, retryOnMount: false,
  });
  const [src, setSrc] = useState<string>();
  useEffect(() => {
    if (!canViewPhoto || !photo.data) { setSrc(undefined); return; }
    const url = URL.createObjectURL(photo.data); setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [photo.data, canViewPhoto]);
  return <Avatar className="size-9" aria-hidden="true">
    {canViewPhoto && src && <AvatarImage src={src} alt="" className="object-cover" />}
    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">{name.trim().split(/\s+/).slice(0, 2).map(word => word[0]).join("") || "?"}</AvatarFallback>
  </Avatar>;
}
