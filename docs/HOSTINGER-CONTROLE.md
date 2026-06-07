# Contrôle général Hostinger — BOOKFLOW (stkmsoft.online)

## Diagnostic actuel

| Test | Résultat | Signification |
|------|----------|---------------|
| `/manifest.json` | ✅ 200 (CDN Hostinger) | Fichiers statiques OK |
| `/api/ping` | ❌ 503 | **App Node arrêtée ou mal configurée** |
| `/fr` | ❌ 503 | Idem — le serveur Next.js ne tourne pas |

**Conclusion :** le build réussit, mais l'app **ne démarre pas** au runtime, ou le domaine **n'est pas branché** sur l'app Node.js.

---

## CHECKLIST hPanel (à faire dans l'ordre)

### 1. App Node.js « bookflow » existe ?

hPanel → **Sites** → vous devez voir une app **Node.js** (pas seulement un site PHP/WordPress).

### 2. Domaine branché sur l'app Node ?

hPanel → **Domaines** → `stkmsoft.online` doit pointer vers l'app **Node.js bookflow**.

Si le domaine pointe vers un site PHP vide → 503 sur `/fr` mais parfois 200 sur fichiers statiques.

### 3. Commandes (copier-coller exact)

| Champ | Valeur |
|-------|--------|
| **Framework** | Next.js |
| **Node** | **20.x** |
| **Install** | `npm install --include=dev` |
| **Build** | `NODE_OPTIONS=--max-old-space-size=2048 npm run build` |
| **Start** | `npm run start` |
| **Entry file** | `app.js` (ou laisser vide) |

### 4. Variables d'environnement

```env
NODE_ENV=production
AUTH_SECRET=minimum-32-caracteres-aleatoires-ici
AUTH_URL=https://stkmsoft.online
NEXT_PUBLIC_APP_URL=https://stkmsoft.online
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=u835607784_IGlionel
DB_PASSWORD=VOTRE_MOT_DE_PASSE_MYSQL
DB_NAME=u835607784_bookflow
```

**À supprimer si présentes :**
- `DATABASE_URL` (utiliser uniquement `DB_*`)
- `PORT=3000` (Hostinger gère le port automatiquement)

**AUTH_SECRET obligatoire** — sans lui, l'app peut crasher au démarrage.

Générer une clé (PowerShell) :
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 5. Redeploy

1. **Save** les variables
2. **Deployments** → **Redeploy**
3. Attendre **Build succeeded** + statut **Running**

### 6. Vérifier les logs

**Build logs** → dernière ligne : `[bookflow] Build OK`

**Journaux d'exécution** → chercher :
```
[bookflow] DÉMARRAGE PRODUCTION
[bookflow] port   : XXXX
✓ Ready in
```

Si vous voyez `BUILD_ID absent` → build raté ou `.next` non déployé.

---

## Tests après redeploy

| URL | Attendu |
|-----|---------|
| https://stkmsoft.online/api/ping | `{"ok":true}` |
| https://stkmsoft.online/api/status | JSON diagnostic |
| https://stkmsoft.online/fr | Page d'accueil |

---

## Erreurs fréquentes

| Symptôme | Cause | Solution |
|----------|-------|----------|
| Build OK + 503 | Start command incorrecte | `npm run start` |
| Build OK + 503 | AUTH_SECRET manquant | Ajouter variable 32+ car. |
| Build OK + 503 | Domaine sur site PHP | Brancher sur app Node.js |
| Build Failed | NODE_ENV=production sans devDeps | Install : `npm install --include=dev` |
| Build Failed | Mémoire | Build avec `NODE_OPTIONS=--max-old-space-size=2048` |
| Pages lentes / DB false | Mot de passe MySQL | Mettre à jour `DB_PASSWORD` + Redeploy |

---

## MySQL — tables

Si la base est vide : phpMyAdmin → Importer → `prisma/hostinger-init.sql`

Comptes démo : `prisma/hostinger-demo-seed.sql`

---

## Dépôt GitHub

Branche `main` : https://github.com/leonel2377/bookflow

Dernier commit à déployer : vérifiez que hPanel a bien pull le dernier commit.

---

## Si 503 persiste après tout ça

Envoyez une capture ou copie de :

1. **Build logs** — 10 dernières lignes
2. **Journaux d'exécution** — 15 dernières lignes
3. Capture des **Settings** (Install / Build / Start / Node version)
4. Capture des **Variables d'environnement** (masquez les mots de passe)
