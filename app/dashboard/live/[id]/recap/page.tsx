import { LiveRecap } from "@/components/dashboard/live/live-recap"

type PageProps = { params: Promise<{ id: string }> }

export default async function LiveRecapPage({ params }: PageProps) {
  const { id } = await params
  return <LiveRecap sessionId={id} />
}
