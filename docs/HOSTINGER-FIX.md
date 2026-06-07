# BOOKFLOW — déploiement Hostinger (checklist complète)

## Réglages hPanel (copier-coller)

| Champ | Valeur exacte |
|-------|---------------|
| Framework | **Next.js** |
| Node | **20.x** |
| Install | `npm install` |
| Build | `npm run build` |
| Start | `npm run start` |
| Entry file | `server.js` (si le champ existe) |

> Si le build échoue (mémoire) : `NODE_OPTIONS=--max-old-space-size=2048 npm run build`

> Si Hostinger affiche « .next manquant » : le build a échoué — gardez les variables **DB_*** (le script crée `DATABASE_URL` au build) puis **Redeploy**.

---

## Variables d'environnement (toutes obligatoires)

**Recommandé : variables séparées** (supprimez `DATABASE_URL` si elle existe) :

```env
PORT=3000
NODE_ENV=production
AUTH_SECRET=une-cle-aleatoire-32-caracteres-minimum
AUTH_URL=https://stkmsoft.online
NEXT_PUBLIC_APP_URL=https://stkmsoft.online

DB_HOST=localhost
DB_PORT=3306
DB_USER=u835607784_IGlionel
DB_PASSWORD=Bookflow2026
DB_NAME=u835607784_bookflow
```

**Alternative** — une seule variable :

```env
DATABASE_URL=mysql://u835607784_IGlionel:Bookflow2026@localhost:3306/u835607784_bookflow
```

**Important :**
- `DB_USER` = utilisateur MySQL (**IGlionel**), PAS le nom de la base
- `DB_NAME` = **u835607784_bookflow**
- Pas de guillemets autour des valeurs
- Ne pas utiliser `u835607784_bookflow` comme utilisateur

---

## MySQL — créer les tables (sans npm)

1. hPanel → Bases de données → **Entrer dans phpMyAdmin** (depuis la base bookflow)
2. Onglet **Importer**
3. Choisir le fichier **`prisma/hostinger-init.sql`** du projet GitHub
4. **Exécuter**

---

## Après chaque modification

1. **Save** les variables
2. **Deployments → Redeploy** (ou **Restart**)
3. Attendre **Build succeeded** + **Running** (3–5 min)
4. Tester : https://stkmsoft.online/api/health

### Résultat attendu

```json
{
  "status": "ok",
  "checks": {
    "database": true,
    "databaseUrlSource": "DB_*"
  }
}
```

---

## Si 503 persiste

1. **Build logs** → le build a-t-il réussi ?
2. **Runtime logs** → chercher `[bookflow] next start` ou une erreur rouge
3. Vérifier **PORT=3000** dans les variables
4. Vérifier **Node 20.x** (pas 18, pas 24)
5. Domaine **stkmsoft.online** attaché à **cette** app Node.js (pas un site PHP)

---

## Tests finaux

| URL | Attendu |
|-----|---------|
| /api/health | JSON `"database": true` |
| /fr | Page d'accueil |
| /fr/pro/inscription | Inscription sans erreur |

Comptes démo (si seed) : `pro@studio-eclat.demo` / `demo1234`
