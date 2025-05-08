'use client';

import { useAuth } from '@/context/AuthContext';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userData, loading, isAdmin } = useAuth();
  const [directAdminCheck, setDirectAdminCheck] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  // Direct admin check from Firestore
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('Admin layout - direct admin check:', userData.isAdmin);
            setDirectAdminCheck(userData.isAdmin || false);
          } else {
            setDirectAdminCheck(false);
          }
        } catch (error) {
          console.error('Error in direct admin check:', error);
          setDirectAdminCheck(false);
        }
      } else {
        setDirectAdminCheck(false);
      }
      setCheckingAdmin(false);
    };
    
    if (!loading) {
      checkAdminStatus();
    }
  }, [user, loading]);

  useEffect(() => {
    if (!loading && !checkingAdmin && (!user || (!isAdmin && !directAdminCheck))) {
      console.log('Redirecting - user:', !!user, 'isAdmin:', isAdmin, 'directAdminCheck:', directAdminCheck);
      redirect('/');
    }
  }, [user, isAdmin, loading, directAdminCheck, checkingAdmin]);

  if (loading || checkingAdmin) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isAdmin && !directAdminCheck) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar />
      <div className="flex-1 p-8">
        <main>{children}</main>
      </div>
    </div>
  );
} 