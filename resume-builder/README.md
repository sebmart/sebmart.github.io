# Resume Builder

Generates the PDF version of my CV directly from `assets/json/resume.json` so the web and PDF versions always share the same source of truth.

## Usage

```bash
cd resume-builder
npm install        # first time only
npm run build      # writes ../assets/pdf/sebastien-martin-cv.pdf
```

The script renders the JSON with a bundled Handlebars template (a lightly customized copy of the `jsonresume-theme-onepage-plus` theme) and prints the resulting HTML to PDF via Puppeteer/Chromium.

## Notes

- The intermediate HTML file is stored in `resume-builder/dist/resume.html` to aid debugging.
- The output filename is stable (`assets/pdf/sebastien-martin-cv.pdf`) so `_pages/cv.md` can link to it without dates.
- The theme assets were copied from [vkcelik/jsonresume-theme-onepage-plus](https://github.com/vkcelik/jsonresume-theme-onepage-plus) (MIT license).
