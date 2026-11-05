export type TaskStatus = "todo" | "in_progress" | "in_review" | "blocked" | "done";
export type Priority = "low" | "medium" | "high";
export type PeriodType = "daily" | "weekly" | "sprint";
export type MembershipRole = "lead" | "member";
export type InsightPeriod = "daily" | "weekly" | "monthly" | "general";
export type HelpRequestStatus = "open" | "resolved";

export type TaskPeriodType = "daily" | "weekly" | "monthly";

export type Task = {
  id: number;
  title: string;
  description: string | null;
  assignee_id: number;
  assigned_by_id: number;
  group_id: number | null;
  priority: Priority;
  status: TaskStatus;
  estimated_hours: number;
  actual_hours: number;
  percent_complete: number;
  deadline: string | null;
  created_at: string;
  completed_at: string | null;
  is_management_duty: boolean;
  period_type: TaskPeriodType | null;
  is_archived: boolean;
};

export type Alert = {
  type: "missed_checkin" | "overdue_task";
  message: string;
  user_id: number | null;
  task_id: number | null;
};

export type MyDashboard = {
  total_tasks: number;
  done_tasks: number;
  overdue_tasks: number;
  total_estimated_hours: number;
  total_actual_hours: number;
  completion_rate: number;
  tasks: Task[];
  alerts: Alert[];
};

export type MemberSummary = {
  user: { id: number; name: string; email: string; skills: string | null };
  total_tasks: number;
  done_tasks: number;
  overdue_tasks: number;
  on_time_rate: number;
  total_estimated_hours: number;
  total_actual_hours: number;
  workload_score: number;
  has_checked_in: boolean;
};

export type Group = {
  id: number;
  name: string;
  description: string | null;
  created_by: number;
  checkin_cadence: PeriodType;
  is_archived: boolean;
  created_at: string;
  my_role: MembershipRole;
};

export type GroupDashboard = {
  group: Group;
  members: MemberSummary[];
  total_open_tasks: number;
  total_overdue_tasks: number;
  alerts: Alert[];
};

export type Checkin = {
  id: number;
  user_id: number;
  group_id: number | null;
  task_id: number | null;
  goal: string | null;
  achieved: string;
  went_well: string | null;
  didnt_go_well: string | null;
  improve: string | null;
  blocker: string | null;
  period_type: PeriodType;
  period_date: string;
  created_at: string;
};

export type GroupGoal = {
  id: number;
  group_id: number;
  created_by: number;
  goal_text: string;
  period_type: PeriodType;
  period_start: string;
  period_end: string | null;
  created_at: string;
};

export type MemberBreakdownItem = {
  name: string;
  percent_achieved: number | null;
  comment: string;
};

export type AIInsight = {
  id: number;
  scope: "individual" | "group";
  period: InsightPeriod;
  user_id: number | null;
  group_id: number | null;
  group_goal_id: number | null;
  summary: string;
  risk_level: "low" | "medium" | "high";
  risk_flags: string[];
  recommendations: string[];
  member_breakdown: MemberBreakdownItem[];
  wins: string[];
  predicted_workload_hours: number | null;
  predicted_completion_date: string | null;
  generated_at: string;
};
export type GroupMember = {
  id: number;
  user_id: number;
  group_id: number;
  role: MembershipRole;
  created_at: string;
  name: string;
  email: string;
  skills: string | null;
};
export type HelpRequest = {
  id: number;
  group_id: number;
  task_id: number | null;
  requested_by: number;
  requested_by_name: string;
  skill_needed: string;
  note: string | null;
  status: HelpRequestStatus;
  resolved_by: number | null;
  created_at: string;
  resolved_at: string | null;
};

export type Quote = { text: string; author: string };