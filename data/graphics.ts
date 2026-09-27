/** Built-in starter graphics so anyone can try the studio without a file. */
export interface PresetGraphic {
  id: string;
  name: string;
  aspect: number;
  src: string;
}

const toDataUri = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg.replace(/\s+/g, " ").trim())}`;

const VOLT = "#c8ff2e";
const BONE = "#eeebe3";
const INK = "#0a0a0a";
const HEAVY = "Arial Black, Impact, Helvetica Neue, sans-serif";

const bolt = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 140">
  <path d="M62 2 L12 82 H46 L34 138 L90 52 H56 L72 2 Z" fill="${VOLT}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
</svg>`;

const stamp = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs><path id="c" d="M100 100 m-74 0 a74 74 0 1 1 148 0 a74 74 0 1 1 -148 0"/></defs>
  <circle cx="100" cy="100" r="96" fill="none" stroke="${BONE}" stroke-width="4"/>
  <circle cx="100" cy="100" r="56" fill="none" stroke="${BONE}" stroke-width="2"/>
  <text font-family="${HEAVY}" font-size="17" letter-spacing="4" fill="${BONE}">
    <textPath href="#c">CUSTOM GARAGE · MADE TO ORDER · EST 2026 ·</textPath>
  </text>
  <text x="100" y="96" text-anchor="middle" font-family="${HEAVY}" font-size="16" fill="${VOLT}" letter-spacing="2">BUILD</text>
  <text x="100" y="128" text-anchor="middle" font-family="${HEAVY}" font-size="34" fill="${BONE}">01</text>
</svg>`;

const checker = (() => {
  let squares = "";
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 0) squares += `<rect x="${c * 20}" y="${r * 20}" width="20" height="20"/>`;
    }
  }
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 120">
  <g transform="translate(10 10) skewY(-6)">
    <rect width="160" height="100" fill="${BONE}"/>
    <g fill="${INK}">${squares}</g>
    <rect width="160" height="100" fill="none" stroke="${INK}" stroke-width="3"/>
  </g>
</svg>`;
})();

const wordmark = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 180">
  <text x="0" y="58" font-family="${HEAVY}" font-size="62" fill="${BONE}" letter-spacing="-2">WEAR</text>
  <text x="0" y="116" font-family="${HEAVY}" font-size="62" fill="none" stroke="${BONE}" stroke-width="2" letter-spacing="-2">YOUR</text>
  <text x="0" y="174" font-family="${HEAVY}" font-size="62" fill="${VOLT}" letter-spacing="-2">DESIGN</text>
</svg>`;

const burst = (() => {
  const pts: string[] = [];
  for (let i = 0; i < 32; i++) {
    const r = i % 2 === 0 ? 96 : 70;
    const a = (i / 32) * Math.PI * 2;
    pts.push(`${(100 + r * Math.cos(a)).toFixed(1)},${(100 + r * Math.sin(a)).toFixed(1)}`);
  }
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <polygon points="${pts.join(" ")}" fill="${VOLT}"/>
  <text x="100" y="94" text-anchor="middle" font-family="${HEAVY}" font-size="26" fill="${INK}">100%</text>
  <text x="100" y="124" text-anchor="middle" font-family="${HEAVY}" font-size="20" fill="${INK}">CUSTOM</text>
</svg>`;
})();

const barcode = (() => {
  const widths = [3, 1, 2, 1, 4, 1, 1, 3, 2, 1, 1, 2, 4, 1, 2, 1, 3, 1, 1, 2, 3, 1, 2, 4, 1, 1, 2, 1, 3, 2];
  let x = 0;
  let bars = "";
  widths.forEach((w, i) => {
    if (i % 2 === 0) bars += `<rect x="${x * 4}" y="0" width="${w * 4}" height="70"/>`;
    x += w;
  });
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 110">
  <g fill="${BONE}">${bars}</g>
  <text x="0" y="98" font-family="Courier New, monospace" font-weight="700" font-size="16" fill="${BONE}" letter-spacing="3">BLD-0001 / RIVET</text>
</svg>`;
})();

const eye = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120">
  <path d="M6 60 Q100 -20 194 60 Q100 140 6 60 Z" fill="none" stroke="${BONE}" stroke-width="6"/>
  <circle cx="100" cy="60" r="30" fill="${VOLT}"/>
  <circle cx="100" cy="60" r="12" fill="${INK}"/>
</svg>`;

export const PRESET_GRAPHICS: PresetGraphic[] = [
  { id: "bolt", name: "Volt Bolt", aspect: 100 / 140, src: toDataUri(bolt) },
  { id: "stamp", name: "Build Stamp", aspect: 1, src: toDataUri(stamp) },
  { id: "wordmark", name: "Wear Your Design", aspect: 300 / 180, src: toDataUri(wordmark) },
  { id: "checker", name: "Checker Flag", aspect: 180 / 120, src: toDataUri(checker) },
  { id: "burst", name: "100% Custom", aspect: 1, src: toDataUri(burst) },
  { id: "barcode", name: "Barcode Tag", aspect: 260 / 110, src: toDataUri(barcode) },
  { id: "eye", name: "Watcher", aspect: 200 / 120, src: toDataUri(eye) },
];
