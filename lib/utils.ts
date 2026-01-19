import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { IdentificationResponse } from "./schemas";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function buildPhiaSearchUrl(result: IdentificationResponse): string | null {
  const parts = [
    result.brand,
    result.subcategory,
    result.productName,
    result.color,
    result.material,
  ].filter((part): part is string => !!part);

  if (parts.length === 0) return null;

  const query = parts.join(" ");
  return `https://phia.com/search/${encodeURIComponent(query)}`;
}
