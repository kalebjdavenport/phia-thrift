# Phia Thrift: Clothing Identification App

## Product Vision

**One sentence:** Point your camera at any clothing item and instantly know what it is.

Phia Thrift is a mobile app that uses the device camera to identify clothing items, surfacing brand, product name, and detailed garment attributes. The app opens directly to a full-screen camera experience.

---

## MVP Scope

### What the MVP Does

1. Permission Primer: A clean one-time screen explaining why the app needs camera access.
2. Opens directly to full-screen camera
3. User captures an image of a clothing item
4. Identifies the item and displays brand, product name, and garment attributes

### What the MVP Does NOT Do (Future)

- History of past identifications
- Shopping links or price comparisons
- Social sharing or community features
- Authenticity verification
- Outfit recommendations or styling
- Real-time AR overlays or bounding boxes
- Offline mode

---

## User Experience

### Screen 0: Permissions Primer
To avoid the "black screen of death" or immediate system-prompt rejection, the app starts here if permissions are not yet granted.

UI: Simple icon, "Phia Thrift needs your camera to identify clothes," and a "Get Started" button.

Behavior: Tapping "Get Started" triggers the system Camera.requestCameraPermissionsAsync()

### Screen 1: Camera (Home)

The app opens directly to a full-screen camera view. No splash screen, no onboarding—straight to the camera.

**Behavior:**
- Camera fills the entire screen
- User taps the capture button to take a photo
- Brief loading state (2-4 seconds) while AI processes
- Results appear in a bottom sheet overlay

**Camera View Elements:**
- Viewfinder (full screen)
- Capture button (center bottom)
- Flash toggle (top right)

### Screen 2: Identification Results (Bottom Sheet)

After capture, results slide up from the bottom as a draggable sheet.

**Information Displayed:**

*From GPT-4o (Brand Recognition):*
- **Brand:** e.g., "Levi's" or "Unknown Brand"
- **Product Name:** e.g., "501 Original Fit Jeans" or "Denim Jacket"

*From Ximilar (Garment Attributes):*
- **Category:** e.g., "Clothing/Pants"
- **Subcategory:** e.g., "jeans", "sweat pants", "chinos"
- **Color:** e.g., "blue", "grey", "black"
- **Material:** e.g., "denim", "cotton", "linen"
- **Style:** e.g., "casual", "formal", "sporty"
- **Fit:** e.g., "slim", "straight", "relaxed"
- **Design/Pattern:** e.g., "solid", "striped", "melange"
- **Gender:** e.g., "men", "women", "unisex"

*UI Presentation:*
- Thumbnail of the captured image at top
- Brand + Product Name prominently displayed
- Attributes shown as tags/chips below

**Actions:**
- Retake (dismiss and return to camera)
- Share (copy info to clipboard)

---

## Identification Architecture

Phia Thrift uses a **Hybrid Parallel API** approach. By triggering two specialized services simultaneously, the app balances speed (Ximilar) with high-level intelligence (GPT-4o).



### 1. Parallel Execution Logic
The app uses `Promise.allSettled` to prevent a slow response from one service from blocking the other. This allows for a "progressive" UI where results populate as they arrive.

```typescript
/**
 * Triggers both identification services in parallel.
 * Ximilar (Attributes): Fast (~1s)
 * GPT-4o (Brand/Product): Precise (~3-4s)
 */
const [ximilarResult, gptResult] = await Promise.allSettled([
  fetchXimilarTags(base64Image),
  fetchGPTBrandInfo(base64Image)
]);
```

### Hybrid AI Approach

The app uses two AI services in parallel to get comprehensive identification:

```
┌─────────────────┐
│  Captured Image │
│     (JPG)       │
└────────┬────────┘
         │
         ├─────────────────────────────────┐
         │                                 │
         ▼                                 ▼
┌─────────────────┐               ┌─────────────────┐
│    Ximilar      │               │     GPT-4o      │
│  Fashion API    │               │   Vision API    │
└────────┬────────┘               └────────┬────────┘
         │                                 │
         │ Returns:                        │ Returns:
         │ • Category                      │ • Brand
         │ • Subcategory                   │ • Product Name
         │ • Color                         │
         │ • Material                      │
         │ • Style                         │
         │ • Fit                           │
         │ • Design/Pattern                │
         │ • Gender                        │
         │                                 │
         └─────────────┬───────────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  Combined Result │
              │  Displayed to    │
              │      User        │
              └─────────────────┘
```

### Why Two Services?

| Service | Strength | Limitation |
|---------|----------|------------|
| **Ximilar** | Structured taxonomy, consistent attribute tagging, fast | No brand recognition, no product name identification |
| **GPT-4o** | Excellent at logo/brand recognition, can identify specific products | Inconsistent attribute formatting, slower, more expensive |

By combining both, we get the best of each: reliable structured data from Ximilar plus intelligent brand recognition from GPT-4o.

### API Details

**Ximilar Fashion Tagging API**
- Endpoint: `POST https://api.ximilar.com/tagging/fashion/v2/detect_tags`
- Input: Base64-encoded JPG image
- Cost: 20 credits per request
- Free tier: 1,000 credits/month (~50 identifications)
- Response time: ~1 second

**OpenAI GPT-4o Vision API**
- Endpoint: `POST https://api.openai.com/v1/chat/completions`
- Input: Base64-encoded image + prompt
- Cost: ~$0.01-0.03 per image (depending on size)
- Response time: ~2-3 seconds

---

## Data Model

### Identification Result

```typescript
interface IdentificationResult {
  // From GPT-4o
  brand: string | null;
  productName: string | null;
  
  // From Ximilar
  category: string;        // e.g., "Clothing/Pants"
  subcategory: string;     // e.g., "jeans"
  color: string;           // e.g., "blue"
  material: string | null; // e.g., "denim"
  style: string | null;    // e.g., "casual"
  fit: string | null;      // e.g., "slim"
  design: string | null;   // e.g., "solid"
  gender: string | null;   // e.g., "men"
}
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Time from capture to results | Under 5 seconds |
| Category identification accuracy (Ximilar) | 90%+ |
| Brand identification rate (GPT-4o) | 70%+ for items with visible logos/tags |
| App crash rate | Under 1% |

---

## Technical Requirements

### Platform
- iOS only (iPhone 12 or newer)
- Built with Expo / React Native
- TypeScript

### Network
- Requires internet connection (no offline mode)
- Both API calls made in parallel to minimize wait time

### Storage
- AsyncStorage for any transient app state (e.g., last captured image URI for re-render on app reopen)
- No persistent history storage

### API Keys
- Ximilar API token (free tier: 1,000 credits/month)
- OpenAI API key (pay-per-use: ~$0.01-0.03 per image)

---

## GPT-4o Prompt Design

The prompt sent to GPT-4o should be structured to return consistent, parseable results:

```
You are a fashion expert identifying clothing items from photos.

Analyze this image and identify:
1. Brand name (if visible via logo, tag, or distinctive design)
2. Product name or line (if identifiable)

If you cannot determine the brand with confidence, respond with "Unknown".
If you can identify the brand but not the specific product, just provide the brand.

Respond in this exact JSON format:
{
  "brand": "Brand Name" or null,
  "productName": "Product Name" or null,
  "confidence": "high" | "medium" | "low",
  "reasoning": "Brief explanation of how you identified this"
}
```

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| No clothing detected in image | Show error: "No clothing item detected. Try again with a clearer shot." |
| Brand not identifiable | Display "Unknown Brand" with category/attributes still shown |
| Multiple items in frame | Ximilar identifies largest item; note this in UI |
| Poor image quality | Show warning but attempt identification anyway |
| API timeout | Show error with retry option |
| API rate limit hit | Show error: "Too many requests. Please wait a moment." |

---

## Next Steps

1. **Set up Ximilar account** and test API with sample images
2. **Test GPT-4o prompt** with various clothing images to validate accuracy
3. **Build camera screen** with Expo Camera
4. **Implement parallel API calls** and result merging
5. **Design results bottom sheet UI** with brand + attributes layout
6. **Test end-to-end flow** with real clothing items