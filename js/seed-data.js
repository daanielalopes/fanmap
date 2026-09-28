/**
 * Dados iniciais (seed) — usados no MODO LOCAL (sem Supabase).
 * Multi-fandom: cada lugar tem um campo `artist`.
 * Fontes públicas de imprensa/fandom. Coordenadas aproximadas.
 */
window.SEED_PLACES = [
  /* ---------------- Harry Styles ---------------- */
  {
    id: "seed-hs-kaffeine", artist: "Harry Styles", name: "Kaffeine", category: "cafe",
    city: "Londres, Reino Unido", address: "66 Great Titchfield St, Fitzrovia, W1W 7QJ",
    lat: 51.5185, lng: -0.1400,
    description: "Chamado pelo próprio Harry de seu café favorito. Em 2026 ele pagou o café de fãs que visitaram o local para comemorar a turnê.",
    link: "https://www.standard.co.uk/showbiz/harry-styles-together-tour-2027-london-coffee-b1297492.html",
    submittedBy: "equipe", createdAt: "2026-01-10T10:00:00Z", confirms: 42, doubts: 1
  },
  {
    id: "seed-hs-howmatcha", artist: "Harry Styles", name: "How Matcha!", category: "cafe",
    city: "Londres, Reino Unido", address: "Blandford Street, Marylebone",
    lat: 51.5178, lng: -0.1533,
    description: "Café de matchá em Marylebone conhecido pelas combinações de sabores; o cantor já foi visto por lá.",
    link: "https://www.cntraveller.com/article/harry-styles-guide-to-london",
    submittedBy: "equipe", createdAt: "2026-01-10T10:05:00Z", confirms: 18, doubts: 3
  },
  {
    id: "seed-hs-ritas", artist: "Harry Styles", name: "Rita's Soho", category: "restaurante",
    city: "Londres, Reino Unido", address: "Soho, Londres",
    lat: 51.5138, lng: -0.1330,
    description: "Bistrô de estilo americano no Soho. Já recebeu Harry Styles e Zoë Kravitz em um jantar.",
    link: "https://uk.news.yahoo.com/inside-excellent-gorgeous-london-restaurant-040000048.html",
    submittedBy: "equipe", createdAt: "2026-01-10T10:10:00Z", confirms: 14, doubts: 2
  },
  {
    id: "seed-hs-saydoughnuts", artist: "Harry Styles", name: "SAY Doughnuts", category: "loja",
    city: "Bedford, Reino Unido", address: "Bedford, Inglaterra",
    lat: 52.1360, lng: -0.4666,
    description: "Loja de donuts em Bedford onde Harry virou 'meio que um cliente frequente' segundo os donos.",
    link: "https://www.yahoo.com/entertainment/celebrity/articles/harry-styles-bit-regular-local-190217668.html",
    submittedBy: "equipe", createdAt: "2026-01-10T10:15:00Z", confirms: 27, doubts: 0
  },
  {
    id: "seed-hs-dauntbooks", artist: "Harry Styles", name: "Daunt Books Marylebone", category: "loja",
    city: "Londres, Reino Unido", address: "83 Marylebone High St, W1U 4QW",
    lat: 51.5205, lng: -0.1520,
    description: "Livraria eduardiana clássica em Marylebone, citada em guias sobre a Londres do Harry.",
    link: "https://www.vogue.co.uk/article/harry-styles-london",
    submittedBy: "equipe", createdAt: "2026-01-10T10:20:00Z", confirms: 9, doubts: 1
  },
  {
    id: "seed-hs-hampstead", artist: "Harry Styles", name: "Hampstead Heath (Men's Pond)", category: "outro",
    city: "Londres, Reino Unido", address: "Hampstead Heath, Londres",
    lat: 51.5608, lng: -0.1607,
    description: "Parque enorme no norte de Londres. Harry já foi visto nadando no Men's Pond, como muitos londrinos.",
    link: "https://www.cntraveller.com/article/harry-styles-guide-to-london",
    submittedBy: "equipe", createdAt: "2026-01-10T10:25:00Z", confirms: 21, doubts: 4
  },
  {
    id: "seed-hs-barbican", artist: "Harry Styles", name: "Barbican Estate", category: "gravacao",
    city: "Londres, Reino Unido", address: "Barbican, City of London, EC2Y",
    lat: 51.5200, lng: -0.0937,
    description: "O clipe de 'As It Was' abre com Harry no complexo brutalista do Barbican, no centro de Londres.",
    link: "https://www.capitalfm.com/news/harry-styles-as-it-was-music-video-location/",
    submittedBy: "equipe", createdAt: "2026-01-10T10:30:00Z", confirms: 55, doubts: 0
  },
  {
    id: "seed-hs-skye", artist: "Harry Styles", name: "Isle of Skye", category: "gravacao",
    city: "Escócia, Reino Unido", address: "Ilha de Skye, Terras Altas da Escócia",
    lat: 57.2736, lng: -6.2155,
    description: "As paisagens épicas do clipe de 'Sign of the Times' foram filmadas na Ilha de Skye, na Escócia.",
    link: "https://www.sonymusic.co.uk/harry-styles-premieres-sign-of-the-times-music-video/",
    submittedBy: "equipe", createdAt: "2026-01-10T10:35:00Z", confirms: 33, doubts: 1
  },
  {
    id: "seed-hs-golden", artist: "Harry Styles", name: "Costa Amalfitana", category: "gravacao",
    city: "Amalfi, Itália", address: "Costa Amalfitana, Itália",
    lat: 40.6340, lng: 14.6027,
    description: "O clipe de 'Golden' mostra Harry correndo, nadando e dirigindo pela deslumbrante Costa Amalfitana.",
    link: "https://www.sportskeeda.com/us/music/where-harry-styles-golden-video-filmed-shooting-locations-fine-line-song-mv-explored",
    submittedBy: "equipe", createdAt: "2026-01-10T10:40:00Z", confirms: 24, doubts: 2
  },
  {
    id: "seed-hs-malibu", artist: "Harry Styles", name: "Praia de Malibu", category: "gravacao",
    city: "Malibu, Califórnia, EUA", address: "Malibu, Califórnia",
    lat: 34.0359, lng: -118.6905,
    description: "Clipe de 'Watermelon Sugar' foi gravado em uma praia de Malibu — a mesma de 'What Makes You Beautiful' (2011).",
    link: "https://www.capitalfm.com/artists/harry-styles/watermelon-sugar-video-what-makes-you-beautiful/",
    submittedBy: "equipe", createdAt: "2026-01-10T10:45:00Z", confirms: 30, doubts: 3
  },

  /* ---------------- Taylor Swift ---------------- */
  {
    id: "seed-ts-cornelia", artist: "Taylor Swift", name: "Cornelia Street", category: "outro",
    city: "Nova York, EUA", address: "Cornelia Street, West Village, Manhattan",
    lat: 40.7317, lng: -74.0033,
    description: "Rua do West Village onde Taylor morou em uma casa alugada; virou nome de música em 'Lover'.",
    link: "https://en.wikipedia.org/wiki/Cornelia_Street_(song)",
    submittedBy: "equipe", createdAt: "2026-01-11T10:00:00Z", confirms: 48, doubts: 1
  },
  {
    id: "seed-ts-nyc", artist: "Taylor Swift", name: "West Village (era 1989)", category: "outro",
    city: "Nova York, EUA", address: "West Village, Manhattan",
    lat: 40.7358, lng: -74.0036,
    description: "Bairro fortemente associado à Taylor na era 1989; ponto de peregrinação de Swifties em NY.",
    link: "",
    submittedBy: "equipe", createdAt: "2026-01-11T10:05:00Z", confirms: 15, doubts: 2
  },

  /* ---------------- BTS ---------------- */
  {
    id: "seed-bts-hybe", artist: "BTS", name: "Área de Yongsan (HYBE)", category: "outro",
    city: "Seul, Coreia do Sul", address: "Yongsan-gu, Seul",
    lat: 37.5299, lng: 126.9648,
    description: "Região da sede da HYBE em Seul, parada frequente de fãs (ARMY) em roteiros pela cidade.",
    link: "",
    submittedBy: "equipe", createdAt: "2026-01-12T10:00:00Z", confirms: 12, doubts: 1
  },
  {
    id: "seed-bts-gyeongbok", artist: "BTS", name: "Gyeongbokgung", category: "gravacao",
    city: "Seul, Coreia do Sul", address: "161 Sajik-ro, Jongno-gu, Seul",
    lat: 37.5796, lng: 126.9770,
    description: "Palácio histórico que já apareceu em conteúdos do grupo; visita clássica de quem vai a Seul.",
    link: "",
    submittedBy: "equipe", createdAt: "2026-01-12T10:05:00Z", confirms: 9, doubts: 0
  }
];

/* Fandoms sugeridos que aparecem no seletor mesmo sem lugares ainda. */
window.SEED_ARTISTS = ["Harry Styles", "Taylor Swift", "BTS"];

/**
 * Integração com o Spotify (player embed, sem login/OAuth).
 * Mapeia o nome do fandom -> ID do artista no Spotify.
 * O embed é montado como: https://open.spotify.com/embed/artist/<ID>
 * Fandoms sem mapeamento simplesmente não exibem o player.
 * Para adicionar: abra o artista no Spotify, copie o ID da URL
 * (open.spotify.com/artist/<ID>) e coloque aqui.
 */
window.SPOTIFY_ARTISTS = {
  "Harry Styles": "6KImCVD70vtIoJWnq6nGn3",
  "Taylor Swift": "06HL4z0CvFAxyc27GXpf02",
  "BTS": "3Nrfpe0tUJi4K4DXYWgMUX"
};
