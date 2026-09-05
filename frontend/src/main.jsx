import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { ContentProvider } from './context/ContentContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import './index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const normalizedClerkKey = typeof PUBLISHABLE_KEY === 'string' ? PUBLISHABLE_KEY.trim() : '';
const isClerkConfigured =
  normalizedClerkKey.startsWith('pk_') && !/your|placeholder/i.test(normalizedClerkKey);

const queryClient = new QueryClient();

function AppProviders({ children }) {
  const appTree = (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AdminAuthProvider>
            <ContentProvider>{children}</ContentProvider>
          </AdminAuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );

  if (!isClerkConfigured) {
    console.warn('VITE_CLERK_PUBLISHABLE_KEY is missing. Running frontend in limited auth mode.');
    return appTree;
  }

  return <ClerkProvider publishableKey={PUBLISHABLE_KEY}>{appTree}</ClerkProvider>;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>
);
