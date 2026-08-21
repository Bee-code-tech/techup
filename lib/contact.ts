export const contactSubjects = [
  "Bootcamp",
  "Scholarship",
  "Courses",
  "Partnership",
  "Other",
] as const;

export type ContactSubject = (typeof contactSubjects)[number];

export type ContactMessage = {
  fullName: string;
  email: string;
  subject: ContactSubject;
  message: string;
};

export function parseContactMessage(
  data: Record<string, FormDataEntryValue>,
): { ok: true; value: ContactMessage } | { ok: false; error: string } {
  const fullName = String(data.fullName ?? "").trim();
  const email = String(data.email ?? "").trim().toLowerCase();
  const subject = String(data.subject ?? "").trim();
  const message = String(data.message ?? "").trim();

  if (fullName.length < 2) {
    return { ok: false, error: "Please enter your full name." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (!contactSubjects.includes(subject as ContactSubject)) {
    return { ok: false, error: "Please select a subject." };
  }
  if (message.length < 10) {
    return {
      ok: false,
      error: "Please enter a message with at least 10 characters.",
    };
  }
  if (message.length > 4000) {
    return { ok: false, error: "Please keep your message under 4000 characters." };
  }

  return {
    ok: true,
    value: {
      fullName,
      email,
      subject: subject as ContactSubject,
      message,
    },
  };
}
