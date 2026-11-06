/* ================================================================
   Rendering the report
   ================================================================ */
import { SOURCES, KIND_LABEL } from "./content.js";
import { esc, toast } from "./util.js";

export function highlight(text, phrases){
  let out = esc(text);
  const seen = new Set();
  for (const p of phrases){
    const k = p.toLowerCase(); if (seen.has(k)) continue; seen.add(k);
    const re = new RegExp(esc(p).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    out = out.replace(re, m => `<mark>${m}</mark>`);
  }
  return out;
}

function srcHtml(codes){
  return codes.map(c => {
    const s = SOURCES[c];
    return s.url ? `<a href="${s.url}" target="_blank" rel="noopener" title="${esc(s.title)}">${esc(s.short)}</a>` : `<span title="${esc(s.title)}">${esc(s.short)}</span>`;
  }).join(", ");
}
function flagHtml(m){
  return `<li class="flag ${m.kind}"><span class="kind">${KIND_LABEL[m.kind]}</span><p>${esc(m.text)}</p><div class="src">Source: ${srcHtml(m.src)}</div></li>`;
}

function factCell(label, state, value){
  return `<div class="fact ${state}"><b>${label}</b><span class="v">${esc(value)}</span></div>`;
}
function incidentHtml(inc, flags, n){
  const when = inc.timeLevel === 3 ? factCell("When", "ok", inc.timePhrase)
    : inc.timeLevel === 2 ? factCell("When", "partial", `${inc.timePhrase} (approximate)`)
    : inc.timeLevel === 1 ? factCell("When", "missing", `“${inc.timePhrase}” only`)
    : factCell("When", "missing", "Not found");
  const where = inc.place ? factCell("Where or how", "ok", inc.place) : factCell("Where or how", "missing", "Not found");
  const what = inc.hasAct
    ? factCell("What was done", inc.vagueWords.length ? "partial" : "ok", inc.vagueWords.length ? "Partly described" : "Described")
    : factCell("What was done", "missing", inc.vagueWords.length ? "General words only" : "Not found");
  const whose = inc.secondhand ? factCell("Whose account", "missing", "Someone else’s") : factCell("Whose account", "ok", "Yours");
  return `<article class="inc"><h3>Incident ${n}</h3>
    <blockquote>${highlight(inc.text, inc.highlights)}</blockquote>
    <div class="facts">${when}${where}${what}${whose}</div>
    <ul class="flags">${flags.map(flagHtml).join("")}</ul></article>`;
}

let lastResult = null;
export function renderReport(form, r){
  const all = [...r.petition, ...r.respondent, ...r.perIncident.flatMap(x => x.flags)];
  const gaps = all.filter(m => m.kind === "gap").length;
  const qs = all.filter(m => m.kind === "question").length;
  const n = r.incidents.length;
  let summary = `The checker found ${n} incident${n === 1 ? "" : "s"}. `;
  if (!gaps && !qs) summary += "Nothing from the court’s published denial reasons stood out.";
  else summary += [gaps ? `${gaps} possible gap${gaps === 1 ? "" : "s"}` : "", qs ? `${qs} question${qs === 1 ? "" : "s"}` : ""].filter(Boolean).join(" and ") + " to look at.";

  let html = `<section class="report" tabindex="-1" id="reportCard"><h2>What the checker found</h2><p class="summary">${esc(summary)}</p>`;
  if (r.petition.length) html += `<h3 class="group-h">About the petition</h3><ul class="flags">${r.petition.map(flagHtml).join("")}</ul>`;
  if (r.respondent.length) html += `<h3 class="group-h">About the respondent</h3><ul class="flags">${r.respondent.map(flagHtml).join("")}</ul>`;
  if (r.perIncident.length){
    html += `<h3 class="group-h">Incident by incident</h3><p class="bg-note">Highlighted words are what the checker reacted to.</p>`;
    html += r.perIncident.map((x, i) => incidentHtml(x.inc, x.flags, i + 1)).join("");
  } else {
    html += `<h3 class="group-h">Incident by incident</h3><p class="bg-note">The checker didn’t find an incident in the draft: a description of something the respondent did. Paste the part of the draft that describes what happened, then check again.</p>`;
  }
  if (r.background.length){
    html += `<h3 class="group-h">Background</h3><p class="bg-note">These parts don’t describe something the respondent did, so they aren’t counted as incidents.</p>`;
    html += r.background.map(b => `<blockquote class="bg-note" style="margin:.5rem 0;padding-left:.85rem;border-left:3px solid var(--line)">${esc(b.text)}</blockquote>`).join("");
  }
  html += `<div class="report-foot">Edit your draft above and check again as often as you like.
    The checker reads dates and places by pattern, so it can miss things that are there or react to things that aren’t. It doesn’t judge whether a petition will be granted.
    <div class="row"><button class="btn ghost" type="button" id="copyBtn">Copy this report</button><button class="btn ghost" type="button" id="rerunBtn">Check again</button></div></div></section>`;
  const host = document.getElementById("report");
  host.innerHTML = html;
  lastResult = { form, r, summary };
  document.getElementById("copyBtn").addEventListener("click", copyReport);
  document.getElementById("rerunBtn").addEventListener("click", () => { document.getElementById("draft").focus(); });
  const card = document.getElementById("reportCard");
  card.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  card.focus({ preventScroll: true });
}

export function renderNothingToCheck(){
  document.getElementById("report").innerHTML = `<section class="report" tabindex="-1" id="reportCard"><h2>Nothing to check yet</h2><p class="summary">Paste the part of your draft that describes what happened into step 3, then choose Check my draft.</p></section>`;
}

export function clearReport(){
  document.getElementById("report").innerHTML = "";
  lastResult = null;
}

function reportText(){
  if (!lastResult) return "";
  const { r, summary } = lastResult;
  const line = m => `- [${KIND_LABEL[m.kind]}] ${m.text}`;
  const out = ["Petition check report", summary, ""];
  if (r.petition.length) out.push("About the petition", ...r.petition.map(line), "");
  if (r.respondent.length) out.push("About the respondent", ...r.respondent.map(line), "");
  r.perIncident.forEach((x, i) => out.push(`Incident ${i + 1}`, ...x.flags.map(line), ""));
  out.push("Legal information, not legal advice. Source: Indiana Instructions for Petition for Order of Protection (OJA-PO-0102).");
  return out.join("\n");
}
async function copyReport(){
  const t = reportText();
  try { await navigator.clipboard.writeText(t); toast("Report copied"); }
  catch {
    const ta = document.createElement("textarea"); ta.value = t; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); toast("Report copied"); } catch { toast("Copying isn’t available here"); }
    ta.remove();
  }
}
