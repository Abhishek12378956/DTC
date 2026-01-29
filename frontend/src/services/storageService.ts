const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export const storageService = {
  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },

  setUser: (user: any): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser: (): any | null => {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  removeUser: (): void => {
    localStorage.removeItem(USER_KEY);
  },

  clear: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

