// ---- Roles (File 02) ----
export type Role = 'user' | 'creator' | 'moderator' | 'admin' | 'ceo';

export type AccountStatus = 'active' | 'suspended' | 'restricted' | 'deleted';
export type CreatorStatus = 'none' | 'pending' | 'approved' | 'revoked';

// ---- API envelope (File 05 §5-6) ----
export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta: { requestId: string; page?: number; limit?: number; total?: number; hasNextPage?: boolean };
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    fields?: Record<string, string>;
  };
  meta: { requestId: string };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorBody;

export const ErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_INVALID: 'AUTH_INVALID',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

// ---- Auth DTOs ----
export interface PublicUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string;
  roles: Role[];
  accountStatus: AccountStatus;
  creatorStatus: CreatorStatus;
  createdAt: string;
}

export interface RegisterInput {
  email: string;
  username: string;
  displayName: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: PublicUser;
}
