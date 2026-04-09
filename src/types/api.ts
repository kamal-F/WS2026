export type ErrorBody = {
  error: {
    code: string;
    message: string;
    issues?: Record<string, string[] | undefined>;
  };
};

export type SuccessBody<T> = {
  data: T;
};

export type PaginatedBody<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
};
