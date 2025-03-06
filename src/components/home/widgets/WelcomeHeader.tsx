
import React from 'react';
import UserWelcome from '@/components/UserWelcome';

interface WelcomeHeaderProps {
  username: string;
  onLogout: () => void;
  astralLevel: number;
}

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({
  username,
  onLogout,
  astralLevel
}) => {
  return (
    <UserWelcome 
      username={username}
      onLogout={onLogout}
      astralLevel={astralLevel}
    />
  );
};

export default WelcomeHeader;
