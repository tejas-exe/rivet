export interface Review {
  id: string;
  author: string;
  city: string;
  rating: number;
  title: string;
  body: string;
  size: string;
  date: string;
  verified: boolean;
  customBuild: boolean;
}

export const REVIEWS: Review[] = [
  {
    id: "r1",
    author: "Aarav M.",
    city: "Bengaluru",
    rating: 5,
    title: "Print came out sharper than my screen",
    body: "Uploaded a band poster I made in Procreate, placed it on the back and it arrived exactly where I positioned it. Fabric is thick and the collar hasn't stretched.",
    size: "L",
    date: "2026-09-12",
    verified: true,
    customBuild: true,
  },
  {
    id: "r2",
    author: "Ishita R.",
    city: "Mumbai",
    rating: 5,
    title: "The customiser is ridiculously fun",
    body: "Spent way too long rotating the hoodie and trying colours. White with a small left-sleeve print is the move. Delivery took 6 days.",
    size: "M",
    date: "2026-08-29",
    verified: true,
    customBuild: true,
  },
  {
    id: "r3",
    author: "Kabir S.",
    city: "Delhi",
    rating: 4,
    title: "Great fit, runs big",
    body: "It's properly oversized — I'm usually an L and the M fits the way I wanted. Colour is a deep, even black. Would love a cream option.",
    size: "M",
    date: "2026-08-03",
    verified: true,
    customBuild: false,
  },
  {
    id: "r4",
    author: "Neha P.",
    city: "Pune",
    rating: 5,
    title: "Ordered five for our studio team",
    body: "Used the same front logo and changed sleeve text for each person. The price breakdown made it easy to budget before checking out.",
    size: "XL",
    date: "2026-07-19",
    verified: true,
    customBuild: true,
  },
];

export const RATING_BREAKDOWN = [
  { stars: 5, share: 0.78 },
  { stars: 4, share: 0.15 },
  { stars: 3, share: 0.04 },
  { stars: 2, share: 0.02 },
  { stars: 1, share: 0.01 },
];

export const SIZE_GUIDE = {
  tshirt: {
    note: "Measurements in inches, taken flat. Oversized cuts are designed with ~6\" of ease.",
    headers: ["Size", "Chest", "Length", "Shoulder", "Sleeve"],
    rows: [
      ["S", "21", "27", "20.5", "8.5"],
      ["M", "22", "28", "21.5", "9"],
      ["L", "23", "29", "22.5", "9.5"],
      ["XL", "24", "30", "23.5", "10"],
      ["XXL", "25", "31", "24.5", "10.5"],
    ],
  },
  hoodie: {
    note: "Measurements in inches, taken flat. Sleeve measured from shoulder seam to cuff.",
    headers: ["Size", "Chest", "Length", "Shoulder", "Sleeve"],
    rows: [
      ["S", "22", "26.5", "20", "23.5"],
      ["M", "23", "27.5", "21", "24"],
      ["L", "24", "28.5", "22", "24.5"],
      ["XL", "25", "29.5", "23", "25"],
      ["XXL", "26", "30.5", "24", "25.5"],
    ],
  },
} as const;
