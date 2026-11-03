/* ================================================================
   Sources. Every message carries one or more of these codes, so each
   flag traces back to a published court document or the client session.
   ================================================================ */
export const SOURCES = {
  S1: { short: "Court instructions for the petition", title: "Indiana Office of Court Services, Instructions for Petition for Order of Protection (OJA-PO-0102, rev. 05/25)", url: "https://www.in.gov/courts/iocs/files/center-bb-po-form-po-0102.pdf" },
  S2: { short: "Client session with the court", title: "AI for Impact client session with Indiana OJA staff and Allen County magistrates, Oct 9, 2026", url: null },
  S5: { short: "Indiana E-filing User Guide", title: "Indiana Judicial Branch, E-filing User Guide (Sept 1, 2026)", url: "https://www.in.gov/courts/files/efiling-user-guide.pdf" },
  A:  { short: "Team assumption, to be tested", title: "Team 10 assumption: upload limit to be confirmed in walkthrough", url: null }
};

/* ================================================================
   Fixed, pre-reviewed messages. Rules choose a message; the text never
   changes at run time except for incident numbers and quoted phrases
   taken from the user's own draft.
   kind: gap = matches a published denial reason
         question = asks for a fact that may be missing
         info = good to know, not a denial reason
         ok = requirement appears to be met
   ================================================================ */
const TPD = "Petitions can be denied when allegations don’t describe the time, place, or acts.";
export const MESSAGES = {
  noBasis:         () => ({ kind:"gap", src:["S1"], text:"No filing basis is selected in step 1. The checker needs one to know which requirements apply." }),
  relMissing:      () => ({ kind:"question", src:["S1"], text:"Domestic or family violence is selected. Which relationship applies? Domestic violence orders cover family or household members, such as current or former partners." }),
  relNone:         () => ({ kind:"gap", src:["S1"], text:"Domestic violence orders cover family or household members, such as current or former partners. The relationship described isn’t one of those listed." }),
  relOk:           () => ({ kind:"ok", src:["S1"], text:"The relationship selected is one that domestic violence orders cover." }),
  harassmentOnly:  () => ({ kind:"info", src:["S1"], text:"Petitions based only on harassment require notice to the respondent and a hearing within 30 days before any order is issued." }),
  stalkingFew:     (n) => ({ kind:"gap", src:["S1","S2"], text:`Stalking requires two or more incidents. Your petition describes ${n === 0 ? "none yet" : "one"}. Is there another incident you have not listed?` }),
  stalkingOk:      (n) => ({ kind:"ok", src:["S1"], text:`Stalking requires two or more incidents. The checker found ${n}.` }),
  respondentId:    () => ({ kind:"info", src:["S1"], text:"Without the respondent’s date of birth or Social Security number, the order can’t be entered into the national registry. It will still be in the Indiana registry." }),
  respondentOk:    () => ({ kind:"ok", src:["S1"], text:"The respondent’s date of birth or Social Security number is known, so the order can be entered into the national registry." }),
  noTime:          (i) => ({ kind:"gap", src:["S1"], text:`Incident ${i} doesn’t say when it happened. ${TPD}` }),
  vagueTime:       (i,p) => ({ kind:"gap", src:["S1"], text:`Incident ${i} gives the time as “${p},” which doesn’t point to a specific date. ${TPD}` }),
  approxTime:      (i,p) => ({ kind:"question", src:["S1"], text:`Incident ${i} gives the time as “${p}.” Do you know the date?` }),
  noPlace:         (i) => ({ kind:"gap", src:["S1"], text:`Incident ${i} doesn’t say where it happened, or how (for example, by text or phone). ${TPD}` }),
  vagueActsOnly:   (i,w) => ({ kind:"gap", src:["S1"], text:`Incident ${i} uses general words like “${w}” without describing what the person did. ${TPD}` }),
  noActs:          (i) => ({ kind:"gap", src:["S1"], text:`Incident ${i} doesn’t describe what the person did. ${TPD}` }),
  vagueWords:      (i,w) => ({ kind:"question", src:["S1"], text:`Incident ${i} uses general words like “${w}.” Courts look for the acts themselves. What did the person say or do?` }),
  secondhand:      (i) => ({ kind:"gap", src:["S1"], text:`Part of incident ${i} describes something another person saw or told you. Accounts from other people need a sworn affidavit from that person, who must also attend any hearing.` }),
  repeated:        (i,p) => ({ kind:"question", src:["S1"], text:`Incident ${i} says this happened “${p}” but describes it as one event, so the checker counts it once. Did each time happen on a different date?` }),
  incidentOk:      (i) => ({ kind:"ok", src:["S1"], text:`Incident ${i} says when, where, and what was done, in your own account.` }),
  photoResizedGps: () => ({ kind:"ok", src:["A","S5"], text:"Resized to fit the size limit. Location data was found and removed." }),
  photoResized:    () => ({ kind:"ok", src:["A","S5"], text:"Resized to fit the size limit. No location data was found; other photo details were removed." }),
  photoGpsOnly:    () => ({ kind:"ok", src:["A","S5"], text:"Already under the size limit. Location data was found and removed." }),
  photoClean:      () => ({ kind:"ok", src:["A","S5"], text:"Already under the size limit. No location data was found; other photo details were removed." }),
  photoTooBig:     () => ({ kind:"info", src:["A"], text:"Still over the size limit at the smallest size that keeps text readable. Location data was removed." })
};
export const KIND_LABEL = { gap:"Possible gap", question:"Question", info:"Good to know", ok:"Looks complete" };
