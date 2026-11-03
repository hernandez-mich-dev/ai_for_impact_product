# Petition Check: Indiana Protection Orders

A pre-submission checker for Indiana protection order petitions. A self-filer pastes the "what happened" part of their draft and gets a plain-language report of facts the court looks for that may be missing, based on the reasons the court itself publishes for denying emergency (ex parte) orders. It also prepares evidence photos for upload by shrinking them and stripping location data.

Built by Team 10 for AI for Impact (CS 4535 / CS 6983), Fall 2026. Client: Indiana Supreme Court, Office of Judicial Administration.

> Prototype for course review. It gives legal information, not legal advice, and does not file anything. All example petitions are fictional.

## Quick start

You need [Node.js](https://nodejs.org/) **20.19+ or 22.12+** (the LTS installer is fine). Check with `node -v`.

```bash
git clone https://github.com/hernandez-mich-dev/ai_for_impact_product.git
cd ai_for_impact_product
npm install
npm run dev
```

The app opens at http://localhost:5173. Edits to files in `src/` reload the page automatically.

To try it quickly, use the **Vague draft** and **Detailed draft** buttons near the top of the page. They load the fictional persona petitions from the journey map.

| Command           | What it does                                       |
| ----------------- | -------------------------------------------------- |
| `npm run dev`     | Start the local dev server with live reload        |
| `npm run build`   | Build a static site into `dist/`                   |
| `npm run preview` | Serve the built `dist/` folder to check the build  |

The build output is plain static files, so `dist/` can be hosted anywhere (GitHub Pages, Netlify, a university server) with no backend.

## The problem

People asking Indiana courts for a protection order often submit petitions that lack the facts the law requires: one incident where stalking needs two, descriptions with no date or place, or events they only heard about from someone else. Judges then deny emergency orders that might otherwise have been granted, and the petitioner, who may still be in danger, has to start over.

Allen County prevents many of these denials with a protective order specialist who reviews petitions at the counter. Most counties have no such role, and people who e-file late at night from a phone never meet one. This tool gives self-filers that review before they submit through the official [Indiana Protection Order E-filing Service](https://public.courts.in.gov/porefsp).

The full research, persona (Dana Morales), journey map and service blueprint are in [`docs/Team10_Journey_Map_Service_Blueprint.pdf`](docs/Team10_Journey_Map_Service_Blueprint.pdf).

## How it works

Rules decide; nothing generates the text the user sees.

1. **Filing basis.** The user picks domestic violence, stalking, harassment or sex offense. The tool never recommends one.
2. **Respondent details.** Yes or no only: does the user know the respondent's date of birth or Social Security number?
3. **Extract incidents.** The pasted narrative is split into incidents, and each one is read for when, where or how, what was done, and whose account it is.
4. **Rule checks.** Deterministic checks built from the court's published denial reasons run against the incidents.
5. **Ask, don't tell.** Each result is a fixed, pre-reviewed message or question, with a link to its source. Highlighted words show what the checker reacted to.
6. **Photos (optional).** Each photo is redrawn on a canvas and saved as a new JPEG, which drops all metadata including GPS, and is shrunk to fit a chosen size limit while keeping text readable.

### Checks

| Check               | Triggered when                                                                  | Source |
| ------------------- | ------------------------------------------------------------------------------- | ------ |
| Filing basis        | No basis selected                                                               | S1     |
| Relationship fit    | Domestic violence selected, relationship missing or not in the statutory list  | S1     |
| Harassment only     | Harassment is the only basis (needs notice and a hearing first)                 | S1     |
| Stalking incidents  | Stalking selected and fewer than two incidents found                            | S1, S2 |
| Respondent details  | Neither date of birth nor Social Security number known                          | S1     |
| Time                | Incident has no date, only an approximate one, or only a span like "for months" | S1     |
| Place               | Incident names no place and no medium such as text or phone                     | S1     |
| Acts                | No act described, or only general words such as "harassing"                     | S1     |
| Secondhand accounts | Narrative reports what another person saw or said ("my coworker said...")       | S1     |
| Repeated events     | One incident says it happened "twice" or "several times"                        | S1     |
| Evidence files      | Photo over the chosen size limit, or carrying GPS data                          | A, S5  |

Sources: **S1** Indiana Instructions for Petition for Order of Protection (OJA-PO-0102), **S2** client session with Indiana OJA staff and Allen County magistrates (Oct 9, 2026), **S5** Indiana E-filing User Guide, **A** team assumption still to be tested. Full list in the PDF and in the app's "How this checker works" panel.

### Guardrails

- **Legal information, not legal advice.** No message says what to claim, which basis to use, or whether the petition will be granted. The reviewer panel at the bottom of the page runs the "should" test from the client session on every message and shows pass or fail.
- **The draft never leaves the browser.** No backend, no cookies, no local storage, no analytics. Closing the tab erases everything.
- **Safe exit.** The button in the top bar (or pressing Esc twice) clears the page and navigates to a neutral site.
- **Location data is stripped from photos**, since the petition and attachments are sent to the respondent.

## Project structure

```
index.html            Page markup (all steps, report area, reviewer panel)
src/
  main.js             Entry point: form wiring and example buttons
  content.js          Sources and every fixed message the user can see
  extract.js          Incident extraction (pattern matching, no DOM)
  rules.js            Rule checks: evaluate(form) returns the flags (no DOM)
  report.js           Renders the report and "Copy this report"
  photos.js           Photo resize, metadata stripping, download and .zip
  safe-exit.js        Safe exit button and Esc-twice shortcut
  review-panel.js     "How this checker works" panel and the advice test
  examples.js         Fictional demo petitions
  util.js             HTML escaping and toast
  styles.css          All styles, light and dark theme
docs/                 Journey map and service blueprint (PDF)
```

### Working on it

- **Changing what users read:** edit `src/content.js`. Keep messages as requirements or questions. Anything phrased like "you should" fails the advice test in the reviewer panel.
- **Adding a check:** add a message in `content.js`, trigger it in `rules.js`, and list it in the `rules` table in `review-panel.js`.
- **Improving extraction:** `extractIncidents()` in `src/extract.js` is the swap point. A language-model extractor can replace it later as long as it returns the same incident shape; the rules don't need to change.

## Prototype limitations

- Incident extraction is pattern matching in the browser, not a language model, so it can miss things that are there or react to things that aren't.
- It reads pasted text only. PDF upload of a draft petition is not built yet.
- The photo size limit is a setting because the E-filing Service's actual upload limit is still unconfirmed. The general e-filing limit is 50 MB per document (S5).
- The relationship list paraphrases Indiana's family or household member definition and still needs checking against S1 and the court's Legal Information vs. Legal Advice guide before any pilot.
- iPhone HEIC photos only open in Safari; other browsers need a screenshot of the photo.

## Team 10

Yash Kava, Michael Hernandez, Prachi Bhavsar, Udit Sen, Leonardo Pivato, Vashistha Ravindra Pandya, Joythish Reddy Evuri

## In an emergency

Call 911. National Domestic Violence Hotline: 1-800-799-7233, or text START to 88788.
