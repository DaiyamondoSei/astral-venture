
import React from 'react';
import Layout from '@/components/Layout';
import AuthForms from '@/components/AuthForms';

const Login = () => {
  return (
    <Layout className="flex min-h-screen items-center justify-center py-12">
      <div className="w-full max-w-md">
        <AuthForms />
      </div>
    </Layout>
  );
};

export default Login;
