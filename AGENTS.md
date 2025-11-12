# Agent Notes: sebmart.github.io

## Purpose & Structure
- Personal academic site for Sébastien Martin (hosted at `sebastienmartin.info`) built on the al-folio Jekyll theme.
- Public navigation is intentionally small: Home (`_pages/about.md`), Publications, CV, Press, and News (collection in `_news/`); anything not reachable from the home page is removed unless it belongs to AIML 901.
- Resume-style data (bio, publications, CV entries, etc.) comes from `resume.json` (also loaded into Jekyll via `jekyll-get-json`) and powers both the `/cv` and `/publications` pages—treat the JSON file as the single source of truth.

## Build & Tooling
- Project requires Ruby 3.x. On this Mac use the Homebrew toolchain by running `export PATH="/opt/homebrew/opt/ruby/bin:$PATH"` before `bundle install` or `bundle exec jekyll …` (the system Ruby 2.6 can’t run Bundler). Front-end assets rely on CDN links defined in `_config.yml` (`third_party_libraries`); ensure those URLs stay hardcoded so jQuery/Bootstrap load for the mobile nav.
- Standard workflow: `bundle install`, then `bundle exec jekyll serve --livereload` for local development.
- The repo intentionally omits legacy automation (GitHub Actions, prettier, etc.); keep things lightweight unless needed for a new feature.

## AIML 901 Microsite
- All course content lives in `aiml901/` and must appear visually separate from the main site.
- Default layout: `_layouts/aiml901.liquid` (no navbar, standalone hero, but reuses global footer/scripts).
- Styling lives in `_sass/_aiml901.scss`, imported via `assets/css/main.scss`.
- Obsidian-specific processing is handled by `_plugins/obsidian_support.rb`:
  * converts `[[wiki]]` links and `![[attachments]]` (supports optional `|WIDTH` or `|WIDTHxHEIGHT` descriptors),
  * turns Markdown image links pointing to YouTube into responsive iframes,
  * normalizes callouts and code-collapse blocks exported from Obsidian.
- Obsidian exports: drop Markdown and any assets into `aiml901/attachments/`; only front matter field required is `title`.

## Content Guidelines
- Keep the main-site experience minimal and easy to maintain—if a page or asset isn’t reachable from Home or AIML 901, it probably doesn’t belong here.
- Reuse components (e.g., `_includes/news.liquid` for news snippets, `_includes/resume/*.liquid` in the CV layout) to avoid duplicating data or logic.
