<div align="center">

# 📸 Camera App

**A modern, cross-platform mobile camera application built with Expo, React Native, and Expo Router.**

[![Expo SDK](https://img.shields.io/badge/Expo-SDK%2058-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.88-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Scripts](#-available-scripts) • [Project Structure](#-project-structure) • [EAS Build](#-building-with-eas)

</div>

---

## ✨ Features

| Feature                     | Description                                                                                                       |
| :-------------------------- | :---------------------------------------------------------------------------------------------------------------- |
| **📷 Camera Capture**       | High-quality photo capture with animated shutter feedback powered by `expo-camera`.                               |
| **🔄 Camera Controls**      | Switch between front and back cameras, cycle flash modes (`off` → `on` → `auto`), and toggle zoom.                |
| **⊞ Composition Grid**      | Optional rule-of-thirds grid overlay for balanced shot framing.                                                   |
| **🖼️ Photo Preview & Save** | Full-screen modal preview for captured photos with one-tap saving to the device library via `expo-media-library`. |
| **🔐 Permissions Flow**     | Built-in camera and media library permission prompts for a smooth onboarding experience.                          |
| **📱 Cross-Platform**       | Configured for Android, iOS, and Web using Expo Router file-based navigation.                                     |

---

## 🛠️ Tech Stack

- **Framework:** [Expo](https://expo.dev) (`~58.0.26`) & [React Native](https://reactnative.dev) (`0.88.1`)
- **UI & React:** [React](https://react.dev) (`19.3.0`), `@expo/vector-icons`, `expo-image`, `react-native-reanimated`, `react-native-safe-area-context`
- **Navigation:** [Expo Router](https://docs.expo.dev/router/introduction/) (`src/app/`)
- **Camera & Media:** `expo-camera`, `expo-media-library`
- **Language:** TypeScript (`~6.0.3`)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [Expo Go](https://expo.dev/go) on your mobile device, or an Android Emulator / iOS Simulator

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the development server**

   ```bash
   npx expo start
   ```

   Or launch directly on a specific platform:

   ```bash
   npm run android   # Launch on Android
   npm run ios       # Launch on iOS
   npm run web       # Launch on Web
   npm run start:go  # Start with Expo Go
   ```

---

## 📜 Available Scripts

| Command                   | Description                       |
| :------------------------ | :-------------------------------- |
| `npm start`               | Start the Expo development server |
| `npm run start:go`        | Start with Expo Go                |
| `npm run start:tunnel`    | Start with Expo tunnel            |
| `npm run start:go:tunnel` | Start with Expo Go over tunnel    |
| `npm run android`         | Start and open on Android         |
| `npm run ios`             | Start and open on iOS             |
| `npm run web`             | Start and open on Web             |
| `npm run lint`            | Run `expo lint`                   |
| `npx tsc --noEmit`        | Run TypeScript type checking      |

---

## 📁 Project Structure

```text
io-app/
├── assets/              # App icons and splash screen assets
├── src/
│   └── app/             # Expo Router screens and layouts
│       ├── _layout.tsx  # Root navigator layout
│       └── index.tsx    # Main camera screen
├── app.json             # Expo configuration & native permissions
├── eas.json             # EAS Build profiles (development, preview, production)
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

---

## 📦 Building with EAS

This project is configured with [EAS Build](https://docs.expo.dev/build/introduction/) in `eas.json`:

```bash
# Development build
npx eas-cli@latest build --profile development

# Preview build (Android APK)
npx eas-cli@latest build --profile preview

# Production build
npx eas-cli@latest build --profile production
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
