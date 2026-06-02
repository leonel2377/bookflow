# Déployer BOOKFLOW sur Hostinger

Cette application est une **Next.js 15** avec **Prisma**, **NextAuth** et **API routes**.  
L’hébergement mutualisé classique (PHP seul) **ne convient pas**. Il vous faut l’une de ces options Hostinger :

| Option | Plan Hostinger | Difficulté | Recommandé pour |
|--------|----------------|------------|-----------------|
| **A — Node.js Web App** | Business Web Hosting ou Cloud | Facile | Démarrer vite, peu de serveur à gérer |
| **B — VPS** | KVM VPS (idéal KVM 2+, 8 Go RAM) | Moyenne | Contrôle total, plus de trafic |

> **Important :** en production, n’utilisez **pas SQLite** (`file:./dev.db`). Les fichiers locaux ne sont pas fiables sur un hébergement géré. Utilisez **MySQL** (inclus sur Business/Cloud) ou **PostgreSQL** (souvent sur VPS).

---

## Avant de commencer

1. **Code sur GitHub** (dépôt public ou privé connecté à Hostinger).
2. **Nom de domaine** pointant vers Hostinger (DNS).
3. Générer un secret fort pour la session :
   ```bash
   openssl rand -base64 32
   ```

---

## Étape 1 — Base de données MySQL (Hostinger)

Guide détaillé : **[MYSQL-SETUP.md](./MYSQL-SETUP.md)**

Résumé :

1. hPanel → créer base + utilisateur MySQL.
2. Copier `.env.hostinger.example` → `.env` et remplir `DATABASE_URL`.
3. Exécuter :

   ```bash
   npm run db:use-mysql
   npm run db:mysql:push
   npm run db:mysql:seed
   ```

   (Le seed crée les comptes démo ; à changer en production réelle.)

---

## Étape 2 — Variables d’environnement (production)

À configurer dans **hPanel → Node.js Web App → Environment variables** (ou fichier `.env` sur VPS) :

| Variable | Exemple | Obligatoire |
|----------|---------|-------------|
| `DATABASE_URL` | `mysql://...` | Oui |
| `AUTH_SECRET` | clé 32+ caractères | Oui |
| `AUTH_URL` | `https://votredomaine.com` | Oui |
| `NEXT_PUBLIC_APP_URL` | `https://votredomaine.com` | Oui (e-mails reset) |
| `SMTP_HOST` | `smtp.hostinger.com` | Recommandé |
| `SMTP_PORT` | `465` ou `587` | Recommandé |
| `SMTP_USER` | e-mail Hostinger | Recommandé |
| `SMTP_PASS` | mot de passe boîte mail | Recommandé |
| `MAIL_FROM` | `"BOOKFLOW <noreply@votredomaine.com>"` | Recommandé |
| `NODE_ENV` | `production` | Oui |

E-mail : créez une boîte **noreply@votredomaine.com** dans Hostinger et utilisez ses identifiants SMTP.

---

## Option A — Node.js Web App (recommandé)

### Prérequis plan

- **Business Web Hosting** ou **Cloud** (Startup, Professional, etc.)
- [Documentation Hostinger Node.js](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/)

### Déploiement

1. **hPanel** → **Sites** → **Ajouter un site** → **Application Web Node.js** / **Frontend web app**.
2. **Importer depuis GitHub** → autoriser Hostinger → choisir le dépôt `reservation-rdv`.
3. Branche : `main`.
4. **Paramètres de build** (vérifier / ajuster) :

   | Champ | Valeur |
   |-------|--------|
   | Framework | Next.js (détecté) |
   | Version Node | **20.x** |
   | Commande d’installation | `npm install` |
   | Commande de build | `npm run build` |
   | Commande de démarrage | `npm run start` (le script lit `PORT` automatiquement) |
   | Répertoire racine | `/` (racine du repo) |

5. Coller toutes les **variables d’environnement** (étape 2).
6. Lancer le déploiement.

### Après le premier déploiement

- Si la base est vide : exécuter `db:push` + `db:seed` via **SSH** (si disponible sur votre plan) ou en local en pointant `DATABASE_URL` vers MySQL Hostinger.
- Tester : `https://votredomaine.com/fr`
- Connexion démo (si seed) : `client@demo.com` / `demo1234` — **à désactiver ou changer en production**.

### Échec de build (« Failed to build the application »)

1. **Node.js** : version **20.x** (pas 18).
2. **Variables d’environnement** : `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `NEXT_PUBLIC_APP_URL`, `NODE_ENV=production` — ajoutées **avant** le deploy.
3. **Prisma** : le package `prisma` doit être dans `dependencies` (déjà corrigé dans ce repo).
4. **Start** : `npm run start -- -p $PORT` dans les paramètres Hostinger.
5. Ouvrir les **Build logs** dans hPanel → Deployments → dernier déploiement → copier les 20 dernières lignes d’erreur.

### Erreur 503 « Service Unavailable »

L’app Node **ne tourne pas** ou n’écoute pas sur le bon port.

1. **Start command** dans hPanel : `npm run start` (sans `-- -p $PORT` en double).
2. **Node 20.x** et dernier commit Git déployé (`fix: remove Prisma from Edge middleware`).
3. **Variables** : `AUTH_SECRET`, `DATABASE_URL` avec `localhost`, `NODE_ENV=production`.
4. **Deployments** → ouvrir les **Runtime / Application logs** (pas seulement Build logs).
5. Test direct : `https://stkmsoft.online/api/health` → doit répondre `{"status":"ok",...}`.

Si `/api/health` fonctionne mais pas `/fr`, le problème est dans l’app (DB, auth). Si rien ne répond → processus arrêté ou mauvais port.

### Domaine & HTTPS

- Attacher le domaine dans hPanel ; le certificat SSL est en général automatique (Let’s Encrypt).

---

## Option B — VPS Hostinger

Adapté si vous avez un **KVM VPS** (Ubuntu 22.04 / 24.04). Prévoir **au moins 2–4 Go RAM** pour `npm run build` (idéal **KVM 2** = 8 Go).

### 1. Connexion SSH

```bash
ssh root@VOTRE_IP_VPS
```

### 2. Node.js 20 + PM2

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
npm install -g pm2
```

### 3. Cloner et configurer

```bash
cd /var/www
git clone https://github.com/VOTRE_COMPTE/reservation-rdv.git bookflow
cd bookflow
cp .env.example .env
nano .env   # DATABASE_URL mysql, AUTH_*, SMTP, NEXT_PUBLIC_APP_URL
```

Modifier `prisma/schema.prisma` → `provider = "mysql"` puis :

```bash
npm install
npm run db:push
npm run db:seed
npm run build
```

### 4. Démarrer avec PM2

```bash
pm2 start npm --name bookflow -- start
pm2 save
pm2 startup
```

Le fichier `ecosystem.config.cjs` à la racine du projet peut aussi être utilisé :

```bash
pm2 start ecosystem.config.cjs
```

### 5. Nginx (reverse proxy)

```bash
apt update && apt install -y nginx certbot python3-certbot-nginx
```

Fichier `/etc/nginx/sites-available/bookflow` :

```nginx
server {
    listen 80;
    server_name votredomaine.com www.votredomaine.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/bookflow /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d votredomaine.com -d www.votredomaine.com
```

### 6. Mises à jour

```bash
cd /var/www/bookflow
git pull
npm install
npm run build
pm2 restart bookflow
```

---

## Checklist avant mise en ligne

- [ ] `provider = "mysql"` + `DATABASE_URL` production
- [ ] `AUTH_SECRET` unique (jamais celui du `.env` local)
- [ ] `AUTH_URL` et `NEXT_PUBLIC_APP_URL` en **https** avec le bon domaine
- [ ] SMTP configuré (reset mot de passe)
- [ ] Comptes démo supprimés ou mots de passe changés
- [ ] Build OK en local : `npm run build && npm run start`

---

## Dépannage

| Problème | Piste |
|----------|--------|
| Build échoue (mémoire) | VPS plus grand, ou build en local puis déployer l’artefact |
| 500 après login | `AUTH_URL` incorrect ou `AUTH_SECRET` manquant |
| Prisma erreur | `postinstall` / `prisma generate` ; vérifier `DATABASE_URL` |
| E-mail reset absent | SMTP + `NEXT_PUBLIC_APP_URL` |
| Page 404 i18n | URL avec locale : `/fr/...` |

---

## Hébergement mutualisé sans Node.js

Les offres **Single / Premium** (PHP uniquement) **ne peuvent pas** faire tourner cette app telle quelle. Il faut **upgrader** vers Business/Cloud Node.js ou prendre un **VPS**.
