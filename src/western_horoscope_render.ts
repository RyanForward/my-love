const SIGNS_PT = [
  "Áries",
  "Touro",
  "Gêmeos",
  "Câncer",
  "Leão",
  "Virgem",
  "Libra",
  "Escorpião",
  "Sagitário",
  "Capricórnio",
  "Aquário",
  "Peixes",
] as const;

const SIGN_EN_PT: Record<string, string> = {
  Aries: "Áries",
  Taurus: "Touro",
  Gemini: "Gêmeos",
  Cancer: "Câncer",
  Leo: "Leão",
  Virgo: "Virgem",
  Libra: "Libra",
  Scorpio: "Escorpião",
  Sagittarius: "Sagitário",
  Capricorn: "Capricórnio",
  Aquarius: "Aquário",
  Pisces: "Peixes",
};

const PLANET_EN_PT: Record<string, string> = {
  Sun: "Sol",
  Moon: "Lua",
  Mercury: "Mercúrio",
  Venus: "Vênus",
  Mars: "Marte",
  Jupiter: "Júpiter",
  Saturn: "Saturno",
  Uranus: "Urano",
  Neptune: "Netuno",
  Pluto: "Plutão",
  Node: "Nodo lunar",
  Chiron: "Quíron",
  Lilith: "Lilith",
  Ascendant: "Ascendente",
  Midheaven: "Meio do céu",
  "Part of Fortune": "Parte da fortuna",
};

const ASPECT_EN_PT: Record<string, string> = {
  Conjunction: "Conjunção",
  Opposition: "Oposição",
  Trine: "Trígono",
  Square: "Quadratura",
  Sextile: "Sextil",
};

/** Converte longitude eclíptica (°) em grau no signo + nome em PT. */
export function formatLongitudePt(fullDegree: number): string {
  const norm = ((fullDegree % 360) + 360) % 360;
  const idx = Math.floor(norm / 30) % 12;
  const inSign = norm % 30;
  const d = Math.floor(inSign);
  const m = Math.min(59, Math.round((inSign - d) * 60));
  return `${d}°${String(m).padStart(2, "0")}′ ${SIGNS_PT[idx]}`;
}

function ptSign(signEn: string | undefined): string {
  if (!signEn) return "—";
  return SIGN_EN_PT[signEn] ?? signEn;
}

function ptPlanet(name: string): string {
  return PLANET_EN_PT[name] ?? name;
}

function ptAspect(type: string): string {
  return ASPECT_EN_PT[type] ?? type;
}

function num(n: unknown): string {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—";
  return n.toFixed(2);
}

function retroBadge(isRetro: unknown): string {
  return isRetro === "true" ? "↺" : "";
}

function isPlanetRow(x: unknown): x is Record<string, unknown> {
  return x !== null && typeof x === "object" && typeof (x as { name?: string }).name === "string";
}

function isHouseRow(x: unknown): x is Record<string, unknown> {
  return x !== null && typeof x === "object" && typeof (x as { house?: number }).house === "number";
}

function isAspectRow(x: unknown): x is Record<string, unknown> {
  return (
    x !== null &&
    typeof x === "object" &&
    typeof (x as { aspecting_planet?: string }).aspecting_planet === "string"
  );
}

export function isWesternHoroscopePayload(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  const o = data as Record<string, unknown>;
  return Array.isArray(o.planets) && Array.isArray(o.houses);
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function section(title: string): { wrap: HTMLDivElement; inner: HTMLDivElement } {
  const wrap = document.createElement("div");
  wrap.className = "horoscopeSection";
  const h = el("h4", "horoscopeSection__title", title);
  const inner = document.createElement("div");
  inner.className = "horoscopeSection__inner";
  wrap.append(h, inner);
  return { wrap, inner };
}

function tablePlanetHeaders(): HTMLTableRowElement {
  const tr = document.createElement("tr");
  const heads = ["Planeta", "Signo", "Grau no signo", "Casa", "Ret."];
  for (const t of heads) {
    tr.appendChild(el("th", "horoscopeTh", t));
  }
  return tr;
}

function appendPlanetRow(tbody: HTMLTableSectionElement, row: Record<string, unknown>): void {
  const tr = document.createElement("tr");
  const name = String(row.name ?? "");
  const sign = ptSign(typeof row.sign === "string" ? row.sign : undefined);
  const norm = row.norm_degree;
  const house = typeof row.house === "number" ? String(row.house) : "—";
  const retro = retroBadge(row.is_retro);
  [ptPlanet(name), sign, typeof norm === "number" ? `${num(norm)}°` : "—", house, retro].forEach(
    (cell, i) => {
      const isRetroCol = i === 4;
      const txt = isRetroCol ? retro : cell || "—";
      const td = el("td", isRetroCol ? "horoscopeTd horoscopeTd--muted" : "horoscopeTd", txt);
      tr.appendChild(td);
    },
  );
  tbody.appendChild(tr);
}

/** Preenche `container` com o mapa astral; retorna false se o formato não for reconhecido. */
export function appendWesternHoroscopeView(container: HTMLElement, data: unknown): boolean {
  if (!isWesternHoroscopePayload(data)) return false;

  const o = data as Record<string, unknown>;
  const planets = o.planets as unknown[];

  const angles = section("Ângulos principais");
  const grid = document.createElement("div");
  grid.className = "horoscopeAngles";
  const asc = o.ascendant;
  const mc = o.midheaven;
  const vx = o.vertex;
  if (typeof asc === "number") {
    const card = document.createElement("div");
    card.className = "horoscopeAngleCard";
    card.append(
      el("span", "horoscopeAngleCard__label", "Ascendente"),
      el("span", "horoscopeAngleCard__value", formatLongitudePt(asc)),
    );
    grid.appendChild(card);
  }
  if (typeof mc === "number") {
    const card = document.createElement("div");
    card.className = "horoscopeAngleCard";
    card.append(
      el("span", "horoscopeAngleCard__label", "Meio do céu"),
      el("span", "horoscopeAngleCard__value", formatLongitudePt(mc)),
    );
    grid.appendChild(card);
  }
  if (typeof vx === "number") {
    const card = document.createElement("div");
    card.className = "horoscopeAngleCard";
    card.append(
      el("span", "horoscopeAngleCard__label", "Vértice"),
      el("span", "horoscopeAngleCard__value", formatLongitudePt(vx)),
    );
    grid.appendChild(card);
  }
  const planetsSec = section("Planetas e pontos");
  const tbl = document.createElement("table");
  tbl.className = "horoscopeTable";
  const thead = document.createElement("thead");
  thead.appendChild(tablePlanetHeaders());
  const tbody = document.createElement("tbody");
  for (const p of planets) {
    if (isPlanetRow(p)) appendPlanetRow(tbody, p);
  }
  const lilith = o.lilith;
  if (lilith && typeof lilith === "object") appendPlanetRow(tbody, lilith as Record<string, unknown>);
  tbl.append(thead, tbody);
  planetsSec.inner.appendChild(tbl);

  const housesSec = section("Casas");
  const tblH = document.createElement("table");
  tblH.className = "horoscopeTable";
  const theadH = document.createElement("thead");
  const hr = document.createElement("tr");
  for (const t of ["Casa", "Signo na cúspide", "Posição da cúspide"]) {
    hr.appendChild(el("th", "horoscopeTh", t));
  }
  theadH.appendChild(hr);
  const tbodyH = document.createElement("tbody");
  const houses = o.houses as unknown[];
  for (const h of houses) {
    if (!isHouseRow(h)) continue;
    const tr = document.createElement("tr");
    const sign = ptSign(typeof h.sign === "string" ? h.sign : undefined);
    const deg = h.degree;
    tr.append(
      el("td", "horoscopeTd", String(h.house)),
      el("td", "horoscopeTd", sign),
      el(
        "td",
        "horoscopeTd horoscopeTd--mono",
        typeof deg === "number" ? formatLongitudePt(deg) : "—",
      ),
    );
    tbodyH.appendChild(tr);
  }
  tblH.append(theadH, tbodyH);
  housesSec.inner.appendChild(tblH);

  const aspSec = section("Aspectos");
  const aspWrap = document.createElement("div");
  aspWrap.className = "horoscopeAspects";
  const aspects = o.aspects;
  if (Array.isArray(aspects)) {
    for (const a of aspects) {
      if (!isAspectRow(a)) continue;
      const type = typeof a.type === "string" ? a.type : "";
      const chip = document.createElement("div");
      chip.className = `horoscopeAspect horoscopeAspect--${aspectClassSuffix(type)}`;
      const main = el(
        "span",
        "horoscopeAspect__main",
        `${ptPlanet(String(a.aspecting_planet))} · ${ptAspect(type)} · ${ptPlanet(String(a.aspected_planet))}`,
      );
      const orb =
        typeof a.orb === "number"
          ? el("span", "horoscopeAspect__orb", `orbe ${num(a.orb)}°`)
          : null;
      chip.append(main);
      if (orb) chip.appendChild(orb);
      aspWrap.appendChild(chip);
    }
  }
  aspSec.inner.appendChild(aspWrap);

  const blocks: HTMLElement[] = [];
  if (grid.childElementCount > 0) {
    angles.inner.appendChild(grid);
    blocks.push(angles.wrap);
  }
  blocks.push(planetsSec.wrap, housesSec.wrap, aspSec.wrap);
  container.append(...blocks);

  const details = document.createElement("details");
  details.className = "horoscopeRaw";
  details.appendChild(el("summary", "horoscopeRaw__summary", "Dados brutos (JSON)"));
  const pre = el("pre", "horoscopeDialog__json horoscopeDialog__json--nested");
  pre.textContent = JSON.stringify(data, null, 2);
  details.appendChild(pre);
  container.appendChild(details);

  return true;
}

function aspectClassSuffix(type: string): string {
  const k = type.toLowerCase();
  if (k.includes("conjunct")) return "conj";
  if (k.includes("opposit")) return "opp";
  if (k.includes("trine")) return "tri";
  if (k.includes("square")) return "squ";
  if (k.includes("sextile")) return "sex";
  return "oth";
}
