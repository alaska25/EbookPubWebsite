import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const HERO_DIR = "src/components/images"; // folder that holds your 3 photos
const HERO_FILES = ["29342", "29340", "29339"];

for (const name of HERO_FILES) {
  const input = path.join(HERO_DIR, `${name}.jpg`);
  const output = path.join(HERO_DIR, `${name}.webp`);

  if (!fs.existsSync(input)) {
    console.warn(`Skipping ${input} (not found)`);
    continue;
  }

  await sharp(input)
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(output);

  const before = (fs.statSync(input).size / 1024).toFixed(0);
  const after = (fs.statSync(output).size / 1024).toFixed(0);
  console.log(`${name}: ${before} KB -> ${after} KB`);
}