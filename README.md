# PDW-Votaciones (Frontend)

Aplicación web (SPA) para **registro**, **inicio de sesión**, **listado de campañas** y **votación de candidatos**. Construida con **React + Vite + TypeScript + SASS/SCSS** y **Bootstrap**.

Link en vercel: https://electoral-sys-frontend.vercel.app/
---
## Links de Manual técnico y de usuario

1. Manual Usuario: https://umgt-my.sharepoint.com/:b:/g/personal/govandoh_miumg_edu_gt/EYQ6nLAk4Y1Gvy4CLXq-ozABykKoOiw9EeKcetEhHNNHSg?e=8fXfeO
2. Manual Técnico: https://umgt-my.sharepoint.com/:b:/g/personal/govandoh_miumg_edu_gt/EcVINpV8o8RLg4prGDxpOv4BF4ecfhwmnNpnLQ-V0oZyOg?e=qa9qQl
   
---

## 🚀 Características

- Rutas públicas (Login/Registro) y privadas (Dashboard/Resultados)
- Autenticación con **Context API** (token + usuario)
- Servicios HTTP centralizados (cliente con `Authorization`)
- UI reutilizable (Toast, Navbar, Cards, Forms)
- Estilos modulares con **SASS/SCSS** (arquitectura por parciales)

---

## 🧱 Stack

- **React 18** + **Vite**
- **TypeScript**
- **SASS/SCSS** (módulos con `@use`/`@forward`)
- **Bootstrap** + **Bootstrap Icons**
- **React Router**

---

## 📁 Estructura de carpetas
electoral-sys-frontend/
├─ public/
├─ src/
│ ├─ components/ # UI reutilizable (Toast, Navbar, Cards, etc.)
│ ├─ context/ # AuthContext (estado, token, login/logout)
│ ├─ hooks/ # useAuth, useForm, useFetch<T> (según se use)
│ ├─ pages/ # Login, Register, Dashboard, Results, NotFound
│ ├─ services/ # apiClient, auth.service, campaign.service, vote.service
│ ├─ styles/ # main.scss + abstracts/ base/ components/ layout/ pages/
│ ├─ types/ # interfaces TS (User, Campaign, Candidate, Vote, ApiResponse)
│ ├─ utils/ # helpers varios
│ ├─ App.tsx
│ └─ main.tsx
├─ index.html
├─ package.json
├─ tsconfig.json
└─ vite.config.ts


> Convención: importaciones con alias `@` → `src` (p. ej. `@/services/auth.service`).
---
## ⚙️ Requisitos
- **Node.js 18+** (recomendado 20+)
- **npm** (o **pnpm**/**yarn**)
---
## 🛠️ Instalación y configuración
1) Clonar e instalar:
```bash
git clone https://github.com/govandoh/PDW-votaciones-frontend.git
cd PDW-votaciones-frontend/electoral-sys-frontend
npm ci   # o: npm install

# URL base del backend (sin slash final)
VITE_API_BASE_URL=http://localhost:5000/api
npm run dev       # desarrollo (Vite)
npm run build     # build de producción (dist/)
npm run preview   # sirve el build localmente
# opcional si existen:
npm run lint
npm run format
```

🧩 Arquitectura funcional
Rutas

- Públicas: /login, /register
- Privadas: /dashboard, /results/:campaignId
- Fallback: * → NotFound / ErrorPage

Contexto

- AuthContext: user, token, loading, error, y métodos login() / logout().
- ProtectedRoute: si no hay token, redirige a /login.

Servicios HTTP

- apiClient: agrega Authorization: Bearer <token> si existe, y maneja errores.
- auth.service: login, register, logout.
- campaign.service: getCampaigns, getCandidates(campaignId), getResults(campaignId).
- vote.service: castVote(campaignId, candidateId).

Componentes

- Toast: notificaciones transitorias (success|error|warning|info) con autocierre.
- Navbar: navegación condicional si existe sesión.
- CampaignCard / CandidateList / VoteButton: UI de campañas, candidatos y voto.

Hooks 

- useAuth(): acceso tipado al contexto.
- useForm(): formularios controlados (valores/handlers/validación).
- useFetch<T>(): patrón data/loading/error.


## Tipos 
export interface User {
  id: string; nombre: string; dpi: string; email: string;
  rol?: 'ADMIN' | 'USER';
}

export interface Campaign {
  id: string; nombre: string; fechaInicio: string; fechaFin: string; activa?: boolean;
}

export interface Candidate {
  id: string; nombre: string; campania: string; // campaignId
}

export interface Vote {
  id: string; campania: string; candidato: string; usuario: string; createdAt: string;
}

export interface ApiResponse<T> {
  ok: boolean; message?: string; data?: T;
}

## Estilos (SASS/SCSS)
styles/
├─ abstracts/   _variables.scss, _mixins.scss, _functions.scss
├─ base/        _reset.scss, _typography.scss
├─ components/  _toast.scss, _forms.scss, _buttons.scss, _error-pages.scss
├─ layout/      _navbar.scss, _grid.scss
├─ pages/       _login.scss, _register.scss, _dashboard.scss, _results.scss
└─ main.scss

Guías de uso:
1. Usar módulos: @use y @forward (evitar @import deprecado).
2. Namespacing de variables:
   // components/_error-pages.scss
@use "../abstracts/variables" as vars;
.error-page { color: vars.$text-muted; }

