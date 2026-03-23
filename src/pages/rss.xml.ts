import type { APIContext } from 'astro';
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context: APIContext) {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const posts = (await getCollection('blog'))
    .filter(post => new Date(`${post.data.date}T00:00:00`) <= today)
    .sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());

  return rss({
    title: 'Manoga Digital Blog',
    description: 'Insights on SEO, AI, Claude Code, and Google Tag Manager from Manoga Digital.',
    site: context.site!,
    items: posts.map(post => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: new Date(`${post.data.date}T00:00:00`),
      link: `/blog/${post.id}/`,
      categories: [post.data.category],
    })),
  });
}
