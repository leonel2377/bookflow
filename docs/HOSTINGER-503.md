# 503 — L'app Node ne tourne pas (Hostinger)

## Diagnostic rapide

| URL | Résultat | Signification |
|-----|----------|---------------|
| https://stkmsoft.online/manifest.json | JSON OK | Domaine OK, fichiers statiques OK |
| https://stkmsoft.online/api/ping | HTML 503 | **App Node arrêtée ou build raté** |

---

## Étape 1 — Vérifier le BUILD (cause n°1)

hPanel → **Applications Web Node.js** → **bookflow** → **Deployments**

- Dernier déploiement = **Build succeeded** ?
- Si **Failed** → cliquer → **Build logs** → copier la **dernière ligne rouge**

Build command :
```
NODE_OPTIONS=--max-old-space-size=2048 npm run build
```

---

## Étape 2 — Paramètres exacts

| Champ | Valeur |
|-------|--------|
| Node | **20.x** |
| Install | `npm install` |
| Build | `npm run build` |
| Start | `npm run start` |

Entry file (si visible) : laisser vide ou `server.js`

---

## Étape 3 — Variables d'environnement

```env
PORT=3000
NODE_ENV=production
AUTH_SECRET=minimum-32-caracteres-aleatoires
AUTH_URL=https://stkmsoft.online
NEXT_PUBLIC_APP_URL=https://stkmsoft.online
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=u835607784_IGlionel
DB_PASSWORD=votre_mot_de_passe_mysql
DB_NAME=u835607784_bookflow
```

**Supprimez `DATABASE_URL`** si vous utilisez `DB_*`.

---

## Étape 4 — Runtime logs

Menu gauche → **Runtime logs** (ou stderr.log)

Chercher :
- `[bookflow] Démarrage 0.0.0.0:3000` → OK
- `BUILD_ID absent` → build échoué
- `Error`, `ENOMEM`, `Cannot find module` → copier ici

---

## Étape 5 — Domaine

hPanel → **Domaines** → `stkmsoft.online` doit être sur l'app **Node.js bookflow**, pas PHP/WordPress.

---

## Étape 6 — Redeploy

1. Save variables
2. Deployments → **Redeploy**
3. Attendre **Running**
4. Test : https://stkmsoft.online/api/ping → `{"ok":true}`
