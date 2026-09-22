import { AdminShell } from "@/components/admin/AdminApp";
import { BackofficeProvider } from "@/lib/backoffice-store";
import { requireAdmin } from "@/lib/authz";

export const metadata = { title: "Back-office — FeaseWeb", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <BackofficeProvider><AdminShell>{children}</AdminShell></BackofficeProvider>;
}
