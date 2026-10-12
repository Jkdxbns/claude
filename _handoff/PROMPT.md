# Build, host and verify justinmascarenhas.com

You are working in this repository (`Jkdxbns/claude`) in Claude Code. Build my personal portfolio site at the repo root, push it to `main`, and verify it with a headless browser. I'm Justin Mascarenhas, a computer engineer (M.S. Computer Engineering, RIT, graduated May 2026) working across **embedded firmware, robotics and edge AI**. The site's job is to show that these form **one system I build end to end, not three separate skills**. It has to read as an engineer's site: precise, calm and real.

**Deliverable:** the finished static site on `main`, ready for GitHub Pages at **https://justinmascarenhas.com**, plus a verification report (format at the end).

## 1. Input files in `_handoff/` (read all of them before writing any code)

| File | What it is | How to use it |
|---|---|---|
| `content.json` | **The only source of truth for every word, number, date and link on the site:** profile, 14 projects (spec tables, bars, bullets, stack, GitHub links), 1 in-progress project, 1 archive project, 7 experience entries, education, awards, skills, the four focus tracks (sub-text, project order, resume path) and the image manifest. | Render from it. Never add, round, reword into a stronger claim, or invent anything. If a field is missing, leave it out. Respect every `note`, `placement_rule` and `wording_rules` field. |
| `hero-reference.html` | **The finished, tested hero: a live robot "system board".** Three coupled panels: **Perceive** (my quantization-aware-trained int8 MLP classifies a drawn digit), **Move** (a two-link IK arm with collision checking and pick planning), **Command** (servo firmware config with a 3-channel PWM scope). The digit you draw tells the arm which numbered block to pick; firmware speed and joint limits change how the arm moves. It also has a focus switch, live status lights and a Retry button. It's written in artifact format (no `<!doctype>`, `<html>` or `<head>`), so wrap it properly. | **Port this behaviour exactly.** Split its `<script>` blocks into modules, but keep all logic, numbers, colours and layout. Do not redesign or "simplify" it; it has been tuned and debugged. Drop only the preview-only bits: the top "Preview · …" bar and the closing "Below this come…" paragraph. |
| `qat-weights.json` | int8 weights and scales of my trained 256→64→10 MLP, plus ten MNIST test samples. The same data is inlined in the hero reference. | Ship it as a static asset (e.g. `assets/data/qat-weights.js` setting `window.QAT = …`) and load it in the Perceive panel. |
| `images/` | 15 project images (1600×900 WebP, named `<project id>.webp`), `og-image.png` (1200×630) and one video, `cuda-vgg16.mp4` (10 s, silent, H.264). | Put the images in `assets/img/projects/`, the OG image in `assets/img/`, and the video in `assets/video/`. One image (`qat-mnist`) comes later (`content.json` → `images.pending`); until then its slot shows a tidy placeholder (graph-paper pattern plus the project's short title, no filename text, no broken-image icon). The video plays **only in the CUDA project drawer**: muted, looping, `playsinline`, `preload="none"`, with `cuda-vgg16.webp` as the poster, started when the drawer opens. With reduced motion, show the poster only. |

## 2. Hard rules

1. **Truth:** all text comes from `content.json`. No new metrics, no "passionate about", no "leverage", no stock photos, no AI-generated people.
2. Never show my phone number or street address. The location is "Arlington, TX" only. No mention of visa, OPT, EAD or sponsorship anywhere.
3. QAT project: describe only the training and the in-browser demo. Never claim the hardware export, requantization constants, golden vectors or any FPGA work.
4. Robocon is never the first project in any list. The ARC General Secretary role goes last, under a "Leadership" label.
5. Telemetry Gateway is shown as **in progress**, with no metrics, following its `wording_rules`.
6. Plain static site: HTML, CSS and vanilla JS. No framework, no build step required to serve it, no third-party trackers or cookies. Fonts come from Google Fonts (IBM Plex Sans and IBM Plex Mono) only.
7. Committing and pushing to this repo's `main` branch is approved. Anything outside the repo (GitHub settings, repo visibility, DNS) is mine to do: give me exact steps (Section 6), never attempt it yourself.

## 3. Design system ("Datasheet")

Use the exact tokens from `hero-reference.html` (`:root` and both dark blocks):
- **Light:** bg `#f4f5f2`, panel `#fbfcfa`, fg `#1a1e1c`, muted `#5c6560`, line `#d8ddd8`, grid `#e7eae6`, accent teal `#2c6a62`, warm amber `#a87622`, danger `#b0443a`.
- **Dark:** bg `#111413`, panel `#161a18`, fg `#e1e5e2`, accent `#84c0b5`, warm `#d6a650`, danger `#e3806f`.
- Scope screens stay dark in both themes.

Rules:
- Light and dark both follow `prefers-color-scheme`, with a manual toggle saved in `localStorage`.
- One muted accent. No gradients, neon, glows, emoji, or `rounded-lg` on everything.
- Mono labels (uppercase, letter-spaced) for small headers. Project cards carry a **datasheet "characteristics" table**: Parameter | Typ | Unit.
- Motion is subtle: elements below the first screen rise in from a visible resting state (never fully hidden), and cards lift slightly on hover. Honour `prefers-reduced-motion` everywhere.
- Layout max width 1160 px with a 20 px side gutter. Must look right at **375, 768, 1024 and 1440 px**, with **no horizontal page scroll** at any width.

## 4. Site structure

1. **Top bar** (sticky): "JM" mark; links to Projects, Experience, About, Contact; theme toggle.
2. **Hero:** exactly as in `hero-reference.html`.
   - **Intro:** headline "I build robots end to end: the model that sees, the firmware that drives, the arm that moves.", the per-focus sub-text, buttons (View projects, **Resume · <Focus> (PDF)**, Contact), and the **Focus** switch: System · Embedded · Robotics · Edge AI.
   - **Layer chain** with live status lights: **Perceive · Edge AI → Command · Firmware → Move · Robotics**.
   - **System board:** Perceive panel | Move panel on top, Command panel full width below. It stacks to Move, Perceive, Command on narrow screens.
3. **Selected work:** the first 6 projects in the active focus's `order`, as cards. Each card has an image, period, title, blurb and spec table.
4. **All projects:**
   - Every project in the focus order, with filter chips (Firmware · Edge AI · Robotics · ML · HPC, mapped through `filter_tag_map`; "All" by default).
   - A small **Now building** block for `in_progress`.
   - A compact **Archive** row for `archive`.
5. **Project detail:** clicking any card opens a side drawer (a bottom sheet on phones) with:
   - image, title, period
   - spec table
   - animated before/after **bars** when `bars` exist, with the best value in the accent colour
   - bullets, stack chips and "View code on GitHub" when `github` exists
   - the `note` when it starts with "Live demo" (shown as a link that scrolls to the hero)

   Esc, × or a backdrop click closes it, and focus returns to the card.
6. **Experience:** reverse-chronological timeline from `experience`. Show the first bullet; "More" expands the rest. ARC goes last, under "Leadership".
7. **About, education and awards:** the `about` text, both education entries (with courses), the three awards, and a compact skills table grouped by `skills` keys.
8. **Contact / footer:**
   - email shown as text, with a copy button and a mailto link
   - LinkedIn and GitHub links
   - "© 2026 Justin Mascarenhas"

### Focus, URLs and resume

- Routes: `/` = **system** (the default), `/embedded/`, `/robotics/`, `/edge-ai/`. Each folder holds an `index.html` shell identical to the root except for `data-focus`, `<title>`, meta description, canonical and OG tags.
- Focus resolution order: path folder, then `?focus=`, then `#system|#embedded|#robotics|#edge-ai`, then the default.
- **Switching focus changes everything at once:**
  - the sub-text
  - which panel is **editable** (rule below)
  - the highlighted chip and panel
  - the Selected work order
  - the All-projects order
  - the Resume label and link (`tracks.<focus>.resume_pdf`)
  - the URL, via `history.replaceState`, without a reload
- **Interaction gating:**
  - **System:** every panel is editable.
  - **Embedded:** only Command (speed and limits) is editable.
  - **Edge AI:** only Perceive (draw pad, samples, Serial/64-lane toggle) is editable.
  - **Robotics:** only Move (steer, click blocks) is editable.
  - Locked panels keep running and show a dashed "view only" tag. **Retry stays enabled in every focus.**
- **Resume PDFs** (four, one per focus) live at `assets/resume/…` and I'll upload them. Before the button shows, check with `fetch(url, {method: "HEAD"})`. If the PDF is missing, hide the button.

### SEO and meta

- Per-focus `<title>` (e.g. "Justin Mascarenhas · Robotics, Firmware & Edge AI") and meta description.
- Open Graph and Twitter tags using `assets/img/og-image.png`. Its left side is intentionally empty; it's fine as is.
- JSON-LD `Person` with name, URL, sameAs (LinkedIn, GitHub) and alumniOf (RIT).
- `robots.txt`, `sitemap.xml` (four URLs), an SVG favicon (monogram "JM" in the accent colour), and a `404.html` styled like the site with a link home.

## 5. Porting the hero: behaviour to keep (already solved in the reference)

- **Coupling** goes through small globals.
  - `JM_robot`: `pickDigit(d, conf)`, `bump()`, `retry()`, `moving()`, `mark()`.
  - `JM_edge`: `loadSample(d, animate)`, `busy()`.
  - Other hooks: `JM_markDigits`, `JM_flashCmd`, `JM_goDeeper`, `JM_FOCUS`.
  - Keep these, or an equivalent event bus with the same behaviour.
- **Perceive → Move:**
  - Blocks carry random distinct digits, and the MNIST sample buttons for digits on the table are highlighted.
  - Only a **user-initiated** inference (drawing, a sample button, Replay, or the automatic run) commands a pick. The boot animation and a mode toggle never do.
  - If no block has the classified digit, show "NO TARGET · no block N on the table" and `TX ERR`.
- **Automatic run when idle:** about 9 s, or **1.6 s in Embedded focus**, and never while the network is still animating. It feeds an MNIST sample of a digit on the table into the network, so the arm keeps working for visitors who can't command it.
- **Command → Move:**
  - **Joint speed** (30–300 °/s) rate-limits cursor following and sets pick-move durations. Both joints share one progress value, so they finish together.
  - **Shoulder and elbow limits** use dual sliders, drawn as a reachable-workspace dot map on the arm display.
  - A pose outside the limits shows **JOINT LIMIT · CANNOT MOVE**, and the arm eases back inside when the limits are narrowed.
  - The 3-channel scope shows each servo's 50 Hz pulse (544 + angle × 1856/180 µs) inside its limit band. The gripper opens at 60° and closes at 10°.
- **Planner:**
  - The whole pick is checked before anything moves.
  - If the direct path is blocked, it tries going home first (`home\n`).
  - Otherwise it rejects with **PICK REJECTED**, the reason plus "· press Retry", `TX ERR`, and the Retry button pulsing red.
  - **Retry** cancels the pick (via a pick token), re-homes the arm inside the limits, and then retries the last rejected block.
- **Collision model:** the table, the base, the other blocks, the panel edges and the joint limits. A carried block is checked too. The offending link or obstacle is drawn in the danger colour.
- **Live status lights:** Perceive is lit while the network computes, Move is lit while the arm moves, and Command flickers amber on every TX (`prepick`, `pick`, `drop`, `home`, `OK`) and red on `ERR`.
- **Robotics geometry:**
  - The shoulder sits at `x = max(52, W·0.15, L1·0.95 + 10)`.
  - Blocks are validated at spawn with the planner from the home pose.
  - Resize must not respawn blocks; font loading fires a resize.
- **Edge AI math:**
  - Preprocessing is MNIST-style: crop, fit in 20×20, centre by mass in 28×28, then area (BOX) resample to 16×16 uint8.
  - Inference is integer-only: uint8 × int8 → int32, ReLU, rescale to uint8, then int8 → int32 and argmax.
  - Serial mode animates 17,024 MACs; 64-lane mode animates 320 steps.
- **Timing:**
  - All motion uses wall-clock time (`performance.now()`), so throttled frames don't slow the logic down.
  - Each module re-reads its CSS tokens on the `jm-theme` event.

**Suggested repo layout:**
```
/index.html  /embedded/index.html  /robotics/index.html  /edge-ai/index.html  /404.html  /CNAME
/assets/css/site.css
/assets/js/site.js  hero-page.js  hero-robot.js  hero-edge.js
/assets/data/content.js  qat-weights.js
/assets/img/projects/*.webp  /assets/img/og-image.png  /assets/resume/*.pdf  /favicon.svg
/robots.txt  /sitemap.xml  /README.md   (README: how to edit content.js, add the pending image and the 4 PDFs)
/.nojekyll
```

The final commit must **delete `_handoff/`** so it isn't published (it stays in git history).

## 6. Hosting (GitHub Pages + my domain)

You do steps 1–2. Steps 3–6 are mine: list them for me in your report with exact clicks and values, and don't attempt them.

1. Commit the site at the repo root on `main`, including `CNAME` (containing `justinmascarenhas.com`) and `.nojekyll`, then push.
2. Delete `_handoff/` in the final commit.
3. *(Me)* This repo is **private**. GitHub Pages on a private repo needs a paid plan, so either confirm I have GitHub Pro or make the repo public (Settings → General → Danger Zone → Change visibility).
4. *(Me)* Settings → Pages → Build and deployment: Deploy from a branch → `main` / root. Custom domain: `justinmascarenhas.com`.
5. *(Me)* DNS at my registrar:
   - apex `A` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - apex `AAAA` → `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
   - `www` `CNAME` → `jkdxbns.github.io`
   - remove any parking/forwarding records
6. *(Me)* After the certificate is issued, turn on **Enforce HTTPS**. Optionally verify the domain under account Settings → Pages.

## 7. Verify with a headless browser (do every item; fix and re-check anything that fails)

Serve the repo root locally (e.g. `python3 -m http.server`) and drive it with Playwright + Chromium in your sandbox. Install them if needed. Use real waits for animations (picks take a few seconds). Report each item as pass/fail with a screenshot where useful; don't commit the screenshots.

**Focus routes** (`/`, `/embedded/`, `/robotics/`, `/edge-ai/`):
- Each loads the right focus.
- The switch updates the sub-text, panel locks, project order, Resume label and URL without a reload.
- Reloading the new URL keeps the focus.
- Locks match the gating rule exactly, and Retry stays enabled everywhere.

**Perceive → Move:**
- Tapping a highlighted MNIST sample classifies it (each of 0–9 predicts its own digit).
- The arm's command box shows the digit, and the arm runs `prepick\n → pick\n → pick\n → drop\n → OK\n`. Command flickers on each TX, and Perceive and Move light up while working.
- A hand-drawn digit also works.
- A digit that isn't on the table shows NO TARGET.

**Move:**
- The arm follows the cursor, and the IK readout shows x/y in mm, d, cos θ2, θ1 and θ2.
- Pushing below the table shows COLLISION WARNING · CANNOT MOVE.
- Clicking a block picks it.
- Blocks respawn once the table is empty.

**Command:**
- Speed visibly changes arm speed.
- Narrowing the shoulder limits to about 30–110° shrinks the workspace map, updates the config block (`.min = 30, .max = 110`) and narrows the D6 band.
- Steering past a limit shows JOINT LIMIT · CANNOT MOVE.

**Retry:**
- With the shoulder limited to 0–50°, commanding a far block shows PICK REJECTED and a pulsing Retry.
- After widening the limits, Retry sends `home\n`, then retries and picks that block.

**Embedded focus:** with no input at all, the arm keeps picking blocks by itself.

**Rest of the page:**
- Filters work.
- Every card opens its drawer, bars animate, and Esc closes it.
- Experience "More" expands.
- The email copy button works.
- Every external link returns 200; list any that don't.
- Pending images show placeholders.

**Responsive:** at **375, 768, 1024 and 1440 px** (set the viewport size, and use mobile emulation with touch at 375):
- no horizontal scroll
- no overlapping text
- panels usable (the draw pad works with touch emulation)
- drawer works as a bottom sheet on phones

Check both **light and dark** themes.

**Console:** zero errors on every route.

**Live site** (only after I've done Section 6; if your sandbox can't reach the internet, list these checks for me instead):
- `http://` redirects to `https://`
- `www` redirects to the apex
- folder routes work on the custom domain
- a missing PDF hides the Resume button

## 8. Report back in this format

1. Live URL and repo URL.
2. A checklist table for Section 7 (pass/fail, plus the fix made for each failure).
3. Screenshots: the hero in each focus at 1440 px and 375 px, a project drawer, and the 404 page.
4. Anything you couldn't do or verify, and why.
5. What I still have to add: the pending `qat-mnist` image, the 4 resume PDFs (paths), and the Section 6 steps 3–6 checklist.

Do not pad the report. Do not restate this brief.
