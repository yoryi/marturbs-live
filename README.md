# MARTURBS LIVE

MVP premium de plataforma de videollamadas privadas 1-a-1 con sistema de créditos.

## Stack

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 16, React, Tailwind CSS v4, Framer Motion |
| Backend | NestJS, PostgreSQL, TypeORM, JWT |
| Realtime | Socket.io |
| Video | [PeerJS](https://peerjs.com/) (WebRTC P2P) |

## Inicio rápido

### 1. Base de datos (opcional para dev con mock)

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm run start:dev
```

API: `http://localhost:3001`

### 3. Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm run dev
```

App: `http://localhost:3000`

### 4. Servidor PeerJS (videollamadas)

En la raíz del monorepo:

```bash
npm install
npm run dev:peer
```

Señalización en `http://localhost:9000/marturbs`. En `frontend/.env.local`:

```
NEXT_PUBLIC_PEER_HOST=localhost
NEXT_PUBLIC_PEER_PORT=9000
NEXT_PUBLIC_PEER_PATH=/marturbs
NEXT_PUBLIC_PEER_SECURE=false
```

Sin `NEXT_PUBLIC_PEER_HOST`, el frontend usa el cloud de PeerJS (solo para pruebas rápidas).

**Probar una llamada (2 navegadores):**

1. Terminal: `npm run dev:peer`, `npm run dev:api`, `npm run dev:web`
2. Cliente: inicia sesión como `demo@marturbs.live`, entra a una modelo y pulsa llamar
3. Copia el **código de sala** que aparece en pantalla (ej. `call-1-…`)
4. Modelo: `model@marturbs.live` → Panel → pega el código → **Entrar a la sala**
5. Acepta permisos de cámara/micrófono en ambos; el video remoto conecta vía PeerJS

## Credenciales demo

| Rol | Email | Password |
|-----|-------|----------|
| Cliente | demo@marturbs.live | demo1234 |
| Modelo | model@marturbs.live | demo1234 |
| Admin | admin@marturbs.live | admin1234 |

## Estructura

```
marturbs-live/
├── frontend/     # UI premium Next.js
├── backend/      # API NestJS
└── docker-compose.yml
```

## PeerJS en red local (móvil / LAN)

- Frontend: `npm run dev --prefix frontend -- --hostname 0.0.0.0`
- Peer: `PEER_PORT=9000 node scripts/peer-server.cjs` (escucha en `0.0.0.0`)
- `.env.local`: `NEXT_PUBLIC_PEER_HOST=192.168.x.x` (IP de tu Mac)

## LiveKit (opcional / legacy)

El backend aún incluye módulo LiveKit; las llamadas del MVP usan PeerJS. Para LiveKit, configura `backend/.env` con `LIVEKIT_*`.
