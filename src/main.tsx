import React from 'react';
import ReactDOM from 'react-dom/client';
import { HomePage } from './pages/HomePage.tsx';
import './css/main.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HomePage />
  </React.StrictMode>
);
