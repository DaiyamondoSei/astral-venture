
import React from 'react';
import { Card } from '@/components/ui/card';

const LoginPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900">
      <Card className="w-full max-w-md p-8 bg-white/10 backdrop-blur-md border-0">
        <h1 className="text-3xl font-bold text-center mb-6 text-white">Welcome Back</h1>
        <p className="text-center text-white/80 mb-6">Sign in to continue your spiritual journey</p>
      </Card>
    </div>
  );
};

export default LoginPage;
