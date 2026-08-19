import { mkdir } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();

const script = `
from PIL import Image, ImageDraw
from pathlib import Path

src = Image.open("branding/favicon.png").convert("RGBA")
bbox = src.getbbox()
x = src.crop(bbox)
NAVY = (8, 23, 47, 255)

def square(size, pad_ratio, rounded):
    canvas = Image.new("RGBA", (size, size), NAVY)
    pad = int(size * pad_ratio)
    inner = size - pad * 2
    mark = x.copy()
    mark.thumbnail((inner, inner), Image.Resampling.LANCZOS)
    ox = (size - mark.width) // 2
    oy = (size - mark.height) // 2
    canvas.paste(mark, (ox, oy), mark)
    if rounded:
        mask = Image.new("L", (size, size), 0)
        d = ImageDraw.Draw(mask)
        r = int(size * 0.22)
        d.rounded_rectangle((0, 0, size - 1, size - 1), radius=r, fill=255)
        canvas.putalpha(mask)
    return canvas

outs = {
    "public/icons/icon-192.png": (192, 0.14, True),
    "public/icons/icon-512.png": (512, 0.14, True),
    "public/icons/maskable-192.png": (192, 0.22, False),
    "public/icons/maskable-512.png": (512, 0.22, False),
    "public/icons/apple-touch-icon.png": (180, 0.14, False),
    "public/apple-touch-icon.png": (180, 0.14, False),
    "app/icon.png": (192, 0.14, True),
    "app/apple-icon.png": (180, 0.14, False),
}
Path("public/icons").mkdir(parents=True, exist_ok=True)
for path, args in outs.items():
    square(*args).save(path, "PNG")
    print("wrote", path)
`;

async function main() {
  await mkdir(path.join(ROOT, "public", "icons"), { recursive: true });
  const run = spawnSync("python3", ["-"], { input: script, encoding: "utf8", cwd: ROOT });
  if (run.status !== 0) {
    console.error(run.stderr);
    process.exit(run.status ?? 1);
  }
  process.stdout.write(run.stdout);
}

main();
