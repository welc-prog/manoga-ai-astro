import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { defineCollection } from 'astro:content';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
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
