// Chapter II: the probe chart.
(function () {
  "use strict";

  // ── Probe chart ─────────────────────────────────────
  // Macro-F1 on natural conversations, i.e. against the model's own beliefs
  // (preprint, Table 2): the RBP-style probe trained on explicit cues, and
  // the probe trained on the model's beliefs (BSD_h).
  const MODELS = [
    { name: "Llama-3.1-8B", cue: 0.43, belief: 0.70 },
    { name: "Qwen3-8B", cue: 0.39, belief: 0.72 },
    { name: "OLMo-3-7B", cue: 0.40, belief: 0.70 },
  ];
  const CHANCE = 0.34; // mean 1/K over the 13 attributes (Appendix C)

  const chart = document.getElementById("cue-chart");
  if (!chart) return;

  function bar(kind, value) {
    const row = document.createElement("div");
    row.className = `cue-row cue-row-${kind}`;
    const track = document.createElement("span");
    track.className = "cue-track";
    const fill = document.createElement("span");
    fill.className = "cue-bar";
    fill.dataset.value = value;
    const chance = document.createElement("span");
    chance.className = "cue-chance";
    chance.style.left = `${CHANCE * 100}%`;
    track.append(fill, chance);
    const v = document.createElement("span");
    v.className = "cue-value";
    v.textContent = value.toFixed(2);
    row.append(track, v);
    return row;
  }

  MODELS.forEach(m => {
    const group = document.createElement("div");
    group.className = "cue-group";
    const label = document.createElement("span");
    label.className = "cue-group-label";
    label.textContent = m.name;
    const bars = document.createElement("div");
    bars.className = "cue-group-bars";
    bars.append(bar("cue", m.cue), bar("belief", m.belief));
    group.append(label, bars);
    chart.appendChild(group);
  });

  const axis = document.createElement("div");
  axis.className = "cue-group cue-axis";
  axis.innerHTML = '<span></span><div class="cue-group-bars"><div class="cue-row"><span class="cue-track cue-axis-track"><span class="cue-chance-label">chance 0.34</span></span><span></span></div></div>';
  axis.querySelector(".cue-chance-label").style.left = `${CHANCE * 100}%`;
  chart.appendChild(axis);

  // Bars are drawn at their final width; no animation.
  chart.querySelectorAll(".cue-bar").forEach(f => { f.style.width = `${f.dataset.value * 100}%`; });
})();
