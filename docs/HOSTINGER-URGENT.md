# Hostinger — si 503 ou « Application error »

## Réglages EXACTS dans hPanel (Node.js Web App)

| Champ | Valeur |
|-------|--------|
| **Install** | `npm install` |
| **Build** | `npm run build` |
| **Start** | `npm run start` |
| **Node** | **20.x** |

**Ne pas utiliser** : `npm run start -- -p $PORT` (Next lit `PORT` tout seul).

## Variables d'environnement (obligatoires)

```env
DATABASE_URL=mysql://u835607784_IGlionel:IGSotekam26%21@localhost:3306/u835607784_bookflow
AUTH_SECRET=une-longue-cle-aleatoire-32-caracteres-minimum
AUTH_URL=https://stkmsoft.online
NEXT_PUBLIC_APP_URL=https://stkmsoft.online
NODE_ENV=production
PORT=3000
```

> Le `!` du mot de passe MySQL doit être `%21` dans l’URL.

## Après chaque changement

1. **Save** les variables
2. **Deployments** → **Redeploy**
3. Attendre **Build succeeded** + statut **Running**

## Tests

1. https://stkmsoft.online/api/health → JSON (pas page noire 503)
2. https://stkmsoft.online/fr
3. https://stkmsoft.online/fr/salons

## Si 503 persiste

**Runtime logs** (menu gauche) → chercher `[bookflow] Démarrage` ou une erreur rouge.

Causes fréquentes :
- Build failed → corriger puis redeploy
- `AUTH_SECRET` manquant
- `DATABASE_URL` incorrect (testez avec `%21` pour `!`)
- Domaine pointant vers un **autre** site (PHP) au lieu de l’app Node.js **bookflow**

## Dernier commit Git à déployer

Branche `main` sur https://github.com/leonel2377/bookflow
