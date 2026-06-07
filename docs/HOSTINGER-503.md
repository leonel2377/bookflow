# 503 — L'app Node ne tourne pas (Hostinger)

## Symptôme
Page **503 Service Unavailable** sur https://stkmsoft.online/fr

Test : https://stkmsoft.online/api/ping  
→ Si HTML « 503 » au lieu de `{"ok":true}` = **l'app Node est arrêtée**.

---

## Réparation (5 minutes)

### 1. hPanel → Sites → **Applications Web Node.js** → **bookflow**

### 2. Commandes (copier-coller exact)

| Champ | Valeur |
|-------|--------|
| **Node** | 20.x |
| **Install** | `npm install` |
| **Build** | `npm run build` |
| **Start** | `npm run start -- -p $PORT` |

Si le build échoue (mémoire) :
```
NODE_OPTIONS=--max-old-space-size=2048 npm run build
```

> **Important :** la commande Start doit contenir `$PORT` (port dynamique Hostinger).  
> **Ne mettez PAS** `PORT=3000` dans les variables d'environnement — cela provoque souvent un 503.

### 3. Variables d'environnement (obligatoires)

```env
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

**SUPPRIMEZ** si présentes :
- `DATABASE_URL` (utiliser uniquement `DB_*`)
- `PORT=3000` (Hostinger fournit `$PORT` automatiquement)

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
- Mémoire insuffisante → `NODE_OPTIONS=--max-old-space-size=2048 npm run build`
- Erreur TypeScript → corriger puis redeploy

---

## Si build OK mais 503 persiste

**Runtime logs** → chercher :
- `[bookflow] Démarrage port=...` → démarrage OK
- `ERREUR: aucun port` → Start command incorrecte (voir §2)
- `Error`, `ENOMEM`, `EADDRINUSE` → copier l'erreur

---

## Domaine mal configuré

hPanel → **Domaines** → `stkmsoft.online` doit pointer vers l'app **Node.js bookflow**, pas un site WordPress/PHP vide.

---

## Mot de passe MySQL changé ?

1. Mettre à jour `DB_PASSWORD` dans l'app Node
2. **Redeploy** ou **Restart** (obligatoire)
