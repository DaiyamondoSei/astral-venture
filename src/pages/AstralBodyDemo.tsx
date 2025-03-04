
import React from 'react';
import Layout from '@/components/Layout';
import AstralBody from '@/components/entry-animation/AstralBody';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const AstralBodyDemo = () => {
  const navigate = useNavigate();
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Button 
          onClick={() => navigate('/')}
          className="mb-6"
          variant="outline"
        >
          Back to Home
        </Button>
        
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl md:text-3xl font-display text-center mb-8">
            Astral Body Visualization
          </h1>
          
          <div className="bg-black/30 backdrop-blur-md p-8 rounded-xl">
            <AstralBody />
          </div>
          
          <p className="text-center mt-8 text-white/70">
            This visualization represents your energy field in the quantum realm
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default AstralBodyDemo;
