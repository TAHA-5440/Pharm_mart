import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT = path.join(process.cwd(), "public", "icons");

function markSvg(size: number, padRatio: number, round: boolean) {
  const font = Math.round(size * (padRatio > 0.18 ? 0.28 : 0.36));
  const radius = round ? Math.round(size * 0.22) : 0;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="#0f4c3a"/>
  <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
    font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${font}" fill="#f7f4ee">PX</text>
</svg>`);
}

async function writePng(file: string, size: number, padRatio: number, round: boolean) {
  await sharp(markSvg(size, padRatio, round)).png().toFile(path.join(OUT, file));
}

async function main() {
  await mkdir(OUT, { recursive: true });
  await writePng("icon-192.png", 192, 0.12, true);
  await writePng("icon-512.png", 512, 0.12, true);
  await writePng("maskable-192.png", 192, 0.22, false);
  await writePng("maskable-512.png", 512, 0.22, false);
  await writePng("apple-touch-icon.png", 180, 0.12, false);
  console.log("Wrote PWA icons to public/icons");
}

main();
