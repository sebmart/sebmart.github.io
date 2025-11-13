---
layout: default
permalink: /publications/
title: publications
description: Publications now live in the CV section below.
nav: true
nav_order: 2
redirect_target: "/cv/#publications"
---

<div class="post">
  <article>
    <div class="alert alert-info">
      <p>
        Publications now live in the CV. You should be redirected automatically,
        but if not, <a href="{{ page.redirect_target | relative_url }}">click here</a>.
      </p>
    </div>
  </article>
</div>

<script>
  window.location.replace({{ page.redirect_target | relative_url | jsonify }});
</script>
