/* Mixer Idea Map — canvas renderer that only draws when something changes. */
(() => {
  const D = window.MIXER;
  const notes = D.notes, themes = D.themes;
  const themeById = Object.fromEntries(themes.map(t => [t.id, t]));
  const $ = id => document.getElementById(id);
  const canvas = $("map"), ctx = canvas.getContext("2d");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- theme colours (muted hues, readable in both modes) ----------
  themes.forEach((t, i) => {
    const h = Math.round((i * 360) / themes.length + 18) % 360;
    t.hue = h;
  });
  const isDark = () => getComputedStyle(document.documentElement).colorScheme === "dark";
  const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  let palette = {};
  function readPalette() {
    palette = { ink: css("--ink"), muted: css("--muted"), link: css("--link"), accent: css("--accent"),
                bg: css("--bg"), dark: isDark() };
  }
  readPalette();
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { readPalette(); draw(); });

  // ---------- neighbours ----------
  notes.forEach((n, i) => { n.i = i; n.nb = []; });
  D.links.forEach(([a, b, s]) => { notes[a].nb.push([b, s]); notes[b].nb.push([a, s]); });
  notes.forEach(n => n.nb.sort((p, q) => q[1] - p[1]));

  // ---------- images ----------
  const atlas = new Image();
  atlas.onload = () => draw();
  atlas.src = "img/atlas.jpg";
  const full = new Map(); // id -> {img, ok, frame}
  const FULL_MAX = 40;
  let frame = 0;
  // Full-resolution photos only for notes that are large on screen. Never evict a
  // note drawn in the current frame, so a crowded view can't thrash load/evict.
  function fullImg(n) {
    let e = full.get(n.id);
    if (!e) {
      if (full.size >= FULL_MAX) {
        let old = null;
        for (const [k, v] of full) if (v.frame < frame && (!old || v.frame < old[1].frame)) old = [k, v];
        if (!old) return null; // cache full of visible notes: keep the thumbnail
        old[1].img.onload = null; old[1].img.src = ""; full.delete(old[0]);
      }
      const img = new Image();
      e = { img, ok: false, frame };
      img.decoding = "async";
      img.onload = () => { e.ok = true; draw(); };
      img.src = `img/notes/${n.id}.jpg`;
      full.set(n.id, e);
    }
    e.frame = frame;
    return e.ok ? e.img : null;
  }

  // ---------- camera & layout ----------
  let W = 0, H = 0, dpr = 1;
  const cam = { x: 0, y: 0, k: 0.3 }; // screen = (world - cam) * k + centre
  let mix = 1;             // 0 = wall positions, 1 = theme positions
  let anim = null;
  notes.forEach(n => { n.px = n.x; n.py = n.y; n.pr = n.rot; });
  function place() {
    const e = mix * mix * (3 - 2 * mix);
    for (const n of notes) { n.px = n.wx + (n.x - n.wx) * e; n.py = n.wy + (n.y - n.wy) * e; n.pr = n.wrot + (n.rot - n.wrot) * e; }
  }
  const toScreen = (x, y) => [(x - cam.x) * cam.k + W / 2, (y - cam.y) * cam.k + H / 2];
  const toWorld = (sx, sy) => [(sx - W / 2) / cam.k + cam.x, (sy - H / 2) / cam.k + cam.y];

  function bounds(useWall) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const n of notes) {
      const x = useWall ? n.wx : n.x, y = useWall ? n.wy : n.y;
      x0 = Math.min(x0, x - n.w / 2); x1 = Math.max(x1, x + n.w / 2);
      y0 = Math.min(y0, y - n.h / 2); y1 = Math.max(y1, y + n.h / 2);
    }
    if (useWall) for (const [x, y, w, h] of D.pages) {
      x0 = Math.min(x0, x); x1 = Math.max(x1, x + w); y0 = Math.min(y0, y); y1 = Math.max(y1, y + h);
    }
    if (!useWall) for (const t of themes) {
      x0 = Math.min(x0, t.cx - t.r); x1 = Math.max(x1, t.cx + t.r);
      y0 = Math.min(y0, t.cy - t.r - 40); y1 = Math.max(y1, t.cy + t.r);
    }
    return [x0, y0, x1, y1];
  }
  function fitTarget(b, pad = 0.9) {
    const [x0, y0, x1, y1] = b;
    const top = headerBottom() + 8, left = 0;
    const k = Math.min((W - left) / (x1 - x0), (H - top) / (y1 - y0)) * pad;
    return { x: (x0 + x1) / 2 - left / 2 / k, y: (y0 + y1) / 2 - top / 2 / k, k };
  }
  const headerBottom = () => document.querySelector(".bar").getBoundingClientRect().bottom;
  const clampK = k => Math.max(0.05, Math.min(k, 6));

  function animate(to, ms, onStep) {
    if (anim) cancelAnimationFrame(anim.raf);
    if (reduceMotion) ms = 0;
    const from = { x: cam.x, y: cam.y, k: cam.k, mix };
    const t0 = performance.now();
    const step = now => {
      const t = ms ? Math.min(1, (now - t0) / ms) : 1;
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      if (to.k !== undefined) {
        // zoom in log space for a natural fly
        const lk = Math.log(from.k) + (Math.log(to.k) - Math.log(from.k)) * e;
        cam.k = Math.exp(lk);
        cam.x = from.x + (to.x - from.x) * e; cam.y = from.y + (to.y - from.y) * e;
      }
      if (to.mix !== undefined) { mix = from.mix + (to.mix - from.mix) * t; place(); }
      onStep && onStep(t);
      drawNow();
      if (t < 1) anim.raf = requestAnimationFrame(step); else anim = null;
    };
    anim = { raf: requestAnimationFrame(step) };
  }

  // ---------- state ----------
  let hover = null, selected = null, query = "";
  let matches = null; // Set of note indices or null
  const neighbourSet = n => new Set(n ? n.nb.map(x => x[0]) : []);

  // ---------- drawing (on demand) ----------
  let pending = false;
  function draw() { if (!pending) { pending = true; requestAnimationFrame(() => { pending = false; drawNow(); }); } }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    draw();
  }

  function drawNow() {
    frame++;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const k = cam.k;
    const [vx0, vy0] = toWorld(-150, -150), [vx1, vy1] = toWorld(W + 150, H + 150);

    // scanned pages (fade out as notes move to their themes)
    if (mix < 1) {
      ctx.globalAlpha = 1 - mix;
      ctx.fillStyle = palette.dark ? "#0b0b0d" : "#2a2826";
      for (const [x, y, w, h] of D.pages) {
        const [sx, sy] = toScreen(x, y);
        ctx.fillRect(sx, sy, w * k, h * k);
      }
      ctx.globalAlpha = 1;
    }
    // islands
    const islandAlpha = Math.max(0, mix * 2 - 1);
    if (islandAlpha > 0) {
      for (const t of themes) {
        const [sx, sy] = toScreen(t.cx, t.cy);
        const r = t.r * k;
        if (sx + r < 0 || sx - r > W || sy + r < 0 || sy - r > H) continue;
        ctx.globalAlpha = islandAlpha;
        ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${t.hue}, 45%, ${palette.dark ? 30 : 75}%, ${palette.dark ? 0.22 : 0.28})`;
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = `hsla(${t.hue}, 40%, ${palette.dark ? 55 : 50}%, 0.35)`;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // links only for the clicked note (no arcs on hover, no "show all" button: Sébastien, Nov 4)
    const focus = selected;
    ctx.lineCap = "round";
    if (focus) {
      const [fx, fy] = toScreen(focus.px, focus.py);
      for (const [j, s] of focus.nb) {
        const B = notes[j];
        const [bx, by] = toScreen(B.px, B.py);
        const mx = (fx + bx) / 2, my = (fy + by) / 2;
        const dx = bx - fx, dy = by - fy;
        ctx.beginPath(); ctx.moveTo(fx, fy);
        ctx.quadraticCurveTo(mx - dy * 0.15, my + dx * 0.15, bx, by);
        ctx.strokeStyle = palette.accent; ctx.globalAlpha = selected ? 0.85 : 0.55;
        ctx.lineWidth = 1.5 + Math.max(0, s - 0.74) * 40;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // notes: choose at most FULL_MAX large on-screen notes for full resolution,
    // and mark them used *before* any eviction can happen this frame.
    const nbs = neighbourSet(focus);
    const visible = [];
    for (const n of notes) {
      if (n.px + n.w < vx0 || n.px - n.w > vx1 || n.py + n.h < vy0 || n.py - n.h > vy1) continue;
      visible.push(n);
    }
    const big = visible.filter(n => n.w * k > 190).sort((a, b) => b.w * b.h - a.w * a.h).slice(0, FULL_MAX);
    const allowFull = new Set(big);
    for (const n of big) { const e = full.get(n.id); if (e) e.frame = frame; }
    for (const n of visible) {
      const [sx, sy] = toScreen(n.px, n.py);
      const w = n.w * k, h = n.h * k;
      let alpha = 1;
      if (matches && !matches.has(n.i)) alpha = 0.12;
      else if (focus && focus !== n && !nbs.has(n.i)) alpha = selected ? 0.35 : 0.7;
      ctx.globalAlpha = alpha;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate((n.pr * Math.PI) / 180);
      if (w > 10) { // cheap drop shadow
        ctx.fillStyle = "rgba(0,0,0,0.16)";
        ctx.fillRect(-w / 2 + 1.5, -h / 2 + 2.5, w, h);
      }
      let img = null;
      if (allowFull.has(n)) { img = fullImg(n); }
      if (img) ctx.drawImage(img, -w / 2, -h / 2, w, h);
      else if (atlas.complete && atlas.naturalWidth) {
        const [ax, ay, aw, ah] = n.atlas;
        ctx.drawImage(atlas, ax, ay, aw, ah, -w / 2, -h / 2, w, h);
      } else { ctx.fillStyle = palette.muted; ctx.fillRect(-w / 2, -h / 2, w, h); }
      if (n === focus || (selected && nbs.has(n.i))) {
        ctx.lineWidth = n === focus ? 3 : 2;
        ctx.strokeStyle = palette.accent;
        ctx.strokeRect(-w / 2 - 2, -h / 2 - 2, w + 4, h + 4);
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;

    // labels (constant screen size, on top)
    if (islandAlpha > 0) {
      ctx.textAlign = "center"; ctx.textBaseline = "bottom";
      const placed = [];
      for (const t of [...themes].sort((a, b) => b.count - a.count)) {
        const [sx, sy0] = toScreen(t.cx, t.cy - t.r);
        const sy = sy0 + 4;
        if (sx < -200 || sx > W + 200 || sy < -40 || sy > H + 60) continue;
        const big = k < 0.5;
        ctx.globalAlpha = islandAlpha;
        ctx.font = `600 ${big ? 15 : 14}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
        const label = t.name, count = `${t.count}`;
        const tw = ctx.measureText(label).width;
        ctx.font = `400 12px -apple-system, BlinkMacSystemFont, sans-serif`;
        const cw = ctx.measureText(count).width;
        const total = tw + 8 + cw, x0 = Math.min(Math.max(sx - total / 2, 14), W - total - 14), y = Math.max(sy - 6, 22);
        const box = [x0 - 10, y - 22, x0 + total + 10, y + 4];
        if (placed.some(b => box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1])) continue;
        placed.push(box);
        ctx.fillStyle = palette.dark ? "rgba(23,22,26,0.78)" : "rgba(255,253,249,0.85)";
        roundRect(x0 - 10, y - 22, total + 20, 26, 13); ctx.fill();
        ctx.textAlign = "left";
        ctx.font = `600 ${big ? 15 : 14}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
        ctx.fillStyle = palette.ink; ctx.fillText(label, x0, y);
        ctx.font = `400 12px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.fillStyle = palette.muted; ctx.fillText(count, x0 + tw + 8, y - 1);
        ctx.textAlign = "center";
      }
      ctx.globalAlpha = 1;
    }
  }
  function roundRect(x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  // ---------- interaction ----------
  function hit(sx, sy) {
    const [x, y] = toWorld(sx, sy);
    for (let i = notes.length - 1; i >= 0; i--) {
      const n = notes[i];
      if (Math.abs(x - n.px) <= n.w / 2 && Math.abs(y - n.py) <= n.h / 2) {
        if (matches && !matches.has(n.i)) continue;
        return n;
      }
    }
    return null;
  }
  function zoomAt(sx, sy, f) {
    const [wx, wy] = toWorld(sx, sy);
    cam.k = clampK(cam.k * f);
    cam.x = wx - (sx - W / 2) / cam.k; cam.y = wy - (sy - H / 2) / cam.k;
    draw();
  }
  const pointers = new Map();
  let drag = null, pinch = null;
  canvas.addEventListener("pointerdown", e => {
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, [e.offsetX, e.offsetY]);
    if (anim) { cancelAnimationFrame(anim.raf); anim = null; if (mix !== 0 && mix !== 1) { mix = Math.round(mix); place(); } }
    if (pointers.size === 1) drag = { x: e.offsetX, y: e.offsetY, cx: cam.x, cy: cam.y, moved: false };
    else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), k: cam.k, mx: (a[0] + b[0]) / 2, my: (a[1] + b[1]) / 2 };
      drag = null;
    }
    hideHint();
  });
  canvas.addEventListener("pointermove", e => {
    if (pointers.has(e.pointerId)) pointers.set(e.pointerId, [e.offsetX, e.offsetY]);
    if (pinch && pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      const target = clampK(pinch.k * d / pinch.d);
      zoomAt(pinch.mx, pinch.my, target / cam.k);
      return;
    }
    if (drag) {
      const dx = e.offsetX - drag.x, dy = e.offsetY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) > 4) { drag.moved = true; canvas.classList.add("dragging"); }
      if (drag.moved) { cam.x = drag.cx - dx / cam.k; cam.y = drag.cy - dy / cam.k; draw(); }
      return;
    }
    if (e.pointerType === "mouse") {
      const n = hit(e.offsetX, e.offsetY);
      if (n !== hover) { hover = n; canvas.classList.toggle("over-note", !!n); }
    }
  });
  const endPointer = e => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = null;
    if (drag && !drag.moved && e.type === "pointerup") {
      const n = hit(e.offsetX, e.offsetY);
      if (n) select(n); else if (selected) select(null);
    }
    drag = null; canvas.classList.remove("dragging");
  };
  canvas.addEventListener("pointerup", endPointer);
  canvas.addEventListener("pointercancel", endPointer);
  canvas.addEventListener("pointerleave", () => { hover = null; });
  canvas.addEventListener("wheel", e => {
    e.preventDefault();
    hideHint();
    if (anim) { cancelAnimationFrame(anim.raf); anim = null; }
    if (e.ctrlKey || e.metaKey || Math.abs(e.deltaX) < 1 && e.deltaMode === 1 || !e.deltaX && Math.abs(e.deltaY) >= 50) {
      const f = Math.exp(-e.deltaY * (e.ctrlKey ? 0.012 : 0.0022));
      zoomAt(e.offsetX, e.offsetY, f);
    } else { // two-finger trackpad scroll pans
      cam.x += e.deltaX / cam.k; cam.y += e.deltaY / cam.k; draw();
    }
  }, { passive: false });
  canvas.addEventListener("dblclick", e => {
    const n = hit(e.offsetX, e.offsetY);
    if (n) flyToNote(n); else zoomAt(e.offsetX, e.offsetY, 2);
  });

  function flyToNote(n) {
    const k = Math.max(cam.k, Math.min(H * 0.34 / n.h, 2.2));
    const off = $("panel").hidden || W <= 760 ? 0 : 210;
    animate({ x: n.px + off / k, y: n.py + (W <= 760 ? H * 0.2 / k : 0), k }, 650);
  }
  function flyToTheme(t) {
    const tgt = fitTarget([t.cx - t.r, t.cy - t.r - 40, t.cx + t.r, t.cy + t.r], 0.92);
    animate(tgt, 700);
  }

  // ---------- panel ----------
  function spriteStyle(n, size) {
    const [ax, ay, aw, ah] = n.atlas;
    const s = size / Math.max(aw, ah);
    const aW = atlas.naturalWidth || 0, aH = atlas.naturalHeight || 0;
    return `width:${Math.round(aw * s)}px;height:${Math.round(ah * s)}px;` +
      `background-image:url(img/atlas.jpg);background-size:${aW * s}px ${aH * s}px;` +
      `background-position:${-ax * s}px ${-ay * s}px;`;
  }
  function textHTML(t) {
    const esc = s => s.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
    return esc(t).replace(/\[(crossed out[^\]]*|cropped|covered|illegible|[^\]]*diagram[^\]]*|three check marks)\]/gi,
      (_, m) => `<span class="mark">[${m}]</span>`);
  }
  function select(n, fly) {
    selected = n;
    const p = $("panel");
    if (!n) { p.hidden = true; draw(); return; }
    p.hidden = false;
    const t = themeById[n.theme];
    const img = $("p-img");
    img.removeAttribute("src");
    img.src = `img/notes/${n.id}.jpg`;
    img.alt = n.text;
    $("p-theme").innerHTML = `<span class="dot" style="width:9px;height:9px;border-radius:50%;background:hsl(${t.hue},45%,55%)"></span>${t.name}`;
    $("p-theme").onclick = () => { select(null); flyToTheme(t); };
    $("p-text").innerHTML = textHTML(n.text);
    const sim = $("p-sim");
    sim.innerHTML = "";
    if (!n.nn.length) sim.innerHTML = `<p class="empty">Too fragmentary to compare.</p>`;
    for (const [j] of n.nn) {
      const m = notes[j];
      const b = document.createElement("button");
      b.title = m.text;
      const cross = m.theme !== n.theme ? `<span class="cross">in ${themeById[m.theme].name}</span>` : "";
      b.innerHTML = `<div class="box"><div class="thumb" style="${spriteStyle(m, 104)}"></div></div>${cross}`;
      b.onclick = () => select(m, true);
      sim.appendChild(b);
    }
    p.scrollTop = 0;
    if (fly || cam.k * n.w < 120) flyToNote(n);
    draw();
  }
  $("close").onclick = () => select(null);
  addEventListener("keydown", e => {
    if (e.key === "Escape") { if (selected) select(null); else if (query) { $("q").value = ""; search(""); } }
    if (e.target.tagName === "INPUT") return;
    if (e.key === "+" || e.key === "=") zoomAt(W / 2, H / 2, 1.4);
    if (e.key === "-") zoomAt(W / 2, H / 2, 1 / 1.4);
    if (e.key === "0") fit();
  });

  // ---------- search ----------
  function search(q) {
    query = q.trim().toLowerCase();
    hover = null;
    if (!query) { matches = null; $("qcount").textContent = ""; draw(); return; }
    matches = new Set(notes.filter(n => n.text.toLowerCase().includes(query) ||
      themeById[n.theme].name.toLowerCase().includes(query)).map(n => n.i));
    $("qcount").textContent = matches.size;
    draw();
  }
  $("q").addEventListener("input", e => search(e.target.value));
  $("q").addEventListener("keydown", e => {
    if (e.key === "Enter" && matches && matches.size) {
      const pts = [...matches].map(i => notes[i]);
      const b = [Math.min(...pts.map(n => n.px - n.w)), Math.min(...pts.map(n => n.py - n.h)),
                 Math.max(...pts.map(n => n.px + n.w)), Math.max(...pts.map(n => n.py + n.h))];
      animate(fitTarget(b, 0.85), 650);
    }
  });

  // ---------- controls ----------
  $("zin").onclick = () => zoomAt(W / 2, H / 2, 1.5);
  $("zout").onclick = () => zoomAt(W / 2, H / 2, 1 / 1.5);
  const fit = () => animate(fitTarget(bounds(false)), 500);
  $("zfit").onclick = fit;

  // ---------- hint ----------
  let hintTimer = setTimeout(hideHint, 7000);
  function hideHint() { $("hint").classList.add("gone"); clearTimeout(hintTimer); }

  // small handle for automated checks
  window.__map = { cam, notes, toScreen, select: id => select(notes.find(n => n.id === id), true) };

  // ---------- start ----------
  $("subtitle").textContent = `${notes.length} sticky notes from October 29, 2026`;
  new ResizeObserver(resize).observe(canvas);
  resize();
  Object.assign(cam, fitTarget(bounds(false)));
  draw();
  // deep link: index.html#P039 opens that note
  const linked = notes.find(n => n.id === decodeURIComponent(location.hash.slice(1)));
  if (linked) setTimeout(() => select(linked, true), 250);
})();
