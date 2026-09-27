"use client";
import { useCallback, useRef, useState } from "react";
import { ACCEPT_ATTR, loadArtwork } from "@/lib/image";
import { sound } from "@/lib/sound";
import type { PrintZone } from "@/lib/types";
import { useCustomizer } from "@/store/customizer";
import { useUI } from "@/store/ui";

/** File-picker + drag-and-drop upload into a print zone. */
export function useArtworkUpload(zone?: PrintZone) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const addDesign = useCustomizer((s) => s.addDesign);
  const notify = useUI((s) => s.notify);

  const handleFiles = useCallback(
    async (files: FileList | File[] | null) => {
      const file = files?.[0];
      if (!file) return;
      setBusy(true);
      try {
        const art = await loadArtwork(file);
        addDesign(art, zone ?? useCustomizer.getState().activeZone);
        sound.play("drop");
      } catch (err) {
        sound.play("error");
        notify(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setBusy(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [addDesign, notify, zone],
  );

  const open = useCallback(() => inputRef.current?.click(), []);

  const inputProps = {
    ref: inputRef,
    type: "file" as const,
    accept: ACCEPT_ATTR,
    className: "hidden",
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleFiles(e.target.files),
  };

  return { inputProps, open, handleFiles, busy };
}
