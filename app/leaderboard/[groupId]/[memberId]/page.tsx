"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Trophy, CheckCircle2, Clock, AlertCircle, Calendar, Target, Star, Crown } from "lucide-react";
import RequireAuth from "@/components/RequireAuth";
import { api } from "@/lib/api";
import InsightPanel from "@/components/InsightPanel";
import type { Group, GroupMember, Task, User as UserType } from "@/lib/types";

export default function MemberDetailPage() {
  const params = useParams();
  const groupId = Number(params.groupId);
  const memberId = Number(params.memberId);

  const [group, setGroup] = useState<Group | null>(null);
  const [member, setMember] = useState<GroupMember | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [g, ms, ts] = await Promise.all([
        api.get<Group>(`/groups/${groupId}`),
        api.get<GroupMember[]>(`/groups/${groupId}/members`),
        api.get<Task[]>(`/tasks?group_id=${groupId}`),
      ]);
      setGroup(g);
      setMember(ms.find(m => m.user_id === memberId) || null);
      setTasks(ts.filter(t => t.assignee_id === memberId));
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }, [groupId, memberId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <p className="text-sm text-muted p-6">Loading member details...</p>;
  if (!group || !member) return <p className="text-sm text-muted p-6">Member not found</p>;

  const total = tasks.length;
  const done = tasks.filter(t => t.status === "done").length;
  const inProgress = tasks.filter(t => t.status === "in_progress").length;
  const inReview = tasks.filter(t => t.status === "in_review").length;
  const blocked = tasks.filter(t => t.status === "blocked").length;
  const todo = tasks.filter(t => t.status === "todo").length;
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

  const now = new Date();
  const onTime = tasks.filter(t => {
    if (t.status !== "done") return false;
    if (!t.deadline) return true;
    const deadline = new Date(t.deadline);
    return deadline >= new Date(t.completed_at || now);
  }).length;

  return (
    <RequireAuth>
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <Link href={`/leaderboard/${groupId}`} className="flex items-center gap-2 text-primary hover:underline mb-4">
            <ArrowLeft size={16} />
            Back to Team Performance
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center text-2xl font-semibold">
              {member.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: 'var(--font-serif)' }}>{member.name}</h1>
              <p className="text-text-secondary">{member.email}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs capitalize">{member.role}</span>
                {member.role === "lead" && <span className="text-xs text-warning flex items-center gap-1"><Trophy size={12} /> Leadership Role</span>}
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <Target className="mx-auto mb-2 text-primary" size={24} />
            <p className="text-2xl font-bold">{total}</p>
            <p className="text-xs text-muted">Total Assigned</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <CheckCircle2 className="mx-auto mb-2 text-success" size={24} />
            <p className="text-2xl font-bold text-success">{done}</p>
            <p className="text-xs text-muted">Completed</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <Clock className="mx-auto mb-2 text-warning" size={24} />
            <p className="text-2xl font-bold text-warning">{inProgress + inReview}</p>
            <p className="text-xs text-muted">Active</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <AlertCircle className="mx-auto mb-2 text-danger" size={24} />
            <p className="text-2xl font-bold text-danger">{blocked}</p>
            <p className="text-xs text-muted">Blocked</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <Star className="mx-auto mb-2 text-warning" size={24} />
            <p className="text-2xl font-bold text-primary">{completionRate}%</p>
            <p className="text-xs text-muted">Completion Rate</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-semibold">Task Analysis</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">To Do</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-border rounded-full h-2">
                        <div className="bg-muted h-2 rounded-full" style={{ width: total > 0 ? `${(todo/total)*100}%` : '0%' }}></div>
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{todo}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">In Progress</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-border rounded-full h-2">
                        <div className="bg-warning h-2 rounded-full" style={{ width: total > 0 ? `${(inProgress/total)*100}%` : '0%' }}></div>
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{inProgress}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">In Review</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-border rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: total > 0 ? `${(inReview/total)*100}%` : '0%' }}></div>
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{inReview}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Blocked</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-border rounded-full h-2">
                        <div className="bg-danger h-2 rounded-full" style={{ width: total > 0 ? `${(blocked/total)*100}%` : '0%' }}></div>
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{blocked}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Completed</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-border rounded-full h-2">
                        <div className="bg-success h-2 rounded-full" style={{ width: total > 0 ? `${(done/total)*100}%` : '0%' }}></div>
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{done}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {}
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-semibold">Assigned Tasks</h2>
              </div>
              <div className="divide-y divide-border max-h-96 overflow-y-auto">
                {tasks.length === 0 ? (
                  <p className="p-6 text-sm text-muted text-center">No tasks assigned</p>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-sm">{task.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${
                          task.status === 'done' ? 'bg-success/10 text-success' :
                          task.status === 'in_progress' ? 'bg-warning/10 text-warning' :
                          task.status === 'in_review' ? 'bg-primary/10 text-primary' :
                          task.status === 'blocked' ? 'bg-danger/10 text-danger' :
                          'bg-muted/10 text-muted'
                        }`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-xs text-text-secondary mb-2 line-clamp-2">{task.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted">
                        {task.deadline && (
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            Due: {task.deadline}
                          </span>
                        )}
                        <span className="capitalize">Priority: {task.priority}</span>
                        {task.is_management_duty && <span className="text-warning">Management Duty</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {}
          <div className="space-y-6">
            <div className="bg-surface border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Trophy className="text-warning" size={20} />
                Performance Summary
              </h2>
              <div className="space-y-4">
                <div className="p-3 bg-success/10 rounded-lg">
                  <p className="text-sm font-medium text-success mb-1">Completion Rate</p>
                  <p className="text-2xl font-bold text-success">{completionRate}%</p>
                  <p className="text-xs text-success/80">{done} out of {total} tasks completed</p>
                </div>
                {member.role === "lead" && (
                  <div className="p-3 bg-warning/10 rounded-lg">
                    <p className="text-sm font-medium text-warning mb-1">Leadership Status</p>
                    <p className="text-sm text-warning/80">Active team leader with management responsibilities</p>
                  </div>
                )}
                <div className="p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm font-medium text-primary mb-1">Skills</p>
                  <p className="text-xs text-primary/80">{member.skills || "No skills listed"}</p>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-3">Team Role</h2>
              <div className="flex items-center gap-2">
                {member.role === "lead" ? <Crown className="text-warning" size={18} /> : <User className="text-muted" size={18} />}
                <span className="capitalize font-medium">{member.role}</span>
              </div>
              <p className="text-xs text-text-secondary mt-2">
                {member.role === "lead" 
                  ? "Team leader responsible for assignments and group management"
                  : "Team member contributing to group goals"}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <InsightPanel endpoint={(period, refresh) => `/insights/user/${memberId}?period=${period}&refresh=${refresh}`} />
        </div>
      </div>
    </RequireAuth>
  );
}
