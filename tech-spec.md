# Phia Thrift Technical Specification

## Overview

Camera app to identify clothing via GPT-4o Vision API. Users capture photos of clothing items, which are analyzed by OpenAI GPT-4o Vision for comprehensive clothing identification including category, attributes, and brand detection.

## MVP Flow

```
Permission Primer → Camera → Capture → Results Sheet
```

---

## Tech Stack

| Category | Package | Version | Purpose |
|----------|---------|---------|---------|
| Framework | expo | ~54.0 | React Native framework |
| Router | expo-router | ~6.0 | File-based routing with typed routes |
| Styling | nativewind | ^4.0 | Tailwind CSS for React Native |
| UI Components | @react-native-reusables/* | latest | shadcn-style components |
| Camera | expo-camera | ~16.0 | Camera capture |
| Image Utils | expo-image-manipulator | ~13.0 | Base64 conversion |
| Bottom Sheet | @gorhom/bottom-sheet | ^5.0 | Results overlay |
| Gestures | react-native-gesture-handler | ~2.24 | Touch gestures |
| Animations | react-native-reanimated | ~4.1 | Smooth animations |
| Storage | @react-native-async-storage/async-storage | ^2.0 | Persistence |
| Validation | zod | ^3.23 | Runtime type safety |
| State | zustand | ^5.0 | Minimal state management |

---

## API Integration

### OpenAI GPT-4o Vision API

Identifies all clothing attributes including category, color, pattern, material, style, and brand.

**Endpoint:** `POST https://api.openai.com/v1/chat/completions`

**Request:**
```typescript
// Headers
{
  "Authorization": "Bearer {EXPO_PUBLIC_OPENAI_API_KEY}",
  "Content-Type": "application/json"
}

// Body
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "Analyze this clothing item and respond with JSON only: { \"category\": string, \"subcategory\": string, \"color\": string, \"pattern\": string, \"material\": string | null, \"style\": string, \"brand\": string | null, \"productName\": string | null, \"confidence\": { \"brand\": \"high\" | \"medium\" | \"low\" | \"none\", \"material\": \"high\" | \"medium\" | \"low\" }, \"reasoning\": string }"
        },
        {
          "type": "image_url",
          "image_url": {
            "url": "data:image/jpeg;base64,<base64-encoded-image>"
          }
        }
      ]
    }
  ],
  "max_tokens": 500
}
```

**Response Schema (Zod):**
```typescript
const identificationResponseSchema = z.object({
  category: z.string(),
  subcategory: z.string(),
  color: z.string(),
  pattern: z.string(),
  material: z.string().nullable(),
  style: z.string(),
  brand: z.string().nullable(),
  productName: z.string().nullable(),
  confidence: z.object({
    brand: z.enum(["high", "medium", "low", "none"]),
    material: z.enum(["high", "medium", "low"]),
  }),
  reasoning: z.string(),
});

type IdentificationResponse = z.infer<typeof identificationResponseSchema>;
```

### Result Type

```typescript
type IdentificationResult = {
  category: string;
  subcategory: string;
  color: string;
  pattern: string;
  material: string | null;
  style: string;
  brand: string | null;
  productName: string | null;
  confidence: {
    brand: "high" | "medium" | "low" | "none";
    material: "high" | "medium" | "low";
  };
  reasoning: string;
  timestamp: number;
};

async function identifyClothing(base64Image: string): Promise<IdentificationResponse> {
  // Single API call to GPT-4o Vision
  // Validates response with Zod schema
  // Returns parsed result
}
```

---

## AsyncStorage Schema

```typescript
type StorageKeys = {
  "phia:permissions:camera": "granted" | "denied" | null;
  "phia:lastCapture": {
    imageUri: string;
    timestamp: number;
    result: IdentificationResult | null;
  } | null;
};

// Typed storage helpers
async function getStorageItem<K extends keyof StorageKeys>(
  key: K
): Promise<StorageKeys[K] | null>;

async function setStorageItem<K extends keyof StorageKeys>(
  key: K,
  value: StorageKeys[K]
): Promise<void>;
```

---

## File Structure

```
app/
  _layout.tsx          # Root layout with providers
  index.tsx            # Permission check → redirect
  primer.tsx           # Permission primer screen
  camera.tsx           # Main camera screen

components/
  ui/                  # React Native Reusables (shadcn-style)
    button.tsx
    card.tsx
    text.tsx
    ...
  ResultsSheet.tsx     # Bottom sheet overlay for results
  CaptureButton.tsx    # Capture button with animation

lib/
  api/
    openai.ts          # GPT-4o Vision client with Zod validation
  storage.ts           # Typed AsyncStorage helpers
  schemas.ts           # Zod schemas
  types.ts             # TypeScript types

hooks/
  useCamera.ts         # Camera ref, capture controls
  useIdentification.ts # Identification flow state machine

__tests__/
  api/
    openai.test.ts     # GPT-4o API tests with mocks
  components/
    ResultsSheet.test.tsx
  integration/
    permission-flow.test.tsx
    capture-flow.test.tsx
```

---

## High-Impact Test List

1. **Permission flow** - Primer shows when permission not granted, redirects after grant
2. **Camera capture** - Image captured and converted to base64
3. **GPT-4o API** - Request format, response parsing, error handling
4. **Response validation** - Zod schema validates all fields correctly
5. **Error handling** - Timeout, rate limit, invalid response handling
6. **Results sheet display** - All result fields render with correct data
7. **Confidence badges** - Brand and material confidence levels display correctly
8. **AsyncStorage persistence** - Last capture restores on app reopen

---

## Environment Variables

Create `.env` file (gitignored):

```bash
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key
```

Access in code:
```typescript
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
```

---

## Error Handling

### API Errors
- **Network failure**: Show retry button, cache last successful result
- **Rate limit**: Show "Please wait" message with countdown
- **Invalid response**: Log to console, show generic error to user
- **Parse failure**: Fallback to raw content display if JSON parsing fails

### User-Facing Error Messages
```typescript
const ERROR_MESSAGES = {
  noClothingDetected: "No clothing items detected. Try a clearer photo.",
  networkError: "Unable to connect. Check your internet connection.",
  apiTimeout: "Analysis taking too long. Please try again.",
  rateLimit: "Too many requests. Please wait a moment.",
  unknown: "Something went wrong. Please try again.",
} as const;
```

---

## Screen Specifications

### Permission Primer (`primer.tsx`)
- Full-screen with centered content
- Camera icon or illustration
- Title: "Camera Access Needed"
- Subtitle: Explain why camera is needed
- "Enable Camera" button → triggers permission request
- On grant → navigate to `/camera`
- On deny → show "Settings" button to open app settings

### Camera Screen (`camera.tsx`)
- Full-screen camera preview
- Capture button (bottom center)
- On capture:
  1. Take photo
  2. Convert to base64
  3. Show loading state
  4. Call `identifyClothing()`
  5. Show results in bottom sheet

### Results Sheet (`ResultsSheet.tsx`)
- Uses `@gorhom/bottom-sheet`
- Snap points: 30%, 60%, 90%
- Content sections:
  - Brand (if detected) with confidence badge
  - Category and Subcategory
  - Color, Pattern, Material (with confidence)
  - Style
  - Reasoning explanation
- "Capture Again" button
