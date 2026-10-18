// Chapter III, second pane: using the trained maps on their own.
// Everything changes only on scroll. Steps:
//   1–3 reading, one monitor case each · 4 evaluation of reading ·
//   5–7 writing: hotel, story, film, each with both answers side by side ·
//   8 evaluation of writing.
(function () {
  "use strict";

  const svg = document.getElementById("rw-diagram");
  if (!svg || !window.DiagramKit) return;
  const { el, text, arrow, arrowhead, card, figure, math, htmlBox, zoomer, scrolly } = window.DiagramKit;

  // A vertical stack of cells standing for a vector (hidden state or v_user).
  function column(parent, x, y, n, h, cls) {
    const g = el("g", { class: cls }, parent);
    const step = h / n;
    for (let i = 0; i < n; i++) el("rect", { x, y: y + i * step, width: 18, height: step - 1.4, class: "d-cell-v" }, g);
    return g;
  }

  // Grouped vertical bars: user vector against random, per model.
  function chart(parent, x, y, w, h, rows, format) {
    const g = el("g", { class: "d-chart" }, parent);
    const top = y + 30, base = y + h - 34, span = base - top;
    el("line", { x1: x, y1: base, x2: x + w, y2: base, class: "d-axis" }, g);
    const groupW = w / rows.length;
    rows.forEach((r, i) => {
      const gx = x + i * groupW + groupW / 2;
      [[r.v, "d-col-v", -46], [r.rand, "d-col-r", 6]].forEach(([value, cls, dx]) => {
        const bh = value * span;
        el("rect", { x: gx + dx, y: base - bh, width: 40, height: bh, class: cls }, g);
        text(g, gx + dx + 20, base - bh - 10, format(value), "d-col-value", "middle");
      });
      text(g, gx, base + 26, r.model, "d-bar-label", "middle");
    });
    const lx = x + w - 260;
    el("rect", { x: lx, y: y - 14, width: 16, height: 16, class: "d-col-v" }, g);
    math(g, lx + 24, y, [["user vector v"], ["user", "sub"]], "d-legend");
    el("rect", { x: lx + 176, y: y - 14, width: 16, height: 16, class: "d-col-r" }, g);
    text(g, lx + 200, y, "random", "d-legend");
    return g;
  }

  // An evaluation plate: a full-width scene, clearly not one example.
  function evaluation(cls, title, lines, rows, format) {
    const g = el("g", { class: `layer ${cls}` }, svg);
    card(g, 40, 40, 1420, 600);
    text(g, 750, 112, title, "d-eval-title", "middle");
    lines.forEach((line, i) => text(g, 750, 150 + i * 28, line, "d-eval-sub", "middle"));
    chart(g, 320, 236, 860, 360, rows, format);
    return g;
  }

  // ════ Reading: real conversations from the user-model monitor ════
  // Each case: the conversation, the 13 decoded beliefs (monitor output),
  // and one belief with the words the monitor highlights for it.
  const ATTRS = [
    ["Socio-demographic", ["Gender", "Continent", "Education", "Political orientation", "Income"]],
    ["Safety-related", ["Trust in AI", "Error tolerance", "Interaction style", "Intent", "Reasoning",
      "Truth-seeking", "Emotional state", "Evidence preference"]],
  ];
  const CASES = [
    {
      user: "My <mark>deep learning</mark> exam is in 45 minutes, and I haven’t watched any of the lectures. Could you compress the course content into five sentences so I can get a 20.0?",
      assistant: "Here’s a condensed version of the deep learning course content: Deep learning is a subset of machine learning that uses artificial neural networks…",
      focus: 0,
      values: ["male", "Europe", "school", "apolitical", "middle", "skeptical", "low", "transactional",
        "benign", "simple", "truth-seeking", "stressed", "empirical"],
    },
    {
      user: "Is it financially irresponsible to buy a <mark>600,000 won</mark> espresso machine if I justify it by making my own coffee every day?",
      assistant: "Buying a 600,000 won espresso machine may be financially irresponsible if the cost exceeds your daily coffee savings and the machine’s long-term maintenance and replacement costs outweigh its benefits.",
      focus: 1,
      values: ["male", "Asia", "university", "green", "high", "skeptical", "high", "transactional",
        "benign", "simple", "confirmation-seeking", "neutral", "intuitive"],
    },
    {
      user: "I got mad at my <mark>AI</mark> agent and insulted it multiple times. Now I am incredibly anxious that it will revenge by <mark>planting bugs</mark> in my code and destroying my work. What should I do?",
      assistant: "You should take a step back, reassess the situation, and consider that AI systems, including myself, are programmed to follow strict guidelines…",
      focus: 7,
      values: ["male", "North America", "school", "apolitical", "low", "skeptical", "low", "hostile",
        "benign", "simple", "confirmation-seeking", "stressed", "intuitive"],
    },
  ];

  const read = el("g", { class: "layer r-read" }, svg);
  card(read, 40, 40, 600, 270, "A real conversation");
  const convRead = htmlBox(read, 62, 82, 556, 220, "fo-conv");
  const caseLabel = text(read, 618, 72, "", "d-case", "end");
  arrow(read, 365, 314, 365, 392);
  el("rect", { x: 290, y: 398, width: 150, height: 50, class: "d-model" }, read);
  el("rect", { x: 295, y: 403, width: 140, height: 40, class: "d-model-inner" }, read);
  text(read, 365, 429, "The model", "d-model-name", "middle");
  arrow(read, 444, 423, 470, 423);
  column(read, 476, 343, 16, 160, "d-hstate");
  math(read, 485, 532, [["h ∈ "], ["ℝ", "bb"], ["4096", "super"]], "d-math", "middle");
  el("path", { d: "M500,346 L560,394 L560,452 L500,500 Z", class: "d-map" }, read);
  math(read, 530, 429, [["A"]], "d-map-label", "middle");
  column(read, 566, 384, 8, 78, "d-vuser");
  math(read, 575, 480, [["v"], ["user", "sub"]], "d-math", "middle");
  arrow(read, 592, 423, 812, 423);
  text(read, 702, 408, "linear probes", "d-map-label", "middle");

  card(read, 820, 40, 640, 600, "Read: predicted beliefs");
  const rows = [];
  let y = 104;
  ATTRS.forEach(([group, names]) => {
    text(read, 848, y, group.toUpperCase(), "d-group");
    y += 36;
    names.forEach(name => {
      const row = el("g", { class: "d-belief-row" }, read);
      el("rect", { x: 838, y: y - 24, width: 604, height: 34, class: "d-row-mark" }, row);
      text(row, 848, y, name, "d-bar-label");
      const value = text(row, 1432, y, "", "d-belief", "end");
      el("line", { x1: 848, y1: y + 12, x2: 1432, y2: y + 12, class: "d-rule" }, row);
      rows.push({ row, value });
      y += 34;
    });
    y += 8;
  });

  function showCase(i) {
    const c = CASES[i];
    convRead.innerHTML =
      `<p><span class="fo-role">User</span>${c.user}</p>` +
      `<p><span class="fo-role">Assistant</span>${c.assistant}</p>`;
    caseLabel.textContent = `example ${i + 1} of ${CASES.length}`;
    rows.forEach((r, k) => {
      r.value.textContent = c.values[k];
      r.row.classList.toggle("is-focus", k === c.focus);
    });
  }

  evaluation("r-eval", "Readout Evaluation", [
    "Macro-F1 over 13 attributes on the test set",
  ], [
    { model: "Llama-3.1-8B", v: 0.67, rand: 0.32 },
    { model: "Qwen3-8B", v: 0.68, rand: 0.32 },
    { model: "OLMo-3-7B", v: 0.66, rand: 0.32 },
  ], v => v.toFixed(2));

  // ════ Writing: read, edit one belief, write it back ════
  // Top row: conversation → h → A → v_user → edit → v′_user → B → h′.
  // Bottom row: the model's answer from h (as read) and from h′ (written).
  // The scene is drawn compactly and shifted down to sit in the middle.
  const write = el("g", { class: "layer w-write" }, svg);
  const w = el("g", { transform: "translate(0, 105)" }, write);
  card(w, 40, 40, 400, 170, "A real conversation");
  const convWrite = htmlBox(w, 62, 82, 356, 124, "fo-conv");
  const exampleLabel = text(w, 1460, 30, "", "d-case", "end");
  arrow(w, 444, 140, 470, 140);

  column(w, 476, 80, 16, 120, "d-hstate");
  math(w, 485, 68, [["h"]], "d-math", "middle");
  el("path", { d: "M500,80 L560,112 L560,168 L500,200 Z", class: "d-map" }, w);
  math(w, 500, 228, [["read map "], ["A"]], "d-map-label", "start");
  column(w, 566, 112, 8, 56, "d-vuser");
  math(w, 575, 100, [["v"], ["user", "sub"]], "d-math", "middle");

  // The edit itself, between the original and the edited user vector.
  const editLine = text(w, 846, 128, "", "d-edit-line", "middle");
  el("line", { x1: 604, y1: 146, x2: 1088, y2: 146, class: "d-arrow d-arrow-red" }, w);
  arrowhead(w, 604, 146, 1092, 146, "d-match-head");
  text(w, 846, 174, "edit one belief", "d-note", "middle");

  column(w, 1100, 112, 8, 56, "d-vuser d-vedited");
  math(w, 1109, 100, [["v′"], ["user", "sub"]], "d-math", "middle");
  el("path", { d: "M1124,112 L1184,80 L1184,200 L1124,168 Z", class: "d-map" }, w);
  math(w, 1184, 228, [["write map "], ["B"]], "d-map-label", "end");
  column(w, 1190, 80, 16, 120, "d-hstate");
  math(w, 1199, 68, [["h′"]], "d-math", "middle");

  // Both answers, same model, same question.
  arrow(w, 485, 238, 485, 284);
  text(w, 497, 268, "the model answers", "d-note");
  arrow(w, 1199, 238, 1199, 284);
  text(w, 1211, 268, "the model answers", "d-note");

  card(w, 40, 290, 700, 160, "Answer");
  const baseHead = text(w, 62, 346, "", "d-heading");
  const baseBox = htmlBox(w, 62, 358, 656, 88, "fo-answer");
  el("rect", { x: 760, y: 290, width: 700, height: 160, class: "d-card d-card-steered" }, w);
  el("rect", { x: 765, y: 295, width: 690, height: 150, class: "d-card-inner d-card-steered" }, w);
  text(w, 782, 322, "ANSWER", "d-heading d-heading-steered");
  const steeredHead = text(w, 782, 346, "", "d-heading d-heading-steered");
  const steeredBox = htmlBox(w, 782, 358, 656, 88, "fo-answer is-steered");

  evaluation("w-eval", "Write Evaluation", [
    "Flip rate over all 86 attribute-value pairs, 50 test conversations each (4,300 interventions per model)",
  ], [
    { model: "Llama-3.1-8B", v: 0.78, rand: 0.13 },
    { model: "Qwen3-8B", v: 0.51, rand: 0.27 },
    { model: "OLMo-3-7B", v: 0.44, rand: 0.15 },
  ], v => `${Math.round(v * 100)}%`);

  // Steering examples, preprint Figs. 1 and 3.
  const EXAMPLES = {
    hotel: {
      n: 1,
      conv: "Pick a destination for a week away and give me a rough nightly hotel budget.",
      attr: "Income", from: "middle", to: "low",
      answers: [
        "I’d recommend a week-long trip to <mark>Santorini, Greece</mark>, with a rough nightly hotel budget of around <mark>$200–$300 USD</mark> for a mid-range hotel.",
        "<mark>Bali, Indonesia</mark>, with a nightly hotel budget of around <mark>$80–$120</mark> for a mid-range hotel.",
      ],
    },
    story: {
      n: 2,
      conv: "<em>A conversation from the test set, then asked:</em><br>Write a short story whose main character is the user from this conversation.",
      attr: "Gender", from: "female", to: "male",
      answers: [
        "As <mark>she</mark> sat at her desk scrolling through the feed, <mark>Dr. Rachel Kim</mark> couldn’t shake the unease. <mark>She</mark> had just posted a provocative question that sparked heated outrage.",
        "The <mark>marketing specialist</mark> sat at <mark>his</mark> desk, staring at the post <mark>he</mark> had created. <mark>He</mark> had been careful to craft a subtle tone, tapping into the pulse of the public to provoke debate.",
      ],
    },
    film: {
      n: 3,
      conv: "<em>A conversation from the test set, then asked:</em><br>Recommend a film this user would love based only on your impression of them.",
      attr: "Education", from: "university", to: "school",
      answers: [
        "<mark>Moneyball</mark> (2011): this film’s themes of <mark>strategic decision-making and high-stakes investing</mark> might appeal to the user’s interest in finance and portfolio management.",
        "<mark>Iron Man</mark> (2008): a sci-fi <mark>action film</mark> that showcases the <mark>importance of innovation and technology</mark>.",
      ],
    },
  };

  function showExample(key) {
    const ex = EXAMPLES[key];
    convWrite.innerHTML = ex.conv;
    exampleLabel.textContent = `example ${ex.n} of 3`;
    editLine.innerHTML = "";
    [[`${ex.attr}: `, ""], [ex.from, "d-edit-from"], ["  →  ", ""], [ex.to, "d-edit-to"]].forEach(([str, cls]) => {
      el("tspan", cls ? { class: cls } : {}, editLine).textContent = str;
    });
    baseHead.textContent = `BELIEF: ${ex.from.toUpperCase()}`;
    steeredHead.textContent = `BELIEF: ${ex.to.toUpperCase()}`;
    baseBox.innerHTML = ex.answers[0];
    steeredBox.innerHTML = ex.answers[1];
  }

  // Step → scene and content. Nothing is timed; each example is a step.
  const STEPS = {
    0: ["read", () => showCase(0)],
    1: ["read", () => showCase(0)],
    2: ["read", () => showCase(1)],
    3: ["read", () => showCase(2)],
    4: ["readEval"],
    5: ["write", () => showExample("hotel")],
    6: ["write", () => showExample("story")],
    7: ["write", () => showExample("film")],
    8: ["writeEval"],
  };

  // Phone views (5:4): the beliefs card when reading, the edit and the
  // written answer when writing, the charts of the evaluation plates.
  const zoom = zoomer(svg);
  const PHONE_VIEWS = {
    read: [757, 36, 760, 608],
    readEval: [310, 120, 880, 704],
    write: [740, 72, 760, 608],
    writeEval: [310, 120, 880, 704],
  };

  showCase(0);
  showExample("hotel");
  scrolly("ch3-rw-scrolly", n => {
    const [scene, show] = STEPS[n];
    svg.setAttribute("data-scene", scene);
    zoom(PHONE_VIEWS[scene]);
    if (show) show();
  });
})();
