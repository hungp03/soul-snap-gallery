import { PaginationResult } from '../interfaces/pagination.interface';

export function createPaginationResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginationResult<T> {
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}