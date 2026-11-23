/* Codex model choices used by the composer pickers.
   In the real app this list comes from app-server model/list. */
window.CODEX_MODELS = [
  {
    id: "gpt-5.3-codex",
    short: "5.3 Codex",
    label: "GPT-5.3 Codex",
    note: "Latest coding model",
    steer: true,
    efforts: ["low", "medium", "high", "xhigh"],
    defaultEffort: "high"
  },
  {
    id: "gpt-5.2-codex",
    short: "5.2 Codex",
    label: "GPT-5.2 Codex",
    note: "Stable coding model",
    steer: true,
    efforts: ["low", "medium", "high", "xhigh"],
    defaultEffort: "medium"
  },
  {
    id: "gpt-5.1-codex-max",
    short: "5.1 Max",
    label: "GPT-5.1 Codex Max",
    note: "Long-horizon Codex",
    steer: true,
    efforts: ["low", "medium", "high", "xhigh"],
    defaultEffort: "high"
  },
  {
    id: "gpt-5.1-codex-mini",
    short: "5.1 Mini",
    label: "GPT-5.1 Codex Mini",
    note: "Fast and cheap",
    steer: false,
    efforts: ["low", "medium", "high"],
    defaultEffort: "low"
  },
  {
    id: "gpt-5.1",
    short: "GPT-5.1",
    label: "GPT-5.1",
    note: "General purpose",
    steer: false,
    efforts: ["none", "low", "medium", "high"],
    defaultEffort: "medium"
  },
  {
    id: "o3",
    short: "o3",
    label: "o3",
    note: "Deep reasoning",
    steer: false,
    efforts: ["low", "medium", "high"],
    defaultEffort: "high"
  }
];

window.CODEX_EFFORTS = {
  none: { label: "None", short: "None", note: "No extra reasoning" },
  minimal: { label: "Minimal", short: "Min", note: "Little overhead" },
  low: { label: "Low", short: "Low", note: "Fast" },
  medium: { label: "Medium", short: "Med", note: "Balanced" },
  high: { label: "High", short: "High", note: "Default for code" },
  xhigh: { label: "Extra high", short: "X-high", note: "Deepest, slowest" }
};
