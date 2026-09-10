import { NextResponse } from "next/server"
import { isNextResponse, requireStudent } from "@/lib/api-auth"
import { bootcampTracks } from "@/lib/bootcamp"
import { db } from "@/lib/db"

export async function GET() {
  const auth = await requireStudent()
  if (isNextResponse(auth)) return auth

  const me = await db.user.findUnique({
    where: { id: auth.userId },
    select: {
      id: true,
      track: true,
      currentStreak: true,
      longestStreak: true,
    },
  })
  if (!me?.track) {
    return NextResponse.json({
      track: null,
      entries: [],
      me: null,
    })
  }

  const students = await db.user.findMany({
    where: { role: "student", track: me.track },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      currentStreak: true,
      longestStreak: true,
    },
  })
  const studentIds = students.map((row) => row.id)

  const [quizProgress, submissions, assignments] = await Promise.all([
    db.moduleProgress.findMany({
      where: { userId: { in: studentIds }, quizPassed: true },
      select: { userId: true, quizScore: true },
    }),
    db.assignmentSubmission.findMany({
      where: { userId: { in: studentIds } },
      select: { userId: true, status: true, score: true },
    }),
    db.assignment.findMany({
      where: { track: me.track, published: true },
      select: { id: true },
    }),
  ])

  const assignmentTotal = Math.max(assignments.length, 1)

  const quizByUser = new Map<string, { count: number; scoreSum: number }>()
  for (const row of quizProgress) {
    const current = quizByUser.get(row.userId) || { count: 0, scoreSum: 0 }
    current.count += 1
    current.scoreSum += row.quizScore ?? 0
    quizByUser.set(row.userId, current)
  }

  const assignmentByUser = new Map<
    string,
    { submitted: number; graded: number; scoreSum: number }
  >()
  for (const row of submissions) {
    const current = assignmentByUser.get(row.userId) || {
      submitted: 0,
      graded: 0,
      scoreSum: 0,
    }
    current.submitted += 1
    if (row.status === "graded") {
      current.graded += 1
      current.scoreSum += row.score ?? 0
    }
    assignmentByUser.set(row.userId, current)
  }

  const entries = students
    .map((student) => {
      const quiz = quizByUser.get(student.id) || { count: 0, scoreSum: 0 }
      const asg = assignmentByUser.get(student.id) || {
        submitted: 0,
        graded: 0,
        scoreSum: 0,
      }
      const avgQuiz = quiz.count ? quiz.scoreSum / quiz.count : 0
      const assignmentRate = asg.submitted / assignmentTotal
      const points =
        student.currentStreak * 12 +
        quiz.count * 8 +
        avgQuiz * 0.35 +
        asg.submitted * 15 +
        asg.graded * 10

      return {
        userId: student.id,
        name: student.name,
        avatarUrl: student.avatarUrl,
        currentStreak: student.currentStreak,
        longestStreak: student.longestStreak,
        quizzesPassed: quiz.count,
        avgQuizScore: Math.round(avgQuiz),
        assignmentsSubmitted: asg.submitted,
        assignmentRate: Math.round(assignmentRate * 100),
        points: Math.round(points),
        isMe: student.id === me.id,
      }
    })
    .sort((a, b) => b.points - a.points)
    .map((entry, index) => ({ ...entry, rank: index + 1 }))

  return NextResponse.json({
    track: me.track,
    trackLabel: bootcampTracks[me.track] || me.track,
    entries,
    me: entries.find((entry) => entry.isMe) || null,
  })
}
