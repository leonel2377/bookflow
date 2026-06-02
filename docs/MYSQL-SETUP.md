# Configurer MySQL (Hostinger)

## Quel plan Hostinger ?

| Vous êtes… | Choix |
|------------|--------|
| Débutant, vous voulez Git → déploiement auto | **Business** ou **Cloud** + **Node.js Web App** |
| Vous gérez Nginx, SSH, mises à jour vous-même | **VPS KVM** (8 Go RAM conseillé pour le build) |

Pour BOOKFLOW, commencez par **Business/Cloud** sauf besoin spécifique d’un serveur dédié.

---

## 1. Créer la base dans hPanel

1. Connectez-vous à **hPanel** → **Bases de données** → **Bases de données MySQL**.
2. **Créer une base** (ex. `u123456789_bookflow`).
3. **Créer un utilisateur** avec mot de passe fort.
4. **Associer** l’utilisateur à la base (tous les privilèges).
5. Notez :
   - **Nom de la base**
   - **Utilisateur**
   - **Mot de passe**
   - **Hôte** (souvent `localhost` depuis l’app sur le même hébergement ; pour connexion depuis votre PC, voir « MySQL distant » / hostname du type `srvXXX.hstgr.io`).

---

## 2. Fichier `.env` pour MySQL

À la racine du projet :

```powershell
copy .env.hostinger.example .env
```

Éditez `.env` et remplacez `DATABASE_URL` :

```env
DATABASE_URL="mysql://UTILISATEUR:MOT_DE_PASSE@HOTE:3306/NOM_BASE"
```

**Caractères spéciaux** dans le mot de passe (`@`, `#`, `%`…) : encodez-les en URL  
(ex. `@` → `%40`) ou changez le mot de passe MySQL.

Générez aussi `AUTH_SECRET` (PowerShell) :

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

---

## 3. Basculer Prisma sur MySQL et créer les tables

Depuis le dossier du projet :

```powershell
npm run db:use-mysql
npm run db:mysql:push
npm run db:mysql:seed
```

Cela :

1. passe `prisma/schema.prisma` en `provider = "mysql"` ;
2. crée les tables sur Hostinger ;
3. insère les données démo (salon, comptes `demo1234`).

> Pour revenir au développement local SQLite :  
> `npm run db:use-sqlite` puis `DATABASE_URL="file:./dev.db"` dans `.env`.

---

## Vos identifiants Hostinger (exemple)

| Champ | Valeur |
|-------|--------|
| Base | `u835607784_bookflow` |
| Utilisateur | `u835607784_IGlionel` |
| Site | `darkorange-starling-738813.hostingersite.com` |

URL Prisma (mot de passe avec `!` → `%21` dans l’URL) :

```env
DATABASE_URL="mysql://u835607784_IGlionel:VOTRE_MOT_DE_PASSE_ENCODE@HOTE:3306/u835607784_bookflow"
```

---

## 4. Connexion depuis votre PC (obligatoire pour `db:mysql:push`)

Si `db:mysql:push` échoue avec « connection refused » :

1. hPanel → **MySQL distant** → autoriser votre **IP publique**.
2. Utilisez l’**hôte distant** indiqué par Hostinger (pas `localhost`).
3. Réessayez `npm run db:mysql:push`.

Une fois les tables créées, vous pouvez aussi lancer `db:push` **depuis SSH** sur le serveur après le premier déploiement Git.

---

## 5. GitHub (si pas encore fait)

Le projet n’a pas encore de dépôt Git. Une fois :

```powershell
cd "d:\mes WEB APP\reservation rdv"
git init
git add .
git commit -m "Initial commit — BOOKFLOW"
```

Sur [github.com](https://github.com) → **New repository** → puis :

```powershell
git remote add origin https://github.com/VOTRE_COMPTE/bookflow.git
git branch -M main
git push -u origin main
```

Ensuite : hPanel → **Node.js Web App** → importer ce dépôt.

---

## 6. Variables sur Hostinger (rappel)

Dans l’interface **Node.js Web App**, reprenez les mêmes valeurs que `.env` :

- `DATABASE_URL`
- `AUTH_SECRET`, `AUTH_URL`, `NEXT_PUBLIC_APP_URL`
- `SMTP_*`, `MAIL_FROM`
- `NODE_ENV=production`

---

## Checklist

- [ ] Base MySQL créée dans hPanel
- [ ] `.env` rempli (`.env.hostinger.example` comme modèle)
- [ ] `npm run db:use-mysql` + `db:mysql:push` + `db:mysql:seed`
- [ ] Code sur GitHub
- [ ] Node.js Web App connectée au repo + variables d’environnement

Suite : [DEPLOY-HOSTINGER.md](./DEPLOY-HOSTINGER.md)
