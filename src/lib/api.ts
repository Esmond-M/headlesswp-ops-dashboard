import { z } from 'zod';

const WP_BASE = import.meta.env.DEV
  ? '/wp-json/wp/v2'
  : `${import.meta.env.VITE_WP_ORIGIN ?? ''}/wp-json/wp/v2`;

const wpRenderedSchema = z.object({ rendered: z.string() });

const wpTermSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  taxonomy: z.string(),
});

const caseStudyMetaSchema = z.object({
  emclient_client_name: z.string().optional(),
  emclient_role: z.string().optional(),
  emclient_project_url: z.string().optional(),
  emclient_repository_url: z.string().optional(),
  emclient_completion_year: z.union([z.number(), z.string()]).optional(),
  emclient_challenge: z.string().optional(),
  emclient_solution: z.string().optional(),
  emclient_outcome: z.string().optional(),
}).optional();

const wpPostSchema = z.object({
  id: z.number(),
  date: z.string(),
  modified: z.string(),
  link: z.string(),
  author: z.number().optional(),
  categories: z.array(z.number()).default([]),
  status: z.string().optional(),
  title: wpRenderedSchema,
  excerpt: wpRenderedSchema.optional(),
});

export type WpPost = z.infer<typeof wpPostSchema>;

export type PaginatedPosts = {
  posts: WpPost[];
  total: number;
  totalPages: number;
};

const wpCaseStudySchema = wpPostSchema.extend({
  featured_media: z.number().optional(),
  project_type: z.array(z.number()).default([]),
  project_stack: z.array(z.number()).default([]),
  meta: caseStudyMetaSchema,
  _embedded: z.object({
    'wp:term': z.array(z.array(wpTermSchema)).optional(),
  }).optional(),
});

export type WpCaseStudy = z.infer<typeof wpCaseStudySchema>;

function validate<T>(schema: z.ZodSchema<T>, input: unknown, source: string): T {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    throw new Error(`Invalid response shape from ${source}`);
  }
  return parsed.data;
}

async function getJson(url: string): Promise<unknown> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${url}`);
  }
  return response.json();
}

export async function fetchRecentPosts(limit = 5): Promise<WpPost[]> {
  const raw = await getJson(`${WP_BASE}/posts?per_page=${limit}`);
  return validate(z.array(wpPostSchema), raw, 'posts');
}

export async function fetchAllPosts(): Promise<WpPost[]> {
  const raw = await getJson(`${WP_BASE}/posts?per_page=100`);
  return validate(z.array(wpPostSchema), raw, 'all posts');
}

export async function fetchEditorialPosts(page = 1, perPage = 10): Promise<PaginatedPosts> {
  const response = await fetch(`${WP_BASE}/posts?page=${page}&per_page=${perPage}`);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} editorial posts`);
  }

  const raw = await response.json();
  return {
    posts: validate(z.array(wpPostSchema), raw, 'editorial posts'),
    total: Number(response.headers.get('X-WP-Total') ?? 0),
    totalPages: Number(response.headers.get('X-WP-TotalPages') ?? 1),
  };
}

export async function fetchCaseStudies(): Promise<WpCaseStudy[]> {
  const raw = await getJson(`${WP_BASE}/project_item?per_page=100&_embed=1`);
  return validate(z.array(wpCaseStudySchema), raw, 'case studies');
}
