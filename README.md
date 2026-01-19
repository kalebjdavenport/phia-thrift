# Phia Thrift

Snap a photo of any clothing item and instantly identify the brand, material, and style using GPT-4o Vision. Search results on [Phia](https://phia.com) with one tap.

<p align="center">
  <img width="260" alt="Landing screen" src="https://github.com/user-attachments/assets/44a5e036-0f6f-4e37-a546-18462cb7ded1" />
  <img width="260" alt="Results screen" src="https://github.com/user-attachments/assets/63a33f30-6db6-4b1f-a1a7-e11d89d85277" />
</p>

## Quick Start

```bash
git clone https://github.com/kalebjdavenport/phia-thrift.git
cd phia-thrift
npm install
cp .env.example .env    # Add your OpenAI API key
npm run ios
```

**Requirements:** Node.js 20+, Xcode 15+

## Environment Variables

```bash
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key
```

Get your API key at [platform.openai.com](https://platform.openai.com)

## Tech Stack

- **Expo SDK 54** with React Native 0.81.5
- **expo-router v6** for file-based navigation
- **NativeWind** for Tailwind CSS styling
- **GPT-4o Vision** for clothing identification
- **@gorhom/bottom-sheet** for results display

## Project Structure

```
app/                 # Screens (primer, camera)
components/          # UI components
hooks/               # useCamera, useIdentification
lib/
  api/openai.ts      # Vision API client
  schemas.ts         # Zod validation
  types.ts           # TypeScript types
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run ios` | Run on iOS Simulator |
| `npm test` | Run tests |

## License

MIT
