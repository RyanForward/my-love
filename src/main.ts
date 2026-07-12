import "./style.css";
import frases from "./frases_amor_verdadeiro.json";
import { pickDifferentIndex, shuffle } from "./rng";
import { routeFromHash, type AppRoute } from "./route";
import { renderEventosOutlet } from "./eventos_list_ui";

type MenubarKey = "home" | "eventos";
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

const frasesTyped = frases as Frase[];
const chosenPhrase: Frase =
  frasesTyped.length > 0
    ? (() => {
        const last = readLastIndex();
        const idx = pickDifferentIndex(last, frasesTyped.length);
        writeLastIndex(idx);
        return frasesTyped[idx];
      })()
    : { autor: "", frase: "" };

let cadastroMod: typeof import("./eventos_cadastro_ui") | undefined;

function showFatalError(mount: HTMLElement, err: unknown) {
  mount.innerHTML = "";
  const box = document.createElement("div");
  box.className = "fatalError";
  const msg = err instanceof Error ? `${err.message}\n\n${err.stack ?? ""}` : String(err);
  box.innerHTML = "<p><strong>Erro ao carregar.</strong></p><pre></pre>";
  box.querySelector("pre")!.textContent = msg;
  mount.appendChild(box);
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

function createMenubar(): { header: HTMLElement; links: Record<MenubarKey, HTMLAnchorElement> } {
  const header = document.createElement("header");
  header.className = "siteNav";

  const nav = document.createElement("nav");
  nav.className = "menubar";
  nav.setAttribute("aria-label", "Principal");

  const linkHome = document.createElement("a");
  linkHome.href = "#/";
  linkHome.textContent = "Página Inicial";

  const linkEvents = document.createElement("a");
  linkEvents.href = "#/eventos";
  linkEvents.textContent = "Nossos eventos";

  nav.append(linkHome, linkEvents);
  header.appendChild(nav);

  return { header, links: { home: linkHome, eventos: linkEvents } };
}

function updateMenubarActive(route: AppRoute, links: Record<MenubarKey, HTMLAnchorElement>) {
  const activeHome = route === "home";
  const activeEventos = route === "eventos" || route === "eventos_cadastro";

  if (activeHome) {
    links.home.setAttribute("aria-current", "page");
    links.home.classList.add("menubar__link--active");
  } else {
    links.home.removeAttribute("aria-current");
    links.home.classList.remove("menubar__link--active");
  }

  if (activeEventos) {
    links.eventos.setAttribute("aria-current", "page");
    links.eventos.classList.add("menubar__link--active");
  } else {
    links.eventos.removeAttribute("aria-current");
    links.eventos.classList.remove("menubar__link--active");
  }
}

function renderHomeOutlet(outlet: HTMLElement) {
  outlet.innerHTML = "";
  outlet.className = "scene scene--home";

  const wrap = document.createElement("div");
  wrap.className = "sceneCenter";

  const card = document.createElement("section");
  card.className = "card";

  const quote = document.createElement("p");
  quote.className = "quote";
  quote.textContent = `“${chosenPhrase.frase}”`;

  const author = document.createElement("p");
  author.className = "author";
  author.textContent = `~ ${chosenPhrase.autor}`;

  card.append(quote, author);
  wrap.appendChild(card);
  outlet.appendChild(wrap);
}

async function syncRoute(outlet: HTMLElement, links: Record<MenubarKey, HTMLAnchorElement>) {
  const route = routeFromHash(location.hash);

  if (route !== "eventos_cadastro" && cadastroMod) {
    cadastroMod.teardownCadastroMap();
    cadastroMod = undefined;
  }

  if (route === "home") renderHomeOutlet(outlet);
  else if (route === "eventos") await renderEventosOutlet(outlet);
  else {
    cadastroMod = await import("./eventos_cadastro_ui");
    cadastroMod.renderCadastroOutlet(outlet);
  }

  updateMenubarActive(route, links);
}

function render() {
  const app = document.querySelector<HTMLDivElement>("#app");
  if (!app) throw new Error("Missing #app");

  try {
    app.innerHTML = "";

    const imageUrls = loadImageUrls();
    createTickerBackground(app, imageUrls);

    const { header: siteNav, links } = createMenubar();
    app.appendChild(siteNav);

    const outlet = document.createElement("main");
    outlet.className = "scene";
    outlet.id = "sceneOutlet";
    app.appendChild(outlet);

    const runSync = () => {
      void syncRoute(outlet, links).catch((e) => showFatalError(outlet, e));
    };
    window.addEventListener("hashchange", runSync);

    if (!location.hash || location.hash === "#") {
      history.replaceState(null, "", `${location.pathname}${location.search}#/`);
    }
    runSync();
  } catch (e) {
    showFatalError(app, e);
  }
}

render();
