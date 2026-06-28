#!/usr/bin/env node
// Scaffolds a new blog post: creates blogs/<path>/index.html from the
// template, adds an entry to content/posts.json, and runs the build.
//
// Usage:
//   npm run new-post -- --slug my-post --title "My Post" \
//     --excerpt "Short summary." --reading "5 min read" \
//     [--category technical|personal] [--datetime 2026-07] \
//     [--date-display "July 2026"] [--lastmod 2026-07-15] \
//     [--path optional/path/override]

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        out[key] = next;
        i++;
      } else {
        out[key] = true;
      }
    }
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));

const required = ["slug", "title", "excerpt", "reading"];
const missing = required.filter((k) => !args[k] || args[k] === true);
if (missing.length) {
  console.error(`Missing required flag(s): ${missing.map((k) => "--" + k).join(", ")}`);
  console.error("Example:");
  console.error('  npm run new-post -- --slug my-post --title "My Post" --excerpt "Summary." --reading "5 min read"');
  process.exit(1);
}

const slug = args.slug;
const category = args.category || "technical";
const path = args.path || (category === "personal" ? `personal/${slug}` : slug);

if (!/^[a-z0-9][a-z0-9/-]*$/.test(path)) {
  console.error(`Invalid path "${path}". Use lowercase letters, digits, hyphens, slashes.`);
  process.exit(1);
}

const now = new Date();
const yyyyMm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
const yyyyMmDd = `${yyyyMm}-${String(now.getDate()).padStart(2, "0")}`;
const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const defaultDisplay = `${months[now.getMonth()]} ${now.getFullYear()}`;

const post = {
  slug,
  path,
  title: args.title,
  datetime: args.datetime || yyyyMm,
  dateDisplay: args["date-display"] || defaultDisplay,
  lastmod: args.lastmod || yyyyMmDd,
  readingTime: args.reading,
  category,
  excerpt: args.excerpt,
};

const postDir = resolve(ROOT, "blogs", path);
const postIndex = resolve(postDir, "index.html");
if (existsSync(postIndex)) {
  console.error(`Refusing to overwrite existing file: blogs/${path}/index.html`);
  process.exit(1);
}

// Compute relative paths back to root and blogs/ from the post page.
const depth = path.split("/").length; // post lives at blogs/<path>/index.html
const rootRel = "../".repeat(depth + 1); // includes the blogs segment
const blogsRel = "../".repeat(depth);

const template = await readFile(resolve(ROOT, "templates/post.html"), "utf8");
const rendered = template
  .replaceAll("{{title}}", escapeAttr(post.title))
  .replaceAll("{{description}}", escapeAttr(post.excerpt))
  .replaceAll("{{keywords}}", escapeAttr(args.keywords || ""))
  .replaceAll("{{path}}", post.path)
  .replaceAll("{{publishedDate}}", post.lastmod)
  .replaceAll("{{datetime}}", post.datetime)
  .replaceAll("{{dateDisplay}}", escapeAttr(post.dateDisplay))
  .replaceAll("{{readingTime}}", escapeAttr(post.readingTime))
  .replaceAll("{{rootRel}}", rootRel)
  .replaceAll("{{blogsRel}}", blogsRel);

await mkdir(postDir, { recursive: true });
await writeFile(postIndex, rendered, "utf8");
console.log(`Created blogs/${path}/index.html`);

// Insert into content/posts.json at the top (newest first).
const postsPath = resolve(ROOT, "content/posts.json");
const data = JSON.parse(await readFile(postsPath, "utf8"));
if (data.posts.some((p) => p.path === post.path)) {
  console.error(`Post with path "${post.path}" already exists in posts.json.`);
  process.exit(1);
}
data.posts.unshift(post);
await writeFile(postsPath, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log(`Added entry to content/posts.json`);

// Run the build to regenerate listings.
const result = spawnSync(process.execPath, [resolve(__dirname, "build.mjs")], {
  stdio: "inherit",
  cwd: ROOT,
});
process.exit(result.status ?? 0);

function escapeAttr(s) {
  return String(s).replaceAll('"', "&quot;");
}
