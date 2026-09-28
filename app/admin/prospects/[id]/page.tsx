import { ProspectReviewDetail } from "@/components/admin/ProspectReviewDetail";
export default async function AdminProspectDetailPage({ params }: { params: Promise<{ id: string }> }) { return <ProspectReviewDetail prospectId={(await params).id} />; }
