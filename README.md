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

High-quality card images go in `assets/cards/master/` (600×960 PNG). Run:

```bash
chmod +x scripts/generate-card-sizes.sh
./scripts/generate-card-sizes.sh
```

### First-time Android setup

If the `android/` folder is missing or you changed icons/splash assets:

```bash
npx expo prebuild --platform android --clean
npx expo run:android
```

## EAS Build

```bash
# Internal test APK
eas build -p android --profile preview

# Play Store AAB
eas build -p android --profile production
```

`runtimeVersion` in `app.json` and EAS Update channels are used for JS-only updates. A new native build is required after native changes (icons, permissions, new native modules).