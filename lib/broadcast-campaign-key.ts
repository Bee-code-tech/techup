export function slugifyCampaignKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function normalizeCampaignKey(value: string) {
  const slug = slugifyCampaignKey(value);
  return slug || "";
}
