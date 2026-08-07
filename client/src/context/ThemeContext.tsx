import React, { createContext, useContext, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme: ThemeMode = 'light';

  useEffect(() => {
    // Always enforce light mode
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme_mode', 'light');
  }, []);

  const toggleTheme = () => {
    // Light-only — no-op
  };

  const setTheme = (_mode: ThemeMode) => {
    // Light-only — no-op
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
