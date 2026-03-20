"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { doc, setDoc, getDoc, onSnapshot, serverTimestamp } from "firebase/firestore";

interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  email: string | null;
  status: "online" | "offline";
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
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

        // Listen to profile changes
        unsubscribeProfile = onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            setProfile(snapshot.data() as UserProfile);
          }
        });
      } else {
        setUser(null);
        setProfile(null);
        if (unsubscribeProfile) unsubscribeProfile();
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const updateStatus = async (status: "online" | "offline") => {
    const currentUser = auth.currentUser || user;
    if (currentUser) {
      const userRef = doc(db, "users", currentUser.uid);
      await setDoc(userRef, { status, updatedAt: serverTimestamp() }, { merge: true });
    }
  };

  // Visibility change logic
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        updateStatus("offline");
      } else {
        updateStatus("online");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user]);

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

  return { user, profile, loading, loginWithGoogle, logout, updateStatus };
}
