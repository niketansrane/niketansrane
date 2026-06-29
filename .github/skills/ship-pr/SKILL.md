---
name: ship-pr
description: Ship a change on niketansrane/niketansrane — commit, push, open PR, verify Vercel preview, hand off for merge.
---

# ship-pr

End-to-end checklist for shipping a change on this repo: write code → commit → push → open PR → verify Vercel preview → hand off for merge. Opinionated and repo-specific. PowerShell first.

## 1. When to use

Load this skill whenever the user asks to:

- "open a PR" / "create a pull request"
- "ship this" / "ship it"
- "deploy" — on this repo, deploy = **merge to `main`**. The site is a static HTML repo deployed by Vercel from the repo root (`vercel.json` has `outputDirectory: "."`). There is a tiny `npm run build` step that regenerates listing blocks (home, blogs index, sitemap, feed, README) from `content/posts.json`, but Vercel does not run it — the generated files are committed. Merging `main` is the deploy.

If the request is on any other repo, this skill does not apply.

## 2. Pre-flight checklist

Before touching git:

- [ ] `git status` — working tree changes match the intended scope, nothing stray staged.
- [ ] `git --no-pager diff --stat` — file/line counts look sane for what was requested.
- [ ] **If you added a new blog post**: edit `content/posts.json` (newest-first) and run `npm run build` — **don't** hand-edit `blogs/index.html`, `index.html`, `sitemap.xml`, `feed.xml`, or `README.md`. Those are generated between `<!-- POSTS:START id="…" -->` / `<!-- POSTS:END -->` markers from `posts.json`. CI runs `npm run check` (which is `node scripts/build.mjs --check`) and will fail the PR if any listing is out of date. The build also auto-generates the homepage card, sitemap entry, RSS item, and README link — saves you four manual edits.
- [ ] **Run `npm run check` locally before pushing** — fast, no network, catches the listings-out-of-date failure mode above. Skip only if the diff genuinely doesn't touch `content/posts.json` or any post page.
- [ ] **Other lints / builds**: there are no other CI checks today (no lint, no test). Do **not** invent `npm run lint`, `npm test`, or similar — `package.json` only defines `build` and `check`.
- [ ] **Referenced static assets exist on disk.** If you added or changed an HTML page, grep its `src=`, `href=`, and `og:image` values and confirm each file exists. Real example: the 404 work referenced `assets/images/og-image.png`, which did not exist — would have shipped a broken OG card. One-liner:
  ```pwsh
  Select-String -Path "<file>.html" -Pattern 'src="([^"]+)"|href="([^"]+)"|content="(/?assets/[^"]+)"' -AllMatches |
    % { $_.Matches.Groups | ? { $_.Value -and $_.Value -notmatch '^https?://|^#|^mailto:' } | % { $_.Value } } |
    Sort-Object -Unique | % { if (-not (Test-Path $_)) { "MISSING: $_" } }
  ```
- [ ] **HTML page audit** (if you touched HTML):
  - [ ] Theme-init inline script present (prevents flash-of-wrong-theme).
  - [ ] `<meta name="description">`, OG (`og:title`, `og:description`, `og:image`, `og:url`), and Twitter (`twitter:card`, `twitter:title`, …) tags.
  - [ ] Vercel Web Analytics snippet (`/_vercel/insights/script.js`).
  - [ ] `favicon.svg` linked.
  - [ ] Sensible `<meta name="robots">` value.
  - [ ] **404 pages specifically**: `robots` must be `noindex`, and the page must **not** have a `<link rel="canonical">`. A canonical on a 404 confuses crawlers.

## 3. Branch + commit

- **Branch name**: kebab-case, descriptive. `add-404-page`, `add-ship-pr-skill`, `fix-og-image-path`. **Not** the Copilot worktree default like `users/niketanrane/laughing-doodle`. If you're in a Copilot worktree, rename early:
  ```
  rename_branch  (tool — pass kebab-case name)
  ```
  Outside Copilot, `git branch -m <new-name>`.
- **Commit format**: short imperative title (≤ 60 chars). Body bullets are optional but encouraged for non-trivial changes — say *why* and *approach*, not what the diff shows. Always include the trailer:
  ```
  Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
  ```
- **One squashable commit per PR**. If you piled up WIP commits, `git reset --soft origin/main` and recommit clean.

```pwsh
git add -A
git commit -m "Add styled 404 page with top bar and home redirect" `
           -m "Matches index.html visual system; noindex; links back to home." `
           -m "" `
           -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

## 4. Auth — use the `niketansrane` account

This is a **personal** repo. All writes (push, `gh pr create`, comments) must go through the `niketansrane` GitHub account, not whatever account is active by default. Before any write op:

```pwsh
$env:GH_TOKEN = ""
$env:GITHUB_TOKEN = ""
gh auth switch --user niketansrane
gh auth status   # confirm: active account is `niketansrane`
```

Bash equivalent (unset, don't blank):

```bash
unset GH_TOKEN GITHUB_TOKEN
gh auth switch --user niketansrane
```

After the switch, `gh pr create` is the reliable path — prefer it over the Copilot `create_pull_request` tool, which shells out through a different auth context and isn't guaranteed to pick up the active account.

## 5. Open the PR

```pwsh
git push -u origin <branch>
```

Write the body to a file (PowerShell here-strings + GitHub markdown inline-flagged with `--body` is painful — always use `--body-file`):

```pwsh
$body = @'
## Why
<one or two sentences of user value — what does this change enable?>

## What changed
- bullet
- bullet

## Verification
- bullet (manual check, screenshot, Vercel preview, etc.)
'@
$body | Out-File -FilePath pr-body.md -Encoding utf8 -NoNewline

gh pr create `
  --repo niketansrane/niketansrane `
  --base main `
  --head <branch> `
  --title "<imperative title>" `
  --body-file pr-body.md
```

Then delete `pr-body.md` (don't commit it).

**Body conventions**: lead with `## Why` (user value), then `## What changed` (bullets, scoped to diff), then `## Verification`. Never lead with implementation detail.

## 6. Verify Vercel preview

Required before signaling ready-to-merge. After the push, wait ~15s, then:

```pwsh
gh pr view <num> --repo niketansrane/niketansrane --json statusCheckRollup,url |
  ConvertFrom-Json | % { $_.statusCheckRollup } |
  ? { $_.name -match 'Vercel' -or $_.context -match 'Vercel' } |
  Select-Object name, context, state, targetUrl
```

Look for `state: SUCCESS` on a `Vercel` check. If `PENDING`, wait another 15–30s and re-run. If `FAILURE`, open `targetUrl` for the build log.

**Extract the preview URL** (Vercel bot posts it as a top-level PR comment):

```pwsh
gh pr view <num> --repo niketansrane/niketansrane --comments --json comments |
  ConvertFrom-Json | % { $_.comments.body } |
  Select-String -Pattern "https://[a-z0-9.-]+\.vercel\.app[^\s)]*" -AllMatches |
  % { $_.Matches.Value } | Select-Object -Unique
```

**Important**: previews on this project are behind **Vercel SSO**. A raw `curl` against the preview URL returns `302` to a Vercel auth page. **Do not interpret that as a broken deploy.** The `SUCCESS` status check on the PR is the source of truth — the preview built, it's just gated to humans in a browser.

## 7. Hand off — do not merge

- [ ] **Do not run `gh pr merge`** from this skill. Merge authorization belongs to the `agent-merge` skill or a human signal.
- [ ] Report back to whoever asked. If invoked from a parent session, use `send_session_message` with:
  - PR number
  - PR URL
  - Vercel state (`SUCCESS` / `PENDING` / `FAILURE`)
  - Preview URL (if extracted)
- [ ] If there's no parent session, just print the same in chat.

## 8. Quick reference

```
# 1. Pre-flight
git status
git --no-pager diff --stat
# (verify referenced assets exist; see §2)

# 2. Branch + commit (kebab-case branch; rename_branch in Copilot worktrees)
git add -A
git commit -m "<imperative title>" \
           -m "<body>" \
           -m "" \
           -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"

# 3. Auth — switch to `niketansrane` (always, before any write)
$env:GH_TOKEN=""; $env:GITHUB_TOKEN=""
gh auth switch --user niketansrane

# 4. Push + open PR
git push -u origin <branch>
gh pr create --repo niketansrane/niketansrane --base main --head <branch> \
  --title "<title>" --body-file pr-body.md

# 5. Verify Vercel
gh pr view <num> --repo niketansrane/niketansrane --json statusCheckRollup,url
# → expect state: SUCCESS on a Vercel check

# 6. Hand off (do NOT merge)
# report PR # + URL + Vercel state + preview URL
```
