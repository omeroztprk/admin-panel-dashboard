export interface ListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}

export interface ListResponse<T> {
  data: T[];
  meta: ListMeta;
}

export interface DetailResponse<T> {
  data: T;
}