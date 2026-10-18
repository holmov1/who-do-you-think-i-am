// Geometry chapter: three models at the corners of a triangle, each edge
// labelled with CKA and belief transfer (preprint Table 3). Static.
(function () {
  "use strict";
  if (!window.DiagramKit) return;
  const { el, text, arrowhead } = window.DiagramKit;

  const svg = document.getElementById("geometry-diagram");
  if (!svg) return;

  const W = 200, H = 62;
  const MODELS = {
    llama: { x: 300, y: 60, name: "Llama-3.1-8B" },
    qwen: { x: 110, y: 400, name: "Qwen3-8B" },
    olmo: { x: 490, y: 400, name: "OLMo-3-7B" },
  };
  Object.values(MODELS).forEach(m => {
    el("rect", { x: m.x - W / 2, y: m.y - H / 2, width: W, height: H, class: "d-model" }, svg);
    el("rect", { x: m.x - W / 2 + 5, y: m.y - H / 2 + 5, width: W - 10, height: H - 10, class: "d-model-inner" }, svg);
    text(svg, m.x, m.y + 8, m.name, "d-geo-text", "middle");
  });

  // Directed pairs, source → target, with the label beside the edge.
  const EDGES = [
    ["qwen", "llama", "0.79", "53%", 176, 214, "end"],
    ["olmo", "llama", "0.73", "54%", 424, 214, "start"],
    ["qwen", "olmo", "0.73", "54%", 300, 460, "middle"],
  ];
  EDGES.forEach(([a, b, cka, tr, lx, ly, anchor]) => {
    const s = MODELS[a], t = MODELS[b];
    // Start and end at the box borders.
    const dx = t.x - s.x, dy = t.y - s.y;
    const k = d => Math.min(Math.abs((W / 2 + 6) / (d.x || 1e-9)), Math.abs((H / 2 + 6) / (d.y || 1e-9)));
    const ks = k({ x: dx, y: dy });
    const x1 = s.x + dx * ks, y1 = s.y + dy * ks, x2 = t.x - dx * ks, y2 = t.y - dy * ks;
    el("line", { x1, y1, x2, y2, class: "d-arrow" }, svg);
    arrowhead(svg, x1, y1, x2, y2);
    text(svg, lx, ly, `CKA ${cka}`, "d-geo-text", anchor);
    text(svg, lx, ly + 32, `transfer ${tr}`, "d-geo-text", anchor);
  });

  el("line", { x1: 150, y1: 514, x2: 450, y2: 514, class: "d-rule" }, svg);
  text(svg, 300, 546, "null: CKA 0.01 · transfer 30%", "d-geo-note", "middle");
})();
