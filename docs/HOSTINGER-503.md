# Build OK mais 503 — problème au démarrage (runtime)

## Votre build réussit ✅

Les logs montrent `[bookflow] Build OK` → le code compile.

Le **503** vient du **démarrage** : l'app Node crash ou n'écoute pas sur le bon port.

---

## Étape 1 — Journaux d'exécution (OBLIGATOIRE)

hPanel → **stkmsoft.online** → menu gauche :

**Journaux d'exécution** (pas « Journaux de compilation »)

Copiez les **15 dernières lignes** ici.

Cherchez :
- `Ready on http://0.0.0.0:XXXX` → OK
- `[bookflow] Démarrage` → OK
- `Error`, `EADDRINUSE`, `Cannot find module` → erreur

---

## Étape 2 — Commande Start

| Champ | Valeur |
|-------|--------|
| **Start** | `npm run start -- -p $PORT` |
| **Install** | `npm install --include=dev` |
| **Build** | `NODE_OPTIONS=--max-old-space-size=2048 npm run build` |

**Ne pas** mettre `PORT=3000` dans les variables.

---

## Étape 3 — Variables

```env
NODE_ENV=production
AUTH_SECRET=32-caracteres-minimum-aleatoires
AUTH_URL=https://stkmsoft.online
NEXT_PUBLIC_APP_URL=https://stkmsoft.online
DB_HOST=127.0.0.1
DB_USER=u835607784_IGlionel
DB_PASSWORD=...
DB_NAME=u835607784_bookflow
```

---

## Étape 4 — Redeploy puis test

https://stkmsoft.online/api/ping → `{"ok":true}`
