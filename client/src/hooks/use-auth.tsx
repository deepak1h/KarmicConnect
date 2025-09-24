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

    const token = localStorage.getItem("adminToken");
    const userData = localStorage.getItem("adminUser");
    console.log("AuthProvider useEffect: Stored Token:", token ? "Found" : "Not Found");
    console.log("AuthProvider useEffect: Stored UserData:", userData ? "Found" : "Not Found");

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
        console.log("AuthProvider useEffect: Successfully authenticated with user:", JSON.parse(userData));
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        
      }
    }
    
    setIsLoading(false); // Finished checking
  }, []); // Empty dependency array ensures this runs only once for the lifetime of the app

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