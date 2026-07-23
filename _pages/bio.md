---
layout: page
permalink: /bio/
title: bios
description:
nav: true
nav_order: 2
---

{% assign bios = site.data.resume.bios %}

<style>
.bio-section {
  margin-bottom: 2.5rem;
}
.bio-section h2 {
  margin-bottom: 1rem;
}
.bio-text {
  position: relative;
  background: var(--global-bg-color);
  border: 1px solid var(--global-divider-color);
  border-radius: 6px;
  padding: 1.25rem 1.25rem 2.5rem;
  font-size: 0.95rem;
  line-height: 1.7;
}
.bio-text p:last-of-type {
  margin-bottom: 0;
}
.copy-btn {
  position: absolute;
  bottom: 0.5rem;
  right: 0.75rem;
  background: none;
  border: 1px solid var(--global-divider-color);
  border-radius: 4px;
  padding: 0.2rem 0.6rem;
  font-size: 0.78rem;
  color: var(--global-text-color);
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
}
.copy-btn:hover {
  opacity: 1;
}
</style>

<div class="bio-section">
  <h2>Short bio</h2>
  <div class="bio-text" id="short-bio">
    {% for paragraph in bios.short %}
      <p>{{ paragraph }}</p>
    {% endfor %}
    <button class="copy-btn" onclick="copyBio('short-bio', this)">Copy</button>
  </div>
</div>

<div class="bio-section">
  <h2>Long bio</h2>
  <div class="bio-text" id="long-bio">
    {% for paragraph in bios.long %}
      <p>{{ paragraph }}</p>
    {% endfor %}
    <button class="copy-btn" onclick="copyBio('long-bio', this)">Copy</button>
  </div>
</div>

<script>
function copyBio(id, btn) {
  var el = document.getElementById(id);
  var paragraphs = el.querySelectorAll('p');
  var text = Array.from(paragraphs).map(function(p) { return p.textContent.trim(); }).join('\n\n');
  navigator.clipboard.writeText(text).then(function() {
    btn.textContent = 'Copied!';
    setTimeout(function() { btn.textContent = 'Copy'; }, 1500);
  });
}
</script>
