'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { 
  db, 
  auth, 
  updateUserPassword, 
  updateUserEmail, 
  enableTwoFactorAuth,
  disableTwoFactorAuth, 
  getTwoFactorStatus,
  getLoginHistory,
  recordLoginActivity 
} from '../lib/firebase';

type UserData = {
  uid: string;
  email: string | null;
  displayName: string | null;
  phoneNumber: string | null;
  twoFactorEnabled?: boolean;
  isAdmin?: boolean;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  isAdmin: boolean;
  signup: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserData>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  changeEmail: (currentPassword: string, newEmail: string) => Promise<void>;
  enableTwoFactor: () => Promise<{ success: boolean; message: string }>;
  disableTwoFactor: () => Promise<{ success: boolean; message: string }>;
  isTwoFactorEnabled: boolean;
  getLoginActivity: (limit?: number) => Promise<any[]>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch user data from Firestore
  const fetchUserData = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as UserData;
        console.log('User data from Firestore:', data);
        console.log('Admin status from Firestore:', data.isAdmin);
        setUserData(data);
        setIsTwoFactorEnabled(data.twoFactorEnabled || false);
        setIsAdmin(data.isAdmin || false);
        console.log('isAdmin state after setting:', data.isAdmin || false);
      } else {
        console.log('User document does not exist in Firestore');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchUserData(currentUser.uid);
        
        // Record login activity
        // In a real app, you'd get this data from a server to be accurate
        const deviceInfo = {
          device: navigator.userAgent,
          browser: navigator.userAgent,
          // IP and location would normally come from the server
          ip: '0.0.0.0',
          location: 'Unknown'
        };
        
        try {
          await recordLoginActivity(currentUser.uid, deviceInfo);
        } catch (error) {
          console.error('Error recording login activity:', error);
        }
      } else {
        setUserData(null);
        setIsTwoFactorEnabled(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign up function
  const signup = async (email: string, password: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with name
      await updateProfile(userCredential.user, {
        displayName: name
      });
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: name,
        phoneNumber: null,
        twoFactorEnabled: false,
        createdAt: new Date().toISOString()
      }, { merge: true });
      
    } catch (error) {
      console.error('Error during signup:', error);
      throw error;
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (data: Partial<UserData>) => {
    if (!user) throw new Error('No user is logged in');
    
    try {
      // Update in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        ...userData,
        ...data
      }, { merge: true });
      
      // Refresh user data
      await fetchUserData(user.uid);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // Change password
  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) throw new Error('No user is logged in');
    
    try {
      await updateUserPassword(user, currentPassword, newPassword);
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  };

  // Change email
  const changeEmail = async (currentPassword: string, newEmail: string) => {
    if (!user) throw new Error('No user is logged in');
    
    try {
      await updateUserEmail(user, currentPassword, newEmail);
      
      // Update local state
      setUserData(prev => prev ? { ...prev, email: newEmail } : null);
    } catch (error) {
      console.error('Error changing email:', error);
      throw error;
    }
  };

  // Enable two-factor authentication
  const enableTwoFactor = async () => {
    if (!user) throw new Error('No user is logged in');
    
    try {
      const result = await enableTwoFactorAuth(user);
      setIsTwoFactorEnabled(true);
      return result;
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      throw error;
    }
  };

  // Disable two-factor authentication
  const disableTwoFactor = async () => {
    if (!user) throw new Error('No user is logged in');
    
    try {
      const result = await disableTwoFactorAuth(user);
      setIsTwoFactorEnabled(false);
      return result;
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      throw error;
    }
  };

  // Get login history
  const getLoginActivity = async (limit = 10) => {
    if (!user) throw new Error('No user is logged in');
    
    try {
      return await getLoginHistory(user.uid, limit);
    } catch (error) {
      console.error('Error fetching login history:', error);
      throw error;
    }
  };

  const value = {
    user,
    userData,
    loading,
    isAdmin,
    signup,
    login,
    logout,
    updateUserProfile,
    changePassword,
    changeEmail,
    enableTwoFactor,
    disableTwoFactor,
    isTwoFactorEnabled,
    getLoginActivity
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};