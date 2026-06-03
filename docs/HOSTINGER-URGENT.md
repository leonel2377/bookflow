# Hostinger — si 503 ou « Application error »

## 503 « Service Unavailable » — l’app Node ne tourne pas

La page noire **503** = Hostinger ne trouve **aucun processus Node** qui écoute (crash au démarrage, build raté, ou mauvais site).

### Checklist (dans l’ordre)

1. **hPanel → Deployments** (votre app Node.js **bookflow**)
   - Dernier déploiement = **Build succeeded** (pas Failed)
   - Statut = **Running** (pas Stopped / Crashed)

2. **Paramètres build** (exactement) :

   | Champ | Valeur |
   |-------|--------|
   | Install | `npm install` |
   | Build | `npm run build` |
   | Start | `npm run start` |
   | Node | **20.x** |

   Si le build plante par manque de mémoire, essayez :  
   `NODE_OPTIONS=--max-old-space-size=2048 npm run build`

3. **Variables d’environnement** — au minimum avant redeploy :

   ```env
   AUTH_SECRET=<32+ caractères aléatoires>
   DATABASE_URL=mysql://u835607784_IGlionel:VOTRE_MDP@localhost:3306/u835607784_bookflow
   AUTH_URL=https://stkmsoft.online
   NEXT_PUBLIC_APP_URL=https://stkmsoft.online
   NODE_ENV=production
   ```

   Sans `AUTH_SECRET`, l’app peut crasher au démarrage.

4. **Runtime logs** (menu gauche de l’app Node)
   - Chercher : `[bookflow] Démarrage` → l’app a démarré
   - Sinon : ligne rouge (`Error`, `ENOMEM`, `EADDRINUSE`, `Cannot find module`) → copier les 15 dernières lignes

5. **Domaine** `stkmsoft.online`
   - Doit être attaché à l’**application Node.js bookflow**, pas à un site PHP / parking vide

6. **Redeploy** après toute modification (Save variables → Deployments → Redeploy)

7. Test : https://stkmsoft.online/api/health → doit renvoyer du **JSON** (pas 503)

---

## DATABASE_URL — cause n°1 des erreurs inscription / salons

Sur **Hostinger (app Node.js)**, utilisez **localhost** (pas srv2062.hstgr.io).

Le `!` du mot de passe doit être encodé **`%21`** dans l’URL :

```env
DATABASE_URL=mysql://u835607784_IGlionel:IGSotekam26%21@localhost:3306/u835607784_bookflow
```

### Vérifier
1. hPanel → **Bases de données MySQL** → utilisateur `u835607784_IGlionel`
2. Si besoin : **Changer le mot de passe** MySQL
3. Mettre à jour `DATABASE_URL` dans **Environment variables** (avec `%21` pour `!`)
4. **Redeploy**

Test : https://stkmsoft.online/api/health → `"database": true`

---

## Réglages EXACTS dans hPanel (Node.js Web App)

| Champ | Valeur |
|-------|--------|
| **Install** | `npm install` |
| **Build** | `npm run build` |
| **Start** | `npm run start` |
| **Node** | **20.x** |

> Le script `start` écoute sur `0.0.0.0` et le `PORT` Hostinger automatiquement.

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
