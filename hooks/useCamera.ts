import { useRef, useState, useCallback } from "react";
import { CameraView, type CameraType } from "expo-camera";
import { processImage, type ProcessedImage } from "@/lib/image";

export function useCamera() {
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const toggleFacing = useCallback(() => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }, []);

  const toggleFlash = useCallback(() => {
    setFlash((current) => !current);
  }, []);

  const capture = useCallback(async (): Promise<ProcessedImage | null> => {
    if (!cameraRef.current || isCapturing) return null;

    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync();
      if (!photo?.uri) return null;

      // Resize, convert to JPEG, save to cache
      return await processImage(photo.uri);
    } finally {
      setIsCapturing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    cameraRef,
    facing,
    flash,
    isCapturing,
    toggleFacing,
    toggleFlash,
    capture,
  };
}
