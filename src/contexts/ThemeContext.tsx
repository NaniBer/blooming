import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const themes = {
  'gruvbox-light': {
    primary: '#458588',
    secondary: '#689d6a',
    accent: '#d79921',
    background: '#fbf1c7',
    surface: '#ebdbb2',
    border: '#d5c4a1',
    'text-primary': '#282828',
    'text-secondary': '#665c54',
  },
  'catppuccin-latte': {
    primary: '#8839ef',
    secondary: '#7287fd',
    accent: '#fe640b',
    background: '#eff1f5',
    surface: '#e6e9ef',
    border: '#bcc0cc',
    'text-primary': '#4c4f69',
    'text-secondary': '#5c5f77',
  },
  'gruvbox-dark': {
    primary: '#83a598',
    secondary: '#8ec07c',
    accent: '#d79921',
    background: '#282828',
    surface: '#3c3836',
    border: '#504945',
    'text-primary': '#ebdbb2',
    'text-secondary': '#a89984',
  },
  'dracula': {
    primary: '#bd93f9',
    secondary: '#ff79c6',
    accent: '#f1fa8c',
    background: '#282a36',
    surface: '#44475a',
    border: '#6272a4',
    'text-primary': '#f8f8f2',
    'text-secondary': '#bfbfbf',
  },
};

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
  themeColors: typeof themes['gruvbox-dark'];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<string>(() => {
    return localStorage.getItem('theme') || 'gruvbox-dark';
  });
  const [themeColors, setThemeColors] = useState(themes['gruvbox-dark']);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'gruvbox-dark';
    setThemeState(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (themeName: string) => {
    const colors = themes[themeName as keyof typeof themes] || themes['gruvbox-dark'];
    setThemeColors(colors);
    localStorage.setItem('theme', themeName);

    // Update CSS variables
    const root = document.documentElement;
    root.style.setProperty('--primary-color', colors.primary);
    root.style.setProperty('--secondary-color', colors.secondary);
    root.style.setProperty('--accent-color', colors.accent);
    root.style.setProperty('--bg-color', colors.background);
    root.style.setProperty('--surface-color', colors.surface);
    root.style.setProperty('--border-color', colors.border);
    root.style.setProperty('--text-primary', colors['text-primary']);
    root.style.setProperty('--text-secondary', colors['text-secondary']);
  };

  const setTheme = (themeName: string) => {
    setThemeState(themeName);
    applyTheme(themeName);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themeColors }}>
      {children}
    </ThemeContext.Provider>
  );
};
