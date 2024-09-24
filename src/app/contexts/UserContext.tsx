"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { createFrontEndClient } from "../utils/supabase/client";
import { Session } from "@supabase/supabase-js";

interface UserContextType {
  session: Session | null;
  loading: boolean;
  logOut: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createFrontEndClient();

  const logOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
  }

  useEffect(() => {
    // Check if there's an active session
    const checkSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session", error);
      } else {
        setSession(session);
      }
      setLoading(false);
    };

    checkSession();

    // Listen to changes in the session state
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <UserContext.Provider value={{ session, loading, logOut }}>
      {loading ? (
        <div className="h-screen bg-white flex flex-col items-center justify-center">
          <span className="loading loading-ring loading-lg text-black"></span>
        </div>
      ) : (
        children
      )}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
