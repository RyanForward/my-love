import { eventoToWesternHoroscopePayload, fetchWesternHoroscope } from "./astrology_api";
import { eventDatetimeAttr, formatEventDateTime } from "./eventos_display";
import { checarSenha, isUnlocked, senhaConfigurada, unlock } from "./eventos_auth";
import { loadEventos, removeEventoById } from "./eventos_storage";
import type { Evento } from "./eventos_types";
import { appendWesternHoroscopeView } from "./western_horoscope_render";

function openHoroscopeDialog(titulo: string, data: unknown) {
  const dlg = document.createElement("dialog");
  dlg.className = "horoscopeDialog";
  const h = document.createElement("h3");
  h.className = "horoscopeDialog__title";
  h.textContent = `Mapa astral — ${titulo}`;
  const body = document.createElement("div");
  body.className = "horoscopeDialog__body";
  const structured = appendWesternHoroscopeView(body, data);
  if (!structured) {
    const pre = document.createElement("pre");
    pre.className = "horoscopeDialog__json";
    pre.textContent = JSON.stringify(data, null, 2);
    body.appendChild(pre);
  }
  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.textContent = "Fechar";
  closeBtn.className = "btnPrimary horoscopeDialog__close";
  closeBtn.addEventListener("click", () => dlg.close());
  dlg.addEventListener("close", () => dlg.remove());
  dlg.append(h, body, closeBtn);
  document.body.appendChild(dlg);
  dlg.showModal();
}

export async function renderEventosOutlet(outlet: HTMLElement) {
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
  const loading = document.createElement("p");
  loading.className = "eventsIntro";
  loading.textContent = "Carregando eventos…";
  list.appendChild(loading);

  wrap.append(headRow, list);
  outlet.appendChild(wrap);

  let eventos: Evento[];
  try {
    eventos = await loadEventos();
  } catch (err) {
    list.innerHTML = "";
    const errMsg = document.createElement("p");
    errMsg.className = "eventsIntro";
    errMsg.textContent = `Erro ao carregar eventos: ${err instanceof Error ? err.message : String(err)}`;
    list.appendChild(errMsg);
    return;
  }

  list.innerHTML = "";
  if (!eventos.length) {
    const empty = document.createElement("p");
    empty.className = "eventsIntro";
    empty.textContent = "Nenhum evento ainda. Use Cadastrar evento para adicionar.";
    list.appendChild(empty);
  } else {
    const sorted = [...eventos].sort((a, b) => {
      if (a.data !== b.data) return a.data < b.data ? 1 : -1;
      const ta = a.horario ?? "";
      const tb = b.horario ?? "";
      return tb.localeCompare(ta);
    });
    for (const ev of sorted) {
      list.appendChild(eventCard(ev, () => void renderEventosOutlet(outlet)));
    }
  }
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
  date.dateTime = eventDatetimeAttr(ev);
  date.textContent = formatEventDateTime(ev);

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

  const chartBtn = document.createElement("button");
  chartBtn.type = "button";
  chartBtn.className = "eventCard__chart";
  chartBtn.textContent = "Mapa astral";
  const canChart = ev.latitude != null && ev.longitude != null;
  chartBtn.disabled = !canChart;
  chartBtn.title = canChart
    ? "Buscar mapa na AstrologyAPI"
    : "Cadastre latitude e longitude para usar a API";
  chartBtn.addEventListener("click", async () => {
    const payload = eventoToWesternHoroscopePayload(ev);
    if (!payload) return;
    chartBtn.disabled = true;
    const prev = chartBtn.textContent;
    chartBtn.textContent = "Carregando…";
    try {
      const data = await fetchWesternHoroscope(payload);
      openHoroscopeDialog(ev.titulo, data);
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      chartBtn.disabled = !canChart;
      chartBtn.textContent = prev ?? "Mapa astral";
    }
  });

  const delBtn = document.createElement("button");
  delBtn.type = "button";
  delBtn.className = "eventCard__delete";
  delBtn.textContent = "Deletar evento";
  delBtn.addEventListener("click", async () => {
    if (!senhaConfigurada()) {
      alert("Defina VITE_EVENTOS_PASSWORD nas variáveis de ambiente para habilitar a exclusão.");
      return;
    }
    if (!isUnlocked()) {
      const senha = prompt("Senha para deletar o evento:");
      if (senha === null) return;
      if (!checarSenha(senha)) {
        alert("Senha incorreta.");
        return;
      }
      unlock();
    }
    if (!confirm("Deletar este evento?")) return;
    delBtn.disabled = true;
    try {
      await removeEventoById(ev.id);
      onDeleted();
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
      delBtn.disabled = false;
    }
  });

  rowActions.append(chartBtn, delBtn);
  body.appendChild(rowActions);

  card.appendChild(body);
  return card;
}
