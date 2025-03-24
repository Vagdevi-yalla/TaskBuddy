import { User } from 'firebase/auth';
import { createContext } from 'react';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
}

export const initialAuthContext: AuthContextType = {
  user: null,
  loading: true,
  signOut: async () => {},
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
};

export const AuthContext = createContext<AuthContextType>(initialAuthContext); 