export type UserRole = "Admin" | "Learner";

export type AppUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  roles: UserRole[];
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type BackendAuthResponse = {
  token: string;
  expiresAt: string;
  user: AppUser;
};

export type AuthContextValue = {
  user: AppUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  primaryRole: UserRole | null;
  setAuthenticatedUser: (user: AppUser | null) => void;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
};
