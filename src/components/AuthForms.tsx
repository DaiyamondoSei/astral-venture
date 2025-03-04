
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import GlowEffect from '@/components/GlowEffect';
import { motion } from 'framer-motion';

interface AuthFormsProps {
  className?: string;
}

const AuthForms = ({ className }: AuthFormsProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, signUp, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      await signUp(email, password);
    } else {
      await signIn(email, password);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={cn(
        "max-w-sm w-full mx-auto p-6 rounded-lg",
        "bg-black/30 backdrop-blur-xl border border-white/10",
        className
      )}
    >
      <GlowEffect 
        className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-astral-400 to-astral-600 flex items-center justify-center"
        animation="pulse"
      >
        <span className="text-2xl text-white">Q</span>
      </GlowEffect>
      
      <h2 className="text-2xl font-display text-center text-white mb-6">
        {isSignUp ? "Begin Your Journey" : "Return to Quanex"}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white/10 border-white/20 text-white"
            required
          />
        </div>
        
        <div>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white/10 border-white/20 text-white"
            required
          />
        </div>
        
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-quantum-500 to-astral-500 hover:from-quantum-600 hover:to-astral-600 text-white"
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
        </Button>
      </form>
      
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-quantum-300 hover:text-quantum-200 text-sm"
        >
          {isSignUp 
            ? "Already have an account? Sign In" 
            : "New to Quanex? Create Account"}
        </button>
      </div>
    </motion.div>
  );
};

export default AuthForms;
