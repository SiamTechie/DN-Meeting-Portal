import { 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  updatePassword,
  createUserWithEmailAndPassword,
  getAuth,
} from 'firebase/auth';
import { auth, db, storage } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Helper function to create user without signing out current user (Admin feature)
export const createNewUserAsAdmin = async (email: string, password: string): Promise<string> => {
  // To avoid signing out the current Admin user, we create a secondary Firebase app instance
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  const secondaryApp = initializeApp(firebaseConfig, 'SecondaryApp');
  const secondaryAuth = getAuth(secondaryApp);

  try {
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const uid = userCredential.user.uid;
    
    // Sign out from the secondary app to clean up
    await signOut(secondaryAuth);
    
    // Store user info in Firestore using the primary app's db
    await setDoc(doc(db, 'users', uid), {
      email: email,
      role: 'user', // default role
      createdAt: new Date().toISOString()
    });

    return uid;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const updateUserProfileData = async (uid: string, name: string, avatarUrl: string) => {
  try {
    // Update Firestore
    await setDoc(doc(db, 'users', uid), {
      name: name,
      avatarUrl: avatarUrl
    }, { merge: true });
    
    // Attempt to update Firebase Auth profile too
    if (auth.currentUser) {
      const { updateProfile } = await import('firebase/auth');
      await updateProfile(auth.currentUser, {
        displayName: name,
        photoURL: avatarUrl
      });
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

export const resetUserPassword = async (email: string) => {
  return sendPasswordResetEmail(auth, email);
};

export const uploadProfileImage = async (uid: string, fileBlob: Blob): Promise<string> => {
  try {
    const storageRef = ref(storage, `users/${uid}/profile.webp`);
    await uploadBytes(storageRef, fileBlob);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading profile image:", error);
    throw error;
  }
};

export const updateUserPassword = async (newPassword: string) => {
  if (auth.currentUser) {
    return updatePassword(auth.currentUser, newPassword);
  }
  throw new Error("No authenticated user");
};

export const logout = () => {
  return signOut(auth);
};
