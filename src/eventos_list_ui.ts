import { loadEventos, removeEventoById } from "./eventos_storage";
import type { Evento } from "./eventos_types";

function formatEventDate(isoDate: string): string {
  const raw = isoDate.includes("T") ? isoDate : `${isoDate}T12:00:00`;
  const d = new Date(raw);
  return Number.isFinite(d.getTime()) ? d.toLocaleDateString("pt-BR") : isoDate;
}

export function renderEventosOutlet(outlet: HTMLElement) {
  outlet.innerHTML = "";
  outlet.className = "scene scene--eventos";

  const wrap = document.createElement("div");
  wrap.className = "eventsPage";

  const headRow = document.createElement("div");
  headRow.className = "eventsHead";

  const title = document.createElement("h2");
  title.className = "eventsTitle";
  title.textContent = "Nossos eventos";

  const linkCadastro = document.createElement("a");
  linkCadastro.href = "#/eventos/cadastro";
  linkCadastro.className = "eventsCadastroLink";
  linkCadastro.textContent = "Cadastrar evento";

  headRow.append(title, linkCadastro);

  const list = document.createElement("div");
  list.className = "eventsList";

  const eventos = loadEventos();
  if (!eventos.length) {
    const empty = document.createElement("p");
    empty.className = "eventsIntro";
    empty.textContent = "Nenhum evento ainda. Use Cadastrar evento para adicionar.";
    list.appendChild(empty);
  } else {
    const sorted = [...eventos].sort((a, b) => (a.data < b.data ? 1 : a.data > b.data ? -1 : 0));
    for (const ev of sorted) {
      list.appendChild(eventCard(ev, () => renderEventosOutlet(outlet)));
    }
  }

  wrap.append(headRow, list);
  outlet.appendChild(wrap);
}

function eventCard(ev: Evento, onDeleted: () => void): HTMLElement {
  const card = document.createElement("article");
  card.className = "eventCard";

  if (ev.imagemUrl) {
    const img = document.createElement("img");
    img.className = "eventCard__img";
    img.src = ev.imagemUrl;
    img.alt = "";
    card.appendChild(img);
  }

  const body = document.createElement("div");
  body.className = "eventCard__body";

  const h = document.createElement("h3");
  h.className = "eventCard__title";
  h.textContent = ev.titulo;

  const date = document.createElement("time");
  date.className = "eventCard__date";
  date.dateTime = ev.data;
  date.textContent = formatEventDate(ev.data);

  const desc = document.createElement("p");
  desc.className = "eventCard__desc";
  desc.textContent = ev.descricao;

  body.append(h, date, desc);

  if (ev.latitude != null && ev.longitude != null) {
    const loc = document.createElement("p");
    loc.className = "eventCard__coords";
    loc.textContent = `Local: ${ev.latitude.toFixed(6)}, ${ev.longitude.toFixed(6)}`;
    body.appendChild(loc);
  }

  const rowActions = document.createElement("div");
  rowActions.className = "eventCard__actions";
  const delBtn = document.createElement("button");
  delBtn.type = "button";
  delBtn.className = "eventCard__delete";
  delBtn.textContent = "Deletar evento";
  delBtn.addEventListener("click", () => {
    if (!confirm("Deletar este evento?")) return;
    removeEventoById(ev.id);
    onDeleted();
  });
  rowActions.appendChild(delBtn);
  body.appendChild(rowActions);

  card.appendChild(body);
  return card;
}
