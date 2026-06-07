# 503 — L'app Node ne tourne pas (Hostinger)

## Symptôme
Page noire **503 Service Unavailable** sur https://stkmsoft.online/fr

Test : https://stkmsoft.online/api/ping  
→ Si HTML « 503 » au lieu de `{"ok":true}` = **l'app Node est arrêtée**.

---

## Réparation en 5 minutes

### 1. hPanel → Sites → **Applications Web Node.js** → **bookflow**

### 2. Vérifiez les commandes (copier-coller exact)

| Champ | Valeur |
|-------|--------|
| **Node** | 20.x |
| **Install** | `npm install` |
| **Build** | `npm run build` |
| **Start** | `npm run start` |

Si le build échoue (mémoire) :
```
NODE_OPTIONS=--max-old-space-size=2048 npm run build
```

### 3. Variables d'environnement (obligatoires)

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

**SUPPRIMEZ `DATABASE_URL`** si elle existe (garder seulement DB_*).

### 4. Redéployer

1. **Save** les variables
2. **Deployments** → **Redeploy**
3. Attendre **Build succeeded** (3–5 min)
4. Statut = **Running**

### 5. Vérifier

| URL | OK |
|-----|-----|
| /api/ping | `{"ok":true}` |
| /fr | Page d'accueil |

---

## Si le build échoue

**Build logs** → lire la dernière erreur rouge.

Causes fréquentes :
- Mémoire insuffisante → build avec `NODE_OPTIONS=--max-old-space-size=2048`
- `AUTH_SECRET` manquant au build (rare)
- Erreur TypeScript → corriger puis redeploy

---

## Si build OK mais 503 persiste

**Runtime logs** → chercher :
- `[bookflow] next start` → démarrage OK
- `Error`, `ENOMEM`, `EADDRINUSE` → copier l'erreur

Causes :
- `PORT=3000` manquant
- Domaine `stkmsoft.online` pas attaché à **cette** app Node (mais à un site PHP)
- App crash au démarrage (Prisma, AUTH_SECRET)

---

## Domaine mal configuré

hPanel → **Domaines** → `stkmsoft.online` doit pointer vers l'app **Node.js bookflow**, pas un site WordPress/PHP vide.

---

## Mot de passe MySQL changé ?

Après changement :
1. Mettre à jour `DB_PASSWORD` dans l'app Node
2. **Restart** (obligatoire)

Sans ça : parfois 503, parfois pages lentes.
