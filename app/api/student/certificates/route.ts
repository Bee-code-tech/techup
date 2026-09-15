import { NextResponse } from "next/server"
import { isNextResponse, requireStudent } from "@/lib/api-auth"
import {
  courseQuizProgress,
  ensureCourseCertificate,
} from "@/lib/certificates"
import { db } from "@/lib/db"

export async function GET() {
  const auth = await requireStudent()
  if (isNextResponse(auth)) return auth

  const user = await db.user.findUnique({
    where: { id: auth.userId },
    select: { track: true },
  })
  if (!user?.track) {
    return NextResponse.json({
      earnedCount: 0,
      totalCourses: 0,
      courses: [],
    })
  }

  const courses = await db.course.findMany({
    where: { track: user.track, published: true },
    select: { id: true, title: true, order: true },
    orderBy: { order: "asc" },
  })

  const items = await Promise.all(
    courses.map(async (course) => {
      const [progress, certificate] = await Promise.all([
        courseQuizProgress(auth.userId, course.id),
        ensureCourseCertificate(auth.userId, course.id),
      ])

      return {
        courseId: course.id,
        courseTitle: course.title,
        progress: { passed: progress.passed, total: progress.total },
        complete: progress.complete,
        certificate: certificate
          ? {
              id: certificate.id,
              code: certificate.code,
              studentName: certificate.studentName,
              courseTitle: certificate.courseTitle,
              tutorName: certificate.tutorName,
              completedAt: certificate.completedAt.toISOString(),
            }
          : null,
      }
    }),
  )

  const earnedCount = items.filter((item) => item.certificate).length

  return NextResponse.json({
    earnedCount,
    totalCourses: courses.length,
    courses: items,
  })
}
