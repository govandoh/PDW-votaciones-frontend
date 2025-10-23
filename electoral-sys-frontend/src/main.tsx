import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // No necesitas especificar la extensión
import './styles/main.scss';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

ReactDOM.createRoot(rootElement).render( 
  <React.StrictMode>
    <App />
  </React.StrictMode>
);