---
layout: default
permalink: /aiml901/
title: AIML901
description: AIML 901 course page redirect.
nav: true
nav_order: 5
redirect_target: "/aiml901/syllabus/"
---

<div class="post">
  <article>
    <div class="alert alert-info">
      <p>
        Redirecting to AIML 901 syllabus.
        If not redirected automatically, <a href="{{ page.redirect_target | relative_url }}">click here</a>.
      </p>
    </div>
  </article>
</div>

<script>
  window.location.replace({{ page.redirect_target | relative_url | jsonify }});
</script>
