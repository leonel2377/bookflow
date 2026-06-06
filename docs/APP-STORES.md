# BOOKFLOW — Publier sur App Store (iOS) et Play Store (Android)

Votre site **https://stkmsoft.online** peut devenir une application mobile officielle. Deux niveaux :

| Niveau | Ce que c’est | Déjà fait ? |
|--------|----------------|-------------|
| **PWA** | Icône sur l’écran d’accueil, sans store | ✅ Oui |
| **Stores** | App téléchargeable depuis Apple / Google | À faire |

---

## Ce qu’il vous faut

| | Android (Play Store) | iOS (App Store) |
|---|---------------------|-----------------|
| **Compte développeur** | Google Play Console — **25 $** (une fois) | Apple Developer — **99 $/an** |
| **Matériel** | PC Windows OK + Android Studio | **Mac obligatoire** + Xcode |
| **Délai review** | Quelques heures à 3 jours | 1 à 7 jours |
| **Difficulté** | ⭐⭐ Moyenne (TWA ou Capacitor) | ⭐⭐⭐ Plus stricte (Apple) |

> **Important Apple** : une app qui n’est qu’un site web dans une WebView peut être **refusée** (règle 4.2). BOOKFLOW a de vraies fonctions (réservation, compte, espace pro) — c’est plus acceptable qu’un simple site vitrine, mais ce n’est pas garanti à 100 %.

---

## Option A — Android : TWA (recommandé, le plus simple)

**TWA** = Trusted Web Activity : votre PWA s’ouvre en plein écran dans le Play Store, **sans dupliquer le code**.

### Étapes

1. Vérifiez que la PWA est OK : https://stkmsoft.online/manifest.webmanifest
2. Allez sur **[PWABuilder.com](https://www.pwabuilder.com/)**
3. Entrez : `https://stkmsoft.online/fr`
4. Cliquez **Start** → corrigez les éventuels avertissements
5. **Package for stores** → **Android** → téléchargez le projet Android
6. Ouvrez le projet dans **Android Studio**
7. Menu **Build → Generate Signed Bundle / APK** (AAB pour Play Store)
8. [Google Play Console](https://play.google.com/console) → **Créer une application**
9. Uploadez l’AAB, fiche store (captures, description), soumettez en review

### Asset Links (obligatoire pour TWA)

Fichier à héberger sur votre domaine :

```
https://stkmsoft.online/.well-known/assetlinks.json
```

Voir le fichier `public/.well-known/assetlinks.json` dans ce repo — remplacez `SHA256_FINGERPRINT` par l’empreinte de votre certificat de signature Android (Android Studio → Gradle → signingReport).

---

## Option B — iOS + Android : Capacitor (dossier `mobile/`)

Capacitor enveloppe votre site dans une coque native. Le code reste sur **stkmsoft.online** — une seule app à maintenir.

### Prérequis

- Node.js 20
- **Android** : [Android Studio](https://developer.android.com/studio)
- **iOS** : Mac + [Xcode](https://developer.apple.com/xcode/) + compte Apple Developer

### Installation (depuis le dossier `mobile/`)

```powershell
cd mobile
npm install
npx cap sync
```

### Android

```powershell
npx cap open android
```

Dans Android Studio : **Build → Generate Signed Bundle** → Play Console.

### iOS (sur Mac uniquement)

```powershell
npx cap open ios
```

Dans Xcode : sélectionnez votre équipe Apple → **Product → Archive** → **Distribute App** → App Store Connect.

### Configuration

Le fichier `mobile/capacitor.config.ts` pointe vers :

```
https://stkmsoft.online/fr
```

Changez l’URL si vous utilisez un autre domaine.

---

## Option C — Agence / service « wrapper »

Si vous n’avez pas de Mac pour iOS, des services (GoNative, Median.co, etc.) génèrent les apps à partir de votre URL moyennant un abonnement mensuel.

---

## Fiche store — textes suggérés

**Nom** : BOOKFLOW  
**Sous-titre** : Réservation salon & planning pro  
**Description courte** : Trouvez un salon, réservez en ligne. Pros : gérez votre planning.  
**Mots-clés** : coiffure, salon, réservation, rendez-vous, beauté, planning  
**Catégorie** : Style de vie / Business  
**URL support** : https://stkmsoft.online/fr  
**Politique de confidentialité** : à créer (page `/fr/confidentialite` recommandée)

---

## Captures d’écran à préparer

Minimum pour les stores :

- Page d’accueil
- Liste des salons
- Fiche salon + réservation
- Espace pro / planning (optionnel)

Tailles : iPhone 6,7″ et 6,5″ + Android phone (Play Console indique les formats exacts).

---

## Checklist avant soumission

- [ ] Site en **HTTPS** ✅ (stkmsoft.online)
- [ ] Base MySQL fonctionnelle (`/api/health` → `"database": true`)
- [ ] PWA déployée (manifest + icônes) ✅
- [ ] `assetlinks.json` configuré (Android TWA)
- [ ] Compte développeur Google / Apple créé
- [ ] Politique de confidentialité en ligne
- [ ] Captures d’écran + icône 512×512 ✅

---

## Coût total estimé

| Poste | Montant |
|-------|---------|
| Google Play (une fois) | 25 $ |
| Apple Developer (par an) | 99 $ |
| Hébergement Hostinger | déjà payé |
| **Total première année** | ~124 $ + Mac si iOS |

---

## Besoin d’aide ?

1. **Android seulement** → PWABuilder + ce guide (Option A)  
2. **iOS + Android** → dossier `mobile/` + Mac pour Xcode (Option B)  
3. **Sans Mac** → PWA suffit pour vos clients, ou service wrapper pour iOS
