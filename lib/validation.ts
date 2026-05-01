import { z } from "zod";

export const listingSchema = z.object({
  slug: z.string().min(2),
  name: z.string().min(2),
  category: z.enum(["single", "graded", "sealed", "collection"]),
  intent: z.enum(["buy", "sell", "trade"]),
  status: z.enum(["draft", "published", "sold", "archived"]),
  set_name: z.string().nullable(),
  card_number: z.string().nullable(),
  condition: z.string().nullable(),
  grade: z.string().nullable(),
  price_cents: z.number().int().nonnegative().nullable(),
  quantity: z.number().int().nonnegative(),
  description: z.string().nullable(),
  notes: z.string().nullable(),
  image_urls: z.array(z.string().url()).default([])
});
