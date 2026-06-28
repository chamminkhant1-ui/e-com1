export type ApiSuccess<T> = {
  ok: true;
  message: string;
  data: T;
};

export interface ApiError {
  ok: false;
  errors?: {
    formErrors?: string[];
    fieldErrors?: Record<string, string[]>;
  };
  part?: string;
  message?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
