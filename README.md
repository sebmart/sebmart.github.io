# sebmart.github.io

This repository hosts Sébastien Martin's personal website, built with
[Jekyll](https://jekyllrb.com/). Originally forked from the
[al-folio](https://alshedivat.github.io/al-folio/) theme, though it has since
diverged significantly.

## Content overview
- Home (`_pages/about.md`) surfaces the main biography, news highlights, and links
  to the only public sections of the site: Publications, CV, and Press.
- `_pages/publications.md`, `_pages/cv.md`, and `_pages/media.md` power the
  navigation items reachable from the home page.
- `_news/` contains short news posts that are linked from the home page.
- `aiml901/` is a self-contained course microsite with its own layout.

All other legacy pages and documents that were not reachable from the home page
have been removed to simplify maintenance.

## Local development
1. Install Ruby 3.x (with Bundler) and Node 18+.
2. Install Ruby gems:
   ```bash
   bundle install
   ```
3. Install frontend dependencies:
   ```bash
   npm install
   ```
4. Start a live-reloading development server:
   ```bash
   bundle exec jekyll serve --livereload
   ```
5. Build the production site when ready to deploy:
   ```bash
   bundle exec jekyll build
   ```

For AIML 901 authoring workflow details, see `AGENTS.md`.
