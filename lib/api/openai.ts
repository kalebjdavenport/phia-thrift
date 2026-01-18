import { identificationResponseSchema, type IdentificationResponse } from "../schemas";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

const IDENTIFICATION_PROMPT = `Analyze this clothing item and respond with JSON only:
{
  "category": string,        // e.g., "Pants", "Shirt", "Jacket"
  "subcategory": string,     // e.g., "Jeans", "T-Shirt", "Blazer"
  "color": string,           // Primary color
  "pattern": string,         // e.g., "Solid", "Striped", "Plaid"
  "material": string | null, // Best guess: "Denim", "Cotton", "Wool"
  "style": string,           // e.g., "Casual", "Formal", "Sporty"
  "brand": string | null,    // Only if logo/label visible
  "productName": string | null, // Only if identifiable
  "confidence": {
    "brand": "high" | "medium" | "low" | "none",
    "material": "high" | "medium" | "low"
  },
  "reasoning": string        // Brief explanation
}`;

export async function identifyClothing(
  base64Image: string
): Promise<IdentificationResponse> {
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
