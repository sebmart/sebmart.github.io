/* Mixer synthesis pages. Static layout, recomputed only on resize: no animation loop. */
(() => {
  const { ideas, ambition: AMB, total } = window.IDEAS;
  const $ = id => document.getElementById(id);
  const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const lead = s => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>"); // **bold lead** in sentences
  const tilt = id => (((id * 37) % 9) - 4) * 0.3;
  const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
  const ambLabel = a => AMB[Math.min(5, Math.max(1, Math.round(a))) - 1];
  const view = document.body.dataset.view;

  // ---------- detail drawer (both pages) ----------
  let opener = null;
  function openIdea(i, from) {
    opener = from;
    const meta = [plural(i.count, "sticky note")];
    if (i.cat === "change") meta.push(`Ambition: ${ambLabel(i.ambition)}`);
    $("drawer-body").innerHTML = `<p class="meta">${meta.join(" · ")}</p><h2>${esc(i.title)}</h2>` +
      i.long.split(/\n\n+/).map(p => `<p>${esc(p)}</p>`).join("");
    $("drawer").hidden = false;
    $("drawer").scrollTop = 0;
    $("close").focus({ preventScroll: true });
  }
  function closeIdea() {
    if ($("drawer").hidden) return;
    $("drawer").hidden = true;
    if (opener) opener.focus({ preventScroll: true });
  }
  $("close").onclick = closeIdea;
  addEventListener("keydown", e => { if (e.key === "Escape") closeIdea(); });
  document.addEventListener("click", e => {
    if (!$("drawer").contains(e.target) && !e.target.closest(".sticker, .pt")) closeIdea();
  });
  const sticker = (i, extra) => {
    const b = document.createElement("button");
    b.className = "sticker";
    b.style.setProperty("--r", tilt(i.id) + "deg");
    b.setAttribute("aria-label", `${i.title}. ${plural(i.count, "note")}` +
      (i.cat === "change" ? `, ambition ${ambLabel(i.ambition)}` : "") + ". Open the description.");
    b.innerHTML = `<span class="s">${lead(i.sentence)}</span>${extra || ""}`;
    b.onclick = () => openIdea(i, b);
    return b;
  };

  // ---------- what we are already doing: a wall, sticker size follows mentions ----------
  if (view === "doing") {
    const list = ideas.filter(i => i.cat === "now").sort((p, q) => q.count - p.count || p.title.localeCompare(q.title));
    $("sub").textContent = `What is already happening with AI at Kellogg, from ${total} sticky notes. ` +
      `Bigger stickers were mentioned by more notes (the number). Click one for the details.`;
    for (const i of list) {
      const b = sticker(i, `<span class="badge" aria-hidden="true">${i.count}</span>`);
      b.style.width = 230 + 14 * (i.count - 1) + "px";
      b.style.fontSize = 16 + 0.7 * (i.count - 1) + "px";
      $("wall").appendChild(b);
    }
    return;
  }

  // ---------- what we should do: one continuous 2D plot ----------
  // Each idea's number circle sits at its exact note count (x) and near its ambition (y), pinned to its sticker.
  const list = ideas.filter(i => i.cat === "change");
  $("sub").textContent = `${list.length} ideas from ${total} sticky notes. Left to right: how many notes mention the idea. ` +
    `Bottom to top: how ambitious it is (a rough judgment, so heights are approximate). Click a sticker for the details.`;
  const plot = $("plot"), svg = $("axes");
  const top = Math.max(...list.map(i => i.count));
  const els = list.map(i => { const b = sticker(i); plot.appendChild(b); return b; });
  const pts = list.map((i, k) => {
    const d = document.createElement("button");
    d.className = "pt";
    d.textContent = i.count;
    d.setAttribute("aria-hidden", "true");
    d.tabIndex = -1;
    d.onclick = () => openIdea(i, els[k]);
    d.onmouseenter = () => els[k].classList.add("on");
    d.onmouseleave = () => els[k].classList.remove("on");
    els[k].onmouseenter = () => d.classList.add("on");
    els[k].onmouseleave = () => d.classList.remove("on");
    plot.appendChild(d);
    return d;
  });
  // Sticker shapes the layout may choose from (width in em): narrow and tall for crowded columns,
  // wide and short where there is room. All stickers share one font size, the largest that fits.
  const SHAPES = [8.4, 11, 14.5], SHAPE_COST = [0.08, 0, 0.04];
  const shape = (k, F, s) => { els[k].style.fontSize = F + "px"; els[k].style.width = SHAPES[s] * F + "px"; };

  const M = { l: 142, r: 30, t: 34, b: 58 };
  const AXIS = ["Quick win", "A program", "Significant", "Institution-wide", "Moonshot"];
  // Linear scale on mentions. Ideas above BREAK (one outlier) sit past a marked axis break,
  // so they don't stretch the axis and squeeze the crowded middle.
  const counts = list.map(i => i.count).sort((a, b) => a - b);
  const BREAK = counts[counts.length - 2] < top - 2 ? counts[counts.length - 2] : top;
  const u = c => (c <= BREAK ? c : BREAK + 0.9 + (c - BREAK) * 0.1);
  const X0 = counts[0] - 0.7, X1 = u(top) + 0.5, Y0 = 0.9, Y1 = 5.15, PAD = 6, R_PT = 13;
  let xs, ys;

  // Every circle is pinned to a corner or side of its own sticker: no leader lines. X is exact (the note
  // count). Ambition is a judgment call, so a circle may slide up or down from its true height to make
  // room, never more than maxDev points, and within a column the ambition order is kept.
  // Search: seeded simulated annealing over (shape, anchor, vertical nudge) per sticker. Overlaps are
  // penalties during the search; only a layout with none is accepted. Same result on every load.
  // Anchors: circle side relative to its sticker (sx, sy), how far out the circle centre sits, extra cost.
  const ANCH = [[-1, -1, 3, 0], [1, -1, 3, 0], [-1, 1, 3, 0], [1, 1, 3, 0], [-1, 0, 8, 0.05], [1, 0, 8, 0.05]];
  const NA = ANCH.length, NS = SHAPES.length, GAP = 7, STEP = 3; // GAP: clearance around circles
  const R1 = R_PT + GAP, R2 = 2 * R_PT + GAP, SEP = Math.max(PAD, GAP);
  function place(P, W, H, unit, maxDev, full) {
    const nd = 2 * Math.floor(maxDev * unit / STEP) + 1, mid = (nd - 1) / 2;
    const lo = M.l + 4, hi = W - M.r - 4, tp = M.t - 22, bt = H - M.b - 4;
    const idx = (s, di, a) => (s * nd + di) * NA + a;
    for (const p of P) { // candidate: sticker centre, circle y, own cost, out-of-bounds penalty, size, bbox
      p.cand = [];
      for (let s = 0; s < NS; s++) {
        const w = p.ws[s], h = p.hs[s];
        for (let di = 0; di < nd; di++) {
          const py = p.ty + (di - mid) * STEP, dev = (di - mid) * STEP / unit;
          for (const [sx, sy, o, c] of ANCH) {
            const cx = p.px - sx * (w / 2 + o), cy = py - sy * (h / 2 + o);
            const l = cx - w / 2, r = cx + w / 2, t = cy - h / 2, b = cy + h / 2;
            const out = Math.max(0, lo - l) + Math.max(0, r - hi) + Math.max(0, tp - t) + Math.max(0, b - bt) +
              Math.max(0, M.t - 14 - py) + Math.max(0, py - (H - M.b - R_PT - 2)) + (p.wide[s] ? 1000 : 0);
            p.cand.push({ cx, cy, py, w, h, l, r, t, b, s, own: 4 * dev * dev + c + SHAPE_COST[s], out: out > 0 ? 2 + out : 0,
              bl: Math.min(l, p.px - R_PT), br: Math.max(r, p.px + R_PT), bt: Math.min(t, py - R_PT), bb: Math.max(b, py + R_PT) });
          }
        }
      }
    }
    const near = (x, y, A) => Math.hypot(x - Math.max(A.l, Math.min(x, A.r)), y - Math.max(A.t, Math.min(y, A.b)));
    const pair = (a, A, b, B) => { // conflict penalty between two placed stickers (0 = fine)
      let pen = 0, d;
      if (a.count === b.count && a.amb !== b.amb && (a.amb - b.amb) * (B.py - A.py) <= 0) pen += 2 + Math.abs(A.py - B.py);
      if (A.bl - B.br > SEP || B.bl - A.br > SEP || A.bt - B.bb > SEP || B.bt - A.bb > SEP) return pen;
      const ox = (A.w + B.w) / 2 + PAD - Math.abs(A.cx - B.cx), oy = (A.h + B.h) / 2 + PAD - Math.abs(A.cy - B.cy);
      if (ox > 0 && oy > 0) pen += 2 + Math.min(ox, oy);
      if ((d = Math.hypot(a.px - b.px, A.py - B.py)) < R2) pen += 2 + R2 - d;
      if ((d = near(b.px, B.py, A)) < R1) pen += 2 + R1 - d;
      if ((d = near(a.px, A.py, B)) < R1) pen += 2 + R1 - d;
      return pen;
    };
    let seed = 12345;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const n = P.length, cur = new Array(n);
    const local = (k, c) => { // [energy, clash] of the terms that involve sticker k at candidate c
      const p = P[k], C = p.cand[c];
      let x = C.out;
      for (let j = 0; j < n; j++) if (j !== k && cur[j] !== undefined) x += pair(p, C, P[j], P[j].cand[cur[j]]);
      return [C.own + 10 * x, x];
    };
    P.forEach((p, k) => { // start at the true height with the least-clashing shape and anchor so far
      let bc = 0, be = Infinity;
      for (let s = 0; s < NS; s++) for (let a = 0; a < NA; a++) {
        const c = idx(s, mid, a), [e] = local(k, c);
        if (e < be) { be = e; bc = c; }
      }
      cur[k] = bc;
    });
    const ITER = (window.SYNTH_TEST || {}).iter ?? 60000, T0 = 8, T1 = 0.01;
    for (let it = 0; it < ITER; it++) {
      const T = T0 * Math.pow(T1 / T0, it / ITER), k = Math.floor(rnd() * n), c0 = cur[k];
      let a = c0 % NA, di = Math.floor(c0 / NA) % nd, s = Math.floor(c0 / NA / nd);
      const r = rnd();
      if (r < 0.5) di = Math.min(nd - 1, Math.max(0, di + Math.round((rnd() - 0.5) * 12)));
      else if (r < 0.7) a = Math.floor(rnd() * NA);
      else if (r < 0.85) s = Math.floor(rnd() * NS);
      else { di = Math.floor(rnd() * nd); a = Math.floor(rnd() * NA); s = Math.floor(rnd() * NS); }
      const c1 = idx(s, di, a);
      if (c1 === c0) continue;
      const e0 = local(k, c0)[0], e1 = local(k, c1)[0];
      if (e1 <= e0 || rnd() < Math.exp((e0 - e1) / T)) cur[k] = c1;
    }
    // polish: each sticker takes its best candidate given the others (fewest clashes, then lowest cost).
    // While searching for the font size only clashing stickers are polished; the final layout polishes all.
    for (let pass = 0; pass < (full ? 3 : 2); pass++) {
      let moved = false;
      for (let k = 0; k < n; k++) {
        let bc = cur[k], [be, bx] = local(k, cur[k]);
        if (!full && bx === 0) continue;
        for (let c = 0; c < P[k].cand.length; c++) {
          const [e, x] = local(k, c);
          if (x < bx || (x === bx && e < be - 1e-9)) { bc = c; be = e; bx = x; }
        }
        if (bc !== cur[k]) { cur[k] = bc; moved = true; }
      }
      if (!moved) break;
    }
    let clash = 0;
    for (let k = 0; k < n; k++) clash += local(k, cur[k])[1];
    P.forEach((p, k) => Object.assign(p, p.cand[cur[k]]));
    return clash === 0;
  }

  // Data signature for the layout cache: changes whenever stickers, sizes or rules change.
  const SIG = (() => {
    let h = 7;
    for (const ch of JSON.stringify([list.map(i => [i.sentence, i.count, i.ambition]), SHAPES, ANCH, PAD, GAP, M]))
      h = (h * 31 + ch.charCodeAt(0)) | 0;
    return (h >>> 0).toString(36);
  })();
  // Put each sticker in its shape and position; with check, refuse (false) if a measured size differs
  // from the remembered one (e.g. a different font), so the caller lays out afresh.
  function show(F, items, check) {
    for (let k = 0; k < items.length; k++) {
      const [s, cx, cy, py, w, h] = items[k];
      shape(k, F, s);
      if (check && (Math.abs(els[k].offsetWidth - w) > 1 || Math.abs(els[k].offsetHeight - h) > 1)) return false;
      els[k].style.left = cx - w / 2 + "px";
      els[k].style.top = cy - h / 2 + "px";
      pts[k].style.left = xs(list[k].count) + "px";
      pts[k].style.top = py + "px";
    }
    return true;
  }

  function layout(defer) {
    const t0 = performance.now();
    const W = plot.clientWidth, H = plot.clientHeight;
    const iw = W - M.l - M.r, ih = H - M.t - M.b;
    xs = c => M.l + (u(c) - X0) / (X1 - X0) * iw;
    ys = a => M.t + (Y1 - a) / (Y1 - Y0) * ih;
    drawAxes(W, H);
    const unit = ih / (Y1 - Y0); // pixels per ambition point
    const T = window.SYNTH_TEST || {};
    // A finished layout is remembered per window size, so a repeat visit shows it at once.
    const key = `mixer-should:${SIG}:${W}x${H}`;
    if (!T.font && !T.dev && !T.iter) {
      let c = null;
      try { c = JSON.parse(localStorage.getItem(key)); } catch (e) { c = null; }
      if (c && c.F && c.items?.length === list.length && show(c.F, c.items, true)) {
        window.__plot = { ms: Math.round(performance.now() - t0), ok: true, cached: true, font: c.F };
        return;
      }
    }
    if (defer) { // first visit at this size: let the header and axes paint, then search
      requestAnimationFrame(() => setTimeout(() => { layout(false); plot.classList.add("ready"); }, 0));
      return;
    }
    let P, dev = T.dev ?? 0.6; // every circle stays within `dev` ambition points of its true height
    const attempt = (F, full) => { // measure every shape at font size F, then place
      P = list.map((i, k) => {
        const ws = [], hs = [], wide = [];
        for (let s = 0; s < NS; s++) {
          shape(k, F, s);
          const e = els[k], s1 = e.firstChild; // a long word wider than the sticker rules that shape out
          ws.push(e.offsetWidth); hs.push(e.offsetHeight); wide.push(s1.scrollWidth > s1.clientWidth + 1 || e.scrollWidth > e.clientWidth + 1);
        }
        return { k, count: i.count, amb: i.ambition, ws, hs, wide, px: xs(i.count), ty: ys(i.ambition) };
      });
      return place(P, W, H, unit, dev, full);
    };
    // Largest font that fits: bisect, starting from an area estimate.
    list.forEach((_, k) => shape(k, 10, 1));
    const area10 = els.reduce((s, e) => s + (e.offsetWidth + PAD) * (e.offsetHeight + PAD), 0);
    let lo = 6.5, hi = Math.min(17, 10 * Math.sqrt(0.7 * iw * ih / area10)), F = 0;
    if (T.font) F = attempt(T.font) ? T.font : 0;
    else if (attempt(hi)) F = hi;
    else {
      for (let s = 0; s < 6; s++) { const m = (lo + hi) / 2; if (attempt(m)) F = lo = m; else hi = m; }
      if (!F) { dev = 1.2; for (let f = 6.5; f > 4 && !F; f *= 0.9) if (attempt(f)) F = f; } // tiny window
    }
    F = F || 4;
    const ok = attempt(F, true);
    const items = P.map(p => [p.s, Math.round(p.cx * 10) / 10, Math.round(p.cy * 10) / 10, Math.round(p.py * 10) / 10, p.w, p.h]);
    show(F, items, false);
    if (ok) try { localStorage.setItem(key, JSON.stringify({ F, items })); } catch (e) { /* storage unavailable: fine */ }
    const devs = P.map(p => Math.abs(p.py - p.ty) / unit);
    window.__plot = { ms: Math.round(performance.now() - t0), ok, font: +F.toFixed(2), maxDev: +Math.max(...devs).toFixed(2),
      meanDev: +(devs.reduce((a, b) => a + b, 0) / devs.length).toFixed(2), shapes: P.map(p => p.s).join("") };
  }

  function drawAxes(W, H) {
    let s = "";
    const xb = H - M.b;
    const ticks = [];
    for (let c = Math.ceil(X0); c <= BREAK; c++) ticks.push(c);
    if (BREAK < top) ticks.push(top);
    for (const c of ticks) {
      const x = xs(c).toFixed(1);
      s += `<line class="grid" x1="${x}" x2="${x}" y1="${M.t - 18}" y2="${xb}"/>`;
      s += `<text class="tick" x="${x}" y="${xb + 19}" text-anchor="middle">${c}</text>`;
    }
    if (BREAK < top) { // axis break marker
      const bx = (xs(BREAK) + xs(top)) / 2;
      s += `<rect x="${bx - 6}" y="${xb - 8}" width="12" height="16" fill="var(--paper)"/>`;
      s += `<path class="axis" d="M${bx - 7} ${xb + 6} l6 -12 M${bx + 1} ${xb + 6} l6 -12" fill="none"/>`;
    }
    for (let a = 1; a <= 5; a++) {
      const y = ys(a).toFixed(1);
      s += `<line class="grid" x1="${M.l}" x2="${W - M.r}" y1="${y}" y2="${y}"/>`;
      s += `<text class="tick" x="${M.l - 12}" y="${+y + 4}" text-anchor="end">${a} · ${AXIS[a - 1]}</text>`;
    }
    s += `<line class="axis" x1="${M.l}" x2="${W - M.r}" y1="${xb}" y2="${xb}"/>`;
    s += `<line class="axis" x1="${M.l}" x2="${M.l}" y1="${M.t - 18}" y2="${xb}"/>`;
    s += `<text class="title" x="${M.l + (W - M.r - M.l) / 2}" y="${xb + 42}" text-anchor="middle">Sticky notes that mention the idea →</text>`;
    s += `<text class="title" x="${M.l - 12}" y="${M.t - 6}" text-anchor="end">Ambition ↑</text>`;
    svg.innerHTML = s;
  }

  // First layout right away (stickers stay hidden until placed). Later resizes wait for the window
  // to settle, since a fresh layout is a search (~0.7 s).
  let lastW = plot.clientWidth, lastH = plot.clientHeight, timer = 0;
  layout(true);
  if (window.__plot) plot.classList.add("ready"); // placed from the cache

  new ResizeObserver(() => {
    if (plot.clientWidth === lastW && plot.clientHeight === lastH) return;
    clearTimeout(timer);
    timer = setTimeout(() => { lastW = plot.clientWidth; lastH = plot.clientHeight; layout(); }, 150);
  }).observe(plot);
})();
