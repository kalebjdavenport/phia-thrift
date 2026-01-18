export type IdentificationResult = {
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

export type StorageKeys = {
  "phia:permissions:camera": "granted" | "denied" | null;
  "phia:lastCapture": {
    imageUri: string;
    timestamp: number;
    result: IdentificationResult | null;
  } | null;
  "phia:settings:flash": "on" | "off" | "auto";
};
