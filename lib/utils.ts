import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { IdentificationResponse } from "./schemas";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function buildPhiaSearchUrl(result: IdentificationResponse): string {
  const parts = [
    result.brand,
    result.subcategory,
    result.color,
    result.material,
    result.pattern,
    result.style,
    result.productName,
  ].filter((part): part is string => !!part);

  const query = parts.join(" ");
  return `https://phia.com/search/${encodeURIComponent(query)}`;
}
