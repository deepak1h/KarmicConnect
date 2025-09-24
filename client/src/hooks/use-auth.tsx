// src/hooks/use-auth.tsx (Replace the entire file with this code)

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";

// --- INTERFACES AND CONTEXT DEFINITION ---

interface AdminUser {
  id: string;
  username: string;
  email?: string;
}

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData: AdminUser) => void;
  logout: () => void;
}

// 1. Create the context. This is what components will "subscribe" to.
const AuthContext = createContext<AuthContextType | undefined>(undefined);


// --- THE PROVIDER COMPONENT (THE "BRAIN") ---

// 2. Create the AuthProvider component. Notice the "export" keyword. This is the fix.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // This useEffect runs ONCE when the provider is first mounted at the top of your app.
  useEffect(() => {
    console.log("AuthProvider useEffect: Running initial localStorage check.");
    setIsLoading(true);

const timer = setTimeout(() => {
      console.log("AuthProvider useEffect: Deferred localStorage check running...");
      const token = localStorage.getItem("adminToken");
      const userData = localStorage.getItem("adminUser");

      console.log("AuthProvider useEffect: Retrieved adminToken (deferred):", token ? "Found" : "Not Found");
      console.log("AuthProvider useEffect: Retrieved adminUser (deferred):", userData ? "Found" : "Not Found");

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
          console.log("AuthProvider useEffect: Authenticated successfully (deferred) with user:", parsedUser.username);
        } catch (error) {
          console.error("AuthProvider useEffect: Error parsing user data from localStorage (deferred):", error);
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminUser");
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        console.log("AuthProvider useEffect: No token or user data found (deferred). Not authenticated.");
        setIsAuthenticated(false);
        setUser(null);
      }
      setIsLoading(false); // Set isLoading to false ONLY AFTER the check is complete
      console.log("AuthProvider useEffect: Initial authentication check complete (END). Final isAuthenticated:", isAuthenticated);
    }, 100); // Try a 100ms delay. You can experiment with 0, 50, 100, 200.

    // Cleanup function for the timer
    return () => clearTimeout(timer);
  }, []);

  

  const login = useCallback((token: string, userData: AdminUser) => {
    localStorage.setItem("adminToken", token);
    localStorage.setItem("adminUser", JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // Provide the state and functions to all children components
  const value = { user, isAuthenticated, isLoading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}


// --- THE CONSUMER HOOK (THE "CONNECTOR") ---

// 3. Create the useAuth hook. Its only job is to connect to the context.
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // This error is helpful. It will tell you if you forgot to wrap your app in AuthProvider.
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}