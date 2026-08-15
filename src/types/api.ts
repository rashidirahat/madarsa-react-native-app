export interface ApiEnvelope<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string | { message?: string };
}

export interface PageData<T> {
  records?: T[];
  items?: T[];
  page?: number;
  pages?: number;
  limit?: number;
  total?: number;
}
