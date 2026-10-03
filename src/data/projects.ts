export const projectSlugs = ["tablets", "capsules"] as const;

export type ProjectSlug = (typeof projectSlugs)[number];
