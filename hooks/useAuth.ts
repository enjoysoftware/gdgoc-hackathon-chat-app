"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        // Create or update user profile in Firestore
        const userRef = doc(db, "users", authUser.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          await setDoc(userRef, {
            uid: authUser.uid,
            displayName: authUser.displayName || "Anonymous",
            photoURL: authUser.photoURL || "",
            email: authUser.email,
            status: "online",
            updatedAt: serverTimestamp(),
          });
        } else {
          await setDoc(userRef, { status: "online", updatedAt: serverTimestamp() }, { merge: true });
        }
        setUser(authUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = async () => {
    if (auth.currentUser) {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(userRef, { status: "offline", updatedAt: serverTimestamp() }, { merge: true });
    }
    await signOut(auth);
  };

  return { user, loading, loginWithGoogle, logout };
}
