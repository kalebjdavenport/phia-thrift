# Phia Thrift

Camera app to identify clothing via dual AI APIs (Ximilar Fashion + GPT-4o Vision).

## Prerequisites

- **Node.js 20+** (required - uses modern JS features)
- **Xcode 15+** with iOS Simulator
- **Xcode Command Line Tools**: `xcode-select --install`
- API keys for Ximilar and OpenAI (see [Environment Variables](#environment-variables))

### Verify Node Version

```bash
node --version  # Should be v20.x or higher
```

If using nvm:
```bash
nvm install 20
nvm use 20
```

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/phia-thrift.git
   cd phia-thrift
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your API keys (see below).

## Environment Variables

Create a `.env` file in the project root:

```bash
EXPO_PUBLIC_XIMILAR_API_KEY=your_ximilar_api_key
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key
```

### Getting API Keys

- **Ximilar**: Sign up at [ximilar.com](https://www.ximilar.com/) → Free tier: 1,000 credits/month
- **OpenAI**: Get key at [platform.openai.com](https://platform.openai.com/) → Pay-per-use (~$0.01-0.03/image)

## Running the App

```bash
# Start Expo dev server
npm start

# Or run directly on iOS Simulator
npm run ios
```

Press `i` in the terminal to open iOS Simulator.

## Tech Stack

| Category | Package | Version |
|----------|---------|---------|
| Framework | Expo SDK | 54 |
| Runtime | React Native | 0.81.5 |
| React | React | 19.1 |
| Router | expo-router | 6.x |
| Styling | NativeWind | 4.x |
| Camera | expo-camera | 17.x |
| Bottom Sheet | @gorhom/bottom-sheet | 5.x |
| Validation | Zod | 4.x |
| State | Zustand | 5.x |

## Scripts

```bash
npm start          # Start Expo dev server
npm run ios        # Run on iOS Simulator
npm test           # Run tests
npm run test:watch # Run tests in watch mode
```

## Project Structure

```
app/                 # Expo Router screens
components/          # React components
  ui/                # Reusable UI components
hooks/               # Custom React hooks
lib/
  api/               # API clients (Ximilar, OpenAI)
  schemas.ts         # Zod validation schemas
  storage.ts         # AsyncStorage helpers
  types.ts           # TypeScript types
```

## Troubleshooting

### `configs.toReversed is not a function`
You're using Node < 20. Upgrade Node:
```bash
nvm install 20 && nvm use 20
```

### Camera not working in Simulator
The iOS Simulator doesn't have a real camera. Test on a physical device or use mock data.

### Metro bundler issues
Clear cache and restart:
```bash
npx expo start --clear
```

## License

MIT
