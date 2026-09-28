/* ============================================================
   fanmap — app principal
   Usa window.Store (js/store.js) como fonte de dados:
   Supabase (colaboração real) ou localStorage (modo teste).
   ============================================================ */

const CATEGORIES = {
  cafe:        { label: "café",       icon: "☕", color: "#a88b6d" },
  restaurante: { label: "restaurante",icon: "🍽", color: "#b08a86" },
  loja:        { label: "loja",       icon: "🛍", color: "#93889f" },
  gravacao:    { label: "gravação",   icon: "🎬", color: "#a89a74" },
  show:        { label: "show",       icon: "🎤", color: "#b3899b" },
  outro:       { label: "outro",      icon: "📍", color: "#8a9aa3" }
};

/* ---------- Estado ---------- */
let places = [];
let activeCategories = new Set(Object.keys(CATEGORIES));
let searchTerm = "";
let sortMode = "confirmed";
let route = [];
let markers = {};
let routeLine = null;
let pickMode = false;
let currentArtist = null;   // fandom selecionado no momento
let artists = [];           // lista de fandoms conhecidos

const ARTIST_KEY = "fanmap-current-artist";

/* ============================================================
   MAPA
   ============================================================ */
const map = L.map("map", { zoomControl: true }).setView([51.515, -0.13], 6);
L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap &copy; CARTO'
}).addTo(map);

map.on("click", (e) => {
  if (!pickMode) return;
  document.getElementById("lat").value = e.latlng.lat.toFixed(5);
  document.getElementById("lng").value = e.latlng.lng.toFixed(5);
  const help = document.getElementById("coords-help");
  help.textContent = `ponto marcado · ${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`;
  help.classList.add("picked");
});

function makeIcon(category) {
  const c = CATEGORIES[category] || CATEGORIES.outro;
  return L.divIcon({
    className: "",
    html: `<div class="pin" style="background:${c.color}"><span>${c.icon}</span></div>`,
    iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -28]
  });
}

function renderMarkers() {
  Object.values(markers).forEach((m) => map.removeLayer(m));
  markers = {};
  visiblePlaces().forEach((p) => {
    const marker = L.marker([p.lat, p.lng], { icon: makeIcon(p.category) })
      .addTo(map)
      .bindTooltip(p.name, { direction: "top" });
    marker.on("click", () => openModal(p.id));
    markers[p.id] = marker;
  });
}

/* ============================================================
   STATUS / FILTRO / ORDENAÇÃO
   ============================================================ */
function statusOf(p) {
  const score = p.confirms - p.doubts;
  if (p.confirms >= 5 && score >= 3) return { label: "verificado", cls: "status-verified" };
  if (p.doubts > p.confirms)         return { label: "contestado", cls: "status-disputed" };
  return { label: "em análise", cls: "status-pending" };
}

function visiblePlaces() {
  let list = places.filter((p) => activeCategories.has(p.category));
  if (searchTerm) {
    const t = searchTerm.toLowerCase();
    list = list.filter((p) =>
      p.name.toLowerCase().includes(t) ||
      (p.city || "").toLowerCase().includes(t) ||
      (p.address || "").toLowerCase().includes(t));
  }
  list.sort((a, b) => {
    if (sortMode === "recent") return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortMode === "name") return a.name.localeCompare(b.name);
    return (b.confirms - b.doubts) - (a.confirms - a.doubts);
  });
  return list;
}

/* ============================================================
   LISTA
   ============================================================ */
function renderList() {
  const ul = document.getElementById("places-list");
  const list = visiblePlaces();
  document.getElementById("places-count").textContent =
    `${list.length} ${list.length === 1 ? "lugar" : "lugares"}`;
  ul.innerHTML = "";

  if (list.length === 0) {
    ul.innerHTML = `<li class="hint" style="padding:20px 4px">nenhum lugar com esses filtros.</li>`;
    return;
  }

  list.forEach((p) => {
    const cat = CATEGORIES[p.category] || CATEGORIES.outro;
    const st = statusOf(p);
    const inRoute = route.includes(p.id);
    const li = document.createElement("li");
    li.className = "place-card";
    li.innerHTML = `
      <div class="top">
        <div>
          <h3>${escapeHtml(p.name)}</h3>
          <div class="city">${escapeHtml(p.city || "")} <span class="status-pill ${st.cls}">${st.label}</span></div>
        </div>
        <span class="cat-badge" style="background:${cat.color}">${cat.label}</span>
      </div>
      <div class="stats">
        <span class="stat-confirm">✓ ${p.confirms}</span>
        <span class="stat-doubt">✕ ${p.doubts}</span>
      </div>
      <div class="form-actions" style="margin-top:14px">
        <button class="btn ghost small" data-act="details">ver / validar</button>
        <button class="btn ${inRoute ? "ghost" : "primary"} small" data-act="route">
          ${inRoute ? "✓ na rota" : "+ rota"}
        </button>
      </div>`;
    li.querySelector('[data-act="details"]').addEventListener("click", (e) => { e.stopPropagation(); openModal(p.id); });
    li.querySelector('[data-act="route"]').addEventListener("click", (e) => { e.stopPropagation(); toggleRoute(p.id); });
    li.addEventListener("click", () => focusPlace(p.id));
    ul.appendChild(li);
  });
}

function focusPlace(id) {
  const p = places.find((x) => x.id === id);
  if (!p) return;
  map.setView([p.lat, p.lng], 14, { animate: true });
  if (markers[id]) markers[id].openTooltip();
}

/* ============================================================
   CHIPS
   ============================================================ */
function renderChips() {
  const box = document.getElementById("category-filters");
  box.innerHTML = "";
  Object.entries(CATEGORIES).forEach(([key, c]) => {
    const chip = document.createElement("span");
    const active = activeCategories.has(key);
    chip.className = "chip" + (active ? " active" : "");
    chip.textContent = c.label;
    if (active) chip.style.background = c.color;
    chip.addEventListener("click", () => {
      if (activeCategories.has(key)) activeCategories.delete(key);
      else activeCategories.add(key);
      renderChips(); renderList(); renderMarkers();
    });
    box.appendChild(chip);
  });
}

/* ============================================================
   MODAL + VALIDAÇÃO
   ============================================================ */
function openModal(id) {
  const p = places.find((x) => x.id === id);
  if (!p) return;
  const cat = CATEGORIES[p.category] || CATEGORIES.outro;
  const st = statusOf(p);
  const myVote = Store.myVote(id);

  const body = document.getElementById("modal-body");
  body.innerHTML = `
    <span class="cat-badge" style="background:${cat.color}">${cat.label}</span>
    <span class="status-pill ${st.cls}">${st.label}</span>
    <h2>${escapeHtml(p.name)}</h2>
    <div class="modal-meta">
      ${escapeHtml(p.address || "sem endereço")}<br/>
      ${escapeHtml(p.city || "—")}
    </div>
    <p class="modal-desc">${escapeHtml(p.description || "")}</p>
    ${p.link ? `<a class="modal-link" href="${escapeAttr(p.link)}" target="_blank" rel="noopener">ver referência ↗</a>` : ""}
    <div class="modal-meta">
      enviado por <strong>${escapeHtml(p.submittedBy || "anônimo")}</strong> ·
      ✓ ${p.confirms} confirmam · ✕ ${p.doubts} duvidam
    </div>
    <div class="validate-row">
      <button class="btn confirm" id="btn-confirm" ${myVote === "confirm" ? "disabled" : ""}>
        ${myVote === "confirm" ? "✓ você confirmou" : "✓ confirmo"}
      </button>
      <button class="btn doubt" id="btn-doubt" ${myVote === "doubt" ? "disabled" : ""}>
        ${myVote === "doubt" ? "✕ você duvidou" : "✕ tenho dúvidas"}
      </button>
    </div>
    <div class="form-actions">
      <button class="btn ghost small" id="btn-goto">centralizar</button>
      ${route.includes(id)
        ? `<button class="btn ghost small" id="btn-route">✓ remover da rota</button>`
        : `<button class="btn primary small" id="btn-route">+ adicionar à rota</button>`}
    </div>`;

  const cBtn = body.querySelector("#btn-confirm");
  const dBtn = body.querySelector("#btn-doubt");
  if (cBtn) cBtn.addEventListener("click", () => vote(id, "confirm"));
  if (dBtn) dBtn.addEventListener("click", () => vote(id, "doubt"));
  body.querySelector("#btn-goto").addEventListener("click", () => { closeModal(); focusPlace(id); });
  body.querySelector("#btn-route").addEventListener("click", () => { toggleRoute(id); openModal(id); });

  document.getElementById("modal").classList.remove("hidden");
}
function closeModal() { document.getElementById("modal").classList.add("hidden"); }

async function vote(id, type) {
  if (Store.myVote(id) === type) return;
  // desabilita botões enquanto processa
  const cBtn = document.getElementById("btn-confirm");
  const dBtn = document.getElementById("btn-doubt");
  if (cBtn) cBtn.disabled = true;
  if (dBtn) dBtn.disabled = true;
  try {
    const updated = await Store.vote(id, type);
    if (updated) {
      const idx = places.findIndex((x) => x.id === id);
      if (idx >= 0) places[idx] = Object.assign(places[idx], updated);
    }
    renderList(); renderMarkers(); openModal(id);
    toast(type === "confirm" ? "obrigada por confirmar 🤍" : "registrado. a comunidade decide.");
  } catch (err) {
    toast("erro ao votar: " + err.message);
    openModal(id);
  }
}

/* ============================================================
   ROTAS
   ============================================================ */
function toggleRoute(id) {
  const i = route.indexOf(id);
  if (i >= 0) route.splice(i, 1); else route.push(id);
  renderRoute(); renderList();
  toast(i >= 0 ? "removido da rota." : "adicionado à rota 🧭");
}

function renderRoute() {
  const ol = document.getElementById("route-list");
  const empty = document.getElementById("route-empty");
  const summary = document.getElementById("route-summary");
  ol.innerHTML = "";

  if (route.length === 0) {
    empty.style.display = "block"; summary.textContent = "";
    if (routeLine) { map.removeLayer(routeLine); routeLine = null; }
    return;
  }
  empty.style.display = "none";

  route.forEach((id, idx) => {
    const p = places.find((x) => x.id === id);
    if (!p) return;
    const cat = CATEGORIES[p.category] || CATEGORIES.outro;
    const li = document.createElement("li");
    li.className = "route-item";
    li.innerHTML = `
      <div class="r-body">
        <div class="r-name">${escapeHtml(p.name)}</div>
        <div class="r-city">${cat.label} · ${escapeHtml(p.city || "")}</div>
      </div>
      <div class="route-controls">
        <button class="icon-btn" data-act="up" ${idx === 0 ? "disabled" : ""}>↑</button>
        <button class="icon-btn" data-act="down" ${idx === route.length - 1 ? "disabled" : ""}>↓</button>
        <button class="icon-btn" data-act="rm">✕</button>
      </div>`;
    li.querySelector('[data-act="up"]').addEventListener("click", () => moveRoute(idx, -1));
    li.querySelector('[data-act="down"]').addEventListener("click", () => moveRoute(idx, 1));
    li.querySelector('[data-act="rm"]').addEventListener("click", () => toggleRoute(id));
    ol.appendChild(li);
  });

  const dist = routeDistanceKm();
  summary.innerHTML = `<strong>${route.length}</strong> paradas · aprox. <strong>${dist.toFixed(1)} km</strong> em linha reta`;
}

function moveRoute(idx, dir) {
  const j = idx + dir;
  if (j < 0 || j >= route.length) return;
  [route[idx], route[j]] = [route[j], route[idx]];
  renderRoute();
}
function routeDistanceKm() {
  let total = 0;
  for (let i = 0; i < route.length - 1; i++) {
    const a = places.find((x) => x.id === route[i]);
    const b = places.find((x) => x.id === route[i + 1]);
    if (a && b) total += haversine(a.lat, a.lng, b.lat, b.lng);
  }
  return total;
}
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function drawRoute() {
  if (route.length < 1) { toast("adicione lugares à rota primeiro."); return; }
  if (routeLine) map.removeLayer(routeLine);
  const pts = route.map((id) => {
    const p = places.find((x) => x.id === id);
    return p ? [p.lat, p.lng] : null;
  }).filter(Boolean);
  routeLine = L.polyline(pts, { color: "#7a6f5d", weight: 3, dashArray: "6 8", opacity: .9 }).addTo(map);
  map.fitBounds(routeLine.getBounds(), { padding: [60, 60] });
  switchView("map");
  toast("rota traçada 🧭");
}
function clearRoute() {
  route = [];
  if (routeLine) { map.removeLayer(routeLine); routeLine = null; }
  renderRoute(); renderList();
}

/* ============================================================
   CADASTRO
   ============================================================ */
document.getElementById("add-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;
  const lat = parseFloat(f.lat.value);
  const lng = parseFloat(f.lng.value);
  if (isNaN(lat) || isNaN(lng)) { toast("coordenadas inválidas."); return; }

  const btn = document.getElementById("submit-add");
  btn.disabled = true; btn.textContent = "salvando...";
  try {
    const created = await Store.addPlace({
      artist: currentArtist,
      name: f.name.value.trim(),
      category: f.category.value,
      city: f.city.value.trim(),
      address: f.address.value.trim(),
      lat, lng,
      description: f.description.value.trim(),
      link: f.link.value.trim(),
      submittedBy: f.submittedBy.value.trim() || "anônimo"
    });
    places.unshift(created);
    f.reset();
    const help = document.getElementById("coords-help");
    help.textContent = "clique no mapa para preencher as coordenadas";
    help.classList.remove("picked");
    pickMode = false;
    renderList(); renderChips(); renderMarkers();
    switchView("map");
    focusPlace(created.id);
    toast("lugar cadastrado 🤍 agora é aguardar a validação da comunidade.");
  } catch (err) {
    toast("erro ao cadastrar: " + err.message);
  } finally {
    btn.disabled = false; btn.textContent = "cadastrar";
  }
});

document.getElementById("cancel-add").addEventListener("click", () => {
  document.getElementById("add-form").reset();
  pickMode = false;
  switchView("map");
});

/* ============================================================
   NAVEGAÇÃO
   ============================================================ */
function switchView(view) {
  document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.view === view));
  document.querySelectorAll(".view").forEach((v) => v.classList.toggle("active", v.id === "view-" + view));
  pickMode = (view === "add");
  if (pickMode) toast("clique no mapa para marcar a localização 📍");
  setTimeout(() => map.invalidateSize(), 100);
}
document.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => switchView(t.dataset.view)));

/* ============================================================
   UTIL
   ============================================================ */
function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function escapeAttr(s) { return escapeHtml(s).replace(/`/g, "&#96;"); }

let toastTimer;
function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add("hidden"), 2800);
}

/* ---------- Listeners globais ---------- */
document.getElementById("search").addEventListener("input", (e) => {
  searchTerm = e.target.value; renderList(); renderMarkers();
});
document.getElementById("sort").addEventListener("change", (e) => {
  sortMode = e.target.value; renderList();
});
document.getElementById("modal-close").addEventListener("click", closeModal);
document.getElementById("modal").addEventListener("click", (e) => { if (e.target.id === "modal") closeModal(); });
document.getElementById("draw-route").addEventListener("click", drawRoute);
document.getElementById("clear-route").addEventListener("click", clearRoute);

/* ============================================================
   FANDOMS (multi-artista)
   ============================================================ */
function renderArtistSelect() {
  const sel = document.getElementById("artist-select");
  sel.innerHTML = "";
  artists.forEach((a) => {
    const opt = document.createElement("option");
    opt.value = a; opt.textContent = a;
    if (a === currentArtist) opt.selected = true;
    sel.appendChild(opt);
  });
}

async function loadPlacesForArtist() {
  document.getElementById("places-list").innerHTML = `<li class="loading">carregando lugares…</li>`;
  // rota é por-fandom: limpa ao trocar
  clearRoute();
  try {
    places = await Store.listPlaces(currentArtist);
  } catch (err) {
    places = [];
    toast("erro ao carregar: " + err.message);
  }
  renderList();
  renderMarkers();
  // enquadra o mapa nos lugares do fandom, se houver
  if (places.length) {
    const bounds = L.latLngBounds(places.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 13 });
  }
}

document.getElementById("artist-select").addEventListener("change", (e) => {
  currentArtist = e.target.value;
  localStorage.setItem(ARTIST_KEY, currentArtist);
  loadPlacesForArtist();
});

document.getElementById("new-fandom").addEventListener("click", () => {
  const name = (prompt("Nome do artista / grupo do novo fandom:") || "").trim();
  if (!name) return;
  if (!artists.includes(name)) { artists.push(name); artists.sort(); }
  currentArtist = name;
  localStorage.setItem(ARTIST_KEY, currentArtist);
  renderArtistSelect();
  loadPlacesForArtist();
  switchView("add");
  toast(`fandom "${name}" criado 🤍 cadastre o primeiro lugar!`);
});

/* ============================================================
   INIT
   ============================================================ */
async function init() {
  // banner de modo
  const banner = document.getElementById("mode-banner");
  if (Store.mode === "local") {
    banner.classList.remove("hidden");
    banner.innerHTML = "modo local · os dados ficam só neste navegador. conecte o supabase (veja o README) para colaboração real entre fãs.";
  } else {
    banner.classList.add("hidden");
  }

  renderChips();

  // carrega a lista de fandoms
  try {
    artists = await Store.listArtists();
  } catch (err) {
    artists = [];
  }
  if (!artists.length) artists = ["Harry Styles"];

  // fandom salvo, senão o primeiro
  const saved = localStorage.getItem(ARTIST_KEY);
  currentArtist = (saved && artists.includes(saved)) ? saved : artists[0];

  renderArtistSelect();
  await loadPlacesForArtist();
  renderRoute();
}
init();
