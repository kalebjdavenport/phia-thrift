import { z } from "zod";

// Ximilar API Schemas
export const ximilarTagSchema = z.object({
  name: z.string(),
  prob: z.number(),
});

export const ximilarRecordSchema = z.object({
  _tags: z.record(z.array(ximilarTagSchema)),
  _objects: z
    .array(
      z.object({
        name: z.string(),
        prob: z.number(),
        bound_box: z.array(z.number()).optional(),
      })
    )
    .optional(),
});

export const ximilarResponseSchema = z.object({
  records: z.array(ximilarRecordSchema),
});

// GPT-4o API Schemas
export const gptBrandResponseSchema = z.object({
  brand: z.string().nullable(),
  productName: z.string().nullable(),
  confidence: z.enum(["high", "medium", "low"]),
  reasoning: z.string(),
});

export type XimilarResponse = z.infer<typeof ximilarResponseSchema>;
export type GPTBrandResponse = z.infer<typeof gptBrandResponseSchema>;
