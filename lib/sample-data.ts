import type { Listing } from "@/lib/types";

export const sampleListings: Listing[] = [
  {
    id: "sample-1",
    slug: "charizard-ex-obsidian-flames-223",
    name: "Charizard ex Special Illustration Rare",
    category: "single",
    intent: "buy",
    status: "published",
    set_name: "Obsidian Flames",
    card_number: "223/197",
    condition: "Near Mint",
    grade: null,
    price_cents: 6499,
    quantity: 1,
    description:
      "A clean binder-ready copy for collectors chasing modern Charizard hits.",
    notes: null,
    image_urls: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "sample-2",
    slug: "psa-10-pikachu-vmax-lost-origin",
    name: "Pikachu VMAX PSA 10",
    category: "graded",
    intent: "buy",
    status: "published",
    set_name: "Lost Origin Trainer Gallery",
    card_number: "TG17/TG30",
    condition: null,
    grade: "PSA 10",
    price_cents: 11999,
    quantity: 1,
    description:
      "Graded display piece with strong eye appeal and verified PSA certification.",
    notes: null,
    image_urls: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "sample-3",
    slug: "trade-for-eeveelution-alt-arts",
    name: "Looking to Trade for Eeveelution Alt Arts",
    category: "collection",
    intent: "trade",
    status: "published",
    set_name: "Sword & Shield",
    card_number: null,
    condition: "LP to NM preferred",
    grade: null,
    price_cents: null,
    quantity: 1,
    description:
      "Open trade target for Umbreon, Espeon, Leafeon, Glaceon, and Sylveon alternate arts.",
    notes: "Use the contact form or social links to send photos and trade values.",
    image_urls: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];
