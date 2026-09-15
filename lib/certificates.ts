import { db } from "@/lib/db"

function randomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let out = "TU-"
  for (let i = 0; i < 8; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return out
}

export async function courseQuizProgress(userId: string, courseId: string) {
  const course = await db.course.findUnique({
    where: { id: courseId },
    select: {
      published: true,
      modules: { select: { id: true } },
    },
  })
  if (!course?.published) {
    return { passed: 0, total: 0, complete: false }
  }

  const moduleIds = course.modules.map((module) => module.id)
  const total = moduleIds.length
  if (total === 0) {
    return { passed: 0, total: 0, complete: false }
  }

  const passed = await db.moduleProgress.count({
    where: {
      userId,
      moduleId: { in: moduleIds },
      quizPassed: true,
    },
  })

  return {
    passed,
    total,
    complete: passed >= total,
  }
}

/** True when every module in the course has quizPassed. */
export async function isCourseComplete(userId: string, courseId: string) {
  const progress = await courseQuizProgress(userId, courseId)
  return progress.complete
}

export async function ensureCourseCertificate(userId: string, courseId: string) {
  const existing = await db.certificate.findUnique({
    where: { userId_courseId: { userId, courseId } },
  })
  if (existing) return existing

  const complete = await isCourseComplete(userId, courseId)
  if (!complete) return null

  const [user, course] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { name: true },
    }),
    db.course.findUnique({
      where: { id: courseId },
      include: { tutor: { select: { name: true } } },
    }),
  ])
  if (!user || !course?.published) return null

  let code = randomCode()
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const clash = await db.certificate.findUnique({ where: { code } })
    if (!clash) break
    code = randomCode()
  }

  return db.certificate.create({
    data: {
      userId,
      courseId,
      studentName: user.name,
      courseTitle: course.title,
      tutorName: course.tutor.name || null,
      code,
      completedAt: new Date(),
    },
  })
}

/** Issue certificates for every completed course in the student's track. */
export async function syncTrackCertificates(userId: string, track: string) {
  const courses = await db.course.findMany({
    where: { track, published: true },
    select: { id: true },
    orderBy: { order: "asc" },
  })

  const certificates = []
  for (const course of courses) {
    const certificate = await ensureCourseCertificate(userId, course.id)
    if (certificate) certificates.push(certificate)
  }
  return certificates
}
