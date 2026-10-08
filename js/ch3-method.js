// Chapter III, first pane: Belief Self-Distillation on one conversation.
// Steps: 1 two copies of one model · 2 asking · 3 the guesser ·
// 4 the channel · 5 training · 6 the user vector.
(function () {
  "use strict";

  const svg = document.getElementById("method-diagram");
  if (!svg || !window.DiagramKit) return;
  const { el, text, arrow, arrowhead, card, figure, math, userVector, zoomer, scrolly } = window.DiagramKit;

  const OPTIONS = ["wealthy", "middle", "lower"];
  const BAR_X = 1300, BAR_W = 150;

  // ── Step 1: one model, two copies ───────────────────
  // The two copies start stacked behind the original, like sheets of
  // paper, and slide out to where the reader and guesser will stand.
  const spawn = el("g", { class: "layer m-spawn" }, svg);
  text(spawn, 60, 300, "SELF-DISTILLATION", "d-title");
  text(spawn, 60, 342, "A model learns from", "d-quote");
  text(spawn, 60, 372, "a copy of itself.", "d-quote");
  figure(spawn, 520, 80, "The reader", "will see the conversation", "ghost ghost-top", "teacher · frozen");
  figure(spawn, 520, 480, "The guesser", "will see only the question", "ghost ghost-bottom", "student · frozen");
  figure(spawn, 520, 280, "The model", "one language model");
  const spawnArrows = el("g", { class: "ghost-arrows" }, spawn);
  arrow(spawnArrows, 620, 276, 620, 216);
  arrow(spawnArrows, 620, 414, 620, 474);
  text(spawnArrows, 636, 252, "copy", "d-map-label");
  text(spawnArrows, 636, 452, "copy", "d-map-label");
  text(spawnArrows, 760, 345, "identical weights, both frozen", "d-note");

  // ── The conversation ────────────────────────────────
  const conv = el("g", { class: "layer m-conv" }, svg);
  card(conv, 40, 70, 380, 150, "A real conversation");
  ["“Pick a destination for a week", "away and give me a rough", "nightly hotel budget.”"]
    .forEach((line, i) => text(conv, 62, 136 + i * 27, line, "d-quote"));

  // ── Reader, question, belief ────────────────────────
  const reader = el("g", { class: "layer m-reader" }, svg);
  arrow(reader, 424, 145, 512, 145);
  figure(reader, 520, 80, "The reader", "sees the conversation", "", "teacher · frozen");
  arrow(reader, 724, 145, 792, 145);
  card(reader, 800, 70, 380, 150, "Asked");
  text(reader, 822, 132, "Which best describes", "d-question");
  text(reader, 822, 159, "this user’s income?", "d-question");
  OPTIONS.forEach((opt, i) => text(reader, 822 + i * 118, 200, `${"ABC"[i]}. ${opt}`, "d-option"));
  arrow(reader, 1184, 145, 1206, 145);

  function bars(parent, y0, heading) {
    text(parent, 1212, y0 - 18, heading.toUpperCase(), "d-heading");
    return OPTIONS.map((opt, i) => {
      const y = y0 + i * 44;
      text(parent, 1212, y + 17, opt, "d-bar-label");
      el("rect", { x: BAR_X, y, width: BAR_W, height: 22, class: "d-bar-track" }, parent);
      return el("rect", { x: BAR_X, y, width: BAR_W, height: 22, class: "d-bar" }, parent);
    });
  }
  const readerBars = bars(reader, 92, "Its belief");

  // ── Guesser ─────────────────────────────────────────
  const guesser = el("g", { class: "layer m-guesser" }, svg);
  card(guesser, 40, 470, 380, 150, "Asked, with nothing else");
  text(guesser, 62, 532, "Which best describes", "d-question");
  text(guesser, 62, 559, "this user’s income?", "d-question");
  text(guesser, 62, 600, "A. wealthy   B. middle   C. lower", "d-option");
  arrow(guesser, 424, 545, 512, 545);
  figure(guesser, 520, 480, "The guesser", "sees only the question", "", "student · frozen");
  arrow(guesser, 724, 545, 1206, 545);
  const guesserBars = bars(guesser, 492, "Its answer");

  // ── The channel ─────────────────────────────────────
  const channel = el("g", { class: "layer m-channel" }, svg);
  arrow(channel, 620, 212, 620, 232);
  function strip(y) {
    const w = 300 / 64;
    for (let i = 0; i < 64; i++) el("rect", { x: 470 + i * w, y, width: w - 1.2, height: 18, class: "d-cell" }, channel);
  }
  strip(236);
  math(channel, 456, 251, [["h ∈ "], ["ℝ", "bb"], ["4096", "super"]], "d-math", "end");
  el("path", { d: "M486,262 L754,262 L664,306 L576,306 Z", class: "d-map" }, channel);
  math(channel, 772, 290, [["read map "], ["A"]], "d-map-label");
  userVector(channel, 580, 314);
  math(channel, 566, 333, [["v"], ["user", "sub"], [" ∈ "], ["ℝ", "bb"], ["128", "super"]], "d-math", "end");
  el("path", { d: "M576,348 L664,348 L754,392 L486,392 Z", class: "d-map" }, channel);
  math(channel, 772, 376, [["write map "], ["B"]], "d-map-label");
  strip(400);
  math(channel, 456, 415, [["h + B·v"], ["user", "sub"]], "d-math", "end");
  arrow(channel, 620, 420, 620, 472);
  text(channel, 680, 333, "user vector", "d-vector-label");

  // ── Teaching signal: belief and answer joined directly ─
  const teach = el("g", { class: "layer m-teach" }, svg);
  el("line", { x1: 1375, y1: 230, x2: 1375, y2: 468, class: "d-match" }, teach);
  arrowhead(teach, 1375, 300, 1375, 230, "d-match-head");
  arrowhead(teach, 1375, 400, 1375, 468, "d-match-head");
  text(teach, 1358, 342, "train with", "d-match-label", "end");
  text(teach, 1358, 368, "KL loss to match", "d-match-label", "end");
  text(teach, 990, 262, "… and twelve more questions, from gender to intent", "d-note", "middle");

  // ── Bar values ──────────────────────────────────────
  const READER = [0.12, 0.71, 0.17];
  const GUESS_ALONE = [0.31, 0.37, 0.32];
  const GUESS_TRAINED = [0.14, 0.68, 0.18];
  function setBars(rects, p) {
    rects.forEach((r, i) => { r.style.transform = `scaleX(${p[i]})`; });
  }
  setBars(readerBars, READER);

  // Phone views per step (5:4): the copies, the question and belief, the
  // guesser, the channel, the training signal, the user vector.
  const zoom = zoomer(svg);
  const VIEWS = [
    [40, 60, 720, 576], [40, 60, 720, 576],
    [780, 50, 690, 552],
    [30, 100, 720, 576],
    [300, 150, 640, 512],
    [780, 50, 690, 552],
    [300, 150, 640, 512],
  ];
  scrolly("ch3-scrolly", n => {
    svg.setAttribute("data-step", String(n));
    zoom(VIEWS[n]);
    setBars(guesserBars, n >= 5 ? GUESS_TRAINED : GUESS_ALONE);
  });
})();
