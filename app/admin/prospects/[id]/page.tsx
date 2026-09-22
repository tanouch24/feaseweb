import { ProspectDetail } from "@/components/admin/AdminApp";
export default async function AdminProspectDetailPage({ params }: { params: Promise<{ id: string }> }) { return <ProspectDetail prospectId={(await params).id} />; }
