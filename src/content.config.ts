import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    category: z.enum(['seo', 'ai', 'claude-code', 'gtm']),
    image: z.string(),
    author: z.string().default('Kenneth Abueg'),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { blog };
