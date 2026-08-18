# Hwatu

Korean Go-Stop (화투) card game for iOS and Android, built with **React Native + Expo**.

## Getting Started

```bash
npm install
npm start
```

Press `a` for Android emulator or `i` for iOS simulator.

## Project Plan

See [`.cursor/plans/hwatu-mobile-app.mdc`](.cursor/plans/hwatu-mobile-app.mdc) for the full implementation roadmap.

## Card Assets

High-quality card images go in `assets/cards/master/` (512×839 PNG). After import or editing masters:

```bash
chmod +x scripts/generate-card-sizes.sh
npm run resize:cards
```

Or import from staged WebP sources:

```bash
npm run import:cards
```

Domain invariant checks (deal, scoring, turn engine):

```bash
npm run verify
```

### First-time Android setup

If the `android/` folder is missing or you changed icons/splash assets:

```bash
npx expo prebuild --platform android --clean
npx expo run:android
```

## EAS Build

```bash
eas build --platform android --profile production
eas build --platform ios --profile production
eas build --platform all --profile production
```

### OTA Update (JS-only changes)

```bash
eas update --channel production --message "Fix bug / update description"
```

`runtimeVersion` in `app.json` and EAS Update channels are used for JS-only updates. A new native build is required after native changes (icons, permissions, new native modules).
