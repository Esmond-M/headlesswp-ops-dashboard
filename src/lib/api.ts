import { z } from 'zod';

const WP_BASE = import.meta.env.DEV
  ? '/wp-json/wp/v2'
  : `${import.meta.env.VITE_WP_ORIGIN ?? ''}/wp-json/wp/v2`;

const wpRenderedSchema = z.object({ rendered: z.string() });

const wpPostSchema = z.object({
  id: z.number(),
  date: z.string(),
  modified: z.string(),
  link: z.string(),
  status: z.string().optional(),
  title: wpRenderedSchema,
  excerpt: wpRenderedSchema.optional(),
});

export type WpPost = z.infer<typeof wpPostSchema>;

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
