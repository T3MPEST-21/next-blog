"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: number;
  name: string;
  email: string;
  role: number;
  role_name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: () => boolean;
  isNormalUser: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  useEffect(() => {
    // Check for existing token on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
      } catch (error) {
        // Clear invalid stored data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axios.post('/api/proxy', {
        endpoint: 'login',
        payload: { email, password },
        method: 'POST',
      });

      if (response.data.status === 200) {
        const { authorisation, email: userEmail } = response.data;
        const jwtToken = authorisation?.token;
        
        if (!jwtToken) {
          console.error('No token in response:', response.data);
          return { success: false, message: 'No token received from server' };
        }
        
        // Fetch user details
        const userResponse = await axios.post('/api/proxy', {
          endpoint: 'getoneuser',
          payload: { email: userEmail },
          method: 'POST',
        });

        console.log('User response data:', userResponse.data);
        
        if (userResponse.data.status === 200) {
          const userData = userResponse.data.oneUser;
          
          if (!userData) {
            console.error('userData is null. Full response:', userResponse.data);
            return { success: false, message: 'Failed to fetch user data' };
          }
          
          setUser({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role || 1,
            role_name: userData.role === 2 ? 'Admin' : 'User',
          });
          setToken(jwtToken);
          
          // Store in localStorage
          localStorage.setItem('token', jwtToken);
          localStorage.setItem('user', JSON.stringify({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role || 1,
            role_name: userData.role === 2 ? 'Admin' : 'User',
          }));
          
          return { success: true, message: 'Login successful' };
        }
      }

      return { success: false, message: response.data.msg || 'Login failed' };
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Network error. Please try again.';
      return { success: false, message: errorMessage };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAdmin = () => {
    return user?.role === 2;
  };

  const isNormalUser = () => {
    return user?.role === 1;
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isLoading,
      isAuthenticated,
      isAdmin,
      isNormalUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
