import { MESSAGES } from "./content.js";
import { extractIncidents } from "./extract.js";

/* ================================================================
   Step 4: deterministic rule checks.
   No DOM access here. evaluate() takes a plain form object:
   { bases: Set<"dv"|"stalking"|"harassment"|"sex">, relationship, dob, ssn, draft }
   ================================================================ */
export function incidentFlags(inc, n){
  const f = [];
  if (inc.timeLevel === 0) f.push(MESSAGES.noTime(n));
  else if (inc.timeLevel === 1) f.push(MESSAGES.vagueTime(n, inc.timePhrase));
  else if (inc.timeLevel === 2) f.push(MESSAGES.approxTime(n, inc.timePhrase));
  if (!inc.place) f.push(MESSAGES.noPlace(n));
  if (!inc.hasAct && inc.vagueWords.length) f.push(MESSAGES.vagueActsOnly(n, inc.vagueWords[0]));
  else if (!inc.hasAct) f.push(MESSAGES.noActs(n));
  else if (inc.vagueWords.length) f.push(MESSAGES.vagueWords(n, inc.vagueWords[0]));
  if (inc.secondhand) f.push(MESSAGES.secondhand(n));
  if (inc.repeated) f.push(MESSAGES.repeated(n, inc.repeated));
  if (!f.length) f.push(MESSAGES.incidentOk(n));
  return f;
}

export function evaluate(form){
  const { incidents, background } = extractIncidents(form.draft);
  const petition = [], respondent = [];
  if (!form.bases.size) petition.push(MESSAGES.noBasis());
  if (form.bases.has("dv")){
    if (!form.relationship) petition.push(MESSAGES.relMissing());
    else if (form.relationship === "none") petition.push(MESSAGES.relNone());
    else petition.push(MESSAGES.relOk());
  }
  if (form.bases.size === 1 && form.bases.has("harassment")) petition.push(MESSAGES.harassmentOnly());
  if (form.bases.has("stalking")){
    petition.push(incidents.length < 2 ? MESSAGES.stalkingFew(incidents.length) : MESSAGES.stalkingOk(incidents.length));
  }
  if (form.dob === "yes" || form.ssn === "yes") respondent.push(MESSAGES.respondentOk());
  else if (form.dob === "no" && form.ssn === "no") respondent.push(MESSAGES.respondentId());
  const perIncident = incidents.map((inc, i) => ({ inc, flags: incidentFlags(inc, i + 1) }));
  return { incidents, background, petition, respondent, perIncident };
}
