export const ROLES = ["admin", "tutor", "student"] as const;

export type Role = (typeof ROLES)[number];

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

export function dashboardHomeForRole(role: Role | string) {
  return "/dashboard";
}

/** Paths under /dashboard that require a specific role (prefix match). */
export const ROLE_ROUTE_RULES: Array<{
  prefix: string;
  roles: Role[];
}> = [
  { prefix: "/dashboard/students", roles: ["admin"] },
  { prefix: "/dashboard/broadcast", roles: ["admin"] },
  { prefix: "/dashboard/tutors", roles: ["admin"] },
  { prefix: "/dashboard/settings", roles: ["admin", "tutor", "student"] },
  { prefix: "/dashboard/courses/manage", roles: ["tutor", "admin"] },
  { prefix: "/dashboard/assignments/review", roles: ["tutor", "admin"] },
  { prefix: "/dashboard/learn", roles: ["student"] },
  { prefix: "/dashboard/live/manage", roles: ["tutor", "admin"] },
  // /dashboard/live redirects students to overview (live callout lives there)
  { prefix: "/dashboard/live", roles: ["student", "tutor", "admin"] },
];

export function rolesAllowedForPath(pathname: string): Role[] | null {
  const match = ROLE_ROUTE_RULES.find(
    (rule) =>
      pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`),
  );
  return match ? match.roles : null;
}

export function canAccessPath(role: string, pathname: string) {
  const allowed = rolesAllowedForPath(pathname);
  if (!allowed) return true;
  return isRole(role) && allowed.includes(role);
}
