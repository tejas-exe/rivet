const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** ₹1,299 */
export const formatINR = (value: number) => `₹${inr.format(Math.round(value))}`;

/** 8.2" */
export const formatInches = (value: number) => `${value.toFixed(1)}"`;

/** 52.48 IN² */
export const formatArea = (value: number) => `${value.toFixed(2)} IN²`;

export const formatDims = (w: number, h: number) => `${w.toFixed(1)} × ${h.toFixed(1)}"`;

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
