import axios from 'axios';
import type { User } from '@/types/user';

type AuthCredentials = {
  email: string;
  password: string;
};

const BASE = '/api/auth';

export async function login(credentials: AuthCredentials): Promise<User> {
  const { data } = await axios.post<User>(`${BASE}/login`, credentials);
  return data;
}

export async function register(credentials: AuthCredentials): Promise<User> {
  const { data } = await axios.post<User>(`${BASE}/register`, credentials);
  return data;
}

export async function logout(): Promise<void> {
  await axios.post(`${BASE}/logout`);
}

export async function getSession(): Promise<User | null> {
  const { data } = await axios.get<User | null>(`${BASE}/session`);
  return data;
}