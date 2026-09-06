/**
 * Seed LMS demo content so you can browse the student learning UI.
 *
 * Creates / refreshes:
 * - Demo tutor (frontend track)
 * - 2 published courses with modules, sample videos, quizzes
 * - Demo student on frontend (free tier)
 * - Optional progress on module 1
 * - Active live session for the overview callout
 *
 * Logins:
 *   Tutor:   tutor.demo@techupacademy.test  /  TutorDemo1!
 *   Student: student.demo@techupacademy.test / StudentDemo1!
 *
 * Usage: npx tsx scripts/seed-lms.ts
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const TUTOR_EMAIL = "tutor.demo@techupacademy.test";
const STUDENT_EMAIL = "student.demo@techupacademy.test";
const TUTOR_PASSWORD = "TutorDemo1!";
const STUDENT_PASSWORD = "StudentDemo1!";
const TRACK = "frontend";

/** Public sample MP4 (works in <video> without Cloudinary). */
const SAMPLE_VIDEO =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

const SAMPLE_VIDEO_2 =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4";

type ModuleSeed = {
  title: string;
  description: string;
  access: "free" | "paid";
  videoUrl: string;
  passMark: number;
  questions: Array<{
    prompt: string;
    options: string[];
    correctIndex: number;
  }>;
};

type CourseSeed = {
  title: string;
  description: string;
  order: number;
  modules: ModuleSeed[];
};

const COURSES: CourseSeed[] = [
  {
    title: "HTML & CSS Foundations",
    description:
      "Build clean page structure and style layouts the way production teams do.",
    order: 0,
    modules: [
      {
        title: "Semantic HTML essentials",
        description:
          "Learn headings, sections, lists, and accessible markup patterns.",
        access: "free",
        videoUrl: SAMPLE_VIDEO,
        passMark: 70,
        questions: [
          {
            prompt: "Which tag best represents the main content of a page?",
            options: ["<div>", "<main>", "<span>", "<section>"],
            correctIndex: 1,
          },
          {
            prompt: "What does the alt attribute on an <img> provide?",
            options: [
              "Image compression",
              "Alternative text for accessibility",
              "CSS styling hooks",
              "Lazy-loading behaviour",
            ],
            correctIndex: 1,
          },
          {
            prompt: "Which element should wrap navigation links?",
            options: ["<nav>", "<header> only", "<footer>", "<aside>"],
            correctIndex: 0,
          },
        ],
      },
      {
        title: "CSS layout with Flexbox",
        description:
          "Align, distribute, and nest flex containers for responsive UI.",
        access: "free",
        videoUrl: SAMPLE_VIDEO_2,
        passMark: 70,
        questions: [
          {
            prompt: "Which property turns an element into a flex container?",
            options: [
              "position: flex",
              "display: flex",
              "flex: container",
              "layout: flex",
            ],
            correctIndex: 1,
          },
          {
            prompt: "justify-content primarily controls alignment on the…",
            options: [
              "Cross axis",
              "Main axis",
              "Z-index stack",
              "Grid template",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        title: "Responsive design checklist",
        description:
          "Mobile-first breakpoints, fluid type, and touch-friendly targets.",
        access: "paid",
        videoUrl: SAMPLE_VIDEO,
        passMark: 75,
        questions: [
          {
            prompt: "A common mobile-first breakpoint approach starts with…",
            options: [
              "Desktop styles, then override down",
              "Base mobile styles, then enhance up",
              "Only print styles",
              "Fixed 1440px layouts",
            ],
            correctIndex: 1,
          },
          {
            prompt: "Minimum recommended touch target size is around…",
            options: ["8px", "16px", "44px", "96px"],
            correctIndex: 2,
          },
        ],
      },
    ],
  },
  {
    title: "JavaScript for the Browser",
    description:
      "DOM events, state in the UI, and small interactive patterns students ship weekly.",
    order: 1,
    modules: [
      {
        title: "Selecting & updating the DOM",
        description:
          "querySelector, textContent vs innerHTML, and safe updates.",
        access: "free",
        videoUrl: SAMPLE_VIDEO_2,
        passMark: 70,
        questions: [
          {
            prompt: "Which method selects the first matching element?",
            options: [
              "document.getAll()",
              "document.querySelector()",
              "document.find()",
              "window.select()",
            ],
            correctIndex: 1,
          },
          {
            prompt: "Prefer textContent over innerHTML when you need to…",
            options: [
              "Inject HTML markup",
              "Set plain text safely",
              "Load remote scripts",
              "Create Web Components",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        title: "Events & user interaction",
        description: "Click handlers, forms, and preventing default behaviour.",
        access: "free",
        videoUrl: SAMPLE_VIDEO,
        passMark: 70,
        questions: [
          {
            prompt: "addEventListener attaches a handler without…",
            options: [
              "Replacing existing inline handlers carefully",
              "Overwriting other listeners on the same event type",
              "Needing a DOM node",
              "Using a callback",
            ],
            correctIndex: 1,
          },
          {
            prompt: "event.preventDefault() is commonly used to…",
            options: [
              "Stop CSS transitions",
              "Block the browser’s default action",
              "Delete the event target",
              "Pause JavaScript execution",
            ],
            correctIndex: 1,
          },
        ],
      },
    ],
  },
];

async function upsertTutor() {
  const passwordHash = await bcrypt.hash(TUTOR_PASSWORD, 12);
  const existing = await db.user.findUnique({ where: { email: TUTOR_EMAIL } });

  if (existing) {
    await db.user.update({
      where: { id: existing.id },
      data: {
        name: "Demo Frontend Tutor",
        passwordHash,
        role: "tutor",
        bio: "Helps students ship clean frontend projects at TechUp.",
        mustChangePassword: false,
      },
    });
    return existing.id;
  }

  const created = await db.user.create({
    data: {
      name: "Demo Frontend Tutor",
      email: TUTOR_EMAIL,
      passwordHash,
      role: "tutor",
      bio: "Helps students ship clean frontend projects at TechUp.",
      mustChangePassword: false,
    },
  });
  return created.id;
}

async function assignTutorTrack(tutorId: string) {
  const existing = await db.tutorTrack.findUnique({ where: { track: TRACK } });
  if (existing) {
    if (existing.tutorId !== tutorId) {
      await db.tutorTrack.delete({ where: { id: existing.id } });
      await db.tutorTrack.create({ data: { tutorId, track: TRACK } });
      console.log(`Reassigned ${TRACK} track to demo tutor.`);
    }
    return;
  }
  await db.tutorTrack.create({ data: { tutorId, track: TRACK } });
}

async function upsertStudent() {
  const passwordHash = await bcrypt.hash(STUDENT_PASSWORD, 12);
  const existing = await db.user.findUnique({ where: { email: STUDENT_EMAIL } });

  if (existing) {
    await db.user.update({
      where: { id: existing.id },
      data: {
        name: "Demo Student",
        passwordHash,
        role: "student",
        track: TRACK,
        accessTier: "free",
        age: 22,
        gender: "Prefer not to say",
        whatsapp: "+2348000000000",
        education: "Undergraduate",
        laptop: "yes",
        mustChangePassword: false,
      },
    });
    return existing.id;
  }

  const created = await db.user.create({
    data: {
      name: "Demo Student",
      email: STUDENT_EMAIL,
      passwordHash,
      role: "student",
      track: TRACK,
      accessTier: "free",
      age: 22,
      gender: "Prefer not to say",
      whatsapp: "+2348000000000",
      education: "Undergraduate",
      laptop: "yes",
      mustChangePassword: false,
    },
  });
  return created.id;
}

async function clearPreviousSeedCourses(tutorId: string) {
  const courses = await db.course.findMany({
    where: { tutorId, track: TRACK },
    select: { id: true },
  });
  const courseIds = courses.map((c) => c.id);
  if (courseIds.length === 0) return;

  const modules = await db.module.findMany({
    where: { courseId: { in: courseIds } },
    select: { id: true },
  });
  const moduleIds = modules.map((m) => m.id);

  if (moduleIds.length > 0) {
    await db.quizQuestion.deleteMany({ where: { moduleId: { in: moduleIds } } });
    await db.moduleProgress.deleteMany({
      where: { moduleId: { in: moduleIds } },
    });
    await db.moduleUnlock.deleteMany({ where: { moduleId: { in: moduleIds } } });
    await db.assignmentSubmission.deleteMany({
      where: { moduleId: { in: moduleIds } },
    });
    await db.module.deleteMany({ where: { id: { in: moduleIds } } });
  }

  await db.course.deleteMany({ where: { id: { in: courseIds } } });
}

async function seedCourses(tutorId: string) {
  const createdModuleIds: string[] = [];

  for (const courseSeed of COURSES) {
    const course = await db.course.create({
      data: {
        track: TRACK,
        title: courseSeed.title,
        description: courseSeed.description,
        order: courseSeed.order,
        tutorId,
        published: true,
      },
    });

    for (let i = 0; i < courseSeed.modules.length; i += 1) {
      const moduleSeed = courseSeed.modules[i];
      const moduleRow = await db.module.create({
        data: {
          courseId: course.id,
          title: moduleSeed.title,
          description: moduleSeed.description,
          videoUrl: moduleSeed.videoUrl,
          access: moduleSeed.access,
          order: i,
          passMark: moduleSeed.passMark,
          materials: [
            {
              name: "Module notes (sample)",
              url: "https://www.w3.org/WAI/WCAG21/quickref/",
              format: "link",
            },
          ],
        },
      });
      createdModuleIds.push(moduleRow.id);

      for (let q = 0; q < moduleSeed.questions.length; q += 1) {
        const question = moduleSeed.questions[q];
        await db.quizQuestion.create({
          data: {
            moduleId: moduleRow.id,
            prompt: question.prompt,
            options: question.options,
            correctIndex: question.correctIndex,
            order: q,
          },
        });
      }
    }
  }

  return createdModuleIds;
}

async function seedStudentProgress(studentId: string, firstModuleId: string) {
  await db.moduleProgress.upsert({
    where: {
      userId_moduleId: { userId: studentId, moduleId: firstModuleId },
    },
    create: {
      userId: studentId,
      moduleId: firstModuleId,
      videoCompleted: true,
      quizPassed: false,
      quizAttempts: 0,
    },
    update: {
      videoCompleted: true,
      quizPassed: false,
    },
  });
}

async function seedLiveSession(tutorId: string) {
  await db.liveSession.updateMany({
    where: { track: TRACK, isActive: true },
    data: { isActive: false, endedAt: new Date() },
  });

  await db.liveSession.create({
    data: {
      track: TRACK,
      tutorId,
      title: "Frontend live lab — Flexbox clinic",
      platform: "meet",
      joinUrl: "https://meet.google.com/techup-demo-frontend",
      audience: "both",
      isActive: true,
    },
  });
}

async function main() {
  console.log("Seeding LMS demo content…");

  const tutorId = await upsertTutor();
  await assignTutorTrack(tutorId);
  const studentId = await upsertStudent();

  await clearPreviousSeedCourses(tutorId);
  const moduleIds = await seedCourses(tutorId);
  await seedStudentProgress(studentId, moduleIds[0]);
  await seedLiveSession(tutorId);

  console.log(
    JSON.stringify(
      {
        ok: true,
        track: TRACK,
        courses: COURSES.length,
        modules: moduleIds.length,
        logins: {
          tutor: { email: TUTOR_EMAIL, password: TUTOR_PASSWORD },
          student: { email: STUDENT_EMAIL, password: STUDENT_PASSWORD },
        },
        notes: [
          "Log in as the demo student to see courses on My learning.",
          "Module 1 video is marked complete — take the quiz to unlock module 2.",
          "One paid module stays locked for free-tier students.",
          "Overview shows a live class callout while the seeded session is active.",
        ],
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
