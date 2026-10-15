#!/usr/bin/env python3
"""Regenerate /embedded/, /robotics/ and /edge-ai/ index.html from the root index.html.

The four shells are identical except for data-focus, <title>, meta description,
canonical and OG/Twitter tags (plus the pre-rendered sub-text and resume link,
which the page script rewrites anyway). Run after editing index.html:

    python3 tools/make-shells.py
"""
import html, json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = "https://justinmascarenhas.com"
TITLES = {
    "system": "Justin Mascarenhas · Robotics, Firmware & Edge AI",
    "embedded": "Justin Mascarenhas · Embedded Firmware",
    "robotics": "Justin Mascarenhas · Robotics",
    "edge-ai": "Justin Mascarenhas · Edge AI",
}

js = (ROOT / "assets/data/content.js").read_text(encoding="utf-8")
content = json.loads(js[js.index("{"): js.rindex("}") + 1])
tracks = content["tracks"]
src = (ROOT / "index.html").read_text(encoding="utf-8")
sys_t = tracks["system"]

def esc(s):
    return html.escape(s, quote=True)

for focus in ("embedded", "robotics", "edge-ai"):
    t = tracks[focus]
    out = src
    out = out.replace('data-focus="system"', f'data-focus="{focus}"', 1)
    out = out.replace(esc(TITLES["system"]), esc(TITLES[focus]))
    out = out.replace(TITLES["system"], TITLES[focus])
    out = out.replace(esc(sys_t["sub"]), esc(t["sub"]))
    out = out.replace(sys_t["sub"], t["sub"])
    out = out.replace(f'{SITE}/"', f'{SITE}{t["path"]}"')
    out = re.sub(r'data-f="system" aria-pressed="true"', 'data-f="system" aria-pressed="false"', out)
    out = out.replace(f'data-f="{focus}" aria-pressed="false"', f'data-f="{focus}" aria-pressed="true"')
    # the JSON-LD url stays the site root
    out = out.replace(f'"url":"{SITE}{t["path"]}"', f'"url":"{SITE}/"')
    d = ROOT / focus.strip("/")
    d.mkdir(exist_ok=True)
    (d / "index.html").write_text(out, encoding="utf-8")
    print("wrote", d / "index.html")
