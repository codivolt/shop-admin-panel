import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const storedTheme = window.localStorage.getItem('admin-panel-theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const initialTheme =
  storedTheme === 'light' || storedTheme === 'dark'
    ? storedTheme
    : storedTheme === 'system'
      ? (prefersDark ? 'dark' : 'light')
      : 'dark';

document.documentElement.classList.toggle('dark', initialTheme === 'dark');
document.documentElement.style.colorScheme = initialTheme;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
