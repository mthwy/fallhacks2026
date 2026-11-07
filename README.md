# Pantry-to-Plate

A cross-platform Expo / React Native starter application for planning meals from a user's ingredient inventory.

## Included in this project

- iOS and Android app built with React Native + Expo + TypeScript.
- Local SQLite pantry database.
- Add, edit and delete pantry ingredients.
- Breakfast, lunch and dinner recipe requests.
- AI recipe-generation API using Google's Gemini API (API key stays on the server).
- Recipe suggestion cards and step-by-step cooking mode.
- Actual-usage confirmation before inventory deductions.
- Cooking history and undo-last-cook.
- Basic ingredient quantity validation on the API.

## Requirements

- Node.js 22.13 or newer (required by Expo SDK 58)
- npm
- Expo Go on a phone, or an iOS Simulator / Android Emulator
- A Gemini API key for AI recipe generation

## 1. Install the mobile app dependencies

From this project directory:

```bash
npm install
```

## 2. Configure and start the recipe API

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env` and set your Gemini key:

```env
GEMINI_API_KEY=your_real_key
GEMINI_MODEL=gemini-2.5-flash
PORT=4000
```

Start the API:

```bash
npm run dev
```

The API health check is at `http://localhost:4000/health`.

**Important:** Never put your Gemini key in the mobile app or commit it to source control.

## 3. Point the app at your API

In the project root, copy `.env.example` to `.env`.

For iOS Simulator / Android emulator, `http://localhost:4000` may work depending on your environment. For a physical phone, set the URL to your development computer's local network IP, for example:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.25:4000
```

Your phone and computer must be on the same Wi-Fi network. Ensure your firewall permits inbound connections to port 4000.

## 4. Start the mobile app

From the project root:

```bash
npm start
```

Scan the Expo QR code using Expo Go, or press `i` / `a` to launch a simulator/emulator.

## Current v1 notes and limitations

- Ingredient amounts are stored as decimal values with their entered unit. This version intentionally does not silently convert between grams, cups, tablespoons, pieces, etc.
- Recipe matching requires the AI to return exact pantry ingredient names and units. The backend rejects recipes that use unknown ingredients, mismatched units, or quantities greater than inventory.
- AI output is not a substitute for checking food allergies, safe food handling, or internal cooking temperatures.
- SQLite data is local to the device. Cloud accounts, multi-device sync, barcode scanning, notifications, image uploads and production deployment are not included in this first build.
- The current UI is a functional foundation and should be usability-tested and refined before public release.
- The undo function restores ingredient quantities from the most recent cooking log. Use it promptly and avoid making unrelated manual changes before undoing a cook.

## Expo SDK 58

This project targets Expo SDK 58, React Native 0.88, and React 19.3. Use Node.js 22.13 or newer. Run `npm install`, `npx expo install --fix`, and `npx expo-doctor` from the project root. SDK 58 requires a compatible Expo Go release or a development build.
