# fanmap · where they stood 🤍

Um mapa colaborativo de **lugares de fandom** — o café que o artista visitou, a loja onde comprou, a rua onde gravou o MV. Fãs cadastram, outras fãs validam, e dá pra montar **rotas de peregrinação** pra quando você viajar.

Funciona para **qualquer fandom**: escolha o artista/grupo no seletor do topo (já vem com Harry Styles, Taylor Swift e BTS de exemplo) ou crie um novo em **+ novo**.

Feito com HTML/CSS/JS puro + [Leaflet](https://leafletjs.com/) (mapa) + [Supabase](https://supabase.com/) (backend). Site estático.

---

## ✨ Funcionalidades

- 🗺️ **Mapa interativo** com marcadores por categoria (café, restaurante, loja, gravação, show, outro)
- ➕ **Cadastro** de lugares clicando direto no mapa
- ✓ **Validação da comunidade** — 1 voto por pessoa (confirmar / duvidar), com status *verificado · em análise · contestado*
- 🧭 **Rotas de peregrinação** — monte, reordene e trace seu roteiro no mapa
- 🎤 **Multi-fandom** — um seletor no topo troca entre artistas; cada fandom tem seus próprios lugares e rotas
- 📸 **Fotos** nos lugares (via URL), exibidas no card e no detalhe
- 💬 **Comentários & dicas** da comunidade em cada lugar
- 🏙️ **Filtro por cidade** para montar rotas locais
- 🔥 **Aba explorar** — estatísticas do fandom, lugares em alta e recém-adicionados
- 🛂 **Passaporte** — marque os lugares que você já visitou e acompanhe o contador
- 🎧 **Spotify** — player do artista embutido na aba explorar (sem login)

---

## 🚀 Rodando localmente

É um site estático, então basta abrir o `index.html`. Sem o Supabase configurado, ele entra em **modo local** (os dados ficam só no seu navegador) — ótimo pra testar.

Pra evitar problemas de CORS ao carregar os scripts, sirva com um servidor simples:

```bash
# opção 1
python3 -m http.server 8000
# opção 2
npx serve .
```

Depois abra `http://localhost:8000`.

---

## 🔌 Configurar o Supabase (colaboração real)

Pra que os cadastros e votos sejam **compartilhados entre todo mundo**, conecte um backend Supabase (tem plano gratuito). Leva ~5 minutos:

### 1. Crie o projeto
1. Acesse [supabase.com](https://supabase.com/) e crie uma conta (dá pra entrar com o GitHub).
2. Clique em **New project**, dê um nome (ex: `fanmap`), defina uma senha de banco e escolha a região mais próxima. Aguarde ~2 min enquanto provisiona.

### 2. Crie as tabelas
1. No menu lateral, abra o **SQL Editor**.
2. Clique em **New query**.
3. Abra o arquivo [`supabase-schema.sql`](./supabase-schema.sql) deste repositório, copie **todo** o conteúdo e cole no editor.
4. Clique em **Run**. Isso cria as tabelas `places` e `votes`, as funções de voto e de listagem de fandoms, as regras de segurança e já insere lugares iniciais de exemplo (Harry Styles, Taylor Swift e BTS).

### 3. Pegue suas credenciais
1. No menu lateral, vá em **Project Settings → API** (ou **Data API**).
2. Copie dois valores:
   - **Project URL** — algo como `https://xxxxxxxx.supabase.co`
   - **anon public** key — a chave pública (pode ficar exposta; é feita pra isso).

### 4. Cole no app
Abra [`js/config.js`](./js/config.js) e preencha:

```js
window.APP_CONFIG = {
  SUPABASE_URL: "https://xxxxxxxx.supabase.co",
  SUPABASE_ANON_KEY: "sua-anon-key-aqui"
};
```

Salve, recarregue a página — o banner de "modo local" some e a colaboração real está ativa. 🎉

> **É seguro deixar a anon key no código?** Sim. A `anon key` é pública por design. A segurança de verdade vem das *Row Level Security policies* definidas no `supabase-schema.sql`: qualquer um pode **ler** e **criar** lugares e **votar**, mas ninguém consegue apagar ou editar registros pelos bastidores.

---

## 🗂️ Estrutura

```
.
├── index.html            # interface
├── css/styles.css        # estilos
├── js/
│   ├── config.js         # <- suas credenciais do Supabase
│   ├── seed-data.js      # lugares iniciais (usados no modo local)
│   ├── store.js          # camada de dados: Supabase OU localStorage
│   └── app.js            # lógica do mapa, cadastro, validação, rotas
├── supabase-schema.sql   # schema do banco (cole no SQL Editor)
└── README.md
```

---

## 🎧 Vincular um artista do Spotify

Na aba **explorar**, o app mostra um player do Spotify do artista do fandom. Para vincular (ou trocar) o artista, edite o mapa `SPOTIFY_ARTISTS` em [`js/seed-data.js`](./js/seed-data.js):

```js
window.SPOTIFY_ARTISTS = {
  "Harry Styles": "6KImCVD70vtIoJWnq6nGn3",
  "Nome do Fandom": "ID_DO_ARTISTA_NO_SPOTIFY"
};
```

O ID do artista está na URL do Spotify: `open.spotify.com/artist/<ID>`. Fandoms sem mapeamento simplesmente não exibem o player. Não requer login nem API key — usa o player público incorporado.

## 🌱 Ideias futuras

- Fotos dos lugares (upload)
- Login pra reputação de quem cadastra
- Outros artistas / fandoms (o app já é genérico por dentro)
- Filtro por cidade pra montar rotas locais

---

Os lugares iniciais vêm de fontes públicas de imprensa e do fandom; coordenadas são aproximadas. Este é um projeto de fã, sem vínculo oficial. 🤍
