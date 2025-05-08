import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth,
  updatePassword,
  updateEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  multiFactor,
  sendEmailVerification
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where,
  addDoc,
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { SiteSettings, Order, Product } from '@/lib/types';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Helper functions for Firestore operations
export const updateUserSettings = async (userId: string, settings: any) => {
  const userSettingsRef = doc(db, 'users', userId, 'settings', 'preferences');
  await setDoc(userSettingsRef, settings, { merge: true });
};

export const getUserSettings = async (userId: string) => {
  const userSettingsRef = doc(db, 'users', userId, 'settings', 'preferences');
  const settingsDoc = await getDocs(query(collection(db, 'users', userId, 'settings')));
  return settingsDoc.docs[0]?.data() || {};
};

// Password management
export const updateUserPassword = async (user: any, currentPassword: string, newPassword: string) => {
  // Reauthenticate the user first (required for sensitive operations)
  const credential = EmailAuthProvider.credential(
    user.email,
    currentPassword
  );
  await reauthenticateWithCredential(user, credential);
  
  // Update the password
  await updatePassword(user, newPassword);
};

// Email management
export const updateUserEmail = async (user: any, currentPassword: string, newEmail: string) => {
  // Reauthenticate the user first
  const credential = EmailAuthProvider.credential(
    user.email,
    currentPassword
  );
  await reauthenticateWithCredential(user, credential);
  
  // Update the email
  await updateEmail(user, newEmail);
  
  // Send verification to new email
  await sendEmailVerification(user);
  
  // Update email in Firestore user document
  await updateDoc(doc(db, 'users', user.uid), {
    email: newEmail
  });
};

// Two-factor authentication
export const enableTwoFactorAuth = async (user: any) => {
  // In a real implementation, this would handle the SMS verification setup
  // For demonstration, we'll just track that 2FA is enabled
  await updateDoc(doc(db, 'users', user.uid), {
    twoFactorEnabled: true
  });
  
  return { success: true, message: "Two-factor authentication enabled" };
};

export const disableTwoFactorAuth = async (user: any) => {
  await updateDoc(doc(db, 'users', user.uid), {
    twoFactorEnabled: false
  });
  
  return { success: true, message: "Two-factor authentication disabled" };
};

// Check if 2FA is enabled
export const getTwoFactorStatus = async (userId: string) => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (userDoc.exists()) {
    return userDoc.data()?.twoFactorEnabled || false;
  }
  return false;
};

// Login history tracking
export const recordLoginActivity = async (userId: string, deviceInfo: any) => {
  await addDoc(collection(db, 'users', userId, 'loginHistory'), {
    timestamp: serverTimestamp(),
    device: deviceInfo.device || 'Unknown',
    browser: deviceInfo.browser || 'Unknown',
    ip: deviceInfo.ip || 'Unknown',
    location: deviceInfo.location || 'Unknown'
  });
};

export const getLoginHistory = async (userId: string, limitCount = 10) => {
  const historyQuery = query(
    collection(db, 'users', userId, 'loginHistory'),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );
  
  const snapshot = await getDocs(historyQuery);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Admin functions
export const getAllUsers = async () => {
  const usersQuery = query(collection(db, 'users'));
  const snapshot = await getDocs(usersQuery);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const setUserAsAdmin = async (userId: string, isAdmin: boolean) => {
  await updateDoc(doc(db, 'users', userId), {
    isAdmin
  });
  return { success: true };
};

export const deleteUser = async (userId: string) => {
  try {
    if (!userId) {
      console.error('Missing user ID');
      return { success: false, error: 'User ID is required' };
    }
    
    console.log('Attempting to delete user with ID:', userId);
    
    // Ensure userId is a string
    const userIdString = String(userId).trim();
    
    if (!userIdString || userIdString === 'undefined' || userIdString === 'null') {
      console.error('Invalid user ID format');
      return { success: false, error: 'Invalid user ID format' };
    }
    
    // Check if user document exists before trying to delete
    const userRef = doc(db, 'users', userIdString);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.log('User does not exist, nothing to delete');
      return { success: true, message: 'User does not exist' };
    }
    
    // Delete main user document first (this approach works better in some cases)
    try {
      console.log('Deleting main user document');
      await deleteDoc(userRef);
      console.log('Main user document deleted successfully');
    } catch (error) {
      console.error('Error deleting main user document:', error);
      throw error; // Rethrow to be caught by the outer try/catch
    }
    
    console.log('User successfully deleted');
    return { success: true };
  } catch (error: any) {
    console.error('Error in deleteUser function:', error);
    // Return a more detailed error message
    return { 
      success: false, 
      error: error?.message || 'Unknown error',
      stack: error?.stack || '',
      code: error?.code || 'unknown_error'
    };
  }
};

export const getAllOrders = async (): Promise<Order[]> => {
  const ordersQuery = query(collection(db, 'orders'));
  const snapshot = await getDocs(ordersQuery);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Order[];
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  await updateDoc(doc(db, 'orders', orderId), {
    status
  });
  return { success: true };
};

// Function to migrate existing orders that don't have customer info properly formatted
export const migrateOrderCustomerInfo = async (orderId: string) => {
  try {
    // Get the order
    const orderDoc = await getDoc(doc(db, 'orders', orderId));
    
    if (!orderDoc.exists()) {
      return { success: false, error: 'Order not found' };
    }
    
    const orderData = orderDoc.data();
    
    // Skip if order already has customer field
    if (orderData.customer && orderData.customer.name && orderData.customer.email) {
      return { success: true, message: 'Order already has customer info' };
    }
    
    // Create customer field from billing info if available
    const updatedFields: any = {};
    
    if (orderData.billing) {
      updatedFields.customer = {
        name: `${orderData.billing.firstName || ''} ${orderData.billing.lastName || ''}`.trim() || 'Anonymous',
        email: orderData.billing.email || 'No email',
        phone: orderData.billing.phone || 'No phone'
      };
    }
    
    // Create shippingAddress if missing
    if (!orderData.shippingAddress && orderData.billing) {
      updatedFields.shippingAddress = {
        street: orderData.billing.address || 'N/A',
        city: orderData.billing.city || 'N/A',
        state: orderData.billing.state || 'N/A',
        postalCode: orderData.billing.postalCode || 'N/A',
        country: 'Nigeria'
      };
    }
    
    // Update the order
    if (Object.keys(updatedFields).length > 0) {
      await updateDoc(doc(db, 'orders', orderId), updatedFields);
      return { success: true, message: 'Order updated with customer info' };
    }
    
    return { success: true, message: 'No updates needed' };
  } catch (error: any) {
    console.error('Error migrating order customer info:', error);
    return { success: false, error: error?.message || 'Unknown error' };
  }
};

// Function to migrate all existing orders
export const migrateAllOrdersCustomerInfo = async () => {
  try {
    const ordersQuery = query(collection(db, 'orders'));
    const snapshot = await getDocs(ordersQuery);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const orderDoc of snapshot.docs) {
      const result = await migrateOrderCustomerInfo(orderDoc.id);
      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }
    }
    
    return { 
      success: true, 
      message: `Migrated ${successCount} orders successfully, ${errorCount} errors` 
    };
  } catch (error: any) {
    console.error('Error migrating all orders:', error);
    return { success: false, error: error?.message || 'Unknown error' };
  }
};

export const getAllProducts = async (): Promise<Product[]> => {
  const productsQuery = query(collection(db, 'products'));
  const snapshot = await getDocs(productsQuery);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Product[];
};

export const getProductById = async (productId: string) => {
  const productDoc = await getDoc(doc(db, 'products', productId));
  if (productDoc.exists()) {
    return {
      id: productDoc.id,
      ...productDoc.data()
    };
  }
  return null;
};

export const updateProduct = async (productId: string, productData: any) => {
  try {
    // Create a clean copy of the data to prevent reference issues
    const sanitizedData = { ...productData };
    
    // Remove any properties that might cause issues
    if (sanitizedData.id) delete sanitizedData.id;
    
    // Make sure we're not trying to directly update timestamp fields
    if (sanitizedData.createdAt && typeof sanitizedData.createdAt !== 'number') {
      delete sanitizedData.createdAt;
    }
    
    // Ensure all data is serializable
    Object.keys(sanitizedData).forEach(key => {
      const value = sanitizedData[key];
      if (value === undefined) {
        delete sanitizedData[key];
      }
    });
    
    await updateDoc(doc(db, 'products', productId), sanitizedData);
    return { success: true };
  } catch (error: any) {
    console.error('Error updating product:', error);
    return { success: false, error: error?.message || 'Unknown error' };
  }
};

export const addProduct = async (productData: any) => {
  const docRef = await addDoc(collection(db, 'products'), {
    ...productData,
    createdAt: serverTimestamp(),
  });
  return { success: true, id: docRef.id };
};

export const deleteProduct = async (productId: string) => {
  await deleteDoc(doc(db, 'products', productId));
  return { success: true };
};

export const getStatsOverview = async () => {
  // Get total users
  const usersSnapshot = await getDocs(collection(db, 'users'));
  const totalUsers = usersSnapshot.size;
  
  // Get total orders
  const ordersSnapshot = await getDocs(collection(db, 'orders'));
  const totalOrders = ordersSnapshot.size;
  
  // Calculate total revenue
  let totalRevenue = 0;
  ordersSnapshot.docs.forEach(doc => {
    const orderData = doc.data();
    totalRevenue += orderData.total || 0;
  });
  
  // Get total products
  const productsSnapshot = await getDocs(collection(db, 'products'));
  const totalProducts = productsSnapshot.size;
  
  return {
    totalUsers,
    totalOrders,
    totalRevenue,
    totalProducts
  };
};

// Site settings functions
export const getSiteSettings = async (): Promise<SiteSettings> => {
  try {
    const settingsDoc = await getDoc(doc(db, 'settings', 'site'));
    if (settingsDoc.exists()) {
      return settingsDoc.data() as SiteSettings;
    }
    
    // Return default settings if none exist
    return {
      storeName: 'Tociano',
      storeDescription: 'Modern African Fashion Store',
      contactEmail: 'contact@tociano.com',
      supportPhone: '+234 000 000 0000',
      address: 'Lagos, Nigeria',
      socialLinks: {
        facebook: 'https://facebook.com/tociano',
        instagram: 'https://instagram.com/tociano',
        twitter: 'https://twitter.com/tociano'
      },
      shippingRates: {
        standard: 2000,
        express: 4500
      },
      paymentOptions: {
        paystack: true,
        payOnDelivery: false
      },
      maintenance: {
        enabled: false,
        message: 'We are currently undergoing scheduled maintenance. Please check back soon.'
      },
      termsUrl: '/terms',
      privacyUrl: '/privacy',
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching site settings:', error);
    throw error;
  }
};

export const updateSiteSettings = async (settings: Partial<SiteSettings>) => {
  try {
    // Add last updated timestamp
    const updatedSettings = {
      ...settings,
      lastUpdated: serverTimestamp()
    };
    
    await setDoc(doc(db, 'settings', 'site'), updatedSettings, { merge: true });
    return { success: true };
  } catch (error: any) {
    console.error('Error updating site settings:', error);
    return { success: false, error: error?.message || 'Unknown error' };
  }
};

export { app, auth, db, storage };