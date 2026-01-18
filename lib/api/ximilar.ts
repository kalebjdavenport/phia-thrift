import { ximilarResponseSchema } from "../schemas";

const XIMILAR_API_URL =
  "https://api.ximilar.com/tagging/fashion/v2/detect_tags";
const XIMILAR_API_KEY = process.env.EXPO_PUBLIC_XIMILAR_API_KEY;

export type XimilarResult = {
  category: string | null;
  color: string | null;
  pattern: string | null;
  material: string | null;
  style: string | null;
  tags: Array<{ name: string; confidence: number }>;
};

export async function fetchXimilarTags(
  base64Image: string
): Promise<XimilarResult> {
  if (!XIMILAR_API_KEY) {
    throw new Error("XIMILAR_API_KEY not configured");
  }

  const response = await fetch(XIMILAR_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Token ${XIMILAR_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      records: [{ base64: base64Image }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Ximilar API error: ${response.status}`);
  }

  const data = await response.json();
  const parsed = ximilarResponseSchema.parse(data);

  // Extract relevant tags from the response
  const record = parsed.records[0];
  if (!record) {
    return {
      category: null,
      color: null,
      pattern: null,
      material: null,
      style: null,
      tags: [],
    };
  }

  const allTags = Object.values(record._tags).flat();

  return {
    category: findTag(allTags, "Category"),
    color: findTag(allTags, "Color"),
    pattern: findTag(allTags, "Pattern"),
    material: findTag(allTags, "Material"),
    style: findTag(allTags, "Style"),
    tags: allTags.map((t) => ({ name: t.name, confidence: t.prob })),
  };
}

function findTag(
  tags: Array<{ name: string; prob: number }>,
  prefix: string
): string | null {
  const tag = tags.find((t) => t.name.toLowerCase().includes(prefix.toLowerCase()));
  return tag?.name ?? null;
}
