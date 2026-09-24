import { LiveClassroom } from "@/components/dashboard/live/live-classroom"

type PageProps = { params: Promise<{ id: string }> }

export default async function LiveClassroomPage({ params }: PageProps) {
  const { id } = await params
  return <LiveClassroom sessionId={id} />
}
