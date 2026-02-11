---
layout: default
permalink: /press/
title: press
description: Press coverage now lives in the CV section below.
nav: true
nav_order: 3
redirect_target: "/cv/#press"
---

<div class="post">
  <article>
    <div class="alert alert-info">
      <p>
        Press coverage now lives in the CV. You should be redirected automatically,
        but if not, <a href="{{ page.redirect_target | relative_url }}">click here</a>.
      </p>
    </div>
  </article>
</div>

<script>
  window.location.replace({{ page.redirect_target | relative_url | jsonify }});
</script>
