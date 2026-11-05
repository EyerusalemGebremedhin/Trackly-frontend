import RequireAuth from "@/components/RequireAuth";

export default function GroupsLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
