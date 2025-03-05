
import React from 'react';
import WelcomeMessage from '@/components/WelcomeMessage';
import AuthForms from '@/components/AuthForms';

const LandingView: React.FC = () => {
  return (
    <>
      <WelcomeMessage />
      <AuthForms className="mt-8" />
    </>
  );
};

export default LandingView;
