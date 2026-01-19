import { identificationResponseSchema, type IdentificationResponse } from "../schemas";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const USE_MOCK = false; // Set to false to use real API

const MOCK_RESPONSE: IdentificationResponse = {
  identified: true,
  category: "Pants",
  subcategory: "Jeans",
  color: "Blue",
  pattern: "Solid",
  material: "Denim",
  style: "Casual",
  brand: "Levi's",
  productName: "501 Original",
  confidence: { brand: "high", material: "high" },
  reasoning: "Classic blue denim jeans with visible Levi's red tab",
};

const IDENTIFICATION_PROMPT = `Act as an expert vintage clothing authenticator and thrift scout. 
Analyze the image(s) provided. 

CRITICAL BRAND ANALYSIS:
1. Scan for visible logos or emblems.
2. If no logo is visible, examine buttons, zippers, and rivets for engraved text.
3. Look at the "cut" and "silhouette" (e.g., specific vintage Levi's silhouettes).
4. Inspect the neck tag if visible. 

If the brand is not explicitly visible, provide your "Best Professional Guess" based on the design language, but reflect this in the "confidence" score.

Identify the clothing item at the CENTER of this image. Focus on whatever is in the middle/focal point of the photo, NOT whatever takes up the most space. If there are multiple items visible, analyze ONLY the one that appears to be the main subject based on positioning (centered) and focus.

If you CANNOT identify a clothing item (image is blurry, no clothing visible, unclear what the subject is, etc.), set "identified" to false and explain why in "reasoning". Use placeholder values for other fields.

Respond with JSON only:
{
  "identified": boolean,     // false if you cannot identify a clothing item
  "category": string,        // e.g., "Shoes", "Pants", "Shirt", "Jacket" (use "Unknown" if not identified)
  "subcategory": string,     // e.g., "Sneakers", "Jeans", "T-Shirt", "Blazer" (use "Unknown" if not identified)
  "color": string,           // Primary color (use "Unknown" if not identified)
  "pattern": string,         // e.g., "Solid", "Striped", "Plaid" (use "Unknown" if not identified)
  "material": string | null, // Best guess: "Leather", "Denim", "Cotton", "Wool"
  "style": string,           // e.g., "Casual", "Formal", "Sporty", "Athletic" (use "Unknown" if not identified)
  "brand": string,           // ALWAYS guess a brand, even if uncertain. Use style, cut, stitching, hardware, design elements, price point indicators. Never leave blank or null.
  "productName": string | null, // Best guess if recognizable
  "confidence": {
    "brand": "high" | "medium" | "low" | "none",  // high=logo visible, medium=distinctive features, low=educated guess, none=complete unknown
    "material": "high" | "medium" | "low" | "none"  // none if material cannot be determined
  },
  "reasoning": string        // Brief explanation. If not identified, explain why (blurry, no clothing, multiple items, etc.)
}`;

export async function identifyClothing(
  base64Image: string
): Promise<IdentificationResponse> {
  if (USE_MOCK) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return MOCK_RESPONSE;
  }

  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: IDENTIFICATION_PROMPT },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: "high",
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No content in OpenAI response");
  }

  // Parse the JSON response from GPT
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse JSON from GPT response");
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return identificationResponseSchema.parse(parsed);
}
