import { z } from "zod";

// GPT-4o unified identification response schema
export const identificationResponseSchema = z.object({
  category: z.string(),
  subcategory: z.string(),
  color: z.string(),
  pattern: z.string(),
  material: z.string().nullable(),
  style: z.string(),
  brand: z.string().nullable(),
  productName: z.string().nullable(),
  confidence: z.object({
    brand: z.enum(["high", "medium", "low", "none"]),
    material: z.enum(["high", "medium", "low"]),
  }),
  reasoning: z.string(),
});

export type IdentificationResponse = z.infer<typeof identificationResponseSchema>;
