import { create } from "zustand";
import { type User, type AuthResponse } from "../types/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (data: AuthResponse) => void;
  logout: () => void;
}

const safeParseJSON = (key: string) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    localStorage.removeItem(key); // clear corrupted data
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: safeParseJSON("user"),
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),
  login: (data: AuthResponse) => {
    const userObj = { username: data.username, email: data.email, role: data.role };
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(userObj));
    set({ user: userObj, token: data.token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

