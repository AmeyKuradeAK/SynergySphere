import React, { createContext, useContext, useEffect } from 'react';
import { AuthService } from '~/services/auth';
import { useAuthStore, useUserStore } from '~/store/store';
import { AuthUser } from '~/types';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { user, isLoading, isAuthenticated, setUser, setLoading } =
    useAuthStore();
  const { setProfile } = useUserStore();

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged(async (authUser) => {
      setUser(authUser);

      if (authUser) {
        try {
          // Get user profile from Firestore
          const userProfile = await AuthService.getUserProfile(authUser.uid);
          if (userProfile) {
            setProfile(userProfile);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, [setUser, setLoading, setProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
