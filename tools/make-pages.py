#!/usr/bin/env python3
"""Generate /projects/, /cv/ and /about/ from the root index.html.

Each page reuses the root's <head>, top bar, footer and project-tile markup, so the nav and styling never drift.
Only the <main> content, the page metadata and the scripts differ (no hero scripts on these pages).
Run after editing index.html, then stamp assets:

    python3 tools/make-shells.py && python3 tools/make-pages.py && python3 tools/stamp-assets.py
"""
import pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = "https://justinmascarenhas.com"
src = (ROOT / "index.html").read_text(encoding="utf-8")

head = src[: src.index('<main class="wrap" id="main">')]
footer = re.search(r'  <footer class="foot">.*?</footer>', src, re.S).group(0)
tile = src[src.index('<div class="dr-back"'): src.index("</aside>") + len("</aside>")]
noscript = re.search(r"<noscript>.*?</noscript>", src, re.S).group(0)

PAGES = {
    "projects": {
        "title": "Projects · Justin Mascarenhas",
        "desc": "Every project by Justin Mascarenhas across embedded firmware, robotics, edge AI and HPC, with filters and search.",
        "nav": "/projects/",
        "main": '''  <section class="pg-hd">
    <div class="label">Projects</div>
    <h1>All projects</h1>
    <p class="sum">Firmware, robotics, edge AI and HPC work. Filter by area or search by tool, chip or model; open any card for the details.</p>
  </section>
  <div class="ptools">
    <div class="chips" id="chips" role="group" aria-label="Filter projects"></div>
    <label class="search"><span class="vh">Search projects</span><input id="q" type="search" placeholder="Search projects, tools, chips…" autocomplete="off"></label>
  </div>
  <div class="label meta-line" id="allMeta" aria-live="polite"></div>
  <div class="cards" id="allGrid"></div>

  <section class="sec" aria-labelledby="h-on">
    <div class="shd"><h2 id="h-on">Ongoing</h2></div>
    <div class="box" id="nowB"></div>
  </section>

  <section class="sec" aria-labelledby="h-arch">
    <div class="shd"><h2 id="h-arch">Archive</h2></div>
    <div class="box" id="arch"></div>
  </section>
''',
    },
    "cv": {
        "title": "CV · Justin Mascarenhas",
        "desc": "CV of Justin Mascarenhas: experience, projects, education, skills and awards, with downloadable one-page resumes.",
        "nav": "/cv/",
        "main": '''  <section class="pg-hd">
    <div class="label">Curriculum vitae</div>
    <h1>Justin Mascarenhas</h1>
    <p class="sum" id="cvLine"></p>
    <div class="cv-pdf" id="cvPdf"></div>
  </section>

  <section class="sec" aria-labelledby="h-exp">
    <div class="shd"><h2 id="h-exp">Experience</h2></div>
    <div id="exp" data-full="1"></div>
  </section>

  <section class="sec" aria-labelledby="h-cvp">
    <div class="shd"><h2 id="h-cvp">Projects</h2><a class="label lk" href="/projects/">Project gallery →</a></div>
    <ol class="cvproj" id="cvProj"></ol>
  </section>

  <section class="sec" aria-labelledby="h-edu">
    <div class="shd"><h2 id="h-edu">Education</h2></div>
    <div class="edu edu-2" id="edu"></div>
  </section>

  <section class="sec" aria-labelledby="h-sk">
    <div class="shd"><h2 id="h-sk">Skills</h2></div>
    <table class="skills" data-skills></table>
  </section>

  <section class="sec" aria-labelledby="h-aw">
    <div class="shd"><h2 id="h-aw">Awards</h2></div>
    <ul class="awards" id="awards"></ul>
  </section>
''',
    },
    "about": {
        "title": "About · Justin Mascarenhas",
        "desc": "About Justin Mascarenhas, a computer engineer working across embedded firmware, robotics and edge AI, based in Dallas–Fort Worth, TX.",
        "nav": "/about/",
        "main": '''  <section class="pg-hd">
    <div class="label">About</div>
    <h1>About me</h1>
  </section>
  <div class="me">
    <div class="me-photo" id="aboutPhoto"></div>
    <div class="me-text">
      <p class="about-text" id="aboutText"></p>
      <p class="me-open" id="aboutOpen"></p>
      <dl class="facts" id="aboutFacts"></dl>
      <div class="me-links" id="aboutLinks"></div>
    </div>
  </div>

  <section class="sec" aria-labelledby="h-site">
    <div class="shd"><h2 id="h-site">About this site</h2><a class="label lk" href="/#hero">Try the demo →</a></div>
    <p class="about-text" id="aboutSite"></p>
  </section>

  <section class="sec" aria-labelledby="h-edu">
    <div class="shd"><h2 id="h-edu">Education</h2></div>
    <div class="edu edu-2" id="edu"></div>
  </section>
''',
    },
}

def meta(h, page, url):
    t, d = page["title"], page["desc"]
    h = re.sub(r"<title>.*?</title>", f"<title>{t}</title>", h, count=1)
    h = re.sub(r'(<meta name="description" content=")[^"]*', lambda m: m.group(1) + d, h, count=1)
    h = re.sub(r'(<link rel="canonical" href=")[^"]*', lambda m: m.group(1) + url, h, count=1)
    h = re.sub(r'(<meta property="og:url" content=")[^"]*', lambda m: m.group(1) + url, h, count=1)
    h = re.sub(r'(<meta property="og:title" content=")[^"]*', lambda m: m.group(1) + t, h, count=1)
    h = re.sub(r'(<meta property="og:description" content=")[^"]*', lambda m: m.group(1) + d, h, count=1)
    h = re.sub(r'(<meta name="twitter:title" content=")[^"]*', lambda m: m.group(1) + t, h, count=1)
    h = re.sub(r'(<meta name="twitter:description" content=")[^"]*', lambda m: m.group(1) + d, h, count=1)
    h = h.replace(f'<a href="{page["nav"]}">', f'<a href="{page["nav"]}" aria-current="page">', 1)
    return h

for slug, page in PAGES.items():
    url = f"{SITE}/{slug}/"
    out = (meta(head, page, url)
           + '<main class="wrap page" id="main">\n' + page["main"] + "\n" + footer + "\n</main>\n\n"
           + tile + "\n\n" + noscript + "\n\n"
           + '<script src="/assets/data/content.js"></script>\n'
           + '<script src="/assets/js/theme.js"></script>\n'
           + '<script src="/assets/js/site.js"></script>\n</body>\n</html>\n')
    d = ROOT / slug
    d.mkdir(exist_ok=True)
    (d / "index.html").write_text(out, encoding="utf-8")
    print("wrote", d / "index.html")
