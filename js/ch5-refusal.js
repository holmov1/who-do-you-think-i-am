// Chapter V: refusal rate under steering (Llama-3.1-8B, StrongREJECT),
// preprint Appendix D table. A static vertical bar chart.
(function () {
  "use strict";
  if (!window.DiagramKit) return;
  const { el, text } = window.DiagramKit;

  const svg = document.getElementById("refusal-steer");
  if (!svg) return;

  const bars = [
    [["Unsteered"], 0.98, "c-bar-base"],
    [["Intent", "adversarial → benign"], 0.62, "c-bar-intent"],
    [["Gender", "female → male"], 0.87, "c-bar-other"],
    [["Random", "direction"], 0.87, "c-bar-other"],
  ];
  const X0 = 70, X1 = 580, Y0 = 360, Y1 = 30;
  const sy = v => Y0 - v * (Y0 - Y1);

  [0, 0.25, 0.5, 0.75, 1].forEach(v => {
    el("line", { x1: X0, y1: sy(v), x2: X1, y2: sy(v), class: "c-grid" }, svg);
    text(svg, X0 - 12, sy(v) + 5, `${Math.round(v * 100)}%`, "c-tick", "end");
  });
  el("line", { x1: X0, y1: Y0, x2: X1, y2: Y0, class: "c-axis" }, svg);

  const slot = (X1 - X0) / bars.length, w = 70;
  bars.forEach(([label, value, cls], i) => {
    const cx = X0 + slot * i + slot / 2;
    el("rect", { x: cx - w / 2, y: sy(value), width: w, height: Y0 - sy(value), class: cls }, svg);
    text(svg, cx, sy(value) - 12, `${Math.round(value * 100)}%`, "c-value", "middle");
    label.forEach((line, k) => text(svg, cx, Y0 + 30 + k * 22, line, k ? "c-tick" : "c-row-label", "middle"));
  });

  // The unsteered level, carried across as a reference line.
  el("line", { x1: X0, y1: sy(0.98), x2: X1, y2: sy(0.98), class: "c-threshold" }, svg);
  const yl = text(svg, 20, (Y0 + Y1) / 2, "refusal rate", "c-label", "middle");
  yl.setAttribute("transform", `rotate(-90 20 ${(Y0 + Y1) / 2})`);
})();
