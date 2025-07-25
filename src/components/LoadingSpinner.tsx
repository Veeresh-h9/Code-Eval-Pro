import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="orange-gradient-bg" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ position: 'relative', marginBottom: '2rem' }}>
          <div className="orange-spinner"></div>
          <div style={{
            position: 'absolute',
            inset: 0,
            width: '3rem',
            height: '3rem',
            border: '4px solid transparent',
            borderRight: '4px solid #d97706',
            borderRadius: '50%',
            animation: 'spin 1.5s linear infinite reverse'
          }}></div>
        </div>
        <h2 className="orange-text-gradient" style={{ 
          fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', 
          marginBottom: '0.75rem' 
        }}>
          Loading CodeEval Pro...
        </h2>
        <p style={{ 
          color: '#78716c', 
          fontSize: 'clamp(0.875rem, 3vw, 1rem)' 
        }}>
          Please wait while we prepare your coding environment
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;