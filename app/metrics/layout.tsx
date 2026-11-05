import RequireAuth from "@/components/RequireAuth";

export default function MetricsLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
