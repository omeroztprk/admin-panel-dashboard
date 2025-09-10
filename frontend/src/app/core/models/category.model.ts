export interface Category {
  _id: string;
  name: string;
  description?: string;
  parent?: string | Category | null;
  children?: Category[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryRequest {
  name: string;
  parent?: string | null;
  description?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  parent?: string | null;
  description?: string;
}
