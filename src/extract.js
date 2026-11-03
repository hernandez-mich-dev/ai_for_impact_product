/* ================================================================
   Step 2 of the pipeline: extraction.
   In this prototype extraction is rule-based pattern matching, run in
   the browser. A language-model extractor can replace extractIncidents()
   later: it only has to return the same incident shape.
   ================================================================ */
const MONTH = "(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sept?(?:ember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)";
const DAY = "(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)";
export const RX = {
  specific: new RegExp(`\\b${MONTH}\\.?\\s+\\d{1,2}(?:st|nd|rd|th)?(?:,?\\s+\\d{4})?\\b|\\b(?:0?[1-9]|1[0-2])[/-](?:0?[1-9]|[12]\\d|3[01])(?:[/-]\\d{2,4})?\\b|\\b\\d{4}-\\d{2}-\\d{2}\\b|\\b(?:on\\s+)?the\\s+\\d{1,2}(?:st|nd|rd|th)\\b`, "i"),
  approx: new RegExp(`\\b(?:yesterday|today|tonight|this (?:morning|afternoon|evening|week|past weekend)|last (?:night|week|weekend|month|year|${DAY})|(?:on )?${DAY}s?|(?:\\d+|a|one|two|three|four|five|six|a few|a couple of|several) (?:days?|weeks?|months?) ago|in (?:early |mid-|late )?${MONTH}|over the weekend|(?:on )?(?:christmas|thanksgiving|new year’?'?s|easter|halloween|my birthday)|the (?:day|night|week) (?:before|after))\\b`, "i"),
  vague: /\b(?:for (?:the (?:past|last) )?(?:a few |several |many )?(?:days|weeks|months|years)|for (?:a while|a long time|ages)|recently|lately|a while (?:ago|back)|sometimes|all the time|constantly|always|ever since|over and over|24\/7|every (?:day|night|week)|since (?:we|i) broke up)\b/i,
  act: /\b(?:push(?:ed|ing)?|shov\w*|grab\w*|hit|hitting|punch\w*|slap\w*|kick\w*|chok\w*|strangl\w*|bit|bite|biting|threw|throw\w*|spit|spat|shot|shoot\w*|stab\w*|burn(?:ed|t)|raped?|sexually|touch(?:ed|ing)|follow(?:ed|ing|s)?|show(?:ed|s)? up|came (?:to|by|over|into|after)|come (?:to|by|over)|went to|wait(?:ed|ing)|drove (?:by|past)|parked|broke (?:into|in|my|the|down)|smash\w*|damag\w*|destroy\w*|took|stole|text(?:ed|s)? me|sent|call(?:ed|s|ing)? me|left (?:a|me|voicemails?)|post(?:ed|ing)|threaten\w*|said (?:he|she|they)(?:'d|’d| would| will| was going to| is going to)|told me (?:he|she|they)|yell\w*|scream\w*|blocked|locked|track(?:ed|ing)|watch(?:ed|ing) me|knock\w*|bang\w*|pound\w*|entered|refused to leave|pinn(?:ed|ing)|restrain\w*|dragg\w*|pull(?:ed|ing)|forced|tried to|kill|hurt|injur\w*|bruis\w*|gun|knife|weapon)\b/i,
  vagueWord: /\b(?:harass\w*|abus\w*|bother\w*|bully\w*|bullied|stalk\w*|terroriz\w*|intimidat\w*|mess(?:ing|ed)? with|scar(?:e|es|ing|ed) me|creep\w*|toxic|crazy|psycho|mean to me|controlling|manipulat\w*)\b/i,
  secondhand: [
    /\b(?:my|a|her|his|the|our|their)\s+(?:co-?workers?|friends?|neighbou?rs?|sister|brother|mom|mother|dad|father|boss|manager|supervisor|roommate|cousin|aunt|uncle|daughter|son|kids?|child|children|security(?: guard)?|guard|receptionist|family|grandma|grandmother|grandpa|grandfather|landlord|teacher)\s+(?:[\w’']+\s+){0,3}?(?:told|said|says|mentioned|saw|noticed|heard|let me know|informed|warned)\b/i,
    /\b(?:someone|somebody|people|everyone|they|she)\s+(?:told me|said that|saw him|saw her|saw them)\b/i,
    /\b(?:i (?:was|got) told|i heard (?:that|from|he|she|they)|according to|apparently|i found out (?:from|that)|word is|rumou?r)\b/i
  ],
  repeated: /\b(?:twice|two times|three times|several times|multiple times|many times|a few times|a couple (?:of )?times|\d+ times|every (?:day|night|week)|daily)\b/i,
  medium: /\b(?:by |over |via |through |on )?(?:text(?:s|ed)?(?: messages?)?|messag(?:es?|ed)|call(?:ed|s)?|phone|voicemails?|e-?mails?|e-?mailed|facebook|instagram|snapchat|tiktok|twitter|social media|dms?|whatsapp|online|letters?)\b/i,
  placeNoun: /\b(?:at|in|outside(?: of)?|near|into|inside|behind|in front of|to|from|across from|around|by)\s+(?:the|my|his|her|our|their|a|an|your)?\s*(?:[\w’'-]+\s+){0,2}?(?:home|house|apartment|apt|place|work|workplace|job|office|hospital|clinic|school|parking lot|parking garage|garage|lot|store|shop|mall|restaurant|bar|church|gym|park|street|road|yard|driveway|porch|door|car|truck|bus|station|hotel|daycare|bedroom|kitchen|room|building|lobby|campus|walmart|target|kroger|meijer)\b/i,
  address: /\b\d{1,6}\s+(?:[A-Z][a-z]+\s+){1,3}(?:St|Street|Ave|Avenue|Rd|Road|Dr|Drive|Blvd|Boulevard|Ln|Lane|Way|Ct|Court|Pl|Place|Pkwy|Hwy)\b\.?/,
  properPlace: /\b(?:at|in)\s+([A-Z][a-zA-Z’'&]+(?:\s+[A-Z][a-zA-Z’'&]+)*)/g,
  continuation: /^(?:and|then|after(?:wards)?|when|while|so|because|later that|during|he (?:also|then|kept|continued)|she (?:also|then|kept|continued)|they (?:also|then)|that|this|it)\b/i,
  newEvent: /^(?:another|the next|on another|a (?:few|couple of) (?:days|weeks)|also|later|the (?:first|second|third|last) time|one (?:time|day|night))\b/i
};
const NOT_PLACES = new RegExp(`^(?:${MONTH}|${DAY}|I|He|She|They|The|My|His|Her)$`, "i");

function splitSentences(p){
  const prot = p
    .replace(/\b(Mr|Mrs|Ms|Dr|St|Ave|Rd|Jr|Sr|Apt|No|approx|vs|etc)\./gi, "$1§")
    .replace(/\b([ap])\.m\./gi, "$1§m§");
  const parts = prot.match(/[^.!?]+[.!?]+["”’)]*|[^.!?]+$/g) || [];
  return parts.map(s => s.replace(/§/g, ".").trim()).filter(Boolean);
}

function findPlace(s){
  let m = s.match(RX.address); if (m) return m[0].trim();
  m = s.match(RX.placeNoun); if (m) return m[0].trim();
  RX.properPlace.lastIndex = 0;
  let pm;
  while ((pm = RX.properPlace.exec(s))){
    const first = pm[1].split(/\s+/)[0];
    if (!NOT_PLACES.test(first)) return pm[0].trim();
  }
  m = s.match(RX.medium); if (m) return m[0].trim();
  return "";
}

function analyzeSentence(s){
  let timeLevel = 0, timePhrase = "";
  let m;
  if ((m = s.match(RX.specific))) { timeLevel = 3; timePhrase = m[0]; }
  else if ((m = s.match(RX.approx))) { timeLevel = 2; timePhrase = m[0]; }
  else if ((m = s.match(RX.vague))) { timeLevel = 1; timePhrase = m[0]; }
  const vagueMatch = s.match(RX.vagueWord);
  let secondhand = "";
  for (const r of RX.secondhand){ const sm = s.match(r); if (sm){ secondhand = sm[0]; break; } }
  const rep = s.match(RX.repeated);
  const act = s.match(RX.act);
  // A vague time phrase ("for months") is worth highlighting even when a date is also present
  const vagueTime = s.match(RX.vague);
  return {
    timeLevel, timePhrase,
    place: findPlace(s),
    hasAct: !!act,
    vagueWord: vagueMatch ? vagueMatch[0] : "",
    vagueTime: vagueTime ? vagueTime[0] : "",
    secondhand,
    repeated: rep ? rep[0] : ""
  };
}

function newIncident(){ return { sentences:[], timeLevel:0, timePhrase:"", place:"", hasAct:false, vagueWords:[], secondhand:"", repeated:"", highlights:[] }; }
function addTo(inc, s, f){
  inc.sentences.push(s);
  if (f.timeLevel > inc.timeLevel){ inc.timeLevel = f.timeLevel; inc.timePhrase = f.timePhrase; }
  if (!inc.place && f.place) inc.place = f.place;
  if (f.hasAct) inc.hasAct = true;
  if (f.vagueWord && !inc.vagueWords.includes(f.vagueWord.toLowerCase())) inc.vagueWords.push(f.vagueWord.toLowerCase());
  if (!inc.secondhand && f.secondhand) inc.secondhand = f.secondhand;
  if (!inc.repeated && f.repeated) inc.repeated = f.repeated;
  [f.vagueWord, f.secondhand, f.repeated, f.vagueTime].forEach(h => { if (h) inc.highlights.push(h); });
}

export function extractIncidents(text){
  const paras = text.replace(/\r/g, "")
    .split(/\n\s*\n+|\n(?=\s*(?:[-•*]|\d+[.)])\s)/)
    .map(s => s.replace(/^\s*(?:[-•*]|\d+[.)])\s+/, "").replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
  const chunks = [];
  for (const p of paras){
    let cur = null;
    for (const s of splitSentences(p)){
      const f = analyzeSentence(s);
      if (!cur){ cur = newIncident(); chunks.push(cur); addTo(cur, s, f); continue; }
      const cont = RX.continuation.test(s);
      const differentDate = f.timeLevel >= 2 && cur.timeLevel >= 2 && f.timePhrase.toLowerCase() !== cur.timePhrase.toLowerCase();
      // A new act with a new place starts a new incident only when the current one has no date yet;
      // under a dated incident, a follow-up sentence ("He followed me to the door.") belongs to the same event.
      const newAct = f.hasAct && cur.hasAct && !cont && (f.timeLevel > 0 || RX.newEvent.test(s) || (f.place && cur.timeLevel < 2));
      if (differentDate || newAct){ cur = newIncident(); chunks.push(cur); }
      addTo(cur, s, f);
    }
  }
  // Chunks with no act, no general allegation words and no secondhand account are background, not incidents.
  const incidents = [], background = [];
  for (const c of chunks){
    c.text = c.sentences.join(" ");
    if (c.hasAct || c.vagueWords.length || c.secondhand) incidents.push(c); else background.push(c);
  }
  return { incidents, background };
}
