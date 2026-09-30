import { create } from "zustand";

export type VisionStatus = "off" | "loading" | "ready" | "unavailable";

interface VisionState {
  status: VisionStatus;
  message: string;
  handVisible: boolean;
  faceVisible: boolean;
  gesture: string;
  cursor: { x: number; y: number } | null;
  yaw: number;
  pitch: number;
  distance: number;
  setStatus: (status: VisionStatus, message: string) => void;
  setTracking: (patch: Partial<Pick<VisionState, "handVisible" | "faceVisible" | "gesture" | "cursor" | "yaw" | "pitch">>) => void;
  zoomBy: (amount: number) => void;
  resetView: () => void;
}

export const useVision = create<VisionState>((set) => ({
  status: "off",
  message: "Camera controls are off",
  handVisible: false,
  faceVisible: false,
  gesture: "Mouse controls ready",
  cursor: null,
  yaw: 0,
  pitch: 0.84,
  distance: 31,
  setStatus: (status, message) => set({ status, message }),
  setTracking: (patch) => set(patch),
  zoomBy: (amount) => set((state) => ({ distance: Math.max(17, Math.min(46, state.distance + amount)) })),
  resetView: () => set({ yaw: 0, pitch: 0.84, distance: 31 }),
}));