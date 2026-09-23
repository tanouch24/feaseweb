import { ClientDetailV6 } from "@/components/admin/ClientDetailV6";
export default async function AdminClientDetailPage({ params }: { params: Promise<{ id: string }> }) { return <ClientDetailV6 clientId={(await params).id} />; }
