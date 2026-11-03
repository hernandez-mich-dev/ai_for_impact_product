import "./styles.css";
import { evaluate } from "./rules.js";
import { renderReport, renderNothingToCheck, clearReport } from "./report.js";
import { EXAMPLES } from "./examples.js";
import { initPhotos } from "./photos.js";
import { initSafeExit } from "./safe-exit.js";
import { buildReviewPanel } from "./review-panel.js";

/* ================================================================
   Form wiring
   ================================================================ */
function readForm(){
  const bases = new Set([...document.querySelectorAll('input[name="basis"]:checked')].map(i => i.value));
  const val = n => (document.querySelector(`input[name="${n}"]:checked`) || {}).value || "";
  return { bases, relationship: document.getElementById("relationship").value, dob: val("dob"), ssn: val("ssn"), draft: document.getElementById("draft").value };
}

const draftEl = document.getElementById("draft");
function updateCount(){
  const w = (draftEl.value.trim().match(/\S+/g) || []).length;
  document.getElementById("count").textContent = `${w} word${w === 1 ? "" : "s"}`;
}
draftEl.addEventListener("input", updateCount);
function syncRel(){ document.getElementById("relWrap").hidden = !document.querySelector('input[name="basis"][value="dv"]').checked; }
document.querySelectorAll('input[name="basis"]').forEach(i => i.addEventListener("change", syncRel));

document.getElementById("runBtn").addEventListener("click", () => {
  const form = readForm();
  if (!form.draft.trim()){ renderNothingToCheck(); draftEl.focus(); return; }
  renderReport(form, evaluate(form));
});
document.getElementById("clearBtn").addEventListener("click", () => {
  draftEl.value = ""; updateCount(); clearReport(); draftEl.focus();
});

/* Fictional examples for prototype review */
document.querySelectorAll("[data-example]").forEach(b => b.addEventListener("click", () => {
  const ex = EXAMPLES[b.dataset.example];
  document.querySelectorAll('input[name="basis"]').forEach(i => { i.checked = ex.bases.includes(i.value); });
  syncRel();
  document.getElementById("relationship").value = ex.relationship;
  document.querySelectorAll('input[name="dob"]').forEach(i => { i.checked = i.value === ex.dob; });
  document.querySelectorAll('input[name="ssn"]').forEach(i => { i.checked = i.value === ex.ssn; });
  draftEl.value = ex.draft; updateCount();
  const form = readForm();
  renderReport(form, evaluate(form));
}));

initPhotos();
initSafeExit();
buildReviewPanel();
updateCount();
