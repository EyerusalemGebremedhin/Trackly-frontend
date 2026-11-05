"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Trophy, Clock, CheckCircle2, AlertCircle, TrendingUp, Crown, User } from "lucide-react";
import RequireAuth from "@/components/RequireAuth";
import { api } from "@/lib/api";
import InsightPanel from "@/components/InsightPanel";
import type { Group, GroupMember, Task } from "@/lib/types";

export default function TeamPerformancePage() {
  const params = useParams();
  const router = useRouter();
  const groupId = Number(params.groupId);

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [g, ms, ts] = await Promise.all([
        api.get<Group>(`/groups/${groupId}`),
        api.get<GroupMember[]>(`/groups/${groupId}/members`),
        api.get<Task[]>(`/tasks?group_id=${groupId}`),
      ]);
      setGroup(g);
      setMembers(ms);
      setTasks(ts);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    load();
  }, [load]);

  const getMemberStats = (memberId: number) => {
    const memberTasks = tasks.filter(t => t.assignee_id === memberId);
    const total = memberTasks.length;
    const done = memberTasks.filter(t => t.status === "done").length;
    const inProgress = memberTasks.filter(t => t.status === "in_progress").length;
    const todo = memberTasks.filter(t => t.status === "todo").length;
    const inReview = memberTasks.filter(t => t.status === "in_review").length;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, inProgress, todo, inReview, completionRate };
  };

  if (loading) return <p className="text-sm text-muted p-6">Loading team performance...</p>;
  if (!group) return <p className="text-sm text-muted p-6">Team not found</p>;

  return (
    <RequireAuth>
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <Link href="/leaderboard" className="flex items-center gap-2 text-primary hover:underline mb-4">
            <ArrowLeft size={16} />
            Back to Team & Performance
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3" style={{ fontFamily: 'var(--font-serif)' }}>
                <Users className="text-primary" size={32} />
                {group.name} - Performance Overview
              </h1>
              <p className="text-text-secondary">Individual and team performance analytics</p>
            </div>
            <Link href={`/groups/${groupId}`} className="px-4 py-2 border border-border rounded-lg hover:bg-paper">
              View Team Details
            </Link>
          </div>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="text-primary" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{members.length}</p>
                <p className="text-xs text-muted">Team Members</p>
              </div>
            </div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="text-success" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{tasks.filter(t => t.status === "done").length}</p>
                <p className="text-xs text-muted">Completed Tasks</p>
              </div>
            </div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="text-warning" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{tasks.filter(t => t.status === "in_progress").length}</p>
                <p className="text-xs text-muted">In Progress</p>
              </div>
            </div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-danger/10 flex items-center justify-center">
                <AlertCircle className="text-danger" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{tasks.filter(t => t.status === "blocked").length}</p>
                <p className="text-xs text-muted">Blocked</p>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="bg-surface border border-border rounded-xl overflow-hidden mb-6">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Trophy className="text-warning" size={20} />
              Team Member Performance
            </h2>
            <p className="text-sm text-text-secondary mt-1">Click on a member to view detailed performance analysis</p>
          </div>
          <div className="divide-y divide-border">
            {members.map((member) => {
              const stats = getMemberStats(member.user_id);
              const memberInfo = member as any;
              return (
                <Link
                  key={member.id}
                  href={`/leaderboard/${groupId}/${member.user_id}`}
                  className="flex items-center justify-between p-6 hover:bg-paper transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center text-lg font-semibold">
                      {member.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold group-hover:text-primary transition-colors">{member.name}</h3>
                        {member.role === "lead" && <Crown className="text-warning" size={16} />}
                      </div>
                      <p className="text-sm text-text-secondary">{member.email}</p>
                      {member.role && <p className="text-xs text-muted mt-1">Role: {member.role}</p>}
                      {memberInfo.added_reason && <p className="text-xs text-muted italic">Added: {memberInfo.added_reason}</p>}
                      {member.skills && (
                        <p className="text-xs text-muted mt-1">Skills: {member.skills}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-lg font-bold">{stats.total}</p>
                      <p className="text-xs text-muted">Assigned</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-success">{stats.done}</p>
                      <p className="text-xs text-muted">Completed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-warning">{stats.inProgress}</p>
                      <p className="text-xs text-muted">In Progress</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="text-primary" size={16} />
                        <p className="text-lg font-bold text-primary">{stats.completionRate}%</p>
                      </div>
                      <p className="text-xs text-muted">Completion</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Trophy className="text-warning" size={20} />
              Member Activity (Fastest Finishers)
            </h2>
            <p className="text-sm text-text-secondary mt-1">Ranked by average completion speed</p>
          </div>
          <div className="divide-y divide-border">
            {[...members].map((member) => {
              const memberTasks = tasks.filter(t => t.assignee_id === member.user_id && t.status === 'done');
              let avgHours = 0;
              let count = 0;
              if (memberTasks.length > 0) {
                let sum = 0;
                for (const t of memberTasks) {
                  if ((t as any).completed_at && t.created_at) {
                    const diff = (new Date((t as any).completed_at).getTime() - new Date(t.created_at).getTime()) / 3600000;
                    if (diff >= 0) { sum += diff; count++; }
                  }
                }
                avgHours = count > 0 ? Math.round((sum / count) * 100) / 100 : 0;
              }
              const score = count > 0 && avgHours > 0 ? Math.round((1.0 / (avgHours + 0.1)) * 1000) / 10 : null;
              return { member, avgHours, score, done: memberTasks.length, count };
            }).sort((a,b) => (b.score ?? -1) - (a.score ?? -1)).map((item, idx) => (
              <div key={item.member.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 text-center text-sm text-muted">#{idx+1}</div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center text-sm font-semibold">
                    {item.member.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium flex items-center gap-2">{item.member.name} {item.member.role === 'lead' && <Crown className="text-warning" size={14} />}</div>
                    <div className="text-xs text-muted">Done: {item.done} · Role: {(item.member as any).role || 'member'}</div>
                    {(item.member as any).added_reason && <div className="text-xs text-muted italic">Added: {(item.member as any).added_reason}</div>}
                  </div>
                </div>
                <div className="text-right">
                  {item.score !== null ? (
                    <>
                      <div className="text-sm font-semibold text-primary">Score: {item.score}</div>
                      <div className="text-xs text-muted">Avg completion: {item.avgHours}h</div>
                    </>
                  ) : (
                    <div className="text-xs text-muted">No completed tasks yet</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
