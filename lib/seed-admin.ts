import { db } from './firebase';
import { doc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

/**
 * This utility function can be used to create your first admin user
 * Run it manually by calling it from a development page or component
 */
export async function makeUserAdmin(email: string): Promise<{ success: boolean; message: string }> {
  try {
    // First, find the user by email
    // Note: In a production app, you'd want a more secure way to identify users
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { 
        success: false, 
        message: `No user found with email: ${email}` 
      };
    }
    
    // Get the first matching user
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    
    // Check if already an admin
    if (userData.isAdmin) {
      return { 
        success: false, 
        message: `User ${email} is already an admin` 
      };
    }
    
    // Update the user to be an admin
    await updateDoc(doc(db, 'users', userDoc.id), {
      isAdmin: true
    });
    
    return { 
      success: true, 
      message: `Successfully made ${email} an admin` 
    };
  } catch (error) {
    console.error('Error making user admin:', error);
    return { 
      success: false, 
      message: `Error making user admin: ${error}` 
    };
  }
}

// Example usage:
// In development, you can run this in a component or page to make yourself an admin
// async function makeMyselfAdmin() {
//   const result = await makeUserAdmin('your-email@example.com');
//   console.log(result);
// } 