/* ============================================================
   STORE — camada de dados (multi-fandom)
   ------------------------------------------------------------
   Se o config do Supabase estiver preenchido, usa o backend real
   (colaboração entre todos os fãs). Caso contrário, modo LOCAL
   (localStorage) para testes.

   Interface pública (assíncrona salvo indicado):
     Store.mode                       -> "supabase" | "local"
     Store.listArtists()              -> Promise<string[]>
     Store.listPlaces(artist)         -> Promise<Place[]>
     Store.addPlace(data)             -> Promise<Place>
     Store.vote(id, type)             -> Promise<Place>
     Store.myVote(id)                 -> "confirm" | "doubt" | undefined
     Store.listComments(placeId)      -> Promise<Comment[]>
     Store.addComment(placeId, data)  -> Promise<Comment>
     -- passaporte (só neste navegador) --
     Store.isVisited(id)              -> boolean
     Store.toggleVisited(id)          -> boolean  (novo estado)
     Store.visitedCount(placeIds)     -> number   (quantos dos ids foram visitados)
   ============================================================ */
(function () {
  const cfg = window.APP_CONFIG || {};
  const useSupabase = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);

  const CLIENT_KEY = "fanmap-client-id";
  let clientId = localStorage.getItem(CLIENT_KEY);
  if (!clientId) {
    clientId = "c_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(CLIENT_KEY, clientId);
  }

  const VOTES_KEY = "fanmap-votes-v1";
  let myVotes = {};
  try { myVotes = JSON.parse(localStorage.getItem(VOTES_KEY)) || {}; } catch (e) {}
  function saveMyVotes() { localStorage.setItem(VOTES_KEY, JSON.stringify(myVotes)); }

  // Passaporte: lugares que ESTE navegador marcou como "já fui".
  const VISITED_KEY = "fanmap-visited-v1";
  let visited = {};
  try { visited = JSON.parse(localStorage.getItem(VISITED_KEY)) || {}; } catch (e) {}
  function saveVisited() { localStorage.setItem(VISITED_KEY, JSON.stringify(visited)); }

  // Comentários no modo local
  const COMMENTS_KEY = "fanmap-comments-v1";
  function loadLocalComments() {
    try { return JSON.parse(localStorage.getItem(COMMENTS_KEY)) || {}; } catch (e) { return {}; }
  }
  function saveLocalComments(obj) { localStorage.setItem(COMMENTS_KEY, JSON.stringify(obj)); }

  /* ---------------- Passaporte (comum aos dois modos) ---------------- */
  const passport = {
    isVisited(id) { return !!visited[id]; },
    toggleVisited(id) {
      if (visited[id]) delete visited[id];
      else visited[id] = new Date().toISOString();
      saveVisited();
      return !!visited[id];
    },
    visitedCount(ids) {
      if (!ids) return Object.keys(visited).length;
      return ids.filter((id) => visited[id]).length;
    }
  };

  /* ---------------- Helpers Supabase (REST) ---------------- */
  function sbUrl(path) { return cfg.SUPABASE_URL.replace(/\/$/, "") + path; }
  function sbHeaders(extra) {
    return Object.assign({
      "apikey": cfg.SUPABASE_ANON_KEY,
      "Authorization": "Bearer " + cfg.SUPABASE_ANON_KEY,
      "Content-Type": "application/json"
    }, extra || {});
  }
  function fromRow(r) {
    return {
      id: r.id, artist: r.artist, name: r.name, category: r.category, city: r.city,
      address: r.address, lat: r.lat, lng: r.lng, description: r.description,
      link: r.link, photoUrl: r.photo_url, submittedBy: r.submitted_by,
      confirms: r.confirms, doubts: r.doubts, createdAt: r.created_at
    };
  }
  function fromCommentRow(r) {
    return { id: r.id, placeId: r.place_id, author: r.author, body: r.body, createdAt: r.created_at };
  }

  /* ================= MODO SUPABASE ================= */
  const supabaseStore = Object.assign({
    mode: "supabase",
    async listArtists() {
      const res = await fetch(sbUrl("/rest/v1/rpc/list_artists"), {
        method: "POST", headers: sbHeaders(), body: "{}"
      });
      if (!res.ok) return [];
      return (await res.json()).map((r) => r.artist);
    },
    async listPlaces(artist) {
      let path = "/rest/v1/places?select=*&order=created_at.desc";
      if (artist) path += "&artist=eq." + encodeURIComponent(artist);
      const res = await fetch(sbUrl(path), { headers: sbHeaders() });
      if (!res.ok) throw new Error("Falha ao carregar lugares (" + res.status + ")");
      return (await res.json()).map(fromRow);
    },
    async addPlace(data) {
      const row = {
        artist: data.artist, name: data.name, category: data.category, city: data.city,
        address: data.address, lat: data.lat, lng: data.lng,
        description: data.description, link: data.link, photo_url: data.photoUrl || null,
        submitted_by: data.submittedBy || "Anônimo", confirms: 1, doubts: 0
      };
      const res = await fetch(sbUrl("/rest/v1/places"), {
        method: "POST", headers: sbHeaders({ "Prefer": "return=representation" }),
        body: JSON.stringify(row)
      });
      if (!res.ok) throw new Error("Falha ao cadastrar (" + res.status + ")");
      const created = fromRow((await res.json())[0]);
      try { await this.vote(created.id, "confirm"); } catch (e) {}
      return created;
    },
    async vote(id, type) {
      const res = await fetch(sbUrl("/rest/v1/rpc/cast_vote"), {
        method: "POST", headers: sbHeaders(),
        body: JSON.stringify({ p_place_id: id, p_client_id: clientId, p_vote: type })
      });
      if (!res.ok) throw new Error("Falha ao votar (" + res.status + ")");
      myVotes[id] = type; saveMyVotes();
      const one = await fetch(
        sbUrl("/rest/v1/places?select=*&id=eq." + encodeURIComponent(id)),
        { headers: sbHeaders() });
      const rows = await one.json();
      return rows[0] ? fromRow(rows[0]) : null;
    },
    myVote(id) { return myVotes[id]; },
    async listComments(placeId) {
      const res = await fetch(
        sbUrl("/rest/v1/comments?select=*&order=created_at.desc&place_id=eq." + encodeURIComponent(placeId)),
        { headers: sbHeaders() });
      if (!res.ok) return [];
      return (await res.json()).map(fromCommentRow);
    },
    async addComment(placeId, data) {
      const row = { place_id: placeId, author: data.author || "Anônimo", body: data.body };
      const res = await fetch(sbUrl("/rest/v1/comments"), {
        method: "POST", headers: sbHeaders({ "Prefer": "return=representation" }),
        body: JSON.stringify(row) });
      if (!res.ok) throw new Error("Falha ao comentar (" + res.status + ")");
      return fromCommentRow((await res.json())[0]);
    }
  }, passport);

  /* ================= MODO LOCAL ================= */
  const LOCAL_KEY = "fanmap-places-v2";
  const localStore = Object.assign({
    mode: "local",
    _load() {
      const saved = localStorage.getItem(LOCAL_KEY);
      if (saved) { try { return JSON.parse(saved); } catch (e) {} }
      return JSON.parse(JSON.stringify(window.SEED_PLACES || []));
    },
    _save(list) { localStorage.setItem(LOCAL_KEY, JSON.stringify(list)); },
    async listArtists() {
      const set = new Set(window.SEED_ARTISTS || []);
      this._load().forEach((p) => { if (p.artist) set.add(p.artist); });
      return Array.from(set);
    },
    async listPlaces(artist) {
      const list = this._load();
      return artist ? list.filter((p) => p.artist === artist) : list;
    },
    async addPlace(data) {
      const list = this._load();
      const place = {
        id: "user-" + Date.now(), artist: data.artist,
        name: data.name, category: data.category, city: data.city,
        address: data.address, lat: data.lat, lng: data.lng,
        description: data.description, link: data.link, photoUrl: data.photoUrl || "",
        submittedBy: data.submittedBy || "Anônimo",
        createdAt: new Date().toISOString(), confirms: 1, doubts: 0
      };
      list.push(place); this._save(list);
      myVotes[place.id] = "confirm"; saveMyVotes();
      return place;
    },
    async vote(id, type) {
      const list = this._load();
      const p = list.find((x) => x.id === id);
      if (!p) return null;
      const prev = myVotes[id];
      if (prev === type) return p;
      if (prev === "confirm") p.confirms = Math.max(0, p.confirms - 1);
      if (prev === "doubt") p.doubts = Math.max(0, p.doubts - 1);
      if (type === "confirm") p.confirms++;
      if (type === "doubt") p.doubts++;
      myVotes[id] = type; saveMyVotes();
      this._save(list);
      return p;
    },
    myVote(id) { return myVotes[id]; },
    async listComments(placeId) {
      const all = loadLocalComments();
      return (all[placeId] || []).slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    async addComment(placeId, data) {
      const all = loadLocalComments();
      const c = {
        id: "c-" + Date.now(), placeId,
        author: data.author || "Anônimo", body: data.body,
        createdAt: new Date().toISOString()
      };
      (all[placeId] = all[placeId] || []).push(c);
      saveLocalComments(all);
      return c;
    }
  }, passport);

  window.Store = useSupabase ? supabaseStore : localStore;
})();
