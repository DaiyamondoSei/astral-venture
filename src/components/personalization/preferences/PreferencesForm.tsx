
import React from 'react';
import { usePersonalization } from '@/hooks/usePersonalization';
import PreferencesTabForm from './PreferencesTabForm';
import LoadingState from './LoadingState';

const PreferencesForm: React.FC = () => {
  const { isLoading } = usePersonalization();
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  return <PreferencesTabForm />;
};

export default PreferencesForm;
