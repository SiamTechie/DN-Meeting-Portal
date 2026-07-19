import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { User as CustomUser } from '../types';

export type UserRole = 'admin' | 'user' | null;

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userRole: UserRole;
  userProfile: CustomUser | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userRole: null,
  userProfile: null,
  loading: true,
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userProfile, setUserProfile] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (user: FirebaseUser) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as CustomUser;
        setUserRole(data.role as unknown as UserRole);
        setUserProfile({ ...data, id: user.uid });
      } else {
        setUserRole('user'); // default fallback
        setUserProfile(null);
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
      setUserRole('user');
      setUserProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await fetchProfile(currentUser);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchProfile(user);
      } else {
        setUserRole(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    userProfile,
    loading,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
