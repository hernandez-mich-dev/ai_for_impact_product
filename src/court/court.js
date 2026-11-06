import "../styles.css";
import "./court.css";
import { esc, toast } from "../util.js";
import { highlight } from "../report.js";
import { SAMPLES } from "./samples.js";
import {
  triage, suggestedCompare, INDICATORS, TRIAGE_SOURCES,
  PRIORITY, COMPLEXITY, BASIS_LABEL
} from "./triage.js";

/* ================================================================
   State
   ================================================================ */
const items = SAMPLES.map(p => ({ p, t: triage(p) }));
let sortMode = "suggested";
let custom = [];          // ids, used when the reviewer reorders by hand
const reviewed = [];      // ids, in the order they were marked
let nextId = 1195;

const byId = id => items.find(i => i.p.id === id);
const COMPARE = {
  suggested: suggestedCompare,
  oldest: (a, b) => a.t.filedAt - b.t.filedAt,
  complex: (a, b) => b.t.complexity - a.t.complexity || b.t.words - a.t.words
};
function waiting(){
  const open = items.filter(i => !reviewed.includes(i.p.id));
  if (sortMode === "custom") return custom.map(byId).filter(i => i && open.includes(i));
  return open.slice().sort(COMPARE[sortMode]);
}

/* ================================================================
   Rendering
   ================================================================ */
const fmtFiled = d => d.toLocaleString("en-US", { month:"short", day:"numeric", hour:"numeric", minute:"2-digit" });
function fmtWait(d){
  const min = Math.max(0, Math.round((Date.now() - d) / 60000));
  if (min < 60) return `${min} min`;
  if (min < 48 * 60) return `${Math.round(min / 60)} h`;
  return `${Math.round(min / 1440)} days`;
}
function srcLinks(codes){
  return String(codes).split(",").map(c => {
    const s = TRIAGE_SOURCES[c];
    return s.url ? `<a href="${s.url}" target="_blank" rel="noopener" title="${esc(s.title)}">${esc(s.short)}</a>` : `<span title="${esc(s.title)}">${esc(s.short)}</span>`;
  }).join(", ");
}
const reasonList = rs => `<ul>${rs.map(r => `<li>${esc(r.text)} <span class="src">(${srcLinks(r.src)})</span></li>`).join("")}</ul>`;

function cardHtml({ p, t }, rank, isDone){
  const bases = (p.bases || []).map(b => BASIS_LABEL[b]).join(", ") || "No basis selected";
  const chips = [
    p.exParte ? `<span class="chip">Ex parte requested</span>` : `<span class="chip">Hearing requested</span>`,
    ...t.indicators.map(f => `<span class="chip ${f.tier === "trigger" ? "danger" : "factor"}">${esc(f.label)}</span>`)
  ].join("");
  const lines = t.lines.map(l => `<li class="${l.latest ? "latest" : ""}"><div class="meta"><b>Incident ${l.n}${l.latest ? " (most recent)" : ""}</b> · ${esc(l.when)} · ${esc(l.where)}</div>“${esc(l.what)}”</li>`).join("");
  const why = `<div class="why">
      <h4>Priority: ${PRIORITY[t.priority]}</h4>${reasonList(t.pReasons)}
      <h4>Complexity: ${COMPLEXITY[t.complexity]}</h4><ul>${t.cReasons.map(r => `<li>${esc(r)}</li>`).join("")}</ul>
      ${t.gaps.length ? `<h4>Possible gaps (published denial reasons)</h4>${reasonList(t.gaps)}` : ""}
      ${t.notes.length ? `<h4>Procedure notes</h4>${reasonList(t.notes)}` : ""}
    </div>`;
  const actions = isDone
    ? `<button class="small-btn" type="button" data-act="undo" data-id="${p.id}">Move back to waiting</button>`
    : `<button class="small-btn" type="button" data-act="up" data-id="${p.id}" aria-label="Move ${p.id} up">Move up</button>
       <button class="small-btn" type="button" data-act="down" data-id="${p.id}" aria-label="Move ${p.id} down">Move down</button>
       <button class="small-btn" type="button" data-act="done" data-id="${p.id}">Mark reviewed</button>`;
  return `<li class="card p${t.priority}" id="card-${p.id}">
    <div class="card-top">
      ${isDone ? "" : `<span class="rank" aria-label="Position ${rank}">${rank}</span>`}
      <div class="ident"><b>${esc(p.id)}</b><span>Filed ${fmtFiled(t.filedAt)} · waiting <span class="wait" data-t="${t.filedAt.getTime()}">${fmtWait(t.filedAt)}</span></span></div>
      <div class="badges"><span class="badge pr${t.priority}">${PRIORITY[t.priority]}</span><span class="badge cx">${COMPLEXITY[t.complexity]} complexity</span><span class="badge cx">About ${t.readMin} min read</span></div>
    </div>
    <p class="headline">${esc(bases)} · ${esc(t.headline)}</p>
    <div class="chips">${chips}</div>
    <ul class="lines">${lines}</ul>
    <details><summary>Why ${PRIORITY[t.priority]}, ${COMPLEXITY[t.complexity].toLowerCase()} complexity</summary>${why}</details>
    <details><summary>Full petition text</summary><blockquote>${highlight(p.text, t.highlights)}</blockquote></details>
    <div class="actions">${actions}</div>
  </li>`;
}

function render(){
  const list = waiting();
  document.getElementById("queue").innerHTML = list.length
    ? list.map((it, i) => cardHtml(it, i + 1, false)).join("")
    : `<li class="card"><p>No petitions waiting.</p></li>`;
  const done = reviewed.map(byId);
  document.getElementById("done").innerHTML = done.map(it => cardHtml(it, 0, true)).join("");
  document.getElementById("doneH").hidden = !done.length;
  const count = n => list.filter(i => i.t.priority === n).length;
  const mins = list.reduce((s, i) => s + i.t.readMin, 0);
  document.getElementById("stats").innerHTML = [
    ["", list.length, "waiting"], ["s3", count(3), "urgent"], ["s2", count(2), "elevated"],
    ["", count(1), "standard"], ["", `${mins} min`, "total reading"]
  ].map(([c, v, l]) => `<div class="stat ${c}"><b>${v}</b><span>${l}</span></div>`).join("");
  const sel = document.getElementById("sort");
  sel.querySelector('[value="custom"]').disabled = sortMode !== "custom";
  sel.value = sortMode;
}

/* ================================================================
   Reviewer actions
   ================================================================ */
document.addEventListener("click", e => {
  const b = e.target.closest("[data-act]"); if (!b) return;
  const id = b.dataset.id;
  if (b.dataset.act === "done"){ reviewed.push(id); toast(`${id} marked reviewed`); }
  else if (b.dataset.act === "undo"){ reviewed.splice(reviewed.indexOf(id), 1); }
  else {
    if (sortMode !== "custom"){ custom = waiting().map(i => i.p.id); sortMode = "custom"; }
    const order = waiting().map(i => i.p.id), k = order.indexOf(id), j = b.dataset.act === "up" ? k - 1 : k + 1;
    if (j < 0 || j >= order.length) return;
    const ci = custom.indexOf(order[k]), cj = custom.indexOf(order[j]);
    [custom[ci], custom[cj]] = [custom[cj], custom[ci]];
  }
  render();
  const again = document.querySelector(`#card-${CSS.escape(id)} [data-act="${b.dataset.act}"]`);
  if (again) again.focus();
});
document.getElementById("sort").addEventListener("change", e => { sortMode = e.target.value; render(); });

const panel = document.getElementById("addPanel"), toggle = document.getElementById("addToggle");
function showAdd(open){ panel.hidden = !open; toggle.setAttribute("aria-expanded", String(open)); if (open) document.getElementById("atext").focus(); }
toggle.addEventListener("click", () => showAdd(panel.hidden));
document.getElementById("addCancel").addEventListener("click", () => showAdd(false));
document.getElementById("addBtn").addEventListener("click", () => {
  const text = document.getElementById("atext").value.trim();
  if (!text){ toast("Paste a petition narrative first"); return; }
  const p = {
    id: `PO-26-${nextId++}`, filedAt: new Date().toISOString(), text,
    bases: [...document.querySelectorAll('input[name="abasis"]:checked')].map(i => i.value),
    relationship: document.getElementById("arel").value,
    exParte: document.getElementById("aexparte").checked,
    dobKnown: document.getElementById("adob").checked
  };
  items.push({ p, t: triage(p) });
  if (sortMode === "custom") custom.push(p.id);
  document.getElementById("atext").value = "";
  showAdd(false); render();
  toast(`${p.id} added`);
  document.getElementById(`card-${p.id}`)?.scrollIntoView({ block: "center" });
});

/* ================================================================
   Reviewer panel: rules, sources and the outcome-language test
   ================================================================ */
(function buildReview(){
  const banned = /\b(grant\w*|deny|denied|denial of the order|should|recommend\w*)\b/i;
  const allText = items.flatMap(({ t }) => [...t.pReasons, ...t.gaps, ...t.notes].map(r => r.text).concat(t.cReasons));
  const fails = allText.filter(s => banned.test(s));
  const row = (a, b, c) => `<tr><td>${a}</td><td>${b}</td><td>${c}</td></tr>`;
  document.getElementById("reviewBody").innerHTML = `
    <p>Rules decide; no model writes or scores anything. The summary is assembled from the petitioner’s own sentences: for each incident, the date, the place, and the sentence describing what was done.</p>
    <h3>Outcome-language test</h3>
    <p>${fails.length ? `<span class="failbadge">${fails.length} of ${allText.length} labels fail</span>` : `<span class="passbadge">All ${allText.length} labels pass</span>`} No label may suggest granting or denying, or say what the reviewer “should” do. AI should never be the final arbiter of a court decision, and risk prediction is a high-risk use that needs a human making the decision (${srcLinks("NC")}).</p>
    <h3>Priority</h3>
    <div class="tablewrap"><table><thead><tr><th>Level</th><th>Set when the petition text mentions</th><th>Source</th></tr></thead><tbody>
      ${row("Urgent", "A weapon used or threatened, a threat to kill, or fear of being killed (Lethality Screen questions 1 to 3); or four or more of the Lethality Screen’s other risk factors", srcLinks("LAP"))}
      ${row("Elevated", "Any other Lethality Screen or Danger Assessment risk factor, or any physical violence, dated or not", srcLinks("LAP,DA,A"))}
      ${row("Standard", "None of the above found in the text", "")}
    </tbody></table></div>
    <h3>Danger indicators</h3>
    <div class="tablewrap"><table><thead><tr><th>Indicator</th><th>Effect</th><th>Source</th></tr></thead><tbody>
      ${INDICATORS.map(i => row(esc(i.label), i.tier === "trigger" ? "Urgent on its own" : i.lap ? "Counts toward the four-factor rule; Elevated" : "Elevated", srcLinks(i.src))).join("")}
    </tbody></table></div>
    <p>Prior non-fatal strangulation was linked to about 7.5 times higher odds of homicide (OR 7.48) in ${srcLinks("GL")}. The Lethality Screen itself notes that most people who screen as high danger would not be expected to be killed, and a petition with no indicators is not a safe petition: the text only shows what the petitioner chose to write.</p>
    <h3>Complexity</h3>
    <p>Points for: more than 150 words (2 for more than 400), four or more incidents, more than one filing basis, secondhand accounts (affidavits and witnesses), children mentioned, and two or more possible gaps. 0 to 1 is Low, 2 to 3 Medium, 4 or more High. This is a team assumption to test with clerks (${srcLinks("A")}).</p>
    <h3>Suggested order</h3>
    <p>Priority first. Within the same priority, ex parte requests come first, because the court can issue those immediately without notice or a hearing, while harassment-only petitions need notice and a hearing within 30 days (${srcLinks("IC")}). Then simpler petitions, so more people get a decision sooner, then the oldest filing. Reviewers can switch to oldest first or reorder by hand at any time.</p>
    <h3>Known limits</h3>
    <ul>
      <li>Keyword rules miss indicators written in other words, and can match negations (“he never had a gun”). The highlighted phrases show what was matched so the reviewer can check it.</li>
      <li>Incident splitting and dates come from the same pattern-based extractor as the petitioner tool, so the same mistakes carry over.</li>
      <li>Priority is about reading order only. It is not a risk assessment and does not replace the reviewer’s reading of the petition.</li>
      <li>Not validated on real petitions. Labels would need checking for bias across groups before any pilot (${srcLinks("NC")}).</li>
    </ul>
    <h3>Sources</h3>
    <ul>${Object.entries(TRIAGE_SOURCES).map(([k, s]) => `<li>${k}. ${s.url ? `<a href="${s.url}" target="_blank" rel="noopener">${esc(s.title)}</a>` : esc(s.title)}</li>`).join("")}</ul>`;
})();

render();
// Keep "waiting" times current without re-rendering open cards
setInterval(() => document.querySelectorAll(".wait").forEach(s => { s.textContent = fmtWait(+s.dataset.t); }), 60000);
