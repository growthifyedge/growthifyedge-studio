"""Extract the GE emblem from the official GrowthifyEdge logo poster as a transparent PNG.

Usage (from the repo root):
    python tools/extract-ge-mark.py <path-to-official-logo.png> [--top-frac 0.62] [--out public/brand/ge-mark.png]

What it does, without redrawing anything:
  1. Looks only at the top part of the poster (default: top 62%), which holds the circular GE emblem
     and excludes the GROWTHIFYEDGE wordmark and taglines below it.
  2. Finds the bounding box of the emblem's own pixels (anything clearly brighter than the black canvas).
  3. Crops to that box with a small margin and converts the near-black canvas to transparency using a
     luminance key, so the gold/silver artwork keeps its exact pixels while the background drops out.
  4. Writes a square, transparent PNG (default 512px) to public/brand/ge-mark.png, which the campaign
     stylesheet already references for the three in-artwork placements.
"""
import argparse
from pathlib import Path
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument('source')
ap.add_argument('--top-frac', type=float, default=0.62, help='portion of the poster height that contains the emblem')
ap.add_argument('--out', default='public/brand/ge-mark.png')
ap.add_argument('--size', type=int, default=512)
ap.add_argument('--key-low', type=int, default=22, help='luma at or below this is fully transparent')
ap.add_argument('--key-high', type=int, default=70, help='luma at or above this is fully opaque')
args = ap.parse_args()

src = Image.open(args.source).convert('RGBA')
w, h = src.size
region = src.crop((0, 0, w, int(h * args.top_frac)))

# Bounding box of emblem pixels: anything meaningfully brighter than the canvas.
lum = region.convert('L')
mask = lum.point(lambda v: 255 if v > args.key_high else 0)
bbox = mask.getbbox()
if not bbox:
    raise SystemExit('No emblem pixels found; adjust --top-frac or --key-high.')
pad = int(max(bbox[2] - bbox[0], bbox[3] - bbox[1]) * 0.04)
bbox = (max(0, bbox[0] - pad), max(0, bbox[1] - pad), min(region.width, bbox[2] + pad), min(region.height, bbox[3] + pad))
emblem = region.crop(bbox)

# Luminance key: canvas -> transparent, artwork -> opaque, soft ramp in between.
lo, hi = args.key_low, args.key_high
alpha = emblem.convert('L').point(lambda v: 0 if v <= lo else 255 if v >= hi else int(255 * (v - lo) / (hi - lo)))
emblem.putalpha(alpha)

# Square canvas, centred, then resized for web use.
side = max(emblem.size)
canvas = Image.new('RGBA', (side, side), (0, 0, 0, 0))
canvas.paste(emblem, ((side - emblem.width) // 2, (side - emblem.height) // 2), emblem)
canvas = canvas.resize((args.size, args.size), Image.LANCZOS)

out = Path(args.out)
out.parent.mkdir(parents=True, exist_ok=True)
canvas.save(out, 'PNG', optimize=True)
print(f'wrote {out} ({args.size}x{args.size}) from crop {bbox} of {args.source}')
