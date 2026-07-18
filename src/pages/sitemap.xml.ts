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
  const notes = await getCollection('notes', ({ data }) => !data.draft);
  const staticPaths = ['/', '/about/', ...site.columns.map((column) => `/columns/${column.id}/`)];

  const staticUrls = staticPaths.map((path) =>
    `  <url><loc>${escapeXml(new URL(path, origin).toString())}</loc></url>`,
  );
  const noteUrls = notes.map((note) =>
    `  <url><loc>${escapeXml(new URL(`/notes/${note.id}/`, origin).toString())}</loc><lastmod>${note.data.date.toISOString()}</lastmod></url>`,
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...noteUrls].join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
