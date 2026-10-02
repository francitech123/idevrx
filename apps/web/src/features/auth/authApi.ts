import { api } from '@/api/client';
import type { AuthResponse, LoginInput, RegisterInput } from '@idevrx/types';

export const authApi = {
  me: () => api.get<AuthResponse>('/api/v1/auth/me'),
  register: (input: RegisterInput) => api.post<AuthResponse>('/api/v1/auth/register', input),
  login: (input: LoginInput) => api.post<AuthResponse>('/api/v1/auth/login', input),
  logout: () => api.post<{ loggedOut: boolean }>('/api/v1/auth/logout'),
};
