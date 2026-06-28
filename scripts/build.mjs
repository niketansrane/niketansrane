#!/usr/bin/env node
// Build step: regenerates listing blocks (home, blogs index, sitemap, README)
// from content/posts.json. Existing post pages are NOT touched.
//
// Each target file declares regions to regenerate using HTML/XML/MD comment
// markers: <!-- POSTS:START id="<region>" --> ... <!-- POSTS:END id="<region>" -->
// The build script writes between those markers; everything else is preserved
// byte-for-byte. This means existing URLs and page bodies cannot be broken
// by the build — at worst a listing card is missing or stale.
//
// Usage:
//   node scripts/build.mjs           # write changes
//   node scripts/build.mjs --check   # exit 1 if any file would change

import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const CHECK_ONLY = process.argv.includes("--check");

const readJson = async (p) => JSON.parse(await readFile(p, "utf8"));

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function getIndent(source, id) {
  const open = `<!-- POSTS:START id="${id}" -->`;
  const idx = source.indexOf(open);
  if (idx === -1) return 0;
  let n = 0, i = idx - 1;
  while (i >= 0 && source[i] === " ") { n++; i--; }
  return n;
}

// Replace content between markers; everything else preserved byte-for-byte.
function replaceRegion(source, id, newInner) {
  const open = `<!-- POSTS:START id="${id}" -->`;
  const close = `<!-- POSTS:END id="${id}" -->`;
  const openIdx = source.indexOf(open);
  const closeIdx = source.indexOf(close);
  if (openIdx === -1 || closeIdx === -1) {
    throw new Error(`Markers for region "${id}" not found.`);
  }
  const indent = " ".repeat(getIndent(source, id));
  const before = source.slice(0, openIdx + open.length);
  const after = source.slice(closeIdx);
  return `${before}\n${newInner}\n${indent}${after}`;
}

// --- Renderers --------------------------------------------------------------

function renderHomeCard(post, indent) {
  const pad = " ".repeat(indent);
  const title = post.titleHome ?? post.title;
  const excerpt = post.excerptHome ?? post.excerpt;
  return [
    `${pad}<article class="blog-preview">`,
    `${pad}    <a href="blogs/${post.path}/" class="blog-preview-link">`,
    `${pad}        <div class="blog-meta">`,
    `${pad}            <time datetime="${post.datetime}" class="blog-date">${escapeHtml(post.dateDisplay)}</time>`,
    `${pad}            <span class="blog-reading-time">${escapeHtml(post.readingTime)}</span>`,
    `${pad}        </div>`,
    `${pad}        <h3>${escapeHtml(title)}</h3>`,
    `${pad}        <p class="blog-excerpt">`,
    `${pad}            ${escapeHtml(excerpt)}`,
    `${pad}        </p>`,
    `${pad}    </a>`,
    `${pad}</article>`,
  ].join("\n");
}

function renderBlogsCard(post, indent) {
  const pad = " ".repeat(indent);
  const category = post.category ?? "technical";
  const categoryLabel = category[0].toUpperCase() + category.slice(1);
  return [
    `${pad}<article class="post-card" data-category="${category}">`,
    `${pad}    <a href="${post.path}/" class="post-link">`,
    `${pad}        <div class="post-meta">`,
    `${pad}            <time datetime="${post.datetime}" class="post-date">${escapeHtml(post.dateDisplay)}</time>`,
    `${pad}            <span class="post-reading-time">${escapeHtml(post.readingTime)}</span>`,
    `${pad}            <span class="post-category-badge ${category}">${escapeHtml(categoryLabel)}</span>`,
    `${pad}        </div>`,
    `${pad}        <h2 class="post-title">${escapeHtml(post.title)}</h2>`,
    `${pad}        <p class="post-excerpt">`,
    `${pad}            ${escapeHtml(post.excerpt)}`,
    `${pad}        </p>`,
    `${pad}    </a>`,
    `${pad}</article>`,
  ].join("\n");
}

function renderSitemapEntries(posts, indent) {
  const pad = " ".repeat(indent);
  return posts.map((p) => [
    `${pad}<url>`,
    `${pad}  <loc>https://www.niketansrane.com/blogs/${p.path}/</loc>`,
    `${pad}  <lastmod>${p.lastmod}</lastmod>`,
    `${pad}  <changefreq>monthly</changefreq>`,
    `${pad}  <priority>${p.category === "personal" ? "0.8" : "0.9"}</priority>`,
    `${pad}</url>`,
  ].join("\n")).join("\n");
}

function renderReadmeList(posts) {
  return posts.slice(0, 5).map((p) => {
    const url = `https://www.niketansrane.com/blogs/${p.path}/`;
    const summary = p.excerpt.replace(/\.$/, "");
    return `- [${p.title}](${url}) - ${summary}`;
  }).join("\n");
}

// --- Orchestration ----------------------------------------------------------

async function processFile(relPath, regions) {
  const fullPath = resolve(ROOT, relPath);
  const original = await readFile(fullPath, "utf8");
  let updated = original;
  for (const region of regions) {
    updated = replaceRegion(updated, region.id, region.content);
  }
  if (updated === original) {
    console.log(`  unchanged  ${relPath}`);
    return false;
  }
  if (CHECK_ONLY) {
    console.log(`  WOULD UPDATE  ${relPath}`);
    return true;
  }
  await writeFile(fullPath, updated, "utf8");
  console.log(`  updated  ${relPath}`);
  return true;
}

async function main() {
  const data = await readJson(resolve(ROOT, "content/posts.json"));
  const posts = data.posts;

  if (!Array.isArray(posts) || posts.length === 0) {
    throw new Error("content/posts.json has no posts.");
  }

  // Validate each post folder exists so we never publish a dead link.
  const missing = [];
  for (const p of posts) {
    const idx = resolve(ROOT, "blogs", p.path, "index.html");
    if (!existsSync(idx)) missing.push(`blogs/${p.path}/index.html`);
  }
  if (missing.length) {
    throw new Error(
      `Missing post pages — build would publish broken links:\n  - ${missing.join("\n  - ")}`
    );
  }

  console.log(`Building from ${posts.length} posts...`);

  const homeSrc = await readFile(resolve(ROOT, "index.html"), "utf8");
  const blogsSrc = await readFile(resolve(ROOT, "blogs/index.html"), "utf8");
  const sitemapSrc = await readFile(resolve(ROOT, "sitemap.xml"), "utf8");

  const homeIndent = getIndent(homeSrc, "home-articles");
  const blogsIndent = getIndent(blogsSrc, "post-cards");
  const sitemapIndent = getIndent(sitemapSrc, "post-urls");

  const homeCards = posts.map((p) => renderHomeCard(p, homeIndent)).join("\n\n");
  const blogsCards = posts.map((p) => renderBlogsCard(p, blogsIndent)).join("\n\n");
  const sitemapEntries = renderSitemapEntries(posts, sitemapIndent);
  const readmeList = renderReadmeList(posts);

  let anyChanged = false;
  anyChanged = (await processFile("index.html", [
    { id: "home-articles", content: homeCards },
  ])) || anyChanged;
  anyChanged = (await processFile("blogs/index.html", [
    { id: "post-cards", content: blogsCards },
  ])) || anyChanged;
  anyChanged = (await processFile("sitemap.xml", [
    { id: "post-urls", content: sitemapEntries },
  ])) || anyChanged;
  anyChanged = (await processFile("README.md", [
    { id: "recent-writing", content: readmeList },
  ])) || anyChanged;

  if (CHECK_ONLY && anyChanged) {
    console.error("\nBuild output is out of date. Run `npm run build`.");
    process.exit(1);
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
