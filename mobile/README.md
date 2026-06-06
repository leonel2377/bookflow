# BOOKFLOW — Apps natives (Capacitor)

Enveloppe **iOS** et **Android** qui charge https://stkmsoft.online/fr  
→ une seule codebase web, mises à jour automatiques côté serveur.

## Prérequis

- Node.js 20
- **Android** : [Android Studio](https://developer.android.com/studio)
- **iOS** : Mac + Xcode + compte Apple Developer (99 $/an)

## Installation

```powershell
cd mobile
npm install
npx cap add android
npx cap add ios
npx cap sync
```

> `cap add ios` ne fonctionne que sur **Mac**.

## Lancer / builder

```powershell
# Android (Windows OK)
npm run android

# iOS (Mac uniquement)
npm run ios
```

Puis dans Android Studio ou Xcode : générez un bundle signé pour les stores.

## Identifiant app

- **Package Android / Bundle iOS** : `online.stkmsoft.bookflow`
- Modifiable dans `capacitor.config.ts`

## Guide complet

Voir **[docs/APP-STORES.md](../docs/APP-STORES.md)** (PWABuilder, coûts, captures, Apple review).
