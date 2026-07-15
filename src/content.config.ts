import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 笔记集合：每篇一个 markdown，放在 src/content/notes/。
// 加新内容只需往那个目录丢一个 .md 文件，首页和路由会自动更新。
const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    deck: z.string().optional(),          // 一句话摘要
    date: z.coerce.date(),                // 发布日期
    type: z.string(),                     // 栏目：读书 / 论文 / AI商业落地 / 展会
    tags: z.array(z.string()).default([]),// 主题标签：AI / 空间智能 / 具身智能 等
    readtime: z.string().optional(),      // 阅读时长
    draft: z.boolean().default(false),    // 草稿不上线
  }),
});

export const collections = { notes };
