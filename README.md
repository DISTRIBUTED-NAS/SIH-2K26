# ScaleGuard — Legal Metrology Officer (LMO) Field Inspection App

[![SIH 2026](https://img.shields.io/badge/SIH-2026-blue.svg)](https://www.sih.gov.in/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2057-black.svg)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.86-61DAFB.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**ScaleGuard** is a digital Legal Metrology verification and enforcement mobile application developed for **Smart India Hackathon (SIH 2026)**. It empowers Legal Metrology Officers (LMO) with an **offline-first**, AI-assisted field inspection tool for auditing weighing and measuring instruments, detecting physical and digital tampering, recording verification certificates, and maintaining transparent regulatory compliance.

---

## Key Highlights

- **Offline-First Architecture**: Built on local SQLite database (`expo-sqlite`) with automatic WAL mode, transactional persistence, and background cloud synchronization.
- **Government Field-Inspection UI (Material 3)**: High-contrast, clean, authoritative interface complying with modern Material Design 3 guidelines.
- **Step-by-Step Inspection Wizard**: Seamless 5-phase guided workflow: Details &rarr; Checklist &rarr; Measurements &rarr; AI Verification &rarr; Officer Decision & Review.
- **AI Forensic & Tamper Verification**: Heuristic and model-assisted detection of seal tampering, calibration drift, and counterfeit verification certificates.
- **Tolerance Engine**: Real-time error-percentage calculations comparing standard mass values against actual instrument readings with instant PASS/FAIL bounds.
- **Field Evidence Capture**: Camera integration for stamping physical instrument plates, manufacturer seals, and inspection sites.

---

## System Architecture

The project follows a clean, modular architecture:

```
SIH-2K26/
├── assets/                    # Application icons, splash screens, and branding
├── scripts/                   # Build and patching automation scripts
│   └── patch-expo-notifications.js
├── src/
│   ├── core/                  # Core infrastructure layer
│   │   ├── config/            # Environment & app configuration
│   │   ├── constants/         # Storage keys, app constants & thresholds
│   │   ├── errors/            # Custom AppError models & exception handlers
│   │   ├── navigation/        # RootNavigator, AppTabNavigator, route types
│   │   ├── network/           # Axios apiClient & useNetworkStatus hook
│   │   ├── notifications/     # Notification service & models
│   │   ├── storage/           # SQLite database layer & async storage
│   │   └── theme/             # Material 3 palette, typography, spacing
│   ├── features/              # Modular feature domains
│   │   ├── ai-verification/   # AI forensic analysis & tamper inspection
│   │   ├── auth/              # Officer authentication, context & session
│   │   ├── camera/            # Evidence photo capture & inspection camera
│   │   ├── dashboard/         # Officer command center & quick actions
│   │   ├── history/           # Audit trails & past inspection records
│   │   ├── inspections/       # Core inspection lifecycle & 5-step wizard
│   │   ├── profile/           # Officer profile, sync controls & settings
│   │   └── splash/            # Animated splash & system initialization
│   └── shared/                # Cross-cutting components & data contracts
│       ├── components/        # M3 AppCard, Buttons, Badges, Progress, etc.
│       └── models/            # Shared domain types & data models
├── .env.example               # Environment variables template
├── .gitignore                 # Version control exclusions
├── app.json                   # Expo application configuration
├── App.tsx                    # Application entry point with DB & Auth providers
├── index.ts                   # Root registration & error logging setup
├── LICENSE                    # MIT License
├── package.json               # Dependencies and scripts
├── package-lock.json          # Deterministic dependency lockfile
└── tsconfig.json              # TypeScript strict configuration
```

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Expo SDK 57 (Managed Workflow) |
| **Runtime** | React Native 0.86, React 19 |
| **Language** | TypeScript (Strict Mode) |
| **Navigation** | React Navigation v7 (Native Stack & Bottom Tabs) |
| **Local Database** | `expo-sqlite` (SQLite 3 with WAL journal mode) |
| **Offline Cache** | `@react-native-async-storage/async-storage` |
| **Networking** | Axios + `expo-network` (Offline detection) |
| **Hardware** | `expo-camera`, `expo-file-system` |
| **Notifications**| `expo-notifications` (with automated Expo Go compatibility patches) |

---

## Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Expo Go** app on Android/iOS (or Android Studio / Xcode simulator)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Jaswanth776/SIH-2K26.git
   cd SIH-2K26
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
   *(Note: The `postinstall` hook automatically applies compatibility patches for `expo-notifications` in Expo Go).*

3. Configure environment variables (optional):
   ```bash
   cp .env.example .env
   ```

### Running the Application

Start the Expo development server with cache cleared:

```bash
npx expo start -c
```

- Press `a` to launch on a connected Android device or emulator.
- Press `i` to launch on an iOS simulator.
- Scan the QR code using the **Expo Go** app on your physical mobile device.

---

## Available Scripts

| Command | Purpose |
|---|---|
| `npm start` | Starts the Expo development bundler |
| `npm run android` | Starts the bundler and opens the Android emulator |
| `npm run ios` | Starts the bundler and opens the iOS simulator |
| `npm run web` | Starts the bundler targeting the web runtime |
| `npm run typecheck` | Runs the TypeScript compiler check (`tsc --noEmit`) |

---

## Core Feature Modules

1. **Authentication & Session Management (`src/features/auth`)**:
   - Secure Officer ID and password verification with mock offline authentication.
   - Persistent session storage and role-based badge identification.

2. **Command Center Dashboard (`src/features/dashboard`)**:
   - Metric summary cards: Pending, Completed, and High-Risk inspections.
   - Quick action shortcuts to start inspections, view history, or trigger sync.

3. **Field Inspections Wizard (`src/features/inspections`)**:
   - **Details Screen**: Overview of establishment, model approval number, serial number, and instrument class.
   - **Checklist Screen**: Mandatory physical integrity checklist (seal integrity, display clarity, level indicator, stamp verification).
   - **Measurements Screen**: Standard load tests vs actual readings with automatic percentage error and tolerance validation.
   - **AI Verification Screen**: Automated image and anomaly evaluation scoring fraud risk.
   - **Officer Decision & Review**: Final disposition (APPROVED, REJECTED, PENALTY_ISSUED) with fee calculations and certificate generation.

4. **Offline Database & Sync Engine (`src/core/storage/database`)**:
   - Robust local SQLite schema with automatic table migrations and self-healing connection recovery.
   - Support for queuing unsynced inspections and uploading when network connectivity returns.

5. **History & Audit Logs (`src/features/history`)**:
   - Comprehensive audit trail of past inspections with search and status filtering.

---

## Security & Privacy

- No sensitive credentials, private keys, or API tokens are tracked in this repository.
- Environment templates are maintained strictly via `.env.example`.
- Sensitive local files (`.env*`, `.expo`, `node_modules`) are excluded via `.gitignore`.

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
