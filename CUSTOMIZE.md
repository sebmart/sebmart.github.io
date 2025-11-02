# Customize

Here we will give you some tips on how to customize the website. One important thing to note is that **ALL** the changes you make should be done on the **main** branch of your repository. The `gh-pages` branch is automatically overwritten every time you make a change to the main branch.

## Project structure

The project is structured as follows, focusing on the main components that you will need to modify:

```txt
.
├── 📂 assets/: static files used across the site
│   ├── 📂 bibliography/: optional BibTeX exports linked from pages
│   ├── 📂 img/: profile and illustration images
│   ├── 📂 pdf/: documents referenced throughout the site
│   └── 📂 json/
│       └── 📄 resume.json: single source of truth for CV, projects, and publications
├── 📄 _config.yml: the configuration file of the template
├── 📂 _includes/: contains code parts that are included in the main HTML file
├── 📂 _layouts/: contains the layouts to choose from in the frontmatter of the Markdown files
├── 📂 _news/: the news that will appear in the news section in the about page
├── 📂 _pages/: contains the pages of the website
│   └── 📄 404.md: 404 page (page not found)
├── 📂 _plugins/: custom Jekyll plugins executed during the build
└── 📂 _sass/: contains the SASS files that define the style of the website
    ├── 📄 _base.scss: base style of the website
    ├── 📄 _cv.scss: style of the CV page
    ├── 📄 _layout.scss: style of the overall layout
    ├── 📄 _themes.scss: themes colors and a few icons
    └── 📄 _variables.scss: variables used in the SASS files
```

## Configuration

The configuration file [\_config.yml](_config.yml) contains the main configuration of the website. Most of the settings is self-explanatory and we also tried to add as much comments as possible. If you have any questions, please check if it was not already answered in the [FAQ](FAQ.md).

> Note that the `url` and `baseurl` settings are used to generate the links of the website, as explained in the [install instructions](INSTALL.md).

All changes made to this file are only visible after you rebuild the website. That means that you need to run `bundle exec jekyll serve` again if you are running the website locally or push your changes to GitHub if you are using GitHub Pages. All other changes are visible immediately, you only need to refresh the page.

## Modifying the CV, publications, and projects

All structured profile content lives in [assets/json/resume.json](assets/json/resume.json). The file follows the [JSON Resume](https://jsonresume.org/) schema and is loaded by the `jekyll_get_json` plugin as `site.data.resume` during builds. Update the relevant arrays (`work`, `education`, `publications`, `projects`, etc.) to refresh what appears on `/cv/`, `/publications/`, and other resume-driven sections.

When you need to reference local files, place documents under [assets/pdf/](assets/pdf/) and images under [assets/img/](assets/img/). Use site-relative URLs (for example, `/assets/pdf/filename.pdf`) inside `resume.json` so the links work in both local previews and the deployed site. Optional BibTeX exports can be stored in [assets/bibliography/](assets/bibliography/); the legacy `_bibliography` folder from the upstream theme is no longer used.

## Creating new pages

You can create new pages by adding new Markdown files in the [\_pages](_pages/) directory. The easiest way to do this is to copy an existing page and modify it. You can choose the layout of the page by changing the [layout](https://jekyllrb.com/docs/layouts/) attribute in the [frontmatter](https://jekyllrb.com/docs/front-matter/) of the Markdown file, and also the path to access it by changing the [permalink](https://jekyllrb.com/docs/permalinks/) attribute. You can also add new layouts in the [\_layouts](_layouts/) directory if you feel the need for it.

## Blog posts

This site currently ships without a blog. The upstream theme expects a `_posts/` collection, but that directory has been removed here. If you decide to publish posts again, recreate an `_posts/` folder and follow the standard Jekyll naming convention (`YYYY-MM-DD-title.md`).

## Updating project highlights

Project cards are generated from the `projects` array inside [assets/json/resume.json](assets/json/resume.json). Add, remove, or reorder entries there to control what appears on the site. Each entry can include fields such as `name`, `summary`, `url`, `startDate`, `endDate`, and a list of `highlights`; any additional keys you add will also be available to the Liquid templates.

## Managing news

You can add news in the about page by adding new Markdown files in the [\_news](_news/) directory. There are currently two types of news: inline news and news with a link. News with a link take you to a new page while inline news are displayed directly in the about page. The easiest way to create yours is to copy an existing news and modify it.

## Adding Collections

This Jekyll theme implements `collections` to let you break up your work into categories. In this repository only the `news` collection is active, and its entries are automatically displayed on the home page.

You can create your own collections—apps, courses, case studies, etc.—by declaring them in [\_config.yml](_config.yml), creating a matching folder (for example, `_mycollection/`), and adding a landing page for the collection under [\_pages](_pages/) with the appropriate layout.

## Managing publications

The publications page is rendered from the `publications` array inside [assets/json/resume.json](assets/json/resume.json). Add a new object to that array to surface another paper. The layout expects fields such as `name`, `authors`, `publisher`, `releaseDate`, `url`, and `summary`, but any additional keys you include will also be available to the Liquid templates.

If you want to link to local files, drop them in [assets/pdf/](assets/pdf/) and reference them with `/assets/pdf/filename.pdf`. To change how entries are displayed—add buttons, reorder fields, or expose new attributes—edit [\_layouts/publications.liquid](_layouts/publications.liquid).

## Changing theme color

A variety of beautiful theme colors have been selected for you to choose from. The default is purple, but you can quickly change it by editing the `--global-theme-color` variable in the [\_sass/\_themes.scss](_sass/_themes.scss) file. Other color variables are listed there as well. The stock theme color options available can be found at [\_sass/\_variables.scss](_sass/_variables.scss). You can also add your own colors to this file assigning each a name for ease of use across the template.

## Adding social media information

You can add your social media links by adding the specified information at the `Social integration` section in the [\_config.yml](_config.yml) file. This information will appear at the bottom of the `About` page.
