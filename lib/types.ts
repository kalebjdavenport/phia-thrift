export type IdentificationResult = {
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

export type StorageKeys = {
  "phia:permissions:camera": "granted" | "denied" | null;
  "phia:lastCapture": {
    imageUri: string;
    timestamp: number;
    result: IdentificationResult | null;
  } | null;
};
