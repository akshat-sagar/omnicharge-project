import type { UserResponseDTO } from '../types';

const ACCESS_TOKEN_KEY = 'omnicharge_access_token';
const REFRESH_TOKEN_KEY = 'omnicharge_refresh_token';
const USER_KEY = 'omnicharge_user';

const getStorage = () => (typeof window === 'undefined' ? null : window.localStorage);

export const tokenStorage = {
  getAccessToken: () => getStorage()?.getItem(ACCESS_TOKEN_KEY) ?? null,
  setAccessToken: (token: string) => getStorage()?.setItem(ACCESS_TOKEN_KEY, token),
  removeAccessToken: () => getStorage()?.removeItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => getStorage()?.getItem(REFRESH_TOKEN_KEY) ?? null,
  setRefreshToken: (token: string) => getStorage()?.setItem(REFRESH_TOKEN_KEY, token),
  removeRefreshToken: () => getStorage()?.removeItem(REFRESH_TOKEN_KEY),
};

export const userStorage = {
  getUser: (): UserResponseDTO | null => {
    const raw = getStorage()?.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserResponseDTO;
    } catch {
      return null;
    }
  },
  setUser: (user: UserResponseDTO) => getStorage()?.setItem(USER_KEY, JSON.stringify(user)),
  removeUser: () => getStorage()?.removeItem(USER_KEY),
};

export const clearAuthStorage = () => {
  tokenStorage.removeAccessToken();
  tokenStorage.removeRefreshToken();
  userStorage.removeUser();
};
