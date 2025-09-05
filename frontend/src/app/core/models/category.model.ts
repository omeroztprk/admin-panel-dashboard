export interface Category {
  _id: string;
  name: string;
  description?: string;
  parent?: string | null;
  children?: Category[];
  createdAt?: Date;
  updatedAt?: Date;
}
