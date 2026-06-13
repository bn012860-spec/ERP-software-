import { z } from "zod";

const optionalDateQueryParam = z.preprocess(
  (value) => {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed && !Number.isNaN(Date.parse(trimmed)) ? trimmed : undefined;
  },
  z.string().optional(),
);

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  limit: z.coerce.number().int().min(1).max(100).catch(20),
});

export const SortingOrderQuerySchema = z.enum(["asc", "desc"]);

export const createSortingQuerySchema = <T extends [string, ...string[]]>(
  sortFields: T,
  defaultSortBy: T[number],
  defaultOrder: z.infer<typeof SortingOrderQuerySchema> = "desc",
) =>
  z.object({
    sortBy: z.enum(sortFields).catch(defaultSortBy),
    order: SortingOrderQuerySchema.catch(defaultOrder),
  });

export const DateRangeQuerySchema = z.object({
  fromDate: optionalDateQueryParam,
  toDate: optionalDateQueryParam,
});
