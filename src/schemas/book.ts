import { z } from "zod";

export const bookInputSchema = z.object({
  title: z.string().min(3),
  author: z.string().min(3),
  year: z.number().int().min(1900).max(new Date().getFullYear())
});

export type BookInput = z.infer<typeof bookInputSchema>;
