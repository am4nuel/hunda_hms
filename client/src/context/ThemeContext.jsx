import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const defaultModes = {
  light: {
    primaryColor: '#3b82f6',
    secondaryColor: '#60a5fa',
    accentColor: '#1d4ed8',
    backgroundColor: '#f8fafc',
    textColor: '#0f172a',
    sidebarColor: '#ffffff',
    sidebarTextColor: '#334155',
    headerColor: '#ffffff',
    headerTextColor: '#0f172a',
  },
  dark: {
    primaryColor: '#3b82f6',
    secondaryColor: '#1e293b',
    accentColor: '#60a5fa',
    backgroundColor: '#0f172a',
    textColor: '#f8fafc',
    sidebarColor: '#1e293b',
    sidebarTextColor: '#94a3b8',
    headerColor: '#1e293b',
    headerTextColor: '#f8fafc',
  }
};

const hexToHsl = (hex) => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = "0x" + hex[1] + hex[1];
    g = "0x" + hex[2] + hex[2];
    b = "0x" + hex[3] + hex[3];
  } else if (hex.length === 7) {
    r = "0x" + hex[1] + hex[2];
    g = "0x" + hex[3] + hex[4];
    b = "0x" + hex[5] + hex[6];
  }
  r /= 255; g /= 255; b /= 255;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => localStorage.getItem('themeMode') || 'light');
  const [activeTheme, setActiveTheme] = useState(() => {
    const savedTheme = localStorage.getItem('activeTheme');
    return savedTheme ? JSON.parse(savedTheme) : null;
  });

  const toggleMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  const applyTheme = (theme) => {
    setActiveTheme(theme);
    if (theme) {
      localStorage.setItem('activeTheme', JSON.stringify(theme));
    } else {
      localStorage.removeItem('activeTheme');
    }
  };

  useEffect(() => {
    const themeToApply = activeTheme || defaultModes[mode];
    const root = document.documentElement;

    // Core Theme Variables (Direct Hex)
    root.style.setProperty('--theme-primary', themeToApply.primaryColor);
    root.style.setProperty('--theme-secondary', themeToApply.secondaryColor);
    root.style.setProperty('--theme-accent', themeToApply.accentColor);
    root.style.setProperty('--theme-bg', themeToApply.backgroundColor);
    root.style.setProperty('--theme-text', themeToApply.textColor);
    root.style.setProperty('--theme-sidebar-bg', themeToApply.sidebarColor || (mode === 'light' ? '#ffffff' : '#1e293b'));
    root.style.setProperty('--theme-sidebar-text', themeToApply.sidebarTextColor || (mode === 'light' ? '#334155' : '#94a3b8'));
    root.style.setProperty('--theme-header-bg', themeToApply.headerColor || (mode === 'light' ? '#ffffff' : '#1e293b'));
    root.style.setProperty('--theme-header-text', themeToApply.headerTextColor || (mode === 'light' ? '#0f172a' : '#f8fafc'));

    // Shadcn / Tailwind Variables (HSL Format)
    const bgHsl = hexToHsl(themeToApply.backgroundColor);
    const textHsl = hexToHsl(themeToApply.textColor);
    const primaryHsl = hexToHsl(themeToApply.primaryColor);
    const secondaryHsl = hexToHsl(themeToApply.secondaryColor);
    const accentHsl = hexToHsl(themeToApply.accentColor);

    root.style.setProperty('--background', bgHsl);
    root.style.setProperty('--foreground', textHsl);
    root.style.setProperty('--primary', primaryHsl);
    root.style.setProperty('--primary-foreground', bgHsl); // Assuming background contrast is better for primary text
    root.style.setProperty('--secondary', secondaryHsl);
    root.style.setProperty('--secondary-foreground', textHsl);
    root.style.setProperty('--accent', accentHsl);
    root.style.setProperty('--accent-foreground', textHsl);
    root.style.setProperty('--popover', bgHsl);
    root.style.setProperty('--popover-foreground', textHsl);
    root.style.setProperty('--card', bgHsl);
    root.style.setProperty('--card-foreground', textHsl);
    
    // Muted/Subtle (slightly adjusted background/text)
    root.style.setProperty('--muted', mode === 'light' ? '210 40% 96.1%' : '217.2 32.6% 17.5%');
    root.style.setProperty('--muted-foreground', mode === 'light' ? '215.4 16.3% 46.9%' : '215 20.2% 65.1%');
    
    // Borders and Inputs
    root.style.setProperty('--border', hexToHsl(mode === 'light' ? '#e2e8f0' : '#1e293b'));
    root.style.setProperty('--input', hexToHsl(mode === 'light' ? '#e2e8f0' : '#1e293b'));
    root.style.setProperty('--ring', primaryHsl);
    
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [mode, activeTheme]);

  return (
    <ThemeContext.Provider value={{ mode, toggleMode, activeTheme, applyTheme }}>
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
