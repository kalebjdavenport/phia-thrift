import type { IdentificationResult } from "../types";
import { fetchXimilarTags, type XimilarResult } from "./ximilar";
import { fetchGPTBrandInfo } from "./openai";
import type { GPTBrandResponse } from "../schemas";

export async function identifyClothing(
  base64Image: string
): Promise<IdentificationResult> {
  const [ximilarResult, gptResult] = await Promise.allSettled([
    fetchXimilarTags(base64Image),
    fetchGPTBrandInfo(base64Image),
  ]);

  return mergeResults(ximilarResult, gptResult);
}

function mergeResults(
  ximilar: PromiseSettledResult<XimilarResult>,
  gpt: PromiseSettledResult<GPTBrandResponse>
): IdentificationResult {
  const errors: IdentificationResult["errors"] = [];

  let ximilarData: Partial<XimilarResult> = {};
  if (ximilar.status === "fulfilled") {
    ximilarData = ximilar.value;
  } else {
    errors.push({
      source: "ximilar",
      message: ximilar.reason?.message ?? "Unknown error",
    });
  }

  let gptData: Partial<GPTBrandResponse> = {};
  if (gpt.status === "fulfilled") {
    gptData = gpt.value;
  } else {
    errors.push({
      source: "openai",
      message: gpt.reason?.message ?? "Unknown error",
    });
  }

  return {
    category: ximilarData.category ?? null,
    color: ximilarData.color ?? null,
    pattern: ximilarData.pattern ?? null,
    material: ximilarData.material ?? null,
    style: ximilarData.style ?? null,
    tags: ximilarData.tags ?? [],
    brand: gptData.brand ?? null,
    productName: gptData.productName ?? null,
    brandConfidence: gptData.confidence ?? null,
    brandReasoning: gptData.reasoning ?? null,
    timestamp: Date.now(),
    errors,
  };
}
