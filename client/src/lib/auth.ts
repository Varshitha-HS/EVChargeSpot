import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { auth } from "./firebase";
import { apiRequest } from "./queryClient";

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  return apiKey && apiKey !== "demo-api-key";
};

// Register a new user
export const register = async (email: string, password: string, username: string, name: string) => {
  try {
    let user;
    
    // Create user in Firebase Auth if configured
    if (isFirebaseConfigured()) {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      user = userCredential.user;
    }
    
    // Create user in backend
    const response = await apiRequest("POST", "/api/auth/register", {
      username,
      password,
      email,
      name,
      role: "user"
    });
    
    if (!response.ok) {
      // If backend registration fails, delete the Firebase user if it was created
      if (isFirebaseConfigured() && user) {
        await user.delete();
      }
      const data = await response.json();
      throw new Error(data.message || "Failed to register user");
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Sign in a user
export const signIn = async (email: string, password: string) => {
  try {
    // Sign in with Firebase Auth if configured
    if (isFirebaseConfigured()) {
      await signInWithEmailAndPassword(auth, email, password);
    }
    
    // Get user data from backend
    const response = await apiRequest("POST", "/api/auth/login", {
      username: email, // Using email as username for simplicity
      password
    });
    
    if (!response.ok) {
      // If backend login fails, sign out from Firebase if it's configured
      if (isFirebaseConfigured()) {
        await firebaseSignOut(auth);
      }
      const data = await response.json();
      throw new Error(data.message || "Failed to sign in");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Sign in error:", error);
    throw error;
  }
};

// Sign out
export const signOut = async () => {
  try {
    if (isFirebaseConfigured()) {
      await firebaseSignOut(auth);
    }
    // Always sign out from the backend as well
    await apiRequest("POST", "/api/auth/logout", {});
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
};

// Current user observer
export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  if (isFirebaseConfigured()) {
    return onAuthStateChanged(auth, callback);
  } else {
    // If Firebase is not configured, immediately call with null
    callback(null);
    // Return a no-op unsubscribe function
    return () => {};
  }
};
