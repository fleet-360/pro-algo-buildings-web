import { readFileSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vm from "node:vm";

const root = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(root, "..");

function loadContent() {
  const code = readFileSync(join(projectRoot, "content.js"), "utf8");
  const context = { window: {} };
  vm.runInNewContext(code, context);
  return context.window.PRO_ALGORITHM;
}

function generateRedirects(seo) {
  return (seo.redirects || []).map(({ path, section }) => ({
    source: path,
    destination: `/#${section}`,
    permanent: true,
  }));
}

function collectBlogSlugs(locales) {
  const items = locales.he?.blogs?.items || locales.en?.blogs?.items || [];
  return items.map((item) => item.slug);
}

function cleanupLegacyBlogPages(slugs) {
  const blogDir = join(projectRoot, "blog");
  slugs.forEach((slug) => {
    const dir = join(blogDir, slug);
    if (existsSync(dir)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });
}

function generateSitemap(siteUrl, slugs) {
  const base = siteUrl.replace(/\/$/, "");
  const urls = [
    { loc: `${base}/`, changefreq: "weekly", priority: "1.0" },
    ...slugs.map((slug) => ({
      loc: `${base}/blog/${slug}`,
      changefreq: "monthly",
      priority: "0.8",
    })),
    { loc: `${base}/catalog/`, changefreq: "monthly", priority: "0.6" },
  ];

  const body = urls
    .map(
      (entry) => `  <url>
    <loc>${entry.loc}</loc>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

function generateRobots(siteUrl) {
  const base = siteUrl.replace(/\/$/, "");
  return `User-agent: *
Allow: /

Sitemap: ${base}/sitemap.xml
`;
}

const content = loadContent();
const { seo, locales } = content;
const slugs = collectBlogSlugs(locales);

const vercelConfig = {
  redirects: generateRedirects(seo),
  rewrites: [
    { source: "/blog/:slug", destination: "/blog/post.html" },
    { source: "/blog/:slug/", destination: "/blog/post.html" },
  ],
  headers: [
    {
      source: "/(.*)",
      headers: [{ key: "X-Content-Type-Options", value: "nosniff" }],
    },
  ],
};

cleanupLegacyBlogPages(slugs);

writeFileSync(join(projectRoot, "vercel.json"), `${JSON.stringify(vercelConfig, null, 2)}\n`);
writeFileSync(join(projectRoot, "sitemap.xml"), generateSitemap(seo.siteUrl, slugs));
writeFileSync(join(projectRoot, "robots.txt"), generateRobots(seo.siteUrl));

console.log(`Generated vercel.json (${vercelConfig.redirects.length} redirects, ${vercelConfig.rewrites.length} rewrites)`);
console.log(`Generated sitemap.xml (${slugs.length + 2} URLs)`);
console.log("Removed legacy per-slug blog index files");
console.log("Generated robots.txt");
