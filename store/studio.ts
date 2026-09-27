"use client";
import { create } from "zustand";

export type Interaction = "move" | "resize" | "rotate" | null;

/** Ephemeral studio UI state (not persisted). */
interface StudioUIState {
  interaction: Interaction;
  summaryOpen: boolean;
  sheetExpanded: boolean;
  helpOpen: boolean;
  /** Bumped to ask the viewer to reset user zoom / re-frame the camera. */
  recenter: number;
  setInteraction: (i: Interaction) => void;
  setSummary: (open: boolean) => void;
  setSheetExpanded: (v: boolean) => void;
  setHelp: (v: boolean) => void;
  requestRecenter: () => void;
}

export const useStudioUI = create<StudioUIState>()((set) => ({
  interaction: null,
  summaryOpen: false,
  sheetExpanded: false,
  helpOpen: false,
  recenter: 0,
  setInteraction: (interaction) => set({ interaction }),
  setSummary: (summaryOpen) => set({ summaryOpen }),
  setSheetExpanded: (sheetExpanded) => set({ sheetExpanded }),
  setHelp: (helpOpen) => set({ helpOpen }),
  requestRecenter: () => set((s) => ({ recenter: s.recenter + 1 })),
}));
