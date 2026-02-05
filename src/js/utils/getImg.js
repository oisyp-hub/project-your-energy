export function getImg(name, ext = "png") {
  // name: "1" або "logo" тощо
  // ext: "png" / "jpg"
  const base = `/src/img/${name}`;

  // AVIF найкращий, потім WEBP, потім fallback
  // якщо не хочеш <picture>, тоді хоча б webp:
  return {
    avif: `${base}.avif`,
    webp: `${base}.webp`,
    fallback: `${base}.${ext}`,
  };
}
