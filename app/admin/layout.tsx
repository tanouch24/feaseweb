import { AdminShell } from "@/components/admin/AdminApp";
import { BackofficeProvider } from "@/lib/backoffice-store";

export const metadata = { title: "Back-office — FeaseWeb", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <BackofficeProvider><AdminShell>{children}</AdminShell></BackofficeProvider>;
}
