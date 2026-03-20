import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const themes = {
  original: {
    primary: '#4CAF50',
    secondary: '#8BC34A',
    accent: '#FFC107',
    background: '#FAFAFA',
    surface: '#FFFFFF',
    border: '#E0E0E0',
    'text-primary': '#2D3436',
    'text-secondary': '#636E72',
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
  'catppuccin-frappe': {
    primary: '#cba6f7',
    secondary: '#8aadf4',
    accent: '#fab387',
    background: '#232634',
    surface: '#303446',
    border: '#414559',
    'text-primary': '#cdd6f4',
    'text-secondary': '#b5bfe2',
  },
  'catppuccin-macchiato': {
    primary: '#c6a0f6',
    secondary: '#8aadf4',
    accent: '#f9a8d4',
    background: '#181926',
    surface: '#24273a',
    border: '#363a4f',
    'text-primary': '#cad3f5',
    'text-secondary': '#939ab7',
  },
  'catppuccin-mocha': {
    primary: '#cba6f7',
    secondary: '#8aadf4',
    accent: '#fab387',
    background: '#1e1e2e',
    surface: '#313244',
    border: '#45475a',
    'text-primary': '#cdd6f4',
    'text-secondary': '#a6adc8',
  },
  dracula: {
    primary: '#bd93f9',
    secondary: '#ff79c6',
    accent: '#f1fa8c',
    background: '#282a36',
    surface: '#44475a',
    border: '#6272a4',
    'text-primary': '#f8f8f2',
    'text-secondary': '#bfbfbf',
  },
  nord: {
    primary: '#81a1c1',
    secondary: '#88c0d0',
    accent: '#ebcb8b',
    background: '#eceff4',
    surface: '#d8dee9',
    border: '#4c566a',
    'text-primary': '#2e3440',
    'text-secondary': '#4c566a',
  },
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
  'tokyo-night': {
    primary: '#7aa2f7',
    secondary: '#bb9af7',
    accent: '#e0af68',
    background: '#1a1b26',
    surface: '#24283b',
    border: '#414868',
    'text-primary': '#c0caf5',
    'text-secondary': '#a9b1d6',
  },
  'rose-pine': {
    primary: '#c4a7e7',
    secondary: '#ebbcba',
    accent: '#ea9a97',
    background: '#191724',
    surface: '#1f1d2e',
    border: '#26233a',
    'text-primary': '#e0def4',
    'text-secondary': '#908caa',
  },
};

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
  themeColors: typeof themes.original;
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
    return localStorage.getItem('theme') || 'catppuccin-latte';
  });
  const [themeColors, setThemeColors] = useState(themes.original);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'catppuccin-latte';
    setThemeState(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (themeName: string) => {
    const colors = themes[themeName as keyof typeof themes] || themes.original;
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
