import { useState, useCallback } from "react";
import { identifyClothing } from "../lib/api/openai";
import type { IdentificationResult } from "../lib/types";
import { setStorageItem } from "../lib/storage";

type IdentificationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: IdentificationResult }
  | { status: "error"; error: string };

export function useIdentification() {
  const [state, setState] = useState<IdentificationState>({ status: "idle" });

  const identify = useCallback(
    async (base64Image: string, imageUri: string) => {
      setState({ status: "loading" });

      try {
        const response = await identifyClothing(base64Image);
        const result: IdentificationResult = {
          ...response,
          timestamp: Date.now(),
        };

        // Save last capture
        await setStorageItem("phia:lastCapture", {
          imageUri,
          timestamp: result.timestamp,
          result,
        });

        setState({ status: "success", result });
        return result;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        setState({ status: "error", error: message });
        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  return {
    state,
    identify,
    reset,
    isLoading: state.status === "loading",
    result: state.status === "success" ? state.result : null,
    error: state.status === "error" ? state.error : null,
  };
}
