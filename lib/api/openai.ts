import { gptBrandResponseSchema, type GPTBrandResponse } from "../schemas";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

const BRAND_IDENTIFICATION_PROMPT = `Analyze this clothing item. Identify the brand if visible (logos, labels, distinctive patterns). Respond with JSON only: { "brand": string | null, "productName": string | null, "confidence": "high" | "medium" | "low", "reasoning": string }`;

export async function fetchGPTBrandInfo(
  base64Image: string
): Promise<GPTBrandResponse> {
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
            { type: "text", text: BRAND_IDENTIFICATION_PROMPT },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
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
  return gptBrandResponseSchema.parse(parsed);
}
