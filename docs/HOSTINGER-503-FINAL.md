# 503 — Guide final Hostinger (stkmsoft.online)

## Symptôme
`/api/ping` → **503** mais `/manifest.json` → **200** = Node arrêté, CDN OK.

---

## Configuration hPanel EXACTE

### Commandes
| Champ | Valeur |
|-------|--------|
| Node | **20.x** |
| Install | `npm install --include=dev` |
| Build | `NODE_OPTIONS=--max-old-space-size=2048 npm run build` |
| Start | `npm run start -- -p $PORT` |
| Entry file | **vide** ou `app.js` |

### Variables (copier-coller)
```
NODE_ENV=production
AUTH_SECRET=votre-cle-32-caracteres-minimum
AUTH_URL=https://stkmsoft.online
NEXT_PUBLIC_APP_URL=https://stkmsoft.online
DB_HOST=127.0.0.1
DB_USER=u835607784_IGlionel
DB_PASSWORD=Bookflow26
DB_NAME=u835607784_bookflow
```

**SUPPRIMER** : `DATABASE_URL`, `PORT=3000`

---

## Redeploy obligatoire
1. Save variables
2. Deployments → **Redeploy**
3. Build logs → `[bookflow] Build OK`
4. Runtime logs → `[bookflow] === DÉMARRAGE ===` puis `Ready`

---

## Tests
- https://stkmsoft.online/api/ping → `{"ok":true}`
- https://stkmsoft.online/api/health → `"database":true`

---

## Si 503 persiste
Copiez les **10 dernières lignes** des **Journaux d'exécution**.

| Message | Action |
|---------|--------|
| `BUILD_ID absent` | Build raté → Build logs |
| `next absent` | Install → `npm install --include=dev` |
| `ENOMEM` | Plan hosting insuffisant |
| `EADDRINUSE` | Supprimer PORT=3000 des variables |
