# BOOKFLOW — Réservation beauté & bien-être

Plateforme **deux faces** (modèle type Planity), **indépendante** :

| Face | Public | Rôle |
|------|--------|------|
| **B2B** | Gérants de salon | RDV, planning équipe, formules Essentiel / Premium, options (boutique, site, pointage) |
| **B2C** | Clients | Fiche salon, réservation, rappels SMS, espace personnel (déplacer / annuler) |

## Démarrage

```bash
cp .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

### Comptes démo (mot de passe `demo1234`)

| Rôle | E-mail | Connexion |
|------|--------|-----------|
| Client | `client@demo.com` | [/connexion](http://localhost:3000/connexion) |
| Pro | `pro@studio-eclat.demo` | [/pro/connexion](http://localhost:3000/pro/connexion) |

- **Client** : `/salons` → réserver → `/compte` (connexion requise)
- **Pro** : `/pro/connexion` → planning, établissement (routes pro protégées)

### Mot de passe oublié

- Page : `/mot-de-passe-oublie` (lien sur les écrans de connexion client et pro)
- **Sans SMTP** : le lien de réinitialisation s’affiche dans la **console** du serveur `npm run dev`
- **Avec SMTP** : configurez `SMTP_*` et `MAIL_FROM` dans `.env` (voir `.env.example`)

## Formules prestataire

- **Essentiel** : référencement + réservation en ligne + planning
- **Premium** : + caisse + stats avancées
- **Options** : boutique en ligne, site internet, pointage équipes

## Mise en ligne (Hostinger)

Guide pas à pas : **[docs/DEPLOY-HOSTINGER.md](docs/DEPLOY-HOSTINGER.md)**  
Résumé : plan **Business/Cloud Node.js** (GitHub → build automatique) ou **VPS** (PM2 + Nginx). Passer la base en **MySQL** sur Hostinger (pas SQLite).

## Stack

- Next.js 15 (App Router), TypeScript, Tailwind CSS 4
- Prisma + SQLite (dev) — **MySQL** sur Hostinger en production

## Prochaines étapes suggérées

1. Calcul réel des créneaux (conflits, horaires staff)
3. Intégration SMS (Twilio, OVH)
4. Module caisse (formule Premium)
5. Paiement en ligne (Stripe)
