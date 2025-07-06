import React, { FC, useState, useLayoutEffect } from 'react';
import styled from 'styled-components';

const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = window.localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }
  return 'light';
};

const ThemeSwitcher: FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);

  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      window.localStorage.setItem('theme', theme);
    } catch {
      // ignore write errors
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      aria-pressed={theme === 'dark'}
      className="theme-switcher-button"
    >
      {theme === 'light' ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="theme-switcher-icon"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="24"
          height="24"
        >
          <path d="M12 4.354a1 1 0 011 1V7a1 1 0 11-2 0V5.354a1 1 0 011-1zM12 16a4 4 0 100-8 4 4 0 000 8zm7.657-3a1 1 0 010 2H17a1 1 0 110-2h2.657zM7 13a1 1 0 110 2H4.343a1 1 0 110-2H7zm9.071-6.071a1 1 0 011.414 1.414L17.414 8.93a1 1 0 11-1.414-1.414l.071-.071zM8.93 17.414a1 1 0 011.414 0 1 1 0 01-1.414 1.414l-.071-.071a1 1 0 010-1.343zM17.414 15.071a1 1 0 011.414-1.414l.071.071a1 1 0 01-1.414 1.414l-.071-.071zM8.93 6.586a1 1 0 011.414-1.414l.071.071a1 1 0 01-1.414 1.414l-.071-.071z" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="theme-switcher-icon"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="24"
          height="24"
        >
          <path d="M21.752 15.002A9.718 9.718 0 0112 21.75C6.072 21.75 1.5 17.178 1.5 11.25c0-4.566 2.993-8.487 7.126-9.75a.75.75 0 01.917.98A7.5 7.5 0 1019.77 17.38a.75.75 0 01.981.918z" />
        </svg>
      )}
    </button>
  );
};

export default ThemeSwitcher;