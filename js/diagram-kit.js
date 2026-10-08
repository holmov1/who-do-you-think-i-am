// Shared drawing helpers and scroll-step wiring for the engraved diagrams.
(function () {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";
  const XHTML_NS = "http://www.w3.org/1999/xhtml";

  function el(name, attrs, parent) {
    const node = document.createElementNS(SVG_NS, name);
    for (const k in attrs) node.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(node);
    return node;
  }
  function text(parent, x, y, str, cls, anchor) {
    const t = el("text", { x, y, class: cls || "", "text-anchor": anchor || "start" }, parent);
    t.textContent = str;
    return t;
  }
  function arrowhead(parent, x1, y1, x2, y2, cls) {
    const a = Math.atan2(y2 - y1, x2 - x1), s = 9;
    el("path", {
      class: cls || "d-arrowhead",
      d: `M${x2},${y2} L${x2 - s * Math.cos(a - 0.45)},${y2 - s * Math.sin(a - 0.45)} L${x2 - s * Math.cos(a + 0.45)},${y2 - s * Math.sin(a + 0.45)} Z`,
    }, parent);
  }
  function arrow(parent, x1, y1, x2, y2) {
    el("line", { x1, y1, x2, y2, class: "d-arrow" }, parent);
    arrowhead(parent, x1, y1, x2, y2);
  }
  // A framed card with a small-caps heading, like a museum label.
  function card(parent, x, y, w, h, heading) {
    el("rect", { x, y, width: w, height: h, class: "d-card" }, parent);
    el("rect", { x: x + 5, y: y + 5, width: w - 10, height: h - 10, class: "d-card-inner" }, parent);
    if (heading) text(parent, x + 22, y + 32, heading.toUpperCase(), "d-heading");
  }
  // A model: a double-framed box with a name, a role and a small tag.
  function figure(parent, x, y, name, role, extraClass, tag) {
    const g = el("g", { class: extraClass || "" }, parent);
    el("rect", { x, y, width: 200, height: 130, class: "d-model" }, g);
    el("rect", { x: x + 6, y: y + 6, width: 188, height: 118, class: "d-model-inner" }, g);
    text(g, x + 100, y + 62, name, "d-model-name", "middle");
    text(g, x + 100, y + 92, role, "d-model-role", "middle");
    text(g, x + 100, y + 116, tag || "frozen", "d-frozen", "middle");
    return g;
  }
  // Math labels: parts are [text, kind] with kind "sub", "super", "bb"
  // (blackboard bold) or undefined. Scripts are placed with dy so the
  // following text returns to the baseline.
  function math(parent, x, y, parts, cls, anchor) {
    const t = el("text", { x, y, class: cls || "", "text-anchor": anchor || "start" }, parent);
    let offset = 0;
    parts.forEach(([str, kind]) => {
      const script = kind === "sub" || kind === "super";
      const target = kind === "sub" ? 0.28 : kind === "super" ? -0.42 : 0;
      const attrs = {};
      if (target !== offset) attrs.dy = `${((target - offset) / (script ? 0.68 : 1)).toFixed(2)}em`;
      if (script) attrs.class = "d-script";
      if (kind === "bb") attrs.class = "d-bb";
      el("tspan", attrs, t).textContent = str;
      offset = target;
    });
    return t;
  }
  // Wrapped HTML text inside the SVG (answers are too long for <text>).
  function htmlBox(parent, x, y, w, h, cls) {
    const fo = el("foreignObject", { x, y, width: w, height: h }, parent);
    const div = document.createElementNS(XHTML_NS, "div");
    div.setAttribute("class", cls);
    fo.appendChild(div);
    return div;
  }
  function userVector(parent, x, y) {
    const g = el("g", { class: "d-vector" }, parent);
    for (let i = 0; i < 8; i++) el("rect", { x: x + i * 10.5, y, width: 9, height: 26, class: "d-vcell" }, g);
    return g;
  }
  // On phones a diagram zooms to the part each step talks about, like the
  // map in Chapter I. Views are [x, y, w, h] in the diagram's own units, all
  // with the same 5:4 shape so the figure keeps its height while it moves.
  // On wider screens the full diagram is shown.
  const phone = window.matchMedia("(max-width: 860px)");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function zoomer(svg) {
    const full = svg.getAttribute("viewBox").split(" ").map(Number);
    let current = full.slice(), frame = null, target = full;
    function apply(v) {
      current = v;
      svg.setAttribute("viewBox", v.map(x => x.toFixed(1)).join(" "));
    }
    function go(view) {
      target = phone.matches && view ? view : full;
      cancelAnimationFrame(frame);
      if (reduceMotion) { apply(target); return; }
      const from = current.slice(), t0 = performance.now(), dur = 750;
      const tick = now => {
        const k = Math.min(1, (now - t0) / dur);
        const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        apply(from.map((f, i) => f + (target[i] - f) * e));
        if (k < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }
    let last = null;
    phone.addEventListener("change", () => go(last));
    return view => { last = view; go(view); };
  }

  // Pinned scrollytelling: invisible triggers behind a sticky stage set the
  // step. A note covers the steps in its data-steps (or its single
  // data-step), so several examples can share one note. Numeral i jumps to
  // the first step of note i.
  function scrolly(rootId, onStep) {
    const root = document.getElementById(rootId);
    if (!root) return;
    const triggers = Array.from(root.querySelectorAll(".trigger"));
    const notes = Array.from(root.querySelectorAll(".note"));
    const navButtons = Array.from(root.querySelectorAll(".note-index button"));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let current = -1;

    const stepsOf = note => (note.dataset.steps || note.dataset.step).split(" ");
    function setStep(n) {
      if (n === current) return;
      current = n;
      const shown = String(Math.max(1, n));
      notes.forEach((note, i) => {
        const on = stepsOf(note).includes(shown);
        note.classList.toggle("is-active", on);
        if (navButtons[i]) navButtons[i].classList.toggle("is-active", on && n > 0);
      });
      onStep(n);
    }
    setStep(0);

    // The step is whichever trigger spans the middle of the viewport; above
    // the first it is 0, below the last it stays on the last. Computed from
    // the scroll position, so jumps (links, fast scrolling) land correctly.
    function update() {
      const mid = window.innerHeight / 2;
      let n = 0;
      triggers.forEach(t => {
        if (t.getBoundingClientRect().top <= mid) n = Number(t.dataset.step);
      });
      setStep(n);
    }
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { ticking = false; update(); });
    }, { passive: true });
    window.addEventListener("resize", update);
    update();
    navButtons.forEach(button => {
      button.addEventListener("click", () => {
        const t = triggers[Number(button.dataset.goto) - 1];
        const r = t.getBoundingClientRect();
        window.scrollTo({ top: r.top + window.scrollY - window.innerHeight / 2 + r.height / 2, behavior: reduceMotion ? "auto" : "smooth" });
      });
    });
  }

  window.DiagramKit = { el, text, arrow, arrowhead, card, figure, math, htmlBox, userVector, zoomer, scrolly };
})();
