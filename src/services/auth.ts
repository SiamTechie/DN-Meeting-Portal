import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification,
  signOut, 
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { User, UserRole } from '../types';

// Login User
export const loginUser = async (email: string, password: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const fbUser = userCredential.user;
  
  // Fetch user profile data from Firestore
  const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
  
  if (userDoc.exists()) {
    return userDoc.data() as User;
  } else {
    throw new Error("User profile not found in database.");
  }
};

// Register User
export const registerUser = async (email: string, password: string, name: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const fbUser = userCredential.user;

    // Send verification email to user
    await sendEmailVerification(fbUser);

    // Create User Profile in Firestore
    const newUser: User = {
      id: fbUser.uid,
      name: name,
      email: email,
      role: "Member", // Default role
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
    };

    await setDoc(doc(db, 'users', fbUser.uid), newUser);
    return newUser;
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      try {
        // Try logging in to prove ownership of the existing Auth account
        const loginCredential = await signInWithEmailAndPassword(auth, email, password);
        const fbUser = loginCredential.user;
        
        // Check if Firestore document is missing (indicating deleted by Admin)
        const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
        if (!userDoc.exists()) {
          // Recreate the missing Firestore profile
          const newUser: User = {
            id: fbUser.uid,
            name: name,
            email: email,
            role: "Member",
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
          };
          await setDoc(doc(db, 'users', fbUser.uid), newUser);
          return newUser;
        }
      } catch (loginError) {
        // If password doesn't match or login fails, fall through to throw original error
      }
    }
    throw error;
  }
};

// Logout User
export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

// Fetch User Profile by UID
export const fetchUserProfile = async (uid: string): Promise<User | null> => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    return userDoc.data() as User;
  }
  return null;
};
