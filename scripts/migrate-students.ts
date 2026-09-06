/**
 * Migrate BootcampRegistration rows into User accounts (role=student).
 * Temp password = UPPERCASE first name from registration fullName.
 * Example: "Ademola Zainab" → password "ADEMOLA"
 *
 * Re-running updates profile fields and resets temp passwords for students
 * who still have mustChangePassword=true (does not overwrite changed passwords).
 *
 * Usage: npx tsx scripts/migrate-students.ts
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();
const BATCH = 10;

/** Temporary login password: first name, uppercased. */
export function tempPasswordFromFullName(fullName: string) {
  const first = fullName.trim().split(/\s+/)[0] || fullName.trim();
  return first.toUpperCase();
}

async function main() {
  const registrations = await db.bootcampRegistration.findMany({
    orderBy: { createdAt: "asc" },
  });

  let created = 0;
  let skipped = 0;
  let updated = 0;
  let passwordsReset = 0;

  console.log(`Migrating ${registrations.length} registrations...`);

  for (let i = 0; i < registrations.length; i += BATCH) {
    const slice = registrations.slice(i, i + BATCH);
    await Promise.all(
      slice.map(async (row) => {
        const email = row.email.trim().toLowerCase();
        const tempPassword = tempPasswordFromFullName(row.fullName);
        const passwordHash = await bcrypt.hash(tempPassword, 10);

        const existing = await db.user.findUnique({
          where: { email },
          select: { id: true, role: true, mustChangePassword: true },
        });

        if (existing) {
          if (existing.role === "student") {
            const data: {
              name: string;
              age: number;
              gender: string;
              whatsapp: string;
              education: string;
              laptop: string;
              track: string;
              passwordHash?: string;
              mustChangePassword?: boolean;
            } = {
              name: row.fullName,
              age: row.age,
              gender: row.gender,
              whatsapp: row.whatsapp,
              education: row.education,
              laptop: row.laptop,
              track: row.track,
            };

            // Keep temp-login scheme in sync until they change password
            if (existing.mustChangePassword) {
              data.passwordHash = passwordHash;
              data.mustChangePassword = true;
              passwordsReset += 1;
            }

            await db.user.update({
              where: { id: existing.id },
              data,
            });
            updated += 1;
          } else {
            skipped += 1;
          }
          return;
        }

        await db.user.create({
          data: {
            name: row.fullName,
            email,
            passwordHash,
            role: "student",
            age: row.age,
            gender: row.gender,
            whatsapp: row.whatsapp,
            education: row.education,
            laptop: row.laptop,
            track: row.track,
            accessTier: "free",
            mustChangePassword: true,
          },
        });
        created += 1;
      }),
    );
    console.log(
      `Progress ${Math.min(i + BATCH, registrations.length)}/${registrations.length}`,
    );
  }

  console.log(
    JSON.stringify({
      total: registrations.length,
      created,
      updated,
      passwordsReset,
      skipped,
    }),
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
