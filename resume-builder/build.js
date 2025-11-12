#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const puppeteer = require('puppeteer');

const repoRoot = path.resolve(__dirname, '..');
const resumePath = path.join(repoRoot, 'assets/json/resume.json');
const outputPdf = path.join(repoRoot, 'assets/pdf/sebastien-martin-cv.pdf');
const distDir = path.join(__dirname, 'dist');
const htmlOutput = path.join(distDir, 'resume.html');
const themeDir = path.join(__dirname, 'theme');
const partialsDir = path.join(themeDir, 'partials');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function registerPartials() {
  const files = fs.readdirSync(partialsDir);
  files.forEach((file) => {
    if (!file.endsWith('.hbs')) return;
    const name = file.replace('.hbs', '');
    const template = fs.readFileSync(path.join(partialsDir, file), 'utf8');
    Handlebars.registerPartial(name, template);
  });
}

function registerHelpers() {
  Handlebars.registerHelper('formatDate', (dateString) => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length >= 3) {
      return new Date(dateString).toLocaleDateString('en', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    if (parts.length === 2) {
      return new Date(`${parts[0]}-${parts[1]}-01`).toLocaleDateString('en', {
        month: 'short',
        year: 'numeric',
      });
    }
    return parts[0];
  });

  Handlebars.registerHelper('subtract', (a, b) => {
    const first = Number(a) || 0;
    const second = Number(b) || 0;
    return first - second;
  });
}

function loadResume() {
  const raw = fs.readFileSync(resumePath, 'utf8');
  return JSON.parse(raw);
}

function renderHtml(resume) {
  const css = fs.readFileSync(path.join(themeDir, 'style.css'), 'utf8');
  const tpl = fs.readFileSync(path.join(themeDir, 'resume.hbs'), 'utf8');
  const template = Handlebars.compile(tpl);
  return template({ resume, css });
}

async function renderPdf(html) {
  ensureDir(path.dirname(outputPdf));
  ensureDir(distDir);
  fs.writeFileSync(htmlOutput, html, 'utf8');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: outputPdf,
      printBackground: true,
      format: 'A4',
      margin: { top: '0.4in', bottom: '0.4in', left: '0.4in', right: '0.4in' },
    });
  } finally {
    await browser.close();
  }
}

async function main() {
  registerPartials();
  registerHelpers();
  const resume = loadResume();
  const html = renderHtml(resume);
  await renderPdf(html);
  console.log(`Generated PDF at ${path.relative(repoRoot, outputPdf)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
