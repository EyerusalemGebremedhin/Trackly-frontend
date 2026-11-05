import { api } from "@/lib/api";
import type { DmAction } from "@/components/ConfirmTypeDialog";

export function runDmAction(id: number | string, action: DmAction) {
  if (action === "clear") return api.post(`/dm/${id}/clear`, {});
  if (action === "delete") return api.delete(`/dm/${id}`);
  return api.delete(`/dm/${id}?everyone=true`);
}
