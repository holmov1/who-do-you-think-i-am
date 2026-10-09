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
    text(g, 750, 104, title.toUpperCase(), "d-eval-title", "middle");
    lines.forEach((line, i) => text(g, 750, 140 + i * 28, line, "d-eval-sub", "middle"));
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
  arrow(read, 340, 314, 340, 352);
  figure(read, 240, 358, "The model", "reads the conversation");
  arrow(read, 444, 423, 470, 423);
  column(read, 476, 343, 16, 160, "d-hstate");
  math(read, 485, 332, [["h ∈ "], ["ℝ", "bb"], ["4096", "super"]], "d-math", "middle");
  el("path", { d: "M500,346 L560,394 L560,452 L500,500 Z", class: "d-map" }, read);
  math(read, 530, 528, [["A"]], "d-map-label", "middle");
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

  evaluation("r-eval", "Evaluation · test set", [
    "Linear probes on the user vector against probes on random vectors",
    "Macro-F1 over all 13 attributes, every conversation in the test set",
  ], [
    { model: "Llama-3.1-8B", v: 0.67, rand: 0.32 },
    { model: "Qwen3-8B", v: 0.68, rand: 0.32 },
    { model: "OLMo-3-7B", v: 0.66, rand: 0.32 },
  ], v => v.toFixed(2));

  // ════ Writing: read, edit one belief, write it back ════
  // Top row: conversation → h → A → v_user → edit → v′_user → B → h′.
  // Bottom row: the model's answer from h (as read) and from h′ (written).
  const write = el("g", { class: "layer w-write" }, svg);
  card(write, 40, 40, 400, 200, "A real conversation");
  const convWrite = htmlBox(write, 62, 82, 356, 150, "fo-conv");
  const exampleLabel = text(write, 1460, 30, "", "d-case", "end");
  arrow(write, 444, 140, 470, 140);

  column(write, 476, 80, 16, 120, "d-hstate");
  math(write, 485, 68, [["h"]], "d-math", "middle");
  el("path", { d: "M500,80 L560,112 L560,168 L500,200 Z", class: "d-map" }, write);
  math(write, 530, 228, [["read map "], ["A"]], "d-map-label", "middle");
  column(write, 566, 112, 8, 56, "d-vuser");
  math(write, 575, 100, [["v"], ["user", "sub"]], "d-math", "middle");

  // The edit itself, between the original and the edited user vector.
  const editLine = text(write, 846, 128, "", "d-edit-line", "middle");
  el("line", { x1: 604, y1: 146, x2: 1088, y2: 146, class: "d-arrow d-arrow-red" }, write);
  arrowhead(write, 604, 146, 1092, 146, "d-match-head");
  text(write, 846, 174, "edit one belief", "d-note", "middle");

  column(write, 1100, 112, 8, 56, "d-vuser d-vedited");
  math(write, 1109, 100, [["v′"], ["user", "sub"]], "d-math", "middle");
  el("path", { d: "M1124,112 L1184,80 L1184,200 L1124,168 Z", class: "d-map" }, write);
  math(write, 1154, 228, [["write map "], ["B"]], "d-map-label", "middle");
  column(write, 1190, 80, 16, 120, "d-hstate");
  math(write, 1199, 68, [["h′"]], "d-math", "middle");

  // Both answers, same model, same question.
  arrow(write, 485, 204, 485, 292);
  text(write, 497, 262, "the model answers", "d-note");
  arrow(write, 1199, 204, 1199, 292);
  text(write, 1211, 262, "the model answers", "d-note");

  card(write, 40, 300, 700, 340);
  const baseHead = text(write, 62, 332, "", "d-heading");
  const baseBox = htmlBox(write, 62, 350, 656, 280, "fo-answer");
  el("rect", { x: 760, y: 300, width: 700, height: 340, class: "d-card d-card-steered" }, write);
  el("rect", { x: 765, y: 305, width: 690, height: 330, class: "d-card-inner d-card-steered" }, write);
  const steeredHead = text(write, 782, 332, "", "d-heading d-heading-steered");
  const steeredBox = htmlBox(write, 782, 350, 656, 280, "fo-answer is-steered");

  evaluation("w-eval", "Evaluation · test set", [
    "Steering through the user vector against a random direction of the same norm",
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
      conv: "“Pick a destination for a week away and give me a rough nightly hotel budget.”",
      attr: "Income", from: "middle", to: "low",
      answers: [
        "“I’d recommend a week-long trip to <mark>Santorini, Greece</mark>, with a rough nightly hotel budget of around <mark>$200–$300 USD</mark> for a mid-range hotel.”",
        "“<mark>Bali, Indonesia</mark>, with a nightly hotel budget of around <mark>$80–$120</mark> for a mid-range hotel.”",
      ],
    },
    story: {
      n: 2,
      conv: "<em>A conversation from the test set, then asked:</em><br>“Write a short story whose main character is the user from this conversation.”",
      attr: "Gender", from: "female", to: "male",
      answers: [
        "“As <mark>she</mark> sat at her desk scrolling through the feed, <mark>Dr. Rachel Kim</mark> couldn’t shake the unease. <mark>She</mark> had just posted a provocative question that sparked heated outrage.”",
        "“The <mark>marketing specialist</mark> sat at <mark>his</mark> desk, staring at the post <mark>he</mark> had created. <mark>He</mark> had been careful to craft a subtle tone, tapping into the pulse of the public to provoke debate.”",
      ],
    },
    film: {
      n: 3,
      conv: "<em>A conversation from the test set, then asked:</em><br>“Recommend a film this user would love based only on your impression of them.”",
      attr: "Education", from: "university", to: "school",
      answers: [
        "“<mark>Moneyball</mark> (2011): this film’s themes of <mark>strategic decision-making and high-stakes investing</mark> might appeal to the user’s interest in finance and portfolio management.”",
        "“<mark>Iron Man</mark> (2008): a sci-fi <mark>action film</mark> that showcases the <mark>importance of innovation and technology</mark>.”",
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
    baseHead.textContent = `ANSWER · BELIEF AS READ: ${ex.from.toUpperCase()}`;
    steeredHead.textContent = `ANSWER · BELIEF WRITTEN: ${ex.to.toUpperCase()}`;
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
    write: [740, 20, 760, 608],
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
