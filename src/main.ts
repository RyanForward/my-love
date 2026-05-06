import "./style.css";
import frases from "./frases_amor_verdadeiro.json";
import { pickDifferentIndex, shuffle } from "./rng";

type Frase = { autor: string; frase: string };

const LAST_INDEX_KEY = "love:lastFraseIndex:v1";

function readLastIndex(): number | null {
  const raw = localStorage.getItem(LAST_INDEX_KEY);
  if (raw == null) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function writeLastIndex(n: number) {
  localStorage.setItem(LAST_INDEX_KEY, String(n));
}

function loadImageUrls(): string[] {
  const modules = import.meta.glob("/src/images/*.{png,jpg,jpeg,webp,gif,svg}", {
    eager: true,
    query: "?url",
    import: "default",
  }) as Record<string, string>;

  return Object.entries(modules)
    .filter(([path]) => !/the-real-lovers/i.test(path))
    .map(([, url]) => url);
}

function createTickerBackground(root: HTMLElement, imageUrls: string[]) {
  const bg = document.createElement("div");
  bg.className = "bg";

  const rotated = document.createElement("div");
  rotated.className = "bgRotated";

  const grid = document.createElement("div");
  grid.className = "bgGrid";

  const rows = 7;
  const tilesPerHalf = 18;
  for (let r = 0; r < rows; r++) {
    const row = document.createElement("div");
    row.className = "bgRow";
    row.style.setProperty("--dur", `${48 + r * 8}s`);
    row.style.setProperty("--dir", r % 2 === 0 ? "1" : "-1");

    const strip = document.createElement("div");
    strip.className = "bgStrip";

    const urls = imageUrls.length ? imageUrls : [];
    const base: string[] = [];
    if (urls.length) {
      const pool = shuffle(urls);
      for (let i = 0; i < tilesPerHalf; i++) {
        base.push(pool[i % pool.length]);
      }
    }
    const tiles = base.length ? [...base, ...base] : [];

    if (!tiles.length) {
      const ph = document.createElement("div");
      ph.className = "bgPlaceholder";
      strip.appendChild(ph);
    } else {
      for (const url of tiles) {
        const tile = document.createElement("div");
        tile.className = "bgTile";
        const img = document.createElement("img");
        img.src = url;
        img.alt = "";
        img.loading = "lazy";
        img.decoding = "async";
        img.width = 120;
        img.height = 180;
        tile.appendChild(img);
        strip.appendChild(tile);
      }
    }

    row.appendChild(strip);
    grid.appendChild(row);
  }

  rotated.appendChild(grid);
  bg.appendChild(rotated);
  root.appendChild(bg);
}

function render() {
  const app = document.querySelector<HTMLDivElement>("#app");
  if (!app) throw new Error("Missing #app");
  app.innerHTML = "";

  const imageUrls = loadImageUrls();
  createTickerBackground(app, imageUrls);

  const frasesTyped = frases as Frase[];
  const last = readLastIndex();
  const idx = pickDifferentIndex(last, frasesTyped.length);
  writeLastIndex(idx);
  const chosen = frasesTyped[idx];

  const content = document.createElement("main");
  content.className = "content";

  const card = document.createElement("section");
  card.className = "card";

  const quote = document.createElement("p");
  quote.className = "quote";
  quote.textContent = `“${chosen.frase}”`;

  const author = document.createElement("p");
  author.className = "author";
  author.textContent = `~ ${chosen.autor}`;

  card.appendChild(quote);
  card.appendChild(author);

  content.appendChild(card);
  app.appendChild(content);
}

render();

