# Phia Thrift Technical Specification

## Overview

Camera app to identify clothing via dual AI APIs. Users capture photos of clothing items, which are analyzed in parallel by Ximilar Fashion API (for attributes/tags) and OpenAI GPT-4o Vision (for brand identification).

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

### Ximilar Fashion API

Detects clothing attributes, categories, and visual features.

**Endpoint:** `POST https://api.ximilar.com/tagging/fashion/v2/detect_tags`

**Request:**
```typescript
// Headers
{
  "Authorization": "Token {EXPO_PUBLIC_XIMILAR_API_KEY}",
  "Content-Type": "application/json"
}

// Body
{
  "records": [
    { "base64": "<base64-encoded-image>" }
  ]
}
```

**Response Schema (Zod):**
```typescript
const ximilarTagSchema = z.object({
  name: z.string(),
  prob: z.number(),
});

const ximilarRecordSchema = z.object({
  _tags: z.record(z.array(ximilarTagSchema)),
  _objects: z.array(z.object({
    name: z.string(),
    prob: z.number(),
    bound_box: z.array(z.number()).optional(),
  })).optional(),
});

const ximilarResponseSchema = z.object({
  records: z.array(ximilarRecordSchema),
});

// Extracted result type
type XimilarResult = {
  category: string | null;
  color: string | null;
  pattern: string | null;
  material: string | null;
  style: string | null;
  tags: Array<{ name: string; confidence: number }>;
};
```

### OpenAI GPT-4o Vision API

Identifies brand and product information from clothing images.

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
          "text": "Analyze this clothing item. Identify the brand if visible (logos, labels, distinctive patterns). Respond with JSON: { \"brand\": string | null, \"productName\": string | null, \"confidence\": \"high\" | \"medium\" | \"low\", \"reasoning\": string }"
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
  "max_tokens": 300
}
```

**Response Schema (Zod):**
```typescript
const gptBrandResponseSchema = z.object({
  brand: z.string().nullable(),
  productName: z.string().nullable(),
  confidence: z.enum(["high", "medium", "low"]),
  reasoning: z.string(),
});

type GPTBrandResult = z.infer<typeof gptBrandResponseSchema>;
```

### Parallel Execution Pattern

```typescript
type IdentificationResult = {
  // From Ximilar
  category: string | null;
  color: string | null;
  pattern: string | null;
  material: string | null;
  style: string | null;
  tags: Array<{ name: string; confidence: number }>;

  // From GPT-4o
  brand: string | null;
  productName: string | null;
  brandConfidence: "high" | "medium" | "low" | null;
  brandReasoning: string | null;

  // Meta
  timestamp: number;
  errors: Array<{ source: "ximilar" | "openai"; message: string }>;
};

async function identifyClothing(base64Image: string): Promise<IdentificationResult> {
  const [ximilarResult, gptResult] = await Promise.allSettled([
    fetchXimilarTags(base64Image),
    fetchGPTBrandInfo(base64Image),
  ]);

  return mergeResults(ximilarResult, gptResult);
}

function mergeResults(
  ximilar: PromiseSettledResult<XimilarResult>,
  gpt: PromiseSettledResult<GPTBrandResult>
): IdentificationResult {
  const errors: IdentificationResult["errors"] = [];

  let ximilarData: Partial<XimilarResult> = {};
  if (ximilar.status === "fulfilled") {
    ximilarData = ximilar.value;
  } else {
    errors.push({ source: "ximilar", message: ximilar.reason?.message ?? "Unknown error" });
  }

  let gptData: Partial<GPTBrandResult> = {};
  if (gpt.status === "fulfilled") {
    gptData = gpt.value;
  } else {
    errors.push({ source: "openai", message: gpt.reason?.message ?? "Unknown error" });
  }

  return {
    category: ximilarData.category ?? null,
    color: ximilarData.color ?? null,
    pattern: ximilarData.pattern ?? null,
    material: ximilarData.material ?? null,
    style: ximilarData.style ?? null,
    tags: ximilarData.tags ?? [],
    brand: gptData.brand ?? null,
    productName: gptData.productName ?? null,
    brandConfidence: gptData.confidence ?? null,
    brandReasoning: gptData.reasoning ?? null,
    timestamp: Date.now(),
    errors,
  };
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
    ximilar.ts         # Ximilar client with Zod validation
    openai.ts          # GPT-4o client with Zod validation
    identify.ts        # Parallel orchestration & result merging
  storage.ts           # Typed AsyncStorage helpers
  schemas.ts           # Shared Zod schemas
  types.ts             # TypeScript types

hooks/
  useCamera.ts         # Camera ref, capture controls
  useIdentification.ts # Identification flow state machine

__tests__/
  api/
    ximilar.test.ts    # Ximilar API tests with mocks
    openai.test.ts     # GPT-4o API tests with mocks
    identify.test.ts   # Parallel execution tests
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
3. **Ximilar API** - Request format, response parsing, error handling
4. **GPT-4o API** - Request format, response parsing, error handling
5. **Parallel execution** - Both APIs called simultaneously, partial failures handled
6. **Result merging** - Ximilar attributes + GPT brand combined correctly
7. **Bottom sheet display** - All result fields render with correct data
8. **Error states** - No clothing detected, API timeout, rate limit messages
9. **AsyncStorage persistence** - Last capture restores on app reopen

---

## Environment Variables

Create `.env` file (gitignored):

```bash
EXPO_PUBLIC_XIMILAR_API_KEY=your_ximilar_api_key
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key
```

Access in code:
```typescript
const XIMILAR_API_KEY = process.env.EXPO_PUBLIC_XIMILAR_API_KEY;
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
```

---

## Error Handling

### API Errors
- **Network failure**: Show retry button, cache last successful result
- **Rate limit**: Show "Please wait" message with countdown
- **Invalid response**: Log to console, show generic error to user
- **Partial failure**: Display available data with indicator for failed source

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
  - Category
  - Color, Pattern, Material
  - Style tags as chips
  - Errors section (if any API failed)
- "Capture Again" button
