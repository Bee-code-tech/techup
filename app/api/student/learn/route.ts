import { NextResponse } from "next/server";
import { isNextResponse, requireStudent } from "@/lib/api-auth";
import { bootcampTracks } from "@/lib/bootcamp";
import { db } from "@/lib/db";

export async function GET() {
  const auth = await requireStudent();
  if (isNextResponse(auth)) return auth;

  const user = await db.user.findUnique({
    where: { id: auth.userId },
    select: {
      track: true,
      accessTier: true,
      name: true,
    },
  });

  if (!user?.track) {
    return NextResponse.json({
      track: null,
      courses: [],
      tutor: null,
      unlocks: [],
    });
  }

  const [courses, tutorTrack, unlocks, progress] = await Promise.all([
    db.course.findMany({
      where: { track: user.track, published: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      include: {
        modules: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            description: true,
            access: true,
            order: true,
            videoUrl: true,
            passMark: true,
          },
        },
        tutor: {
          select: { id: true, name: true, bio: true, avatarUrl: true, email: true },
        },
      },
    }),
    db.tutorTrack.findUnique({
      where: { track: user.track },
      include: {
        tutor: {
          select: {
            id: true,
            name: true,
            bio: true,
            avatarUrl: true,
            email: true,
            whatsapp: true,
          },
        },
      },
    }),
    db.moduleUnlock.findMany({
      where: { userId: auth.userId },
      select: { moduleId: true },
    }),
    db.moduleProgress.findMany({
      where: { userId: auth.userId },
    }),
  ]);

  const progressByModule = Object.fromEntries(
    progress.map((row) => [row.moduleId, row]),
  );
  const unlocked = new Set(unlocks.map((row) => row.moduleId));

  return NextResponse.json({
    track: user.track,
    trackLabel: bootcampTracks[user.track] || user.track,
    accessTier: user.accessTier,
    tutor: tutorTrack?.tutor || courses[0]?.tutor || null,
    courses: courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      order: course.order,
      modules: course.modules.map((moduleRow, index) => {
        const prior = course.modules.slice(0, index);
        const priorComplete = prior.every((item) => {
          const p = progressByModule[item.id];
          return p?.quizPassed;
        });
        const p = progressByModule[moduleRow.id];
        const isPaidLocked =
          moduleRow.access === "paid" &&
          user.accessTier !== "paid" &&
          !unlocked.has(moduleRow.id);

        return {
          ...moduleRow,
          unlocked: !isPaidLocked,
          lockedReason: isPaidLocked
            ? "paid"
            : index > 0 && !priorComplete
              ? "sequence"
              : null,
          progress: p
            ? {
                videoCompleted: p.videoCompleted,
                quizPassed: p.quizPassed,
                quizScore: p.quizScore,
                quizAttempts: p.quizAttempts,
              }
            : null,
        };
      }),
    })),
  });
}
