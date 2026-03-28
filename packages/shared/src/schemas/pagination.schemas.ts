import { z } from "zod";

export const PaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
});

export type PaginationInput = z.infer<typeof PaginationSchema>;

export type CursorPage<T> = {
  items: T[];
  nextCursor?: string;
  hasMore: boolean;
};
