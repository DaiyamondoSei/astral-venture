
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EntryAnimationView from '@/components/EntryAnimationView';
import { useUser } from '@/hooks/useUser';

const EntryAnimationPage = () => {
  const user = useUser();
  const navigate = useNavigate();
  const [showTestButton] = useState(process.env.NODE_ENV === 'development');

  const handleComplete = () => {
    navigate('/dashboard');
  };

  return (
    <EntryAnimationView 
      user={user} 
      onComplete={handleComplete} 
      showTestButton={showTestButton}
    />
  );
};

export default EntryAnimationPage;
