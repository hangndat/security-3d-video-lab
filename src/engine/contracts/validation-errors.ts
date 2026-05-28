export type ValidationErrorCode =
  | "UNKNOWN_FIELD"
  | "UNSUPPORTED_SCHEMA_VERSION"
  | "MISSING_REQUIRED_FIELD"
  | "INVALID_CONSTRAINT"
  | "UNKNOWN_CAPABILITY"
  | "DISABLED_CAPABILITY";

export interface ValidationError {
  path: string;
  code: ValidationErrorCode;
  message: string;
  hint: string;
}

export interface ValidationResult<T> {
  ok: boolean;
  value?: T;
  errors: ValidationError[];
}
