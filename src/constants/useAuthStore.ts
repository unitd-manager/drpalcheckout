import { create } from "zustand";
import { persist } from "zustand/middleware";

// Define types for user and auth state
interface User {
  id: string;
  name: string;
  email: string;
  [key: string]: any;
  zoho_contact_id: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string;
  login: (userData: User, token: string, role: string) => void;
  logout: () => void;
  updateUser: (updatedUserData: Partial<User>) => void;
  role: string;
}

// Create Zustand store with TypeScript
const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      token: "",
      role: "user",
      login: (userData, token, role) =>
        set(() => ({
          user: userData,
          isAuthenticated: true,
          token: token,
          role: role,
        })),

      logout: () =>
        set(() => ({
          user: null,
          isAuthenticated: false,
          token: "",
        })),

      updateUser: (updatedUserData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUserData } : null,
        })),
    }),
    {
      name: "auth-store", // Name of the key in localStorage
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        role: state.role,
      }),
    }
  )
);

export default useAuthStore;
