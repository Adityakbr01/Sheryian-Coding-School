import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { getItem, saveItem, STORAGE_KEYS } from '@/services/storage';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  resolvedTheme: 'light' | 'dark'; // The actual result (system or explicit)
}

export const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'system',
  toggleTheme: () => {},
  setThemeMode: () => {},
  resolvedTheme: 'light',
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await getItem(STORAGE_KEYS.THEME);
        if (savedTheme) {
          // Validate that the saved theme is a valid mode
          if (['light', 'dark', 'system'].includes(savedTheme)) {
            setThemeMode(savedTheme as ThemeMode);
          }
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTheme();
  }, []);

  const updateTheme = async (newMode: ThemeMode) => {
    setThemeMode(newMode);
    try {
      await saveItem(STORAGE_KEYS.THEME, newMode);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const resolvedTheme = themeMode === 'system' 
    ? (systemColorScheme === 'dark' ? 'dark' : 'light') 
    : themeMode;

  const toggleTheme = () => {
    const nextMode = resolvedTheme === 'dark' ? 'light' : 'dark';
    updateTheme(nextMode);
  };

  // Prevent flash of wrong theme by rendering nothing until loaded if desired, 
  // currently just using 'system' as default helps avoid huge flashes.
  
  return (
    <ThemeContext.Provider value={{ 
      themeMode, 
      toggleTheme, 
      setThemeMode: updateTheme, 
      resolvedTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
