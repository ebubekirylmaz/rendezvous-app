// Pure types/constants with no server-only dependencies (no Prisma import),
// so client components can use DAY_KEYS without pulling `pg` into the browser
// bundle. Server-side logic that reads/writes these lives in lib/data.ts.

export const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type DayKey = (typeof DAY_KEYS)[number];
export type DayHours = { closed: boolean; start: string; end: string };
export type WorkingHoursMap = Record<DayKey, DayHours>;
