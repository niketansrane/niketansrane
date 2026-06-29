# Hi, I'm Niketan 👋

I'm a software engineer at Microsoft, building AI-powered developer productivity tools that help developers ship their products and features faster. My resume is [here](https://docs.google.com/document/d/1hemqPU0I-QK_bORctt4F4RR-npnS_ZOESSLOH08g0F0).
If you want to talk Developer Experience, AI for developer productivity or cricket, I'm always up for a good chat.

🚀 **What I Do**
- Helped build the [Microsoft Developer Agent](https://devblogs.microsoft.com/microsoft365dev/build-like-microsoft-developer-agents-in-action/) — an AI system in Microsoft Teams that automates the entire PR lifecycle for Azure DevOps repositories. Featured at Microsoft Build 2025.
- Designed an [ML-based reviewer assignment system](https://www.niketansrane.com/blogs/teaching-machines-find-right-reviewers/) that serves 5,000+ developers and 20K+ pull requests across 1,000+ reviewer teams, using historical patterns, expertise, and geographic load balancing.
- Built [Shanashma](https://github.com/niketansrane/shanashma) — a Claude Code plugin marketplace. Its first plugin, ado-flow, brings Azure DevOps workflows (work items, PRs, pipelines) into your terminal.


💻 **Tech Stack**
- Python, C#, Django, FastAPI
- Azure (Cosmos DB, OpenAI, Active Directory)
- OAuth 2.0, OpenID Connect
- Machine Learning (traditional ML + LLMs)
- Event-driven architectures

📝 **Recent Writing**
<!-- POSTS:START id="recent-writing" -->
- [Understanding 2>&1 in 3 Minutes](https://www.niketansrane.com/blogs/understanding-2-and-1-bash-redirection/) - Breaking down what command > output.log 2>&1 actually means—file descriptors, stdout vs stderr, and useful patterns like splitting streams and /dev/null
- [The Workflow I've Settled On for AI-Assisted Development](https://www.niketansrane.com/blogs/workflow-ai-assisted-development/) - Using Copilot as a sounding board, separating data from presentation, and turning successful workflows into reusable skills—how AI changed the way I think, not just how I write code
- [Returning to Myself](https://www.niketansrane.com/blogs/personal/returning-to-myself/) - A visit back home after two years, rediscovering the people who shaped me, the gestures that feel bigger with age, and a sense of belonging I had almost forgotten
- [Shanashma - A Claude Code Plugin Marketplace for Azure DevOps](https://www.niketansrane.com/blogs/shanashma-claude-code-plugin-azure-devops/) - Building a Claude Code plugin with persistent configuration to solve the multi-project Azure DevOps workflow problem, packaged as a shareable plugin marketplace
- [Building a Claude Agent for Continuous Codebase Improvement](https://www.niketansrane.com/blogs/claude-agent-continuous-codebase-improvement/) - Building a Claude sub-agent workflow to continuously analyze and improve codebases with small, incremental changes—using a finder, implementer, and reviewer pattern
<!-- POSTS:END id="recent-writing" -->

🛠️ **Projects**
- [Shanashma](https://github.com/niketansrane/shanashma) — A Claude Code plugin marketplace. Ships with ado-flow, a plugin that brings Azure DevOps workflows (work items, PRs, pipelines) into your terminal.
- [Netflix Ratings Overlay](https://github.com/niketansrane/movie-ratings-extension) — Chrome extension that shows IMDb & Rotten Tomatoes ratings on Netflix posters on hover. Built with Manifest V3, OMDb API, smart title matching, and local caching.

🌐 **Find Me**
- 🔗 Website: [niketansrane.com](https://www.niketansrane.com)
- 💼 LinkedIn: [linkedin.com/in/niketanrane](https://linkedin.com/in/niketanrane)
- 🐦 Twitter: [@niketansrane](https://twitter.com/niketansrane)
- 📧 Email: niketan.iiita@gmail.com
- ☕ Buy Me a Coffee: [buymeacoffee.com/niketansrane](https://buymeacoffee.com/niketansrane)

---

### About This Repo

This repository is my personal website—a minimalist, Ubuntu-inspired blog where I write about developer productivity, authentication systems, machine learning, and building tools that make engineers' lives easier.

**Live at**: [niketansrane.com](https://www.niketansrane.com)

### Authoring a new post

`content/posts.json` is the single source of truth for the post list. The home page, blogs index, sitemap, RSS feed (`feed.xml`), and README "Recent Writing" section are regenerated from it between `<!-- POSTS:START -->` / `<!-- POSTS:END -->` markers — never edit those listings by hand.

```sh
# Scaffold a new post (creates blogs/<slug>/index.html + posts.json entry, then builds)
npm run new-post -- \
  --slug my-post-slug \
  --title "My Post Title" \
  --excerpt "Short summary used on listings and meta tags." \
  --reading "5 min read" \
  --category technical    # or "personal" (nests under blogs/personal/<slug>/)

# Edit blogs/<slug>/index.html to write the post

# After any change to a post's metadata
npm run build

# CI-friendly drift check (exits 1 if `npm run build` would change anything)
npm run check
```

The build refuses to run if any post listed in `posts.json` is missing its `index.html` — broken links cannot ship.
