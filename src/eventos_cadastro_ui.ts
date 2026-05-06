import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { appendEvento } from "./eventos_storage";

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

let cadastroTeardown: (() => void) | undefined;

export function teardownCadastroMap() {
  cadastroTeardown?.();
  cadastroTeardown = undefined;
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(file);
  });
}

export function renderCadastroOutlet(outlet: HTMLElement) {
  outlet.innerHTML = "";
  outlet.className = "scene scene--cadastro";

  const wrap = document.createElement("div");
  wrap.className = "cadastroPage";

  const title = document.createElement("h2");
  title.className = "eventsTitle cadastroTitle";
  title.textContent = "Cadastro de evento";

  const form = document.createElement("form");
  form.className = "cadastroForm";

  const titulo = inputRow("Título", "text", "titulo", true);
  const dataEv = inputRow("Data", "date", "data", true);
  const desc = textareaRow("Descrição", "descricao");

  const imgWrap = document.createElement("div");
  imgWrap.className = "formRow";
  const imgLbl = document.createElement("label");
  imgLbl.htmlFor = "imagemArquivo";
  imgLbl.textContent = "Imagem (arquivo)";
  const imgFile = document.createElement("input");
  imgFile.type = "file";
  imgFile.id = "imagemArquivo";
  imgFile.accept = "image/*";
  imgWrap.append(imgLbl, imgFile);

  const urlWrap = document.createElement("div");
  urlWrap.className = "formRow";
  const urlLbl = document.createElement("label");
  urlLbl.htmlFor = "imagemUrl";
  urlLbl.textContent = "Ou URL da imagem";
  const urlIn = document.createElement("input");
  urlIn.type = "url";
  urlIn.id = "imagemUrl";
  urlIn.placeholder = "https://…";
  urlWrap.append(urlLbl, urlIn);

  const hintImg = document.createElement("p");
  hintImg.className = "formHint";
  hintImg.textContent = "Se escolher arquivo e URL ao mesmo tempo, o arquivo vale.";

  const mapLbl = document.createElement("p");
  mapLbl.className = "formSectionTitle";
  mapLbl.textContent = "Local exato (latitude e longitude, opcional)";

  const mapHint = document.createElement("p");
  mapHint.className = "formHint";
  mapHint.textContent =
    "Clique no mapa para marcar o ponto (ou use sua localização). Guardamos lat/lng para usar depois.";

  const mapEl = document.createElement("div");
  mapEl.className = "mapPicker";

  const geoBtn = document.createElement("button");
  geoBtn.type = "button";
  geoBtn.className = "btnSecondary";
  geoBtn.textContent = "Usar minha localização";

  const latWrap = document.createElement("div");
  latWrap.className = "formRow formRow--inline";
  const latLbl = document.createElement("label");
  latLbl.htmlFor = "lat";
  latLbl.textContent = "Latitude";
  const latIn = document.createElement("input");
  latIn.type = "text";
  latIn.id = "lat";
  latIn.placeholder = "-23.550520";
  latWrap.append(latLbl, latIn);

  const lngWrap = document.createElement("div");
  lngWrap.className = "formRow formRow--inline";
  const lngLbl = document.createElement("label");
  lngLbl.htmlFor = "lng";
  lngLbl.textContent = "Longitude";
  const lngIn = document.createElement("input");
  lngIn.type = "text";
  lngIn.id = "lng";
  lngIn.placeholder = "-46.633308";
  lngWrap.append(lngLbl, lngIn);

  const actions = document.createElement("div");
  actions.className = "formActions";
  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.className = "btnPrimary";
  submitBtn.textContent = "Salvar evento";
  const cancel = document.createElement("a");
  cancel.href = "#/eventos";
  cancel.className = "btnSecondary btnSecondary--link";
  cancel.textContent = "Cancelar";
  actions.append(submitBtn, cancel);

  form.append(
    titulo.row,
    dataEv.row,
    desc.row,
    imgWrap,
    urlWrap,
    hintImg,
    mapLbl,
    mapHint,
    geoBtn,
    mapEl,
    latWrap,
    lngWrap,
    actions,
  );

  wrap.append(title, form);
  outlet.appendChild(wrap);

  let marker: L.Marker | null = null;

  const syncInputs = (lat: number, lng: number) => {
    latIn.value = lat.toFixed(6);
    lngIn.value = lng.toFixed(6);
  };

  const parseCoords = (): { lat: number; lng: number } | null => {
    if (!latIn.value.trim() || !lngIn.value.trim()) return null;
    const lat = Number(latIn.value.replace(",", "."));
    const lng = Number(lngIn.value.replace(",", "."));
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
    return { lat, lng };
  };

  requestAnimationFrame(() => {
    const map = L.map(mapEl).setView([-14.235, -51.9253], 4);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const wireMarker = (m: L.Marker) => {
      m.on("dragend", () => {
        const p = m.getLatLng();
        syncInputs(p.lat, p.lng);
      });
    };

    map.on("click", (e) => {
      if (!marker) {
        marker = L.marker(e.latlng, { draggable: true }).addTo(map);
        wireMarker(marker);
      } else {
        marker.setLatLng(e.latlng);
      }
      map.panTo(e.latlng);
      syncInputs(e.latlng.lat, e.latlng.lng);
    });

    geoBtn.addEventListener("click", () => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          if (!marker) {
            marker = L.marker([latitude, longitude], { draggable: true }).addTo(map);
            wireMarker(marker);
          } else {
            marker.setLatLng([latitude, longitude]);
          }
          map.setView([latitude, longitude], 14);
          syncInputs(latitude, longitude);
        },
        () => {},
      );
    });

    const applyParsed = () => {
      const c = parseCoords();
      if (!c) return;
      if (!marker) {
        marker = L.marker([c.lat, c.lng], { draggable: true }).addTo(map);
        wireMarker(marker);
      } else {
        marker.setLatLng([c.lat, c.lng]);
      }
      map.panTo([c.lat, c.lng]);
    };
    latIn.addEventListener("change", applyParsed);
    lngIn.addEventListener("change", applyParsed);

    cadastroTeardown = () => {
      map.remove();
      marker = null;
    };

    setTimeout(() => map.invalidateSize(), 120);
  });

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const t = titulo.input.value.trim();
    const d = dataEv.input.value;
    const dc = desc.input.value.trim();
    if (!t || !d) return;

    let imagemUrl: string | null = urlIn.value.trim() || null;
    const file = imgFile.files?.[0];
    if (file) {
      try {
        imagemUrl = await readFileAsDataURL(file);
      } catch {
        imagemUrl = null;
      }
    }

    const coords = parseCoords();
    appendEvento({
      titulo: t,
      descricao: dc,
      data: d,
      imagemUrl,
      latitude: coords ? coords.lat : null,
      longitude: coords ? coords.lng : null,
    });

    location.hash = "#/eventos";
  });
}

function inputRow(label: string, type: string, id: string, required: boolean) {
  const row = document.createElement("div");
  row.className = "formRow";
  const lbl = document.createElement("label");
  lbl.htmlFor = id;
  lbl.textContent = label;
  const input = document.createElement("input");
  input.type = type;
  input.id = id;
  input.required = required;
  row.append(lbl, input);
  return { row, input };
}

function textareaRow(label: string, id: string) {
  const row = document.createElement("div");
  row.className = "formRow";
  const lbl = document.createElement("label");
  lbl.htmlFor = id;
  lbl.textContent = label;
  const input = document.createElement("textarea");
  input.id = id;
  input.rows = 4;
  row.append(lbl, input);
  return { row, input };
}
