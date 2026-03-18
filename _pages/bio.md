---
layout: page
permalink: /bio/
title: bios
description:
nav: true
nav_order: 2
---

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
    <p>S&eacute;bastien Martin is an Associate Professor of Operations at the Kellogg School of Management, Northwestern University. He also serves on the Board of Directors of ESAB Corporation (NYSE: ESAB) and co-founded NoYes.ai, an AI education startup. His research focuses on the interface of algorithms and operations management, with applications to online platforms and public sector operations. He helped design Lyft's dispatch algorithm and optimize school transportation systems for Boston and San Francisco. His work has been recognized with two Franz Edelman Awards and the Dantzig Dissertation Award. He holds an M.Sc. from Ecole Polytechnique and a Ph.D. from MIT.</p>
    <button class="copy-btn" onclick="copyBio('short-bio', this)">Copy</button>
  </div>
</div>

<div class="bio-section">
  <h2>Long bio</h2>
  <div class="bio-text" id="long-bio">
    <p>S&eacute;bastien Martin is an Associate Professor of Operations at the Kellogg School of Management, Northwestern University. He received his M.Sc. in applied mathematics from Ecole Polytechnique (France) and his Ph.D. in operations research from MIT. He also serves on the Board of Directors of ESAB Corporation (NYSE: ESAB), where he focuses on AI strategy and innovation, and co-founded NoYes.ai, an AI education startup.</p>
    <p>His research is at the interface of algorithms and operations management, with applications to online service platforms and public sector operations. He helped design Lyft's dispatch algorithm and optimize the school transportation systems of Boston and San Francisco. He also created Kellogg's AI Teaching Assistant and Kellogg's first AI-powered case studies. His work has been recognized with two Franz Edelman Awards, the George Dantzig Dissertation Award, and the Poets &amp; Quants Best 40 Under 40 MBA Professors list. At Kellogg, he teaches AI Foundations for Managers.</p>
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
