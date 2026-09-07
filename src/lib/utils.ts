// NOTE: If you already have lib/utils.ts (e.g. from shadcn's `cn` helper),
// keep your existing one — this is a plain fallback with no dependencies.

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
