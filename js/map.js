// Chapter I: an allegorical map of where the user has been studied.
// Draws the SVG map, wires the scroll steps, the place cards and the index.
(function () {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";
  const svg = document.getElementById("map");
  const plate = document.getElementById("map-plate");
  const card = document.getElementById("place-card");
  if (!svg) return;

  const places = window.MAP_PLACES || [];
  const bridge = window.MAP_BRIDGE;

  function el(name, attrs, parent) {
    const node = document.createElementNS(SVG_NS, name);
    for (const k in attrs) node.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(node);
    return node;
  }

  // A closed, hand-drawn-looking coastline: an ellipse whose radius wobbles
  // by a few fixed sine terms, smoothed with a Catmull-Rom spline.
  function coastPoints(cx, cy, rx, ry, wobble, n) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const t = (i / n) * Math.PI * 2;
      let r = 1;
      wobble.forEach(([amp, freq, phase]) => { r += amp * Math.sin(freq * t + phase); });
      pts.push([cx + Math.cos(t) * rx * r, cy + Math.sin(t) * ry * r]);
    }
    return pts;
  }

  function smoothClosedPath(pts) {
    const n = pts.length;
    let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += `C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    }
    return d + "Z";
  }

  // Coast with engraved water ripples around it.
  function island(parent, shape) {
    const g = el("g", {}, parent);
    const d = smoothClosedPath(coastPoints(shape.cx, shape.cy, shape.rx, shape.ry, shape.wobble, shape.n || 36));
    [[1.12, 0.12], [1.075, 0.22], [1.035, 0.38]].forEach(([s, o]) => {
      el("path", {
        d, class: "ripple", "stroke-opacity": o, "stroke-width": 0.8,
        transform: `translate(${shape.cx} ${shape.cy}) scale(${s}) translate(${-shape.cx} ${-shape.cy})`,
        "vector-effect": "non-scaling-stroke",
      }, g);
    });
    el("path", { d, class: "coast" }, g);
    return g;
  }

  function hill(parent, x, y) {
    el("path", { class: "hill", d: `M${x - 11},${y} Q${x},${y - 13} ${x + 11},${y} M${x + 5},${y - 3} Q${x + 13},${y - 11} ${x + 21},${y - 2}` }, parent);
  }

  // Region name written in the sea along a gentle arc, as on old maps;
  // the subtitle sits just inside the coast.
  function regionName(parent, id, text, sub, x1, x2, y, lift, subY) {
    const pathId = `arc-${id}`;
    el("path", { id: pathId, d: `M${x1},${y} Q${(x1 + x2) / 2},${y - lift} ${x2},${y}`, fill: "none" }, parent);
    const t = el("text", { class: "region-name", "text-anchor": "middle" }, parent);
    const tp = el("textPath", { href: `#${pathId}`, startOffset: "50%" }, t);
    tp.textContent = text.toUpperCase();
    const s = el("text", { class: "region-sub", x: (x1 + x2) / 2, y: subY, "text-anchor": "middle" }, parent);
    s.textContent = sub;
  }

  // A bridge: two rails offset from a centre curve, with planks between them.
  // Rails get the "draw" class so they sweep in; planks fade in with the layer.
  function bridgeOn(parent, d, cls, halfWidth, plankEvery) {
    const g = el("g", { class: cls }, parent);
    const guide = el("path", { d, fill: "none", stroke: "none" }, g);
    const len = guide.getTotalLength();
    const samples = [];
    for (let s = 0; s <= len; s += 4) {
      const p = guide.getPointAtLength(s);
      const q = guide.getPointAtLength(Math.min(len, s + 1));
      const r = guide.getPointAtLength(Math.max(0, s - 1));
      const tx = q.x - r.x, ty = q.y - r.y, m = Math.hypot(tx, ty) || 1;
      samples.push({ x: p.x, y: p.y, nx: -ty / m, ny: tx / m, s });
    }
    [-1, 1].forEach(side => {
      const pts = samples.map(p => `${(p.x + side * p.nx * halfWidth).toFixed(1)},${(p.y + side * p.ny * halfWidth).toFixed(1)}`);
      const rail = el("path", { d: "M" + pts.join(" L"), class: "rail draw" }, g);
      rail.style.setProperty("--len", rail.getTotalLength().toFixed(1));
    });
    const planks = el("g", { class: "planks" }, g);
    samples.filter((p, i) => i > 0 && i < samples.length - 1 && Math.round(p.s) % plankEvery < 4).forEach(p => {
      el("line", {
        x1: p.x - p.nx * halfWidth, y1: p.y - p.ny * halfWidth,
        x2: p.x + p.nx * halfWidth, y2: p.y + p.ny * halfWidth,
      }, planks);
    });
    guide.remove();
    return g;
  }

  // ── Background: sea strokes, rhumb lines, compass ───
  const W = 1500, H = 680;

  const sea = el("g", { class: "sea-lines", "aria-hidden": "true" }, svg);
  // Sea strokes run past the edges so zoomed (phone) views never show bare paper.
  for (let row = 0, y = -398; y < H + 420; y += 24, row++) {
    for (let x = (row % 2) * 30 - 486; x < W + 500; x += 62) {
      el("path", { d: `M${x},${y} q6,-3.5 12,0 t12,0` }, sea);
    }
  }

  const compass = { x: 1440, y: 622, r: 40 };
  const rhumb = el("g", { class: "rhumb", "aria-hidden": "true" }, svg);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    el("line", { x1: compass.x, y1: compass.y, x2: compass.x + Math.cos(a) * 1600, y2: compass.y + Math.sin(a) * 1600 }, rhumb);
  }

  // ── Islands ─────────────────────────────────────────
  const regionBias = el("g", { class: "layer region-bias" }, svg);
  island(regionBias, { cx: 355, cy: 405, rx: 315, ry: 255, wobble: [[0.04, 3, 0.4], [0.025, 5, 1.9], [0.012, 9, 0.7]], n: 48 });
  [[560, 225], [600, 590]].forEach(([x, y]) => hill(regionBias, x, y));
  regionName(regionBias, "bias", "The User as Bias", "the user studied as a confound", 150, 570, 128, 26, 192);

  const regionPersona = el("g", { class: "layer region-persona" }, svg);
  island(regionPersona, { cx: 1262, cy: 370, rx: 192, ry: 205, wobble: [[0.05, 3, 2.1], [0.04, 4, 0.3], [0.02, 11, 1.2]], n: 40 });
  [[1380, 520], [1430, 300]].forEach(([x, y]) => hill(regionPersona, x, y));
  regionName(regionPersona, "persona", "The Model as Persona", "the model’s own character", 1072, 1452, 132, 26, 214);

  // ── The strait: name appears at step iii ───────────
  const straitLayer = el("g", { class: "layer strait-layer", "aria-hidden": "true" }, svg);
  const st1 = el("text", { class: "strait-label", x: 830, y: 196, "text-anchor": "middle" }, straitLayer);
  st1.textContent = "Mare Incognitum";

  // ── First crossing: the Transluce rock and its plank ─
  const latentLayer = el("g", { class: "layer latentqa-layer" }, svg);
  island(latentLayer, { cx: 830, cy: 334, rx: 32, ry: 25, wobble: [[0.12, 3, 0.8], [0.06, 5, 2.0]], n: 14 });
  bridgeOn(latentLayer, "M684,350 Q745,334 796,338", "bridge-latentqa", 4, 12);

  // ── The BSD bridge, spanning the whole strait ───────
  const bsdLayer = el("g", { class: "layer bsd-layer" }, svg);
  bridgeOn(bsdLayer, "M676,446 Q880,372 1088,444", "bridge-bsd", 6, 12);
  // Our paper: its full title in red under the bridge.
  const bridgeLink = el("g", { class: "place bridge-name", tabindex: "0", role: "button", "aria-label": `${bridge.title}, our preprint` }, bsdLayer);
  // Two lines, centred under the middle of the bridge.
  const bl1 = el("text", { class: "bridge-label", x: 882, y: 468, "text-anchor": "middle" }, bridgeLink);
  el("tspan", { x: 882 }, bl1).textContent = "User Model Extraction";
  el("tspan", { x: 882, dy: "1.2em" }, bl1).textContent = "via Belief Self-Distillation";

  // ── Cartouche and compass ───────────────────────────
  const cart = el("g", { class: "cartouche" }, svg);
  el("rect", { x: 640, y: 22, width: 380, height: 70 }, cart);
  el("rect", { x: 646, y: 28, width: 368, height: 58, class: "inner" }, cart);
  const ct = el("text", { class: "c-title", x: 830, y: 66, "text-anchor": "middle" }, cart);
  ct.textContent = "A CHART OF THE USER";

  const comp = el("g", { class: "compass", "aria-hidden": "true" }, svg);
  el("circle", { cx: compass.x, cy: compass.y, r: compass.r, fill: "none", "stroke-width": 0.8 }, comp);
  el("circle", { cx: compass.x, cy: compass.y, r: compass.r - 6, fill: "none", "stroke-width": 0.5 }, comp);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const long = i % 2 === 0 ? compass.r - 2 : compass.r * 0.55;
    const tip = [compass.x + Math.cos(a) * long, compass.y + Math.sin(a) * long];
    const l = [compass.x + Math.cos(a - 0.35) * 9, compass.y + Math.sin(a - 0.35) * 9];
    const r = [compass.x + Math.cos(a + 0.35) * 9, compass.y + Math.sin(a + 0.35) * 9];
    el("path", { d: `M${l[0]},${l[1]} L${tip[0]},${tip[1]} L${compass.x},${compass.y} Z`, fill: "#3a2e22", "stroke-width": 0.6 }, comp);
    el("path", { d: `M${r[0]},${r[1]} L${tip[0]},${tip[1]} L${compass.x},${compass.y} Z`, fill: "#e8ddc5", "stroke-width": 0.6 }, comp);
  }
  const north = el("text", { x: compass.x, y: compass.y - compass.r - 8, "text-anchor": "middle" }, comp);
  north.textContent = "N";

  // ── Places ──────────────────────────────────────────
  const layerFor = { bias: regionBias, persona: regionPersona, crossing: latentLayer };
  const placeNodes = new Map();

  places.forEach(p => {
    const g = el("g", { class: "place", tabindex: "0", role: "button", "aria-label": `${p.title}, ${p.authors}, ${p.venue}` }, layerFor[p.region]);
    el("circle", { cx: p.x, cy: p.y, r: 6.5, class: "dot-outer" }, g);
    el("circle", { cx: p.x, cy: p.y, r: 2.2, class: "dot-inner" }, g);
    const dx = p.anchor === "middle" ? 0 : 13;
    const dy = p.labelDy || 6;
    const t = el("text", { x: p.x + dx, y: p.y + dy, "text-anchor": p.anchor }, g);
    if (p.label2) {
      // Two-line label: the year goes on the second line.
      t.textContent = p.label;
      const second = el("tspan", { x: p.x + dx, dy: "1.15em" }, t);
      second.textContent = p.label2 + " ";
    } else {
      t.textContent = p.label + " ";
    }
    const yr = el("tspan", { class: "year" }, t);
    yr.textContent = p.year;
    placeNodes.set(g, p);
  });
  placeNodes.set(bridgeLink, bridge);

  // ── Place card ──────────────────────────────────────
  let pinned = null, hideTimer = null;

  function showCard(node, pin) {
    const p = placeNodes.get(node);
    if (!p) return;
    clearTimeout(hideTimer);
    placeNodes.forEach((_, n) => n.classList.toggle("is-open", n === node));
    card.innerHTML = "";
    const close = document.createElement("button");
    close.className = "pc-close";
    close.setAttribute("aria-label", "Close");
    close.textContent = "×";
    close.addEventListener("click", hideCard);
    const meta = document.createElement("div");
    meta.className = "pc-meta";
    meta.textContent = `${p.authors} · ${p.venue}`;
    const title = document.createElement("div");
    title.className = "pc-title";
    title.textContent = p.title;
    const note = document.createElement("div");
    note.className = "pc-note";
    note.textContent = p.note;
    const link = document.createElement("a");
    link.className = "pc-link";
    link.href = p.url;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "Read the paper ↗";
    card.append(close, meta, title, note, link);

    // Place the card beside the marker, inside the plate.
    const pr = plate.getBoundingClientRect();
    const nr = node.getBoundingClientRect();
    const cw = card.offsetWidth || 320;
    let left = nr.right - pr.left + 14;
    if (left + cw > pr.width) left = nr.left - pr.left - cw - 14;
    left = Math.max(8, left);
    let top = nr.top - pr.top - 10;
    top = Math.min(Math.max(8, top), pr.height - card.offsetHeight - 8);
    card.style.left = `${left}px`;
    card.style.top = `${top}px`;
    card.classList.add("is-visible");
    if (pin) pinned = node;
  }

  function hideCard() {
    pinned = null;
    card.classList.remove("is-visible");
    placeNodes.forEach((_, n) => n.classList.remove("is-open"));
  }

  function scheduleHide() {
    if (pinned) return;
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hideCard, 250);
  }

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  placeNodes.forEach((_, node) => {
    if (finePointer) {
      node.addEventListener("mouseenter", () => { if (!pinned) showCard(node, false); });
      node.addEventListener("mouseleave", scheduleHide);
    }
    node.addEventListener("click", e => {
      e.stopPropagation();
      if (pinned === node) hideCard(); else showCard(node, true);
    });
    node.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); showCard(node, true); }
    });
  });
  card.addEventListener("mouseenter", () => clearTimeout(hideTimer));
  card.addEventListener("mouseleave", scheduleHide);
  card.addEventListener("click", e => e.stopPropagation());
  document.addEventListener("click", hideCard);
  document.addEventListener("keydown", e => { if (e.key === "Escape") hideCard(); });

  // ── Scroll steps ────────────────────────────────────
  // Invisible triggers scroll behind the pinned stage; the one crossing the
  // middle of the screen sets the step. Step 0 is the map before the first note.
  const triggers = Array.from(document.querySelectorAll("#ch1-scrolly .trigger"));
  const notes = Array.from(document.querySelectorAll("#ch1-scrolly .note"));
  const navButtons = Array.from(document.querySelectorAll("#ch1-scrolly .note-index button"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // On phones the map zooms to the part each note talks about. Every view has
  // the same 5:4 shape so the map keeps its height while it pans.
  const phone = window.matchMedia("(max-width: 860px)");
  const DESKTOP_VIEW = [0, 0, W, H];
  const PHONE_VIEWS = {
    0: [0, -210, 1500, 1200],
    1: [30, 120, 670, 536],
    2: [1020, 140, 480, 384],
    3: [560, 160, 600, 480],
    4: [560, 160, 600, 480],
  };
  let currentView = DESKTOP_VIEW.slice(), viewAnim = null;

  function applyView(v) {
    currentView = v;
    svg.setAttribute("viewBox", v.map(x => x.toFixed(1)).join(" "));
  }

  function moveView(target) {
    cancelAnimationFrame(viewAnim);
    if (reduceMotion) { applyView(target); return; }
    const from = currentView.slice(), t0 = performance.now(), dur = 750;
    const tick = now => {
      const k = Math.min(1, (now - t0) / dur);
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      applyView(from.map((f, i) => f + (target[i] - f) * e));
      if (k < 1) viewAnim = requestAnimationFrame(tick);
    };
    viewAnim = requestAnimationFrame(tick);
  }

  let currentStep = 0;
  function setStep(n) {
    currentStep = n;
    moveView(phone.matches ? PHONE_VIEWS[n] : DESKTOP_VIEW);
    svg.setAttribute("data-step", String(n));
    const shown = String(Math.max(1, n));
    notes.forEach(note => note.classList.toggle("is-active", note.dataset.step === shown));
    navButtons.forEach(b => b.classList.toggle("is-active", b.dataset.goto === String(n)));
  }
  setStep(0);
  phone.addEventListener("change", () => applyView(phone.matches ? PHONE_VIEWS[currentStep] : DESKTOP_VIEW));

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const n = Number(entry.target.dataset.step);
        if (entry.isIntersecting) setStep(n);
        else if (n === 1 && entry.boundingClientRect.top > 0) setStep(0);
      });
    }, { rootMargin: "-50% 0px -50% 0px" });
    triggers.forEach(t => io.observe(t));
  } else {
    setStep(4);
  }

  navButtons.forEach(button => {
    button.addEventListener("click", () => {
      const t = triggers[Number(button.dataset.goto) - 1];
      const r = t.getBoundingClientRect();
      window.scrollTo({ top: r.top + window.scrollY - window.innerHeight / 2 + r.height / 2, behavior: reduceMotion ? "auto" : "smooth" });
    });
  });

})();
