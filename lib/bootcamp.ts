export const bootcampTracks: Record<string, string> = {
  frontend: "Frontend Web Development",
  backend: "Backend Development",
  uiux: "UI/UX (Product Design)",
  graphic: "Graphic Design",
  data: "Data Analysis",
};

export const laptopLabels: Record<string, string> = {
  yes: "Yes, I have my own laptop",
  no: "No, I need support",
};

export type BootcampApplication = {
  fullName: string;
  email: string;
  age: string;
  gender: string;
  whatsapp: string;
  education: string;
  laptop: string;
  track: string;
};

export function parseBootcampApplication(
  data: Record<string, FormDataEntryValue>,
): { ok: true; value: BootcampApplication } | { ok: false; error: string } {
  const fullName = String(data.fullName ?? "").trim();
  const email = String(data.email ?? "").trim().toLowerCase();
  const age = String(data.age ?? "").trim();
  const gender = String(data.gender ?? "").trim();
  const whatsapp = String(data.whatsapp ?? "").trim();
  const education = String(data.education ?? "").trim();
  const laptop = String(data.laptop ?? "").trim();
  const track = String(data.track ?? "").trim();

  if (fullName.length < 2) {
    return { ok: false, error: "Please enter your full name." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  const ageNumber = Number(age);
  if (!age || Number.isNaN(ageNumber) || ageNumber < 13 || ageNumber > 80) {
    return { ok: false, error: "Please enter a valid age." };
  }
  if (!gender) {
    return { ok: false, error: "Please select your gender." };
  }
  if (whatsapp.length < 8) {
    return { ok: false, error: "Please enter a valid WhatsApp number." };
  }
  if (!education) {
    return { ok: false, error: "Please select your educational level." };
  }
  if (!laptop) {
    return { ok: false, error: "Please tell us about laptop access." };
  }
  if (!track || !bootcampTracks[track]) {
    return { ok: false, error: "Please select a bootcamp track." };
  }

  return {
    ok: true,
    value: {
      fullName,
      email,
      age,
      gender,
      whatsapp,
      education,
      laptop,
      track,
    },
  };
}
