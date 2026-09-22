import { ClientDetail } from "@/components/admin/AdminApp";
export default async function AdminClientDetailPage({ params }: { params: Promise<{ id: string }> }) { return <ClientDetail clientId={(await params).id} />; }
