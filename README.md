# justinmascarenhas.com

Static portfolio site: plain HTML, CSS and vanilla JS, served by GitHub Pages from `main` (root). No framework and no build step: what is in the repo is what is served.

## Layout

```
index.html                  root shell (System focus) and the master copy of the page
embedded/ robotics/ edge-ai/  the same shell per focus (different data-focus, title, meta, canonical, OG)
404.html                    not-found page
assets/css/site.css         design tokens ("Datasheet") and all styles
assets/js/theme.js          light/dark toggle (follows prefers-color-scheme, saved in localStorage)
assets/js/hero-page.js      focus routing, panel gating, resume button, status lights
assets/js/hero-robot.js     Move + Command panels (arm, planner, firmware config, PWM scope)
assets/js/hero-edge.js      Perceive panel (int8 MLP, draw pad, network view)
assets/js/site.js           project cards, filters, drawer, experience, about, contact
assets/data/content.js      ALL site text, numbers, dates and links
assets/data/qat-weights.js  int8 weights + scales + 10 MNIST samples for the Perceive panel
assets/img/projects/<id>.webp, assets/img/og-image.png, assets/video/cuda-vgg16.mp4
assets/resume/              the four resume PDFs (see below)
tools/make-shells.py        regenerates the three focus shells from index.html
CNAME  .nojekyll  favicon.svg  robots.txt  sitemap.xml
```

## Editing content

Every word, number, date and link on the page comes from `assets/data/content.js` (`window.JM_CONTENT = {…}`). Edit that object and reload; nothing else needs to change.

- Projects: `projects[]` (`spec` rows are `[Parameter, Typ, Unit]`; `bars` drive the drawer charts). A `note` is shown in the drawer only when it starts with "Live demo". `claim_rule` is internal and never rendered.
- Order per focus: `tracks.<focus>.order` (Selected work shows the first 6). Robocon is never placed first.
- Experience is sorted newest first automatically; an entry with `placement_rule` goes last under "Leadership".

Keep it valid JavaScript (it is JSON after `window.JM_CONTENT = `).

## Adding a project image

1. Save it as a 1600×900 WebP at `assets/img/projects/<project id>.webp`.
2. In `content.js`, add the id to `images.ready` and remove it from `images.pending`.

Any project whose id is not in `images.ready` shows a graph-paper placeholder with its short title.

## Resume PDFs

Upload these four files (exact names):

```
assets/resume/Justin_Mascarenhas_Resume_System.pdf
assets/resume/Justin_Mascarenhas_Resume_Embedded.pdf
assets/resume/Justin_Mascarenhas_Resume_Robotics.pdf
assets/resume/Justin_Mascarenhas_Resume_Edge_AI.pdf
```

The Resume button checks its PDF with a `HEAD` request and stays hidden while the file is missing. Until a PDF exists, the browser console shows that request's 404; this is expected.

## Editing the page shell

Edit `index.html`, then regenerate the focus folders so the four shells stay identical:

```
python3 tools/make-shells.py
```

## Local preview

```
python3 -m http.server 8000
```

Open http://localhost:8000/ (and `/embedded/`, `/robotics/`, `/edge-ai/`). Serve the repo root: asset paths are absolute (`/assets/…`).
