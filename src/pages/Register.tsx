import React from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { RegisterSection } from '@/components/landing/RegisterSection';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Register = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <RegisterSection />
    </div>
  );
};
export default Register;
