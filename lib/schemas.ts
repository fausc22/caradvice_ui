import { z } from "zod";

export const carFiltersSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  brand: z.string().optional(),
  model: z.string().optional(),
  condition: z.string().optional(),
  transmission: z.string().optional(),
  fuel_type: z.string().optional(),
  color: z.string().optional(),
  segment: z.string().optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  minYear: z.number().int().min(1900).max(2100).optional(),
  maxYear: z.number().int().min(1900).max(2100).optional(),
  minKilometres: z.number().nonnegative().optional(),
  maxKilometres: z.number().positive().optional(),
  search: z.string().optional(),
  sortBy: z.enum(["created_at", "price", "year", "kilometres", "title"]).default("created_at"),
  sortOrder: z.enum(["ASC", "DESC"]).default("DESC"),
  currency: z.enum(["ARS", "USD"]).default("ARS"),
});

export type CarFiltersInput = z.input<typeof carFiltersSchema>;
export type CarFilters = z.output<typeof carFiltersSchema>;
