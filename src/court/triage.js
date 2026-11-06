/* ================================================================
   Court-side triage: pure functions, no DOM.
   Rules decide. Each label carries the phrases that triggered it and a
   source code, so a reviewer can see exactly why a petition sits where
   it does. Nothing here decides or recommends an outcome.
   ================================================================ */
import { extractIncidents } from "../extract.js";

export const TRIAGE_SOURCES = {
  LAP: { short: "Lethality Screen (LAP)", title: "Maryland Network Against Domestic Violence, Domestic Violence Lethality Screen for First Responders (2005)", url: "https://www.tdcaa.com/wp-content/uploads/DV-Lethality-Screen-for-First-Responders.pdf" },
  DA:  { short: "Danger Assessment", title: "Campbell, Danger Assessment (2003); Campbell et al., Risk Factors for Femicide in Abusive Relationships, Am J Public Health 93(7), 2003", url: "https://www.dangerassessment.org/uploads/pdf/DAEnglish2010.pdf" },
  GL:  { short: "Glass et al. 2008", title: "Glass et al., Non-fatal strangulation is an important risk factor for homicide of women, J Emerg Med 35(3), 2008", url: "https://pubmed.ncbi.nlm.nih.gov/17961956/" },
  IC:  { short: "Ind. Code 34-26-5-9", title: "Indiana Code 34-26-5-9 (ex parte orders; harassment requires notice and hearing within 30 days)", url: "https://codes.findlaw.com/in/title-34-civil-law-and-procedure/in-code-sect-34-26-5-9/" },
  NC:  { short: "NCSC/TRI AI principles", title: "TRI/NCSC AI Policy Consortium, Principles and Practices for Using AI Responsibly and Effectively in Courts (2025)", url: "https://www.ali.org/sites/default/files/2025-11/NCSC-TRI-Consortium-Principles-and-Practices-for-AI-in-State-Courts.pdf" },
  S1:  { short: "Court instructions for the petition", title: "Indiana Office of Court Services, Instructions for Petition for Order of Protection (OJA-PO-0102)", url: "https://www.in.gov/courts/iocs/files/center-bb-po-form-po-0102.pdf" },
  A:   { short: "Team assumption, to be tested", title: "Team 10 assumption, to be validated with court staff", url: null }
};

/* Danger indicators. tier "trigger" = LAP questions 1 to 3, where a single
   yes is treated as high danger. tier "factor" = other LAP or Danger
   Assessment risk factors; four or more LAP factors also count as high danger. */
export const INDICATORS = [
  { id:"weaponUse", tier:"trigger", lap:true, src:"LAP", label:"Weapon used or threatened",
    rx:/\b(?:pointed|aimed|waved|held|pulled|showed|swung|came at me with|threatened (?:me |us )?with)\s+(?:a |his |her |their |the |my )?(?:loaded )?(?:gun|pistol|handgun|rifle|shotgun|firearm|knife|blade|machete|weapon|bat)\b|\b(?:gun|pistol|knife|blade)\s+(?:to|at|against)\s+(?:my|me|our)\b|\b(?:shot at|stabbed|cut me)\b/i },
  { id:"threatKill", tier:"trigger", lap:true, src:"LAP", label:"Threat to kill, or fear of being killed",
    rx:/\b(?:kill|murder)\s+(?:me|you|us|her|them|my\b|the kids|the children|our)|\b(?:you(?:'|’)?re|you are|you(?:'|’)?ll be|you will be|i(?:'|’)?ll be|i will be|i am|i(?:'|’)?m)\s+(?:going to be |gonna be )?dead\b|\b(?:afraid|scared|terrified|fear|think|believe)\b[^.]{0,30}\b(?:kill|murder)\b/i },
  { id:"gunAccess", tier:"factor", lap:true, src:"LAP", label:"Has or can get a gun",
    rx:/\b(?:has|owns|keeps|bought|carries|got|have)\s+(?:a |several |two |many |multiple )?(?:guns?|firearms?|rifles?|pistols?|handguns?|shotguns?)\b|\bhis guns?\b|\bher guns?\b|\bgun in (?:his|her|the) (?:truck|car|house|nightstand)\b/i },
  { id:"strangulation", tier:"factor", lap:true, src:"LAP,GL", label:"Choking or strangulation",
    rx:/\b(?:chok\w*|strangl\w*|suffocat\w*|smother\w*)\b|\bhands? (?:around|on) my (?:neck|throat)\b|\b(?:couldn(?:'|’)?t|could not|can(?:'|’)?t) breathe\b/i },
  { id:"control", tier:"factor", lap:true, src:"LAP", label:"Jealousy or control of daily activities",
    rx:/\b(?:jealous\w*|controlling|controls (?:my|all|everything|where)|won(?:'|’)?t let me|doesn(?:'|’)?t let me|took my (?:phone|keys|car|money|paycheck)|checks my phone|isolat\w*)\b/i },
  { id:"separation", tier:"factor", lap:true, src:"LAP", label:"Recent separation",
    rx:/\b(?:left him|left her|broke up|separated|divorc\w*|moved out|split up|ended (?:the|our) relationship)\b/i },
  { id:"unemployed", tier:"factor", lap:true, src:"LAP", label:"Respondent unemployed",
    rx:/\b(?:unemployed|lost (?:his|her|their) job|out of work|got fired|was fired)\b/i },
  { id:"suicide", tier:"factor", lap:true, src:"LAP", label:"Respondent threatened or attempted suicide",
    rx:/\bsuicid\w*|\b(?:kill|hurt|shoot)\s+(?:himself|herself|themself|themselves)\b/i },
  { id:"stepchild", tier:"factor", lap:true, src:"LAP", label:"Child not the respondent's",
    rx:/\bnot (?:his|her|their) (?:child|son|daughter|kid|baby)\b|\b(?:my|her) (?:son|daughter|child|kids?) from (?:a |my |her )?(?:previous|prior|another|past)\b/i },
  { id:"stalking", tier:"factor", lap:true, src:"LAP", label:"Follows, spies, or sends threats",
    rx:/\b(?:follow(?:ed|s|ing)|spy\w*|spied|track(?:ed|ing|er)|gps|watch(?:ed|ing) (?:me|my|the house)|show(?:ed|s)? up|waiting (?:for me|outside)|threatening (?:texts?|messages?|voicemails?|notes?|calls?))\b/i },
  { id:"forcedSex", tier:"factor", lap:false, src:"DA", label:"Forced sex",
    rx:/\b(?:raped?|forced (?:me )?(?:to have )?sex|sexual(?:ly)? assault\w*|forced himself|forced herself)\b/i },
  { id:"escalation", tier:"factor", lap:false, src:"DA", label:"Violence getting worse or more frequent",
    rx:/\b(?:getting worse|worse and worse|escalat\w*|more often|more violent|more and more)\b/i },
  { id:"pregnancy", tier:"factor", lap:false, src:"DA", label:"Petitioner pregnant",
    rx:/\bpregnan\w*/i },
  { id:"property", tier:"factor", lap:false, src:"DA", label:"Property destroyed",
    rx:/\b(?:smash\w*|destroy\w*|slash(?:ed|ing)|broke (?:my|the|our|two|three|a|all)\b[^.]{0,20}\b(?:windows?|doors?|phone|car|mirror|tv|furniture))\b/i },
  { id:"substance", tier:"factor", lap:false, src:"DA", label:"Drug or alcohol use",
    rx:/\b(?:drunk|drinking|high on|meth|cocaine|heroin|fentanyl|using drugs)\b/i }
];

const PHYSICAL = /\b(?:push\w*|shov\w*|grab\w*|hit|hitting|punch\w*|slap\w*|kick\w*|chok\w*|strangl\w*|bit|bite|threw|drag\w*|pinn(?:ed|ing)|restrain\w*|beat|burn(?:ed|t)|stab\w*|shot|raped?)\b/i;
const CHILDREN = /\b(?:kids?|children|child|son|daughter|baby|custody|parenting time)\b/i;

export const BASIS_LABEL = { dv:"Domestic or family violence", stalking:"Stalking", harassment:"Harassment", sex:"Sex offense" };
export const REL_LABEL = {
  spouse:"Current or former spouse", dating:"Dating, now or before", sexual:"Sexual relationship",
  blood:"Related by blood or adoption", marriage:"Related by marriage", legal:"Legal guardian or custodian",
  child:"Child in common", none:"Not a family or household member", "":"Relationship not given"
};
export const PRIORITY = { 3:"Urgent", 2:"Elevated", 1:"Standard" };
export const COMPLEXITY = { 3:"High", 2:"Medium", 1:"Low" };

/* ---------- dates ---------- */
const MONTHS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
const DAY_MS = 864e5;
export function incidentDate(phrase, filedAt){
  if (!phrase) return null;
  const p = phrase.toLowerCase().replace(/^on\s+/, "");
  let m = p.match(/^([a-z]{3})[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(\d{4}))?/);
  if (m && MONTHS.includes(m[1])){
    const y = m[3] ? +m[3] : filedAt.getFullYear();
    let d = new Date(y, MONTHS.indexOf(m[1]), +m[2]);
    if (!m[3] && d > filedAt) d = new Date(y - 1, MONTHS.indexOf(m[1]), +m[2]);
    return d;
  }
  m = p.match(/^(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?$/);
  if (m){ const y = m[3] ? (m[3].length === 2 ? 2000 + +m[3] : +m[3]) : filedAt.getFullYear(); return new Date(y, +m[1] - 1, +m[2]); }
  m = p.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  const back = n => new Date(filedAt.getTime() - n * DAY_MS);
  if (/^(today|tonight|this (morning|afternoon|evening))$/.test(p)) return back(0);
  if (/^(yesterday|last night)$/.test(p)) return back(1);
  if (/^(last week|this week|over the weekend|this past weekend|last weekend)$/.test(p)) return back(6);
  m = p.match(/^(\d+|a|one|two|three|four|five|six|a few|a couple of|several) (day|week|month)s? ago$/);
  if (m){
    const n = { a:1, one:1, two:2, three:3, four:4, five:5, six:6, "a few":3, "a couple of":2, several:4 }[m[1]] ?? +m[1];
    return back(n * { day:1, week:7, month:30 }[m[2]]);
  }
  return null;
}
const fmtDate = d => d.toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });

/* ---------- summary ---------- */
function shorten(s, n = 170){ return s.length <= n ? s : s.slice(0, s.lastIndexOf(" ", n)) + "..."; }
function whatSentence(inc){
  return inc.sentences.find(s => PHYSICAL.test(s)) || inc.sentences.find(s => s.length > 25) || inc.sentences[0];
}

/* ---------- main entry ---------- */
export function triage(p){
  const filedAt = new Date(p.filedAt);
  const { incidents } = extractIncidents(p.text);
  const words = (p.text.trim().match(/\S+/g) || []).length;

  // Danger indicators, with the matched phrase for highlighting
  const textNoSuicide = p.text.replace(INDICATORS.find(i => i.id === "suicide").rx, " ");
  const found = [];
  for (const ind of INDICATORS){
    const m = (ind.id === "threatKill" ? textNoSuicide : p.text).match(ind.rx);
    if (m) found.push({ ...ind, phrase: m[0] });
  }
  const triggers = found.filter(f => f.tier === "trigger");
  const lapFactors = found.filter(f => f.tier === "factor" && f.lap);
  const otherFactors = found.filter(f => f.tier === "factor");

  // Incident dates and recency
  const dated = incidents.map((inc, i) => ({ inc, n: i + 1, date: incidentDate(inc.timePhrase, filedAt) }));
  const withDates = dated.filter(d => d.date).sort((a, b) => a.date - b.date);
  const latest = withDates[withDates.length - 1] || null;
  const daysSinceLatest = latest ? Math.round((filedAt - latest.date) / DAY_MS) : null;
  const recentPhysical = dated.some(d => d.date && (filedAt - d.date) / DAY_MS <= 14 && d.inc.sentences.some(s => PHYSICAL.test(s)));

  // Priority
  const pReasons = [];
  let priority = 1;
  if (triggers.length){
    priority = 3;
    triggers.forEach(t => pReasons.push({ text:`${t.label}: “${t.phrase}”`, src:t.src }));
  }
  if (lapFactors.length >= 4){
    priority = 3;
    pReasons.push({ text:`${lapFactors.length} Lethality Assessment risk factors mentioned (four or more is treated as high danger)`, src:"LAP" });
  }
  // Any physical violence counts, dated or not, so a vaguely written petition
  // is not pushed down the queue for being vague.
  const anyPhysical = incidents.some(i => i.sentences.some(s => PHYSICAL.test(s)));
  if (priority < 3 && (otherFactors.length || anyPhysical)) priority = 2;
  otherFactors.filter(f => !triggers.includes(f)).forEach(f => pReasons.push({ text:`${f.label}: “${f.phrase}”`, src:f.src }));
  if (recentPhysical) pReasons.push({ text:"Physical violence described, within 14 days of filing", src:"A" });
  else if (anyPhysical) pReasons.push({ text:"Physical violence described", src:"A" });
  if (!pReasons.length) pReasons.push({ text:"No danger indicators found in the text", src:"LAP" });

  // Gaps (same published denial reasons the petitioner tool checks)
  const gaps = [];
  const bases = p.bases || [];
  if (!bases.length) gaps.push({ text:"No filing basis selected", src:"S1" });
  if (bases.includes("dv") && p.relationship === "none") gaps.push({ text:"Domestic violence basis, but relationship is not a family or household member", src:"S1" });
  if (bases.includes("stalking") && incidents.length < 2) gaps.push({ text:`Stalking basis, ${incidents.length} incident${incidents.length === 1 ? "" : "s"} found (two or more required)`, src:"S1" });
  dated.forEach(({ inc, n }) => {
    const miss = [];
    if (inc.timeLevel < 2) miss.push("date");
    if (!inc.place) miss.push("place");
    if (!inc.hasAct) miss.push("specific acts");
    if (miss.length) gaps.push({ text:`Incident ${n}: no ${miss.join(" or ")}`, src:"S1" });
    if (inc.secondhand) gaps.push({ text:`Incident ${n}: secondhand account (“${inc.secondhand}”), affidavit needed`, src:"S1" });
  });
  const notes = [];
  if (bases.length === 1 && bases[0] === "harassment") notes.push({ text:"Harassment only: notice and a hearing are required before any order", src:"S1" });
  if (p.exParte) notes.push({ text:"Ex parte order requested (without notice to the respondent)", src:"IC" });
  if (!p.dobKnown) notes.push({ text:"Respondent date of birth or SSN not given: order can't enter the national registry", src:"S1" });

  // Complexity
  const cReasons = [];
  let c = 0;
  if (words > 400){ c += 2; cReasons.push(`${words} words`); }
  else if (words > 150){ c += 1; cReasons.push(`${words} words`); }
  if (incidents.length >= 4){ c += 1; cReasons.push(`${incidents.length} incidents`); }
  if (bases.length > 1){ c += 1; cReasons.push(`${bases.length} filing bases`); }
  if (incidents.some(i => i.secondhand)){ c += 1; cReasons.push("secondhand accounts"); }
  const childMatch = p.text.match(CHILDREN);
  if (childMatch){ c += 1; cReasons.push(`children mentioned (“${childMatch[0]}”)`); }
  if (gaps.length >= 2){ c += 1; cReasons.push(`${gaps.length} possible gaps to check`); }
  const complexity = c >= 4 ? 3 : c >= 2 ? 2 : 1;
  if (!cReasons.length) cReasons.push("short, single-issue petition");

  // Extractive summary: built only from the petitioner's own words
  const range = withDates.length > 1 ? `, ${fmtDate(withDates[0].date)} to ${fmtDate(latest.date)}` : latest ? `, ${fmtDate(latest.date)}` : "";
  const headline = `${REL_LABEL[p.relationship ?? ""]}. ${incidents.length} incident${incidents.length === 1 ? "" : "s"}${range}.`;
  const lines = dated.map(({ inc, n, date }) => ({
    n,
    when: date ? fmtDate(date) : inc.timePhrase ? `“${inc.timePhrase}”` : "No date",
    where: inc.place || "No place",
    what: shorten(whatSentence(inc)),
    latest: latest && latest.n === n
  }));

  return {
    id: p.id, filedAt, words, readMin: Math.max(1, Math.round(words / 200)),
    priority, pReasons, complexity, cReasons, gaps, notes,
    indicators: found, headline, lines, daysSinceLatest,
    highlights: [...found.map(f => f.phrase), ...incidents.flatMap(i => i.highlights)]
  };
}

/* Default reading order: priority first, then ex parte requests, then
   simpler petitions (more people get a decision sooner), then oldest. */
export function suggestedCompare(a, b){
  return b.t.priority - a.t.priority
    || (b.p.exParte ? 1 : 0) - (a.p.exParte ? 1 : 0)
    || a.t.complexity - b.t.complexity
    || a.t.filedAt - b.t.filedAt;
}
