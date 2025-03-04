
import React from 'react';
import Layout from '@/components/Layout';
import AstralBody from '@/components/entry-animation/AstralBody';
import CosmicAstralBody from '@/components/entry-animation/CosmicAstralBody';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AstralBodyDemo = () => {
  const navigate = useNavigate();
  
  return (
    <Layout>
      <motion.div 
        className="container mx-auto px-4 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Button 
          onClick={() => navigate('/')}
          className="mb-6"
          variant="outline"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
            <path d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
          </svg>
          Back to Home
        </Button>
        
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-4xl font-display text-center mb-8 text-blue-50 glow-text">
            Astral Body Visualization
          </h1>
          
          <Tabs defaultValue="cosmic" className="w-full">
            <TabsList className="w-full max-w-sm mx-auto mb-6">
              <TabsTrigger value="cosmic" className="w-1/2">Cosmic Version</TabsTrigger>
              <TabsTrigger value="classic" className="w-1/2">Classic Version</TabsTrigger>
            </TabsList>
            
            <TabsContent value="cosmic" className="mt-0">
              <div className="glass-card p-8 md:p-12 max-w-md mx-auto">
                <CosmicAstralBody />
              </div>
              
              <p className="text-center mt-8 text-white/70 max-w-md mx-auto">
                This visualization represents your quantum energy field as it extends through the universal consciousness network
              </p>
            </TabsContent>
            
            <TabsContent value="classic" className="mt-0">
              <div className="bg-black/30 backdrop-blur-md p-8 rounded-xl max-w-lg mx-auto">
                <AstralBody />
              </div>
              
              <p className="text-center mt-8 text-white/70">
                This visualization represents your energy field in the quantum realm
              </p>
            </TabsContent>
          </Tabs>
          
          <div className="mt-12 text-center">
            <p className="text-blue-200/80 mb-2 text-sm uppercase tracking-wider">Image Credit</p>
            <p className="text-white/60 text-sm">Inspired by sacred geometry and quantum field theory</p>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default AstralBodyDemo;
