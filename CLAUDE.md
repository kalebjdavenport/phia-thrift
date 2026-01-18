# Phia Thrift

Camera app to identify clothing via dual AI APIs (Ximilar Fashion + GPT-4o Vision).

## MVP Flow

Permission Primer → Camera → Capture → Results Sheet

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
  primer.tsx           # Permission primer screen
  camera.tsx           # Main camera screen

components/
  ui/                  # React Native Reusables (shadcn-style)
  ResultsSheet.tsx     # Bottom sheet for results
  CaptureButton.tsx    # Camera capture button

lib/
  api/
    ximilar.ts         # Ximilar Fashion API client
    openai.ts          # GPT-4o Vision client
    identify.ts        # Parallel API orchestration
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
- `EXPO_PUBLIC_XIMILAR_API_KEY`
- `EXPO_PUBLIC_OPENAI_API_KEY`

### Parallel API Calls
Always use `Promise.allSettled` for dual API calls to handle partial failures gracefully.

### Zod Validation
Validate all API responses with Zod schemas before use.

### Permission Flow
1. Check camera permission on app launch
2. Show primer screen if not granted
3. Request permission from primer
4. Redirect to camera on grant
