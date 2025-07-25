import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Toaster } from 'react-hot-toast';
import { SupabaseProvider } from './contexts/SupabaseContext';
import { TestProvider } from './contexts/TestContext';
import { SecurityProvider } from './contexts/SecurityContext';
import LandingPage from './pages/LandingPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TestInterface from './pages/TestInterface';
import Results from './pages/Results';
import Leaderboard from './pages/Leaderboard';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return <LoadingSpinner />;
  }

  const isAdmin = user?.emailAddresses[0]?.emailAddress === 'admin@codeeval.com' || 
                   user?.emailAddresses[0]?.emailAddress === 'veer@gmail.com';

  return (
    <SupabaseProvider>
      <TestProvider>
        <SecurityProvider>
          <Router>
            <div className="min-h-screen gradient-bg">
              <Routes>
                <Route 
                  path="/" 
                  element={!isSignedIn ? <LandingPage /> : <Navigate to={isAdmin ? "/admin" : "/dashboard"} />} 
                />
                <Route 
                  path="/dashboard" 
                  element={isSignedIn && !isAdmin ? <UserDashboard /> : <Navigate to="/" />} 
                />
                <Route 
                  path="/admin" 
                  element={isSignedIn && isAdmin ? <AdminDashboard /> : <Navigate to="/" />} 
                />
                <Route 
                  path="/test/:testId" 
                  element={isSignedIn && !isAdmin ? <TestInterface /> : <Navigate to="/" />} 
                />
                <Route 
                  path="/results" 
                  element={isSignedIn ? <Results /> : <Navigate to="/" />} 
                />
                <Route 
                  path="/leaderboard" 
                  element={isSignedIn ? <Leaderboard /> : <Navigate to="/" />} 
                />
              </Routes>
              <Toaster 
                position="top-right" 
                toastOptions={{
                  className: 'bg-white border-2 border-primary-200 text-secondary-900 shadow-xl',
                  duration: 4000,
                  style: {
                    borderRadius: '12px',
                    padding: '16px',
                    fontSize: '14px',
                    fontWeight: '500',
                  },
                }}
              />
            </div>
          </Router>
        </SecurityProvider>
      </TestProvider>
    </SupabaseProvider>
  );
}

export default App;