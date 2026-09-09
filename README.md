# ScaleGuard LMO Officer Mobile App

## Project

ScaleGuard LMO Officer Mobile Application

## Current Phase

Phase 1 — Project Foundation & Application Shell

## Purpose

ScaleGuard is a digital Legal Metrology verification platform for weighing and measuring instruments.
This mobile application will eventually be used by LMO officers for field verification of weighing/measuring instruments. It is designed to be an **offline-first field inspection application**, where an officer can receive assignments, inspect an instrument, capture photos, record readings/observations, and synchronize inspection data when connectivity becomes available.

## Current Implementation

In Phase 1, the following foundation was implemented:
- Initialized React Native Expo project with TypeScript.
- Created a modular architecture with `core`, `shared`, and `features` boundaries.
- Defined a `theme` system with colors, typography, and spacing tailored for professional field use.
- Set up a clean `navigation` foundation using React Navigation (Stack + Bottom Tabs).
- Created a `SplashScreen` that mimics app initialization and navigates to the App Shell.
- Built reusable shared components (`PrimaryButton`, `AppCard`, etc.).
- Drafted the API abstraction (`apiClient.ts`) and Local Storage (`localStorage.ts`) for offline-first readiness.
- Defined `models` and types (`Inspection`, `Officer`, `Instrument`, `Location`, etc.).
- Created placeholder screens for features coming in future phases.
- Built a functional placeholder Dashboard.

## Architecture

The architecture maintains these conceptual layers:
- **Core (`src/core/`)**: Configuration, theming, routing, network, local storage, and error handling.
- **Shared (`src/shared/`)**: Reusable widgets/components, domain models.
- **Features (`src/features/`)**: Modules for specific app functionality (Splash, Auth, Dashboard, Inspections, Camera, AI, etc.).

## Future Phases

- Phase 2 — Authentication
- Phase 3 — Dashboard
- Phase 4 — Assigned Inspections & Scheduling
- Phase 5 — Inspection Details
- Phase 6 — Camera & Photo Capture
- Phase 7 — Readings & Observations
- Phase 8 — Offline Storage & Sync
- Phase 9 — AI Verification
- Phase 10 — Officer Decision & Submission
- Phase 11 — History
- Phase 12 — Notifications
- Phase 13 — Integration & Testing

## Running the Project

### Prerequisites
- Node.js installed
- iOS Simulator or Android Emulator (or Expo Go app on your physical device)

### Commands
Navigate to the project directory:
```bash
cd "LMO App/ScaleGuardApp"
```

Start the development environment:
```bash
npm start
```
From there, you can press `a` to open on Android, `i` to open on iOS, or scan the QR code with the Expo Go app on your physical device.

To run tests (placeholder script):
```bash
npm test
```
