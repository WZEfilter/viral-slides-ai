import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Auth gate disabled for UI testing; simply render children.
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  return <>{children}</>;
};
