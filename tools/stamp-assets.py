#!/usr/bin/env python3
"""Append ?v=<content hash> to every local /assets/ URL in the HTML pages, so browsers never mix a new page
with a cached old script or stylesheet (GitHub Pages caches files for 10 minutes). Run after make-shells.py:

    python3 tools/make-shells.py && python3 tools/stamp-assets.py
"""
import hashlib, pathlib, re
ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGES = ["index.html", "embedded/index.html", "robotics/index.html", "edge-ai/index.html", "404.html"]
pat = re.compile(r'((?:src|href)=")(/assets/(?:css|js|data)/[^"?]+)(?:\?v=[0-9a-f]+)?(")')
def stamp(m):
    f = ROOT / m.group(2).lstrip("/")
    return m.group(1) + m.group(2) + ("?v=" + hashlib.sha1(f.read_bytes()).hexdigest()[:8] if f.exists() else "") + m.group(3)
for p in PAGES:
    fp = ROOT / p
    if fp.exists():
        s = fp.read_text(encoding="utf-8"); n = pat.subn(stamp, s); fp.write_text(n[0], encoding="utf-8"); print(f"{p}: {n[1]} assets stamped")
