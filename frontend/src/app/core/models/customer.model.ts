export interface Customer {
  _id: string;
  name: string;
  slug: string;
  prompt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCustomerRequest {
  name: string;
  prompt?: string;
}

export interface UpdateCustomerRequest {
  name?: string;
  prompt?: string;
}