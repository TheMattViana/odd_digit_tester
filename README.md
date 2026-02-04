# PIN Upgrade Security Study

This is a web interface prototyped to test user behavior when upgrading PINs from 5 digits to 7 digits using a constrained keypad (odd numbers only).

## Tech Stack
- React
- Vite
- Tailwind CSS

## Architecture
- **App.jsx**: Main state machine handling the flow (Setup 5 -> Interstitial -> Setup 7 -> Results).
- **components/Keypad.jsx**: The restricted keypad component (1, 3, 5, 7, 9).
- **components/PinDisplay.jsx**: The visual feedback for PIN entry (dots).

## How to Run

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open the link (usually http://localhost:5173).

## Features
- **Constrained Flow**: Users must upgrade from 5 digits to 7 digits.
- **Security Analysis**: Automatically checks for:
  - **Targeted Append**: Did the user just add digits to the end?
  - **Repetition**: Did the user repeated digits?
  - **Subsequence**: Is the old PIN contained in the new PIN?
- **Aesthetic**: iOS Lock Screen style with blur effects and animations.
