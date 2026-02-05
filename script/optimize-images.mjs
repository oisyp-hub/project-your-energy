import fg from "fast-glob";
import path from "node:path";
import fs from "node:fs/promises";
import sharp from "sharp";

const ROOT = "src/img";

async function optimizeOne(absPath) {
  const input = await fs.readFile(absPath);          // читаємо файл 1 раз
  const base = sharp(input).rotate();                // базовий інстанс
  const meta = await base.metadata();
  const { dir, name } = path.parse(absPath);

  // 1) робимо webp/avif з клонів (безпечно)
  await base.clone().webp({ quality: 78 }).toFile(path.join(dir, `${name}.webp`));
  await base.clone().avif({ quality: 45 }).toFile(path.join(dir, `${name}.avif`));

  // 2) оптимізуємо оригінал вкінці (теж через clone)
  if (meta.format === "png") {
    const buf = await base.clone().png({ compressionLevel: 9 }).toBuffer(); // lossless
    await fs.writeFile(absPath, buf);
  } else if (meta.format === "jpeg") {
    const buf = await base.clone().jpeg({ quality: 82, mozjpeg: true }).toBuffer();
    await fs.writeFile(absPath, buf);
  }

  console.log(`✅ ${path.relative(process.cwd(), absPath)}`);
}

async function main() {
  const files = await fg(["**/*.{png,jpg,jpeg}"], {
    cwd: ROOT,
    absolute: true,
    ignore: ["**/*.webp", "**/*.avif"],
  });

  for (const f of files) await optimizeOne(f);
  console.log("🎉 Done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
