import { DossierDetail } from "@/components/admin/DossierDetail";

export default async function AdminDossierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <DossierDetail dossierId={(await params).id} />;
}
