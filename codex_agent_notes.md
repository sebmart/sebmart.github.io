# Agent Notes: AIML 901 Subsite

- AIML901 course notes live in `aiml901/` and should look independent from the main Jekyll site.
- Layout for course pages: `_layouts/aiml901.liquid` (standalone shell, no navbar, reuses global footer/scripts).
- Obsidian-specific processing lives in `_plugins/obsidian_support.rb`:
  * converts `[[wiki]]` links, `![[attachments]]` (honours optional `|WIDTH` or `|WIDTHxHEIGHT`).
  * turns Markdown image links to YouTube into responsive iframes.
  * normalizes Obsidian callouts.
- AIML styling is in `_sass/_aiml901.scss` (hero, tables, callouts, images, video wrapper). Imported from `assets/css/main.scss`.
- Main site keeps only About, Publications, CV, Press (news); blog/projects/bibliography tooling removed.
- Build with Ruby 3.x (`bundle install`, `bundle exec jekyll serve --livereload`).
- Obsidian exports: drop markdown + assets into `aiml901/attachments/`; front matter `title` only is required.
