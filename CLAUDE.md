# Phia Thrift

Camera app to identify clothing via GPT-4o Vision API.

## MVP Flow

Landing → Camera → Capture → Results Sheet

## Commands

```bash
npm start           # Start Expo dev server
npm run ios         # Run on iOS simulator
npm run android     # Run on Android emulator
npm test            # Run tests
```

## Architecture

- **Expo SDK 54** with new architecture enabled
- **React Native 0.81.5**, React 19.1
- **expo-router v6** with typed routes (file-based routing)
- **TypeScript strict mode**
- **NativeWind** for Tailwind CSS styling
- **Zustand** for state management
- **Zod** for runtime validation

## File Structure

```
app/
  _layout.tsx          # Root layout with providers
  index.tsx            # Permission check → redirect
  primer.tsx           # Landing screen ("Open Camera" CTA)
  camera.tsx           # Main camera screen

components/
  ui/                  # React Native Reusables (shadcn-style)
  ResultsSheet.tsx     # Bottom sheet for results
  CaptureButton.tsx    # Camera capture button

lib/
  api/
    openai.ts          # GPT-4o Vision client (clothing identification)
  storage.ts           # Typed AsyncStorage helpers
  schemas.ts           # Zod schemas
  types.ts             # TypeScript types

hooks/
  useCamera.ts         # Camera controls
  useIdentification.ts # Identification flow
```

## Critical Patterns

### API Keys
Store in `.env` (gitignored), access via `process.env.EXPO_PUBLIC_*`:
- `EXPO_PUBLIC_OPENAI_API_KEY`

### Zod Validation
Validate all API responses with Zod schemas before use.

### App Flow
1. Check camera permission on app launch
2. If granted → go directly to camera
3. If not granted → show landing screen
4. Tap "Open Camera" → request permission → open camera

### Phia Search Feature
After identification, show a "Search on Phia" button that opens external search.

**URL format:** `https://phia.com/search/{brand}%20{subcategory}%20{color}%20{material}%20{pattern}%20{style}%20{productName}`

**Rules:**
- Only show button when `confidence.brand !== 'none'`
- URL-encode all values, filter out null/empty values
- Variable order: brand (1st), subcategory (2nd), then color, material, pattern, style, productName
- Big purple button at bottom of ResultsSheet
