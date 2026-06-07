# 503 — Corrigé en 3 étapes (Hostinger)

## Cause la plus fréquente

Avec `NODE_ENV=production` dans hPanel, **`npm install` n'installe pas les devDependencies** → le build Next.js **échoue** → 503.

---

## Étape 1 — Install command (IMPORTANT)

hPanel → app Node **bookflow** → Settings :

| Champ | Valeur exacte |
|-------|---------------|
| **Install** | `npm install --include=dev` |
| **Build** | `NODE_OPTIONS=--max-old-space-size=2048 npm run build` |
| **Start** | `npm run start -- -p $PORT` |
| **Node** | 20.x |

---

## Étape 2 — Variables

```env
NODE_ENV=production
AUTH_SECRET=cle-aleatoire-32-caracteres-minimum
AUTH_URL=https://stkmsoft.online
NEXT_PUBLIC_APP_URL=https://stkmsoft.online
DB_HOST=127.0.0.1
DB_USER=u835607784_IGlionel
DB_PASSWORD=votre_mdp_mysql
DB_NAME=u835607784_bookflow
```

**Ne pas ajouter** `PORT=3000` (Hostinger utilise `$PORT`).

**Supprimer** `DATABASE_URL` si vous avez `DB_*`.

---

## Étape 3 — Redeploy

1. Save
2. Deployments → **Redeploy**
3. Build logs → doit finir par `[bookflow] Build OK`
4. Runtime logs → `[bookflow] Démarrage 0.0.0.0:...`

Test : https://stkmsoft.online/api/ping → `{"ok":true}`

---

## Si ça échoue encore

Copiez ici les **10 dernières lignes** des **Build logs** (Deployments → Failed ou dernier deploy).
