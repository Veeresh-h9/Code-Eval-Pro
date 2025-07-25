
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import ErrorBoundary from './components/ErrorBoundary';
import App from './App.tsx';
import './index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_placeholder';

if (!PUBLISHABLE_KEY || PUBLISHABLE_KEY === 'pk_test_placeholder') {
  console.warn("Clerk publishable key not found. Using demo mode.");
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ClerkProvider 
        publishableKey={PUBLISHABLE_KEY}
        afterSignOutUrl="/"
        signInUrl="/sign-in"
        signUpUrl="/sign-up"
      >
        <App />
      </ClerkProvider>
    </ErrorBoundary>
  </StrictMode>
);