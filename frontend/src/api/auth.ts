// e.g. src/api/auth.ts
import { api } from './client';

export function login(data) {
  return api.post('/auth/login', data);
}
