export const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
export const ACCEPT_ATTR = ".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp";
const MAX_FILE_MB = 15;
const MAX_EDGE_PX = 1024;

export interface LoadedArtwork {
  src: string;
  name: string;
  aspect: number;
}

/**
 * Reads an uploaded image, validates it and downsamples it so builds stay
 * small enough to persist in localStorage.
 */
export async function loadArtwork(file: File): Promise<LoadedArtwork> {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new Error("Unsupported file. Use PNG, JPG, JPEG or WEBP.");
  }
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    throw new Error(`File is larger than ${MAX_FILE_MB}MB.`);
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Could not read that image."));
      el.src = url;
    });
    const scale = Math.min(1, MAX_EDGE_PX / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable.");
    ctx.drawImage(img, 0, 0, w, h);
    const keepAlpha = file.type !== "image/jpeg" && file.type !== "image/jpg";
    let src = canvas.toDataURL("image/webp", 0.88);
    if (!src.startsWith("data:image/webp")) {
      src = keepAlpha ? canvas.toDataURL("image/png") : canvas.toDataURL("image/jpeg", 0.88);
    }
    return { src, name: file.name.replace(/\.[^.]+$/, "").slice(0, 32) || "Upload", aspect: w / h };
  } finally {
    URL.revokeObjectURL(url);
  }
}
