# About the Indiana Protection Order Project (AI for Impact, Team 10)

Context file for an assistant that answers questions about this project. It is built from the repository (code, README, and `docs/Team10_Journey_Map_Service_Blueprint.pdf`) as of November 12, 2026.

## How to use this file

- Answer from what is written here. If something is not covered, say so instead of guessing.
- The project tags claims by evidence: **K = Known** (documented in a published source), **H = Heard** (said in the client session), **A = Assumed** (a team assumption still to be tested). Keep those distinctions when answering.
- Source codes (S1, S2, LAP, DA, and so on) are listed in the Sources section. Cite them when a question is about why a rule exists.
- Both prototypes give legal information, not legal advice. Never answer as if advising a real petitioner on what to claim, which basis to choose, or whether they will win.
- All example and sample petitions are fictional.
- If a question comes from someone in danger: call 911. National Domestic Violence Hotline: 1-800-799-7233, or text START to 88788.

## Project at a glance

| Item | Detail |
| ---- | ------ |
| Course | AI for Impact (CS 4535 / CS 6983), Fall 2026, Northeastern University |
| Team | Team 10: Yash Kava, Michael Hernandez, Prachi Bhavsar, Udit Sen, Leonardo Pivato, Vashistha Ravindra Pandya, Joythish Reddy Evuri |
| Client | Indiana Supreme Court, Office of Judicial Administration (OJA) |
| Case type | Civil protection orders (mainly domestic violence) under the Indiana Civil Protection Order Act, Ind. Code 34-26-5 |
| Product 1 (litigant side) | **Petition check**: a pre-submission checker for petitioners |
| Product 2 (court side) | **Petition triage**: a review queue for clerks and judges |
| Live site | https://petition-checker.vercel.app (petitioner tool) and https://petition-checker.vercel.app/court/ (court triage) |
| Repository | https://github.com/hernandez-mich-dev/ai_for_impact_product |
| Stack | Plain JavaScript (ES modules), HTML, CSS, built with Vite, hosted on Vercel. No backend, no database, no language model |

## Timeline

| Date (2026) | What happened |
| ----------- | ------------- |
| Oct 9 | Client session with Indiana OJA staff and two Allen County magistrates (source S2) |
| Oct 27 | Journey map, service blueprint and product proposal submitted (week lead: Yash Kava) |
| Oct 30 | First working prototype of Petition check, built as a single HTML file |
| Nov 3 | Prototype pushed to GitHub with the journey map PDF. Converted to a Vite project with a README (PR #1), deployed to Vercel |
| Nov 6 | Prototype Review. In class, the team was asked to also think of a court-facing product; Petition triage was built as an MVP at `/court/` (PR #2) and deployed |

## The problem

People asking Indiana courts for a protection order often submit petitions that lack the facts the law requires: one incident where stalking needs two, descriptions with no date or place, or events they only heard about from someone else. Judges then deny emergency (ex parte) orders that might otherwise have been granted, and the petitioner, who may still be in danger, has to start over.

Allen County prevents many of these denials with a dedicated protective order specialist who reviews petitions at the counter and follows up. Most counties have no such role, and people who e-file late at night from a phone never meet one.

**Why this problem (from the proposal):** the team compared four candidate problems. Incomplete or insufficient petitions had the strongest evidence: the court publishes the denial reasons itself (S1), and both magistrates described these denials as routine, including one issued the morning of the client session (S2). Oversized evidence files are a real friction point but the upload limit was not confirmed, so photo handling became a supporting feature. Missing respondent details were folded into the core check. Difficulty finding help in the first place matters but would be a different product.

**LASSO check:**

| Test | How the problem meets it |
| ---- | ------------------------ |
| Limited | One case type (protection orders), one moment (before submission), one failure (petition lacks legally required facts) |
| Actionable | The denial reasons are written down by the court (S1), so each can become a specific, testable check |
| Specific | Named checks: relationship fit, two-incident stalking rule, time/place/act detail, secondhand accounts, respondent identifiers |
| Supported | Raised unprompted by both magistrates and the Director of E-filing (S2); the court is already investing in a redesigned protection order e-filing site (S2, S9) |
| Owner | Indiana OJA, Office of Court Technology, which runs the Protection Order E-filing Service (S4, S8) |

**Scale and stakes:**
- Indiana trial courts received 75,256 new protective order and other petition filings in 2025 (S11, provisional data).
- Allen County alone handled about 4,200 protective orders last year (S2).
- An ex parte order can be granted the same day without notice to the respondent when a petition shows domestic or family violence (S1), so a denial caused by missing detail directly delays protection.
- Protection order proceedings carry no filing fee (S1). Cost is not the barrier; information is.

## Persona: Dana Morales (composite)

- 31, lives in Kokomo, Howard County, Indiana. The team assumes her county has no protective order specialist (to be verified).
- Dated the respondent for two years and broke up three months ago. Since then he has sent repeated threatening texts, shown up at her workplace twice, and last week grabbed her arm and shoved her in a parking lot.
- Works rotating shifts as a nursing assistant, uses her phone for everything, has 14 screenshots and photos as evidence, knows the respondent's name and address but not his exact date of birth.
- Goal: an order that keeps him away from her home and work, as quickly and quietly as possible.
- What goes wrong: her petition says "he has been harassing me for months and pushed me," gives no dates or places, and describes the workplace visits through what a coworker told her. The judge denies the ex parte order as too vague.

The two fictional demo drafts in Petition check ("Vague draft" and "Detailed draft") are Dana's petition before and after.

## Journey map summary (Dana files for a protection order)

Times are estimates, to be replaced with measured walkthrough times. Stages 7 and 10 are the problem the product fixes.

| Stage | What happens | Pain point | Tag |
| ----- | ------------ | ---------- | --- |
| 1. Trigger | Shoved in a parking lot; decides that night she needs protection | Acts late at night, alone, under stress | A |
| 2. Search | Searches "how to get a restraining order Indiana," reads a general AI chatbot answer | Indiana calls it an "order for protection." People use general AI tools about 100 to 1 over Indiana Legal Help | K: S1, H: S2 |
| 3. Find official path | Reaches courts.in.gov self-service page | Advocates recommended but unreachable tonight | K: S3, S4 |
| 4. Look for guided help | Tries Indiana Legal Help | No protection order guided interview there | K: S6 |
| 5. Start the petition | Opens the Protection Order E-filing Service on her phone | Long forms that mirror the statute | K: S7, H: S2 |
| 6. Respondent details | Leaves his date of birth blank | Without DOB or SSN the order can't enter the national registry (still valid in Indiana) | K: S1 |
| **7. Describe what happened (problem)** | Writes a vague, secondhand narrative with no dates or places | Nothing tells her vague and secondhand allegations are common denial reasons. A specialist would | K: S1, H: S2 |
| 8. Attach evidence | Uploads 14 full-size photos | Upload limit unconfirmed; photos may carry location data | A; K: S5 (general e-filing limit 50 MB per document) |
| 9. Submit and wait | Waits for an acceptance email | Told to call the clerk if none arrives in several days | K: S7 |
| **10. Judge review (problem)** | Ex parte order denied | Denied for lacking time, place and acts. Accepted by the clerk but denied on the merits, a distinction she doesn't understand | K: S1, H: S2 |
| 11. After denial | Must re-file or go to court in person; may give up | Delay while still at risk; repeat work for her and the court | A |

## Service blueprint summary

Lanes: physical evidence, petitioner actions, frontstage, backstage, support processes, across six stages (search and prepare, complete and submit, clerk review, judge review, order and service, registry and enforcement).

Key facts from the blueprint:
- The e-filing interface collects fields but does not review the narrative for required facts (H: S2).
- No staff review happens before submission for e-filers (A: confirm with Bob Rath).
- The clerk reviews the filing in the Odyssey File and Serve queue, accepts it and forwards it to the judge (K: S7, H: S2).
- The judge checks the petition against statutory definitions. In Allen County a specialist follows up on incomplete petitions and holds them 24 hours; most counties lack this role (H: S2, Magistrate Beaty).
- The sheriff serves the respondent in person, with no service fees (H: S2, K: S1).
- The Indiana Protection Order Registry transmits orders to IDACS and NCIC (K: S8).
- The Protection Order E-filing Service has been run by Court Technology since October 2019 (K: S8).

**Where Petition check sits:** between "complete and submit" and "clerk review," on the petitioner's side, filling the backstage gap for people who file without a specialist or advocate.

## Product 1: Petition check (petitioner side)

URL: `/` (https://petition-checker.vercel.app). A self-filer pastes the "what happened" part of their draft and gets a plain-language report of facts the court looks for that may be missing, based on the reasons the court publishes for denying emergency orders. It also prepares evidence photos for upload.

### User flow

1. **Filing basis:** choose domestic or family violence, stalking, harassment, and/or sex offense (multiple allowed). The tool never suggests one. Choosing domestic violence reveals a relationship question.
2. **Relationship** (DV only): spouse, dating, sexual relationship, blood or adoption, marriage, legal guardian or custodian, child in common, or none of these.
3. **Respondent details:** yes or no only. Does the user know the respondent's date of birth? Social Security number? The tool never asks for the details themselves.
4. **Paste what happened**, then "Check my draft." The report appears below. The user edits and re-checks as often as they like.
5. **Optional: get photos ready to upload.** Resize and strip location data, then save each photo or all of them as a .zip.

### The report

Grouped into "About the petition," "About the respondent," and "Incident by incident." Each incident shows a quote with highlighted trigger words and four fact cells: When, Where or how, What was done, Whose account. Parts with no act, no general allegation words and no secondhand account are shown as "Background" and not counted as incidents. Each flag has a kind and a source link:

| Kind | Label shown | Meaning |
| ---- | ----------- | ------- |
| gap | Possible gap | Matches a published denial reason |
| question | Question | Asks for a fact that may be missing |
| info | Good to know | Useful, not a denial reason |
| ok | Looks complete | Requirement appears met |

"Copy this report" copies a plain-text version.

### Checks and their exact messages

All messages are fixed and pre-reviewed (in `src/content.js`). Only incident numbers and quoted phrases from the user's own draft are filled in.

| Check | Triggered when | Message (abridged where long) | Source |
| ----- | -------------- | ----------------------------- | ------ |
| Filing basis | No basis selected | "No filing basis is selected in step 1. The checker needs one to know which requirements apply." | S1 |
| Relationship fit | DV selected, no relationship chosen | Question: which relationship applies? DV orders cover family or household members | S1 |
| Relationship fit | DV selected, "none of these" | "Domestic violence orders cover family or household members, such as current or former partners. The relationship described isn't one of those listed." | S1 |
| Harassment only | Harassment is the only basis | "Petitions based only on harassment require notice to the respondent and a hearing within 30 days before any order is issued." | S1 |
| Stalking incidents | Stalking selected, fewer than 2 incidents found | "Stalking requires two or more incidents. Your petition describes one. Is there another incident you have not listed?" | S1, S2 |
| Respondent details | Both DOB and SSN answered "no" | "Without the respondent's date of birth or Social Security number, the order can't be entered into the national registry. It will still be in the Indiana registry." | S1 |
| Time | No date, only an approximate one ("last week"), or only a vague span ("for months") | Gap or question naming the incident, plus "Petitions can be denied when allegations don't describe the time, place, or acts." | S1 |
| Place | No place and no medium (text, phone, social media) | "Incident N doesn't say where it happened, or how (for example, by text or phone)." | S1 |
| Acts | No act verb, or only general words such as "harassing" | Gap, or question: "Courts look for the acts themselves. What did the person say or do?" | S1 |
| Secondhand accounts | Narrative reports what another person saw or said ("my coworker said...") | "Accounts from other people need a sworn affidavit from that person, who must also attend any hearing." | S1 |
| Repeated events | One incident says "twice," "several times" and so on | Question: "Did each time happen on a different date?" | S1 |
| Evidence files | Photo over the chosen size limit, or carrying GPS data | Resized and/or location data removed, or still over the limit | A, S5 |

Expected demo results: "Vague draft" finds 2 incidents with 4 possible gaps and 2 questions. "Detailed draft" finds 4 incidents and "Nothing from the court's published denial reasons stood out."

### How incident extraction works

Pattern matching in the browser (`src/extract.js`), not a language model. The draft is split into paragraphs and sentences. Each sentence is scanned for: specific dates, approximate times, vague time spans, act verbs, general allegation words, secondhand phrases, repeated-event words, places (addresses, place nouns, proper names after "at" or "in") and mediums (text, phone, social media). Sentences are grouped into incidents when the date changes or a new act appears. The design keeps `extractIncidents()` as a swap point: a language-model extractor could replace it later as long as it returns the same incident shape, and the rules would not change.

### Photo preparation

- Each photo is redrawn on a canvas and saved as a new JPEG, which drops all embedded metadata including GPS. The tool also reads EXIF to report whether location data was found.
- Size limit options: 1, 2 (default), 5 or 10 MB per photo. The limit is a setting because the E-filing Service's actual limit is unconfirmed (A). The general e-filing limit is 50 MB per document (S5).
- Long edge capped at 2400 px. Quality steps down from 0.88 to 0.7, then the image shrinks, but never below about 1600 px on the long edge so screenshot text stays readable.
- Files save through normal browser downloads, individually or as `petition-photos.zip`. Nothing is uploaded.
- iPhone HEIC photos open only in Safari; other browsers need a screenshot of the photo.

### Guardrails

- **Legal information, not legal advice.** Every message states a requirement or asks a question. None says what to claim, which basis to use, or whether the petition will win. The team applies Janelle O'Malley's test: any message phrased as "you should" is advice and is rewritten or removed (S2). The reviewer panel runs this test live on all 24 messages (banned phrases: "you should," "you need to," "we recommend," "I recommend," "you ought to"). All 24 pass. The two-incident message matches what Judge Cook said his staff can already tell people at the counter (S2).
- **Privacy:** the draft never leaves the browser. No backend, cookies, local storage or analytics. Closing the tab erases everything.
- **Safe exit:** a button in the top bar, or pressing Esc twice within about a second, clears the page, changes the tab title to "Weather," and navigates to a Google weather search. Designed for shared or monitored devices. The weather search is added as a new history entry, so pressing Back returns to a fresh, empty copy of the app (a page restored from the browser cache is reloaded, so nothing from before reappears). The team chose this over blocking Back on November 13, 2026: someone pressing Back on the device would see the app's front page, but the visit shows in the browser's history list either way, and in real use the page before the app is often the search for a protection order.
- **Location stripping is a safety feature**, because the petition is sent to the respondent (S1).
- The tool never contacts the respondent, the court or anyone else, and never files anything. Petitions are filed through the official Indiana Protection Order E-filing Service (S7).
- A reviewer panel at the bottom ("How this checker works") lists the checks, sources, the advice test, and how the prototype differs from the proposal.

### Out of scope (from the proposal)

Writing the narrative for the user, recommending a basis or legal strategy, predicting outcomes, filing, case types other than protection orders.

### How the prototype differs from the proposal

- Extraction is pattern matching, not a language model.
- It reads pasted text only; PDF upload of a draft petition is not built.
- The photo size limit is a setting because the real limit is unconfirmed.
- The relationship list paraphrases Indiana's family or household member definition and still needs checking against S1 and the court's Legal Information vs. Legal Advice guide.

## Product 2: Petition triage (court side)

URL: `/court/` (https://petition-checker.vercel.app/court/). Built November 6, 2026 after the professors asked teams for a court-facing product. The journey map (Section 9) had planned a separate court-side track; its leading candidate there was long AI-generated motions from self-represented parties. A team member proposed instead a summarizer and classifier for filed petitions, and the team chose protection order petitions so it shares the same domain, statute and extractor as Petition check.

### What a reviewer sees

- A queue of 8 fictional filed petitions, with counts: waiting, urgent, elevated, standard, total reading time.
- Each card shows: petition ID, filing time and how long it has been waiting, a priority badge, a complexity badge, an estimated reading time, the filing basis and relationship, chips for "Ex parte requested" or "Hearing requested" and for each danger indicator found, and the summary.
- **Summary** is extractive: built only from the petitioner's own sentences. A headline (relationship, number of incidents, date range) plus, for each incident, the date, the place, and the sentence describing what was done. The most recent incident is outlined. Nothing is reworded or generated.
- "Why" section: every priority reason with the exact phrase that triggered it and a source link; complexity reasons; possible gaps (the same published denial reasons Petition check uses); procedure notes (harassment-only hearing rule, ex parte requested, respondent DOB/SSN missing).
- "Full petition text" with matched phrases highlighted.
- Reviewer controls: sort by suggested order, oldest filing first, or most complex first; "Move up" and "Move down" (switches to "Your order"); "Mark reviewed" (moves to a Reviewed list, with "Move back to waiting"); "Add a petition" form to paste and score any fictional narrative.

### Priority rules

| Level | Set when the petition text mentions | Source |
| ----- | ----------------------------------- | ------ |
| **Urgent** | A weapon used or threatened, a threat to kill, or fear of being killed (Lethality Screen questions 1 to 3, any one is enough); or four or more of the Lethality Screen's other risk factors | LAP |
| **Elevated** | Any other Lethality Screen or Danger Assessment risk factor, or any physical violence, dated or not | LAP, DA, A |
| **Standard** | None of the above found in the text | |

Any physical violence counts even without a date, on purpose, so a vaguely written petition is not pushed down the queue for being vague. If the violence is dated within 14 days of filing, the reason says so (team assumption A).

### Danger indicators (keyword rules in `src/court/triage.js`)

| Indicator | Effect | Source |
| --------- | ------ | ------ |
| Weapon used or threatened | Urgent on its own | LAP Q1 |
| Threat to kill, or fear of being killed | Urgent on its own | LAP Q2, Q3 |
| Has or can get a gun | Counts toward the four-factor rule; Elevated | LAP Q4 |
| Choking or strangulation | Counts toward the four-factor rule; Elevated | LAP Q5, Glass 2008 |
| Jealousy or control of daily activities | Counts toward the four-factor rule; Elevated | LAP Q6 |
| Recent separation | Counts toward the four-factor rule; Elevated | LAP Q7 |
| Respondent unemployed | Counts toward the four-factor rule; Elevated | LAP Q8 |
| Respondent threatened or attempted suicide | Counts toward the four-factor rule; Elevated | LAP Q9 |
| Child not the respondent's | Counts toward the four-factor rule; Elevated | LAP Q10 |
| Follows, spies, or sends threats | Counts toward the four-factor rule; Elevated | LAP Q11 |
| Forced sex | Elevated | DA |
| Violence getting worse or more frequent | Elevated | DA |
| Petitioner pregnant | Elevated | DA |
| Property destroyed | Elevated | DA |
| Drug or alcohol use | Elevated | DA |

### Complexity rules

Points: more than 150 words (+1) or more than 400 words (+2); four or more incidents (+1); more than one filing basis (+1); secondhand accounts, which need affidavits and witnesses (+1); children mentioned (+1); two or more possible gaps (+1). 0 to 1 points is Low, 2 to 3 Medium, 4 or more High. Reading time is words divided by 200, minimum 1 minute. These thresholds are a team assumption to test with clerks (A).

### Suggested order

1. Priority (Urgent, then Elevated, then Standard).
2. Within the same priority, ex parte requests first, because the court can issue those immediately without notice or a hearing, while harassment-only petitions need notice and a hearing within 30 days (Ind. Code 34-26-5-9).
3. Then simpler petitions first, so more people get a decision sooner.
4. Then oldest filing first.

Reviewers can override this at any time.

### Sample queue and expected results (suggested order)

| # | ID | Basis, relationship | Priority / complexity | Why |
| - | -- | ------------------- | --------------------- | --- |
| 1 | PO-26-1191 | DV, child in common | Urgent / Low | Threat to kill ("kill me"); separation; respondent lost his job; children mentioned |
| 2 | PO-26-1187 | DV, spouse | Urgent / Low | Gun pointed at petitioner; 4 Lethality Screen factors (gun access, strangulation, control, separation); recent physical violence |
| 3 | PO-26-1193 | Sex offense, acquaintance | Elevated / Low | Forced sex |
| 4 | PO-26-1189 | DV and stalking, dating | Elevated / Medium | Physical violence ("pushed me") with no date; vague, secondhand, 3 gaps. This is Dana's vague petition |
| 5 | PO-26-1188 | DV and stalking, dating | Elevated / Medium | Separation, following, recent physical violence; 4 incidents. Dana's detailed petition |
| 6 | PO-26-1192 | Stalking and harassment, former coworker | Elevated / High | Tracking with GPS, escalation; 7 incidents, secondhand account, gaps |
| 7 | PO-26-1194 | DV, brother | Elevated / Low | Property destroyed (broke windows); no ex parte request, so it sorts after the ex parte ones |
| 8 | PO-26-1190 | Harassment only, neighbor | Standard / Low | No danger indicators; harassment only, so notice and a hearing are required |

The page's outcome-language test checks every generated label for "grant," "deny," "denied," "should" and "recommend." All 53 labels pass.

### Guardrails

- Suggests a reading order only. It never decides, and never suggests granting or denying. Every petition still gets read in full.
- Rules, not a model: every label shows the exact matched phrase and links its source.
- Follows the TRI/NCSC court AI principles (NC): AI "should never be the final arbiter of any court decision," and AI used to predict risk is a high-risk use that needs a human in the loop with ultimate decision-making.
- Priority is not a risk assessment. The Lethality Screen form itself says most people who screen as high danger would not be expected to be killed. A petition with no indicators is not a safe petition: the text only shows what the petitioner chose to write.
- Runs entirely in the browser on fictional data. Nothing is sent anywhere.

### Known limits

- Keyword rules miss indicators written in other words, and can match negations ("he never had a gun") or misread context (in sample 1187, "left him" inside a threat counts as separation). Highlighted phrases let the reviewer check each match.
- Incident splitting and dates come from the same extractor as Petition check, so its mistakes carry over (for example, "our son and told me" can be misread as a secondhand account).
- Not validated on real petitions. Labels would need checking for bias across groups before any pilot (NC).
- A real deployment would need to connect to the court's queue (the clerk works in Odyssey File and Serve); the MVP uses sample data and a paste form.

## Success measures and assumptions (from the proposal)

**How the team will know it works:**
- Detection: on a test set of at least 30 fictional petitions seeded with documented denial reasons, the checker flags at least 90% of the seeded problems.
- Precision: complete petitions produce few or no false flags; the false-flag rate is reported alongside detection.
- Boundary: zero messages fail the "should" test in team and faculty review.
- Usability: in think-aloud tests, testers can explain what each flag means and what fact is missing without help.
- Long term (pilot with the court): fewer ex parte denials for vague or incomplete petitions among users, if the court can measure it.

**Assumptions still to test:**

| Assumption | Why it matters | How to test |
| ---------- | -------------- | ----------- |
| Denials for insufficient facts are common outside Allen County | Determines statewide value | Ask Bob Rath and clerks in counties without a specialist |
| The E-filing Service has an upload limit that phone photos exceed | Decides whether the photo feature is needed | Upload test during the walkthrough, without submitting |
| Attachments are sent to the respondent with the petition | Makes location stripping a safety requirement | Ask Bob Rath and Janelle O'Malley |
| The court would treat the messages as legal information | Required for adoption | Review messages with Bob Rath against the court's guide |
| The redesigned protection order site doesn't already include these checks | Avoids duplicating the court's work | Ask Janelle O'Malley about the redesign's scope |
| People would run a check before filing | A tool no one uses fixes nothing | Think-aloud tests with the persona scenario |

**Planned next steps (from the proposal):** finish the timed walkthrough; turn each denial reason in the instruction booklet into a written rule with one approved message; write 30+ fictional test petitions plus complete controls; prototype extraction and rule checks on the test set; send open assumptions to Bob Rath and Colin Rule.

## People

| Person | Role |
| ------ | ---- |
| Bob Rath | Chief Innovation Officer, Indiana OJA (client session) |
| Janelle O'Malley | Director of E-filing and Innovation (client session); source of the "you should" advice test |
| Magistrate Brian Cook | Allen County (client session); denied a similar e-filed petition the morning of the session |
| Magistrate Taylor Beaty | Allen County (client session); described the specialist who follows up and holds incomplete petitions 24 hours |
| Colin Rule | Recipient of the team's open questions (named in next steps) |
| Dana Morales | Fictional composite persona, not a real person |

## Related research (court side, gathered November 6, 2026)

- **Indiana Trial Rules:** Indiana Supreme Court order, Cause No. 26S-MS-8, effective August 1, 2026. TR 11 and new TR 11.1 (self-represented parties) cover filings prepared with AI assistance; the signature certifies that cited legal authority is authentic, and the court may strike non-compliant filings. New TR 11.2 defines an "abusive litigant" to include one citing fictitious legal authority. https://www.in.gov/courts/files/order-rules-2026-26S-MS-8.pdf
- **Indiana Supreme Court AI policy:** an internal AI use policy for the Court and OJA (August 2025, partly unverified) and a model AI policy toolkit for trial courts (February 17, 2026). https://times.courts.in.gov/2026/02/17/ai-toolkit
- **Strangulation:** Glass et al. 2008 found prior non-fatal strangulation had an odds ratio of 7.48 for completed homicide and 6.70 for attempted homicide.
- **Femicide risk:** Campbell et al. 2003 found the main multivariate predictors were the perpetrator's gun access, a prior threat with a weapon, a stepchild in the home, and estrangement, especially from a controlling partner.
- **Differentiated case management:** the CCJ "Call to Action" (2016) sets streamlined, general and complex pathways assigned by case characteristics. Indiana runs a civil pathways pilot (started June 1, 2023, extended to December 31, 2026). https://secure.in.gov/courts/pathways
- **Comparables:** no court was found using AI to triage protection order petitions specifically. Related: Arizona Supreme Court Administrative Order 2025-191, an AI pilot for self-represented litigants in family court; Singapore's Small Claims Tribunals use a generative AI tool to give magistrates factual case summaries (from September 2025).

## Technical details

### Repository layout

```
index.html              Petitioner tool markup
court/index.html        Court triage page markup
src/
  main.js               Petitioner tool entry: form wiring, example buttons
  content.js            Sources and every fixed message petitioners can see
  extract.js            Incident extraction (pattern matching, no DOM), shared by both tools
  rules.js              evaluate(form) returns the petitioner flags (no DOM)
  report.js             Renders the petitioner report; exports highlight()
  photos.js             Photo resize, metadata stripping, downloads and .zip
  safe-exit.js          Safe exit button and Esc-twice shortcut
  review-panel.js       Petitioner reviewer panel and advice test
  examples.js           Fictional demo drafts
  util.js               HTML escaping and toast
  styles.css            Shared styles and light/dark theme tokens
  court/
    court.js            Queue state, cards, sorting, reorder and reviewed actions, reviewer panel
    triage.js           Summary, priority and complexity rules, sources (no DOM)
    samples.js          Fictional filed petitions
    court.css           Court page styles
docs/
  Team10_Journey_Map_Service_Blueprint.pdf
  about_indiana_gov_project.md   This file
vite.config.js          Builds both pages; relative base path
package.json            Scripts and dependencies
```

### Commands

Requires Node.js 20.19+ or 22.12+.

| Command | What it does |
| ------- | ------------ |
| `npm install` | Install dependencies |
| `npm run dev` | Start the local dev server at http://localhost:5173 (court page at /court/) |
| `npm run build` | Build static files into `dist/` |
| `npm run preview` | Serve the built `dist/` folder |
| `npm run deploy` | `vercel --prod`, deploy to production |

### Dependencies and hosting

- Runtime dependency: JSZip (loaded only when saving a .zip). Dev dependencies: Vite and the Vercel CLI.
- `npm audit` reports vulnerabilities only inside the Vercel CLI's own dependencies, which run only at deploy time. The shipped site's dependencies have none.
- Hosted on Vercel project `petition-checker` under Vashistha's Vercel account. Only that account can deploy to the live URL; a teammate running `npm run deploy` from their own account would create a separate project. Deploys are manual, not automatic on push.
- A **Petitioner | Court** toggle at the top right of both pages switches between the two tools. On the petitioner page it sits next to the Safe exit button. In a real deployment the court tool would not be linked from the petitioner page; the toggle is for the prototype.
- The only external request is the Google Fonts stylesheet (Atkinson Hyperlegible, a font designed for legibility). No user text is ever sent.

### Where to change things

- Petitioner messages: `src/content.js`. Keep them as requirements or questions so they pass the advice test.
- New petitioner check: add a message in `content.js`, trigger it in `rules.js`, list it in `review-panel.js`.
- Triage indicators: the `INDICATORS` list in `src/court/triage.js`. Priority, complexity and order: `triage()` and `suggestedCompare()` in the same file.
- Extraction for both tools: `extractIncidents()` in `src/extract.js`.

## Sources

| Code | Source |
| ---- | ------ |
| S1 | Indiana Office of Court Services, Instructions for Petition for Order of Protection, Filed by Person Seeking Protection (OJA-PO-0102, rev. 05/25). https://www.in.gov/courts/iocs/files/center-bb-po-form-po-0102.pdf |
| S2 | AI for Impact client session with Bob Rath, Janelle O'Malley, Magistrate Brian Cook and Magistrate Taylor Beaty, October 9, 2026. Class transcript |
| S3 | Indiana Judicial Branch, Self-Service Legal Center: Getting a Protection Order. https://www.in.gov/courts/selfservice/protection-orders |
| S4 | Indiana Judicial Branch, E-filing Protection Orders. https://secure.in.gov/courts/help/efiling/protection-orders |
| S5 | Indiana Judicial Branch, E-filing User Guide (updated September 1, 2026). https://www.in.gov/courts/files/efiling-user-guide.pdf |
| S6 | Indiana Legal Help, Protection Order Resources and Information. https://indianalegalhelp.org/protection-order/ |
| S7 | Indiana Protection Order E-filing Service. https://public.courts.in.gov/porefsp |
| S8 | Indiana Court Times, "Change for the Better: Protection Orders & Electronic Filing" (2019). https://times.courts.in.gov/2019/12/20/change-for-the-better-protection-orders-electronic-filing |
| S9 | Indiana Court Times, "Writing a New Chapter" (2025), on the INfile platform and planned redevelopment of protection order e-filing. https://times.courts.in.gov/2025/08/06/writing-a-new-chapter |
| S10 | Wisconsin Court System, online portal pilot for domestic abuse restraining order petitions, July 22, 2026. https://www.wicourts.gov/news/view.jsp?id=1776 |
| S11 | Indiana Supreme Court, October 2026 briefing for AI for Impact students: summary of 2025 new filings (provisional data) |
| LAP | Maryland Network Against Domestic Violence, Domestic Violence Lethality Screen for First Responders (2005). https://www.tdcaa.com/wp-content/uploads/DV-Lethality-Screen-for-First-Responders.pdf |
| DA | Campbell, Danger Assessment (2003); Campbell et al., "Risk Factors for Femicide in Abusive Relationships," Am J Public Health 93(7), 2003. https://www.dangerassessment.org/uploads/pdf/DAEnglish2010.pdf |
| GL | Glass et al., "Non-fatal strangulation is an important risk factor for homicide of women," J Emerg Med 35(3), 2008. https://pubmed.ncbi.nlm.nih.gov/17961956/ |
| IC | Indiana Code 34-26-5-9: ex parte orders for domestic or family violence may issue immediately without notice or hearing; harassment petitions require notice and a hearing within 30 days. https://codes.findlaw.com/in/title-34-civil-law-and-procedure/in-code-sect-34-26-5-9/ |
| NC | TRI/NCSC AI Policy Consortium, Principles and Practices for Using AI Responsibly and Effectively in Courts (2025). https://www.ali.org/sites/default/files/2025-11/NCSC-TRI-Consortium-Principles-and-Practices-for-AI-in-State-Courts.pdf |
| A | Team 10 assumption, to be validated (for example, the photo upload limit, the 14-day recency window, complexity thresholds) |

## Glossary

| Term | Meaning |
| ---- | ------- |
| Petitioner | The person asking the court for protection |
| Respondent | The person the petitioner wants protection from |
| Order for protection | Indiana's term for what other states call a restraining order |
| Ex parte order | An order issued without notice to the respondent and without a hearing, possible the same day for domestic or family violence |
| Filing basis | The legal ground: domestic or family violence, stalking, harassment, or a sex offense |
| Family or household member | The relationships Indiana's DV orders cover, as the prototype paraphrases them: current or former spouse, dating or sexual relationship, related by blood, adoption or marriage, legal guardian relationships, or a child in common. The wording still needs checking against S1 |
| Affidavit | A sworn written statement. Secondhand accounts need one from the person who saw the events, and that person must attend any hearing |
| OJA | Indiana Office of Judicial Administration |
| Odyssey File and Serve | The statewide e-filing and case management queue clerks use |
| IDACS / NCIC | Indiana and national law enforcement data systems the protection order registry sends orders to |
| LAP / Lethality Screen | An 11-question first-responder screen for domestic violence danger. A yes to any of questions 1 to 3, or to four or more of questions 4 to 11, is treated as high danger |
| Danger Assessment | Jacquelyn Campbell's 20-item research instrument on intimate partner homicide risk factors |
| Legal information vs. legal advice | Information states rules and requirements; advice tells a person what they should do in their case. Both tools stay on the information side |

## Frequently asked questions

**Does either tool use AI or a language model?** No. Both use transparent, deterministic rules and pattern matching in the browser. The proposal describes an agentic pipeline where a language model would extract incidents and rules would still decide; the prototype keeps that design but uses pattern matching for extraction, so a model could be swapped in later without changing the rules.

**Is any data stored or sent anywhere?** No. Everything runs in the browser. There is no backend, no cookies, no local storage, no analytics. Closing the tab erases everything.

**Does Petition check file the petition?** No. It only reviews a draft. Filing happens through the official Indiana Protection Order E-filing Service.

**Does Petition triage decide which petitions get granted?** No. It suggests a reading order and explains every label. The judge or clerk reads every petition in full and makes every decision.

**Why does a vague petition with "pushed me" rank Elevated, not Standard?** Any physical violence counts, dated or not, so people who write less precisely are not pushed down the queue.

**Why do ex parte requests come first within a priority level?** Under Ind. Code 34-26-5-9 the court can issue an ex parte order immediately for domestic or family violence, while harassment-only petitions need notice and a hearing within 30 days.

**Why strip location data from photos?** The petition and its attachments are sent to the respondent, so GPS data in a photo could reveal where the petitioner lives or is staying.

**Who can deploy the live site?** Only the owner of the `petition-checker` Vercel project (Vashistha's account), unless others are added to it.

**What is unconfirmed?** The E-filing Service upload limit, whether attachments go to the respondent, how common these denials are outside Allen County, whether the court treats the messages as legal information, whether the redesigned e-filing site already has these checks, and whether people would use a checker before filing. The court-side complexity thresholds and the 14-day recency window are also team assumptions.
