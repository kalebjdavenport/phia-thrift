import { useRef, useState, useCallback } from "react";
import { CameraView, type CameraType, type FlashMode } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import { getStorageItem, setStorageItem } from "../lib/storage";

export function useCamera() {
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<FlashMode>("off");
  const [isCapturing, setIsCapturing] = useState(false);

  // Load flash preference on mount
  const loadFlashPreference = useCallback(async () => {
    const saved = await getStorageItem("phia:settings:flash");
    if (saved) {
      setFlash(saved);
    }
  }, []);

  const toggleFlash = useCallback(async () => {
    const newFlash: FlashMode =
      flash === "off" ? "on" : flash === "on" ? "auto" : "off";
    setFlash(newFlash);
    await setStorageItem("phia:settings:flash", newFlash);
  }, [flash]);

  const toggleFacing = useCallback(() => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }, []);

  const capture = useCallback(async (): Promise<string | null> => {
    if (!cameraRef.current || isCapturing) return null;

    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (!photo?.uri) return null;

      // Convert to base64
      const manipulated = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 1024 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      return manipulated.base64 ?? null;
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing]);

  return {
    cameraRef,
    facing,
    flash,
    isCapturing,
    loadFlashPreference,
    toggleFlash,
    toggleFacing,
    capture,
  };
}
