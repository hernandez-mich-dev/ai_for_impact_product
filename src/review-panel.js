import { MESSAGES, SOURCES } from "./content.js";
import { esc } from "./util.js";

/* ================================================================
   Reviewer panel: rules, sources, and the "should" test (Section 7)
   ================================================================ */
export function buildReviewPanel(){
  const samples = Object.entries(MESSAGES).map(([k, fn]) => [k, fn(1, "example")]);
  const banned = /\b(you should|you need to|we recommend|i recommend|you ought to)\b/i;
  const fails = samples.filter(([, m]) => banned.test(m.text));
  const rules = [
    ["Filing basis", "No basis selected", "S1"],
    ["Relationship fit", "Domestic violence selected, relationship missing or not in the list", "S1"],
    ["Harassment only", "Harassment is the only basis", "S1"],
    ["Stalking incidents", "Stalking selected and fewer than two incidents found", "S1, S2"],
    ["Respondent details", "Neither date of birth nor Social Security number known", "S1"],
    ["Time", "Incident has no date, only an approximate one, or only a vague span such as “for months”", "S1"],
    ["Place", "Incident names no place and no medium such as text or phone", "S1"],
    ["Acts", "Incident has no act verb, or relies on general words such as “harassing”", "S1"],
    ["Secondhand accounts", "Narrative reports what another person saw or said (“my coworker said…”)", "S1"],
    ["Repeated events", "One incident says it happened “twice” or “several times”", "S1"],
    ["Evidence files", "Photo over the chosen size limit, or carrying GPS data", "A, S5"]
  ];
  document.getElementById("reviewBody").innerHTML = `
    <p>Rules decide; nothing generates the text the user sees. Each check picks one fixed message from a reviewed list and cites its source.</p>
    <h3>Advice test</h3>
    <p>${fails.length ? `<span class="failbadge">${fails.length} of ${samples.length} messages fail</span> ${fails.map(f => esc(f[0])).join(", ")}` : `<span class="passbadge">All ${samples.length} messages pass</span>`} None may contain “you should” or similar advice phrasing (the test from Janelle O’Malley, S2).</p>
    <h3>Checks</h3>
    <div class="tablewrap"><table><thead><tr><th>Check</th><th>Triggered when</th><th>Source</th></tr></thead><tbody>
    ${rules.map(r => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join("")}
    </tbody></table></div>
    <h3>What this prototype does differently from the proposal</h3>
    <ul>
      <li>Incident extraction is pattern matching in the browser, not a language model. It can be swapped for model extraction later without changing the rules, because both return the same incident shape.</li>
      <li>It reads pasted text only. PDF upload of a draft petition is not built yet.</li>
      <li>The photo size limit is a setting because the Protection Order E-filing Service limit is still unconfirmed (assumption A). The general e-filing limit is 50 MB per document (S5).</li>
      <li>The relationship list paraphrases Indiana’s family or household member definition. Wording to be checked against S1 and the court’s Legal Information vs. Legal Advice guide before any pilot.</li>
    </ul>
    <h3>Privacy</h3>
    <ul>
      <li>No storage: no cookies, local storage, or server calls with the draft. Closing the page erases everything.</li>
      <li>Safe exit clears the page before leaving. Pressing Esc twice does the same. Pressing Back afterwards opens a fresh, empty page; nothing from before is restored.</li>
    </ul>
    <h3>Sources</h3>
    <ul>${Object.entries(SOURCES).map(([k, s]) => `<li>${k}. ${s.url ? `<a href="${s.url}" target="_blank" rel="noopener">${esc(s.title)}</a>` : esc(s.title)}</li>`).join("")}</ul>`;
}
