"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { UserPlus, UserMinus, Crown, Archive, Plus, Edit2, Trash2, Check, X, HandHelping, Mail, MessagesSquare } from "lucide-react";
import GroupTaskBoard from "@/components/GroupTaskBoard";
import AssignTaskModal from "@/components/AssignTaskModal";
import HelpRequestsPanel from "@/components/HelpRequestsPanel";
import InsightPanel from "@/components/InsightPanel";
import HelpRequestModal from "@/components/HelpRequestModal";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import type { Group, GroupDashboard, GroupGoal, Task, GroupMember } from "@/lib/types";
import Link from "next/link";

const isDone = (t: any) => String(t.status).toLowerCase() === "done";

export default function GroupPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const groupId = Number(params.id);

  const [group, setGroup] = useState<Group | null>(null);
  const [goal, setGoal] = useState<GroupGoal | null>(null);
  const [dash, setDash] = useState<GroupDashboard | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLead, setIsLead] = useState<boolean | null>(null);

  const [assignOpen, setAssignOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ firstName: "", lastName: "", email: "", role: "", inviteReason: "" } as any);
  const [inviteMsg, setInviteMsg] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [newGoalText, setNewGoalText] = useState("");
  const [editingGroup, setEditingGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);

  const load = useCallback(async () => {
    const g = await api.get<Group>(`/groups/${groupId}`);
    setGroup(g);

    const ms = await api.get<GroupMember[]>(`/groups/${groupId}/members`);
    setMembers(ms);
    const mine = ms.find((m) => m.user_id === user?.id);
    setIsLead(mine?.role === "lead");

    try {
      setGoal(await api.get<GroupGoal>(`/groups/${groupId}/goals/latest`));
    } catch {
      setGoal(null);
    }

    const t = await api.get<Task[]>(`/tasks?group_id=${groupId}`);
    setTasks(t);

    if (mine?.role === "lead") {
      try {
        setDash(await api.get<GroupDashboard>(`/dashboard/group/${groupId}`));
      } catch {
        setDash(null);
      }
    }
  }, [groupId, user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (group) setGroupName(group.name);
  }, [group]);

  async function updateGroupName() {
    if (!groupName.trim()) return;
    try {
      await api.patch(`/groups/${groupId}`, { name: groupName.trim() });
      setGroup({ ...group!, name: groupName.trim() });
      setEditingGroup(false);
    } catch (e) {}
  }

  async function deleteGroup() {
    const confirmText = prompt("Type 'delete' to confirm deleting this team (this action cannot be undone):");
    if (confirmText !== "delete") return;
    try {
      await api.del(`/groups/${groupId}?reason=${encodeURIComponent("Team deleted by lead")}`);
      router.push("/groups");
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Failed to delete team");
    }
  }

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteMsg(null);
    setInviteLoading(true);
    try {
      await api.post(`/groups/${groupId}/invite`, { email: inviteForm.email, first_name: inviteForm.firstName, last_name: inviteForm.lastName, role: (inviteForm as any).role || "member", reason: (inviteForm as any).inviteReason || null });
      setInviteMsg("Invitation email sent successfully");
      setInviteForm({ firstName: "", lastName: "", email: "", role: "", inviteReason: "" } as any);
      setTimeout(() => { setInviteOpen(false); setInviteMsg(null); }, 2000);
    } catch (err) {
      setInviteMsg(err instanceof ApiError ? err.message : "Failed to send invitation");
    } finally {
      setInviteLoading(false);
    }
  }

  async function removeMember(uid: number) {
    const reason = prompt("Reason for removing this member (visible to everyone in the group):");
    if (reason === null || !reason.trim()) return;
    await api.del(`/groups/${groupId}/members/${uid}?reason=${encodeURIComponent(reason.trim())}`);
    await load();
  }

  async function saveGoal() {
    if (!newGoalText.trim()) return;
    await api.post(`/groups/${groupId}/goals`, { text: newGoalText.trim() });
    setNewGoalText("");
    await load();
  }

  async function archiveGroup() {
    if (!confirm("Archive this group?")) return;
    await api.post(`/groups/${groupId}/archive`, {});
    router.push("/groups");
  }

  if (!group) {
    return <p className="text-sm text-muted">Loading...</p>;
  }

  const active = tasks.filter((t: any) => !isDone(t));
  const doneCount = tasks.length - active.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            {editingGroup && isLead ? (
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  aria-label="Group name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="text-2xl sm:text-3xl font-bold px-2 py-1 border border-hairline rounded-md bg-paper font-serif text-accent max-w-full"
                />
                <button onClick={updateGroupName} aria-label="Save group name" className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-success"><Check size={20} /></button>
                <button onClick={() => { setEditingGroup(false); setGroupName(group.name); }} aria-label="Cancel editing group name" className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-danger"><X size={20} /></button>
              </div>
            ) : (
              <>
                <h1 className="font-serif text-3xl text-accent break-words">{group.name}</h1>
              <Link href={`/discussion/${groupId}`} className="flex items-center gap-1.5 text-sm text-primary hover:underline mt-1 min-h-[44px]">
                <MessagesSquare size={14} /> Discussion
              </Link>
                {isLead && (
                  <button onClick={() => setEditingGroup(true)} aria-label="Edit group name" className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center hover:bg-blush rounded">
                    <Edit2 size={18} />
                  </button>
                )}
              </>
            )}
          </div>
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <button onClick={() => setHelpOpen(true)} className="flex items-center justify-center gap-1 px-3 py-2 min-h-[44px] border border-hairline rounded-md text-sm hover:bg-paper flex-1 sm:flex-none">
            <HandHelping size={16} />
            Request Help
          </button>
          <Link href={`/completed?group=${groupId}`} className="flex items-center justify-center gap-1 px-3 py-2 min-h-[44px] border border-hairline rounded-md text-sm hover:bg-paper flex-1 sm:flex-none">
            Completed Tasks
          </Link>
          {isLead && (
            <>
              <button onClick={() => setInviteOpen(true)} className="flex items-center justify-center gap-1 px-3 py-2 min-h-[44px] border border-hairline rounded-md text-sm hover:bg-paper flex-1 sm:flex-none">
                <Mail size={16} />
                Add Member
              </button>
              <button onClick={() => setAssignOpen(true)} className="flex items-center justify-center gap-1 px-3 py-2 min-h-[44px] bg-primary text-white rounded-md text-sm hover:bg-primary-hover flex-1 sm:flex-none">
                <UserPlus size={16} />
                Assign Task
              </button>
              <button onClick={archiveGroup} className="flex items-center justify-center gap-1 px-3 py-2 min-h-[44px] border border-hairline rounded-md text-sm hover:bg-paper flex-1 sm:flex-none">
                <Archive size={16} />
                Archive
              </button>
              <button onClick={deleteGroup} className="flex items-center justify-center gap-1 px-3 py-2 min-h-[44px] bg-danger-bg text-danger border border-danger/30 rounded-md text-sm hover:bg-danger/10 flex-1 sm:flex-none">
                <Trash2 size={16} />
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Group Tasks</h2>
        {tasks.length === 0 ? (
          <div className="bg-surface border border-hairline rounded-lg p-8 text-center shadow-sm">
            <p className="text-sm text-muted">No tasks yet. Assign tasks to get started.</p>
          </div>
        ) : (
          <GroupTaskBoard tasks={active} doneCount={doneCount} groupId={groupId} onChanged={load} members={members} />
         )}
      </div>

      {isLead && (
        <div className="mb-6">
          <InsightPanel endpoint={(period, refresh) => `/insights/group/${groupId}?period=${period}&refresh=${refresh}`} dash={dash} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <HelpRequestsPanel groupId={groupId} isLead={!!isLead} />
        </div>
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-medium">Members</h2>
              {isLead && <Crown size={16} className="text-warning" />}
            </div>
            <div className="space-y-2">
              {members.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium">{m.name}</div>
                    <div className="text-xs text-muted">{m.email}</div>
                    {m.role && <div className="text-xs text-primary/80">Role: {m.role}</div>}
                    {m.added_reason && <div className="text-xs text-muted italic">Added: {m.added_reason}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    {m.role === "lead" || m.role?.toLowerCase() === "lead" ? (
                      <span className="text-xs text-warning">Lead</span>
                    ) : (
                      <>
                        {isLead && (
                          <>
                            <button
                              onClick={async () => {
                                const reason = prompt("Reason for adding as co-lead:");
                                if (reason === null) return;
                                try { await api.post(`/groups/${groupId}/co-leads`, { user_id: m.user_id, reason: reason.trim() || null }); await load(); } catch {}
                              }}
                              className="text-xs text-primary hover:underline"
                            >
                              Make co-lead
                            </button>
                            <button
                              onClick={async () => {
                                if (!confirm(`Transfer leadership to ${m.name}?`)) return;
                                const reason = prompt("Reason for transfer:");
                                if (reason === null) return;
                                try { await api.post(`/groups/${groupId}/transfer-leadership`, { new_lead_id: m.user_id, reason: reason.trim() || null }); await load(); } catch {}
                              }}
                              className="text-xs text-warning hover:underline"
                            >
                              Transfer lead
                            </button>
                          </>
                        )}
                        {isLead && (
                          <button onClick={() => removeMember(m.user_id)} className="text-danger hover:bg-danger/10 p-1 rounded">
                            <UserMinus size={14} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-4">
            <h2 className="font-medium mb-2">Group Goal</h2>
            {goal ? (
              <p className="text-sm text-text-secondary">{goal.goal_text || goal.text}</p>
            ) : isLead ? (
              <div className="flex gap-2">
                <input
                  value={newGoalText}
                  onChange={(e) => setNewGoalText(e.target.value)}
                  placeholder="Set or update group goal..."
                  className="flex-1 px-2 py-1.5 text-sm border border-hairline rounded-md bg-paper"
                />
                <button onClick={saveGoal} className="px-2 py-1.5 bg-primary text-white rounded-md text-sm">
                  <Plus size={14} />
                </button>
              </div>
            ) : (
              <p className="text-sm text-muted">No goal set</p>
            )}
          </div>

          {false && isLead && dash && dash.members && dash.members.length > 0 && (
            <div className="bg-surface border border-border rounded-xl p-4">
              <h2 className="font-medium mb-3">Member Activity</h2>
              <div className="space-y-2">
                {[...dash.members].sort((a: any, b: any) => (b.fastest_finish_score || 0) - (a.fastest_finish_score || 0)).map((m: any) => (
                  <div key={m.user?.id} className="flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium">{m.user?.name}</div>
                      <div className="text-xs text-muted">Done: {m.done_tasks}/{m.total_tasks} · Check-ins: {m.has_checked_in ? "Yes" : "No"} · Avg completion: {m.completion_time_avg_hours || 0}h</div>
                    </div>
                    <div className="text-xs text-primary">Score: {m.fastest_finish_score || 0}</div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted mt-2">Higher score = faster task completion on average.</p>
            </div>
          )}
        </div>
      </div>

      {assignOpen && (
        <AssignTaskModal open={assignOpen} onClose={() => setAssignOpen(false)} groupId={groupId} members={members} onDone={() => { setAssignOpen(false); load(); }} />
      )}
      {helpOpen && (
        <HelpRequestModal groupId={groupId} onClose={() => setHelpOpen(false)} onDone={load} />
      )}
      {inviteOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setInviteOpen(false)} onKeyDown={(e) => e.key === "Escape" && setInviteOpen(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby="invite-title" className="bg-surface rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto p-5 border border-hairline" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 gap-3">
              <h3 id="invite-title" className="font-serif text-lg text-accent">Invite Team Member</h3>
              <button onClick={() => setInviteOpen(false)} aria-label="Close invite dialog" className="text-muted hover:text-ink min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded"><X size={18} /></button>
            </div>
            <form onSubmit={sendInvite} className="space-y-3">
              <div>
                <label htmlFor="invite-first" className="text-xs text-muted block mb-1">First Name *</label>
                <input id="invite-first" required value={inviteForm.firstName} onChange={(e) => setInviteForm({...inviteForm, firstName: e.target.value})} className="w-full border border-hairline rounded-md px-3 py-2 text-sm min-h-[44px]" />
              </div>
              <div>
                <label htmlFor="invite-last" className="text-xs text-muted block mb-1">Last Name</label>
                <input id="invite-last" value={inviteForm.lastName} onChange={(e) => setInviteForm({...inviteForm, lastName: e.target.value})} className="w-full border border-hairline rounded-md px-3 py-2 text-sm min-h-[44px]" />
              </div>
              <div>
                <label htmlFor="invite-email" className="text-xs text-muted block mb-1">Email Address *</label>
                <input id="invite-email" type="email" required value={inviteForm.email} onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})} className="w-full border border-hairline rounded-md px-3 py-2 text-sm min-h-[44px]" />
              </div>
              <div>
                <label htmlFor="invite-role" className="text-xs text-muted block mb-1">Role (free text)</label>
                <input id="invite-role" value={inviteForm.role || ""} onChange={(e) => setInviteForm({...inviteForm, role: e.target.value})} className="w-full border border-hairline rounded-md px-3 py-2 text-sm min-h-[44px]" placeholder="e.g. Developer, Designer" />
              </div>
              <div>
                <label htmlFor="invite-reason" className="text-xs text-muted block mb-1">Reason for adding (visible to group)</label>
                <input id="invite-reason" value={inviteForm.inviteReason || ""} onChange={(e) => setInviteForm({...inviteForm, inviteReason: e.target.value})} className="w-full border border-hairline rounded-md px-3 py-2 text-sm min-h-[44px]" placeholder="Why this member is being added" />
              </div>
              {inviteMsg && <p className={`text-xs ${inviteMsg.includes('sent') ? 'text-success' : 'text-danger'}`}>{inviteMsg}</p>}
              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <button type="button" onClick={() => setInviteOpen(false)} className="px-3 py-2 text-sm border border-hairline rounded-md min-h-[44px]">Cancel</button>
                <button disabled={inviteLoading} className="px-3 py-2 text-sm bg-primary text-white rounded-md disabled:opacity-60 min-h-[44px]">{inviteLoading ? "Sending..." : "Send Invitation"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
