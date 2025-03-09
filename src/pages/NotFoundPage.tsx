
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <h1 className="text-6xl font-bold mb-6">404</h1>
      <p className="text-xl mb-8">The page you're looking for doesn't exist in this realm.</p>
      <Button asChild>
        <Link to="/">Return to Cosmic Center</Link>
      </Button>
    </div>
  );
};

export default NotFoundPage;
