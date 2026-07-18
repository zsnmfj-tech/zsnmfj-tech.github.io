import { getCollection } from 'astro:content';
import { site } from '../site.config';

export const prerender = true;

const escapeXml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

export async function GET({ site: siteUrl }: { site?: URL }) {
  const origin = siteUrl ?? new URL('https://zsnmfj-tech.github.io');
  const notes = (await getCollection('notes', ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  const items = notes.map((note) => {
    const url = new URL(`/notes/${note.id}/`, origin).toString();
    return `    <item>
      <title>${escapeXml(note.data.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${note.data.date.toUTCString()}</pubDate>
      <description>${escapeXml(note.data.deck ?? note.data.title)}</description>
    </item>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(site.siteName)}</title>
    <link>${escapeXml(origin.toString())}</link>
    <description>${escapeXml(site.description)}</description>
    <language>zh-CN</language>
    <atom:link href="${escapeXml(new URL('/rss.xml', origin).toString())}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
