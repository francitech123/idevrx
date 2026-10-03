import { Project } from '../models/Project.js';

/**
 * Convert a title to a URL-safe slug.
 * "Robot Arm v2.0!" → "robot-arm-v2-0"
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')      // remove non-word chars except space/hyphen
    .replace(/[\s_]+/g, '-')       // spaces/underscores → hyphens
    .replace(/-+/g, '-')           // collapse multiple hyphens
    .replace(/^-+|-+$/g, '')       // trim leading/trailing hyphens
    .slice(0, 80);                 // cap length
}

/**
 * Find a unique slug for a project. If "robot-arm" exists,
 * returns "robot-arm-2", "robot-arm-3", etc.
 */
export async function uniqueSlug(baseSlug: string, excludeProjectId?: string): Promise<string> {
  const base = baseSlug || 'project';
  let candidate = base;
  let counter = 1;

  // Loop until we find a candidate that doesn't collide
  // Cap at 100 attempts to be safe
  while (counter < 100) {
    const query: Record<string, unknown> = { slug: candidate };
    if (excludeProjectId) query._id = { $ne: excludeProjectId };

    const exists = await Project.exists(query);
    if (!exists) return candidate;

    counter += 1;
    candidate = `${base}-${counter}`;
  }

  // Fallback: append a random suffix
  return `${base}-${Date.now().toString(36)}`;
}
