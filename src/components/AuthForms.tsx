
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormLabel } from '@/components/ui/form-label';
import { cn } from '@/lib/utils';
import GlowEffect from '@/components/GlowEffect';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';

interface AuthFormsProps {
  className?: string;
}

const AuthForms = ({ className }: AuthFormsProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{email?: string; password?: string}>({});
  const { signIn, signUp, isLoading, authError } = useAuth();

  const validateForm = () => {
    const errors: {email?: string; password?: string} = {};
    
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (isSignUp && password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (isSignUp) {
      await signUp(email, password);
    } else {
      await signIn(email, password);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={cn(
        "max-w-sm w-full mx-auto p-6 rounded-lg",
        "bg-black/30 backdrop-blur-xl border border-white/10 shadow-lg",
        className
      )}
    >
      <GlowEffect 
        className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-astral-400 to-astral-600 flex items-center justify-center"
        animation="pulse"
        color="rgba(50, 102, 205, 0.5)"
      >
        <span className="text-2xl text-white font-display">Q</span>
      </GlowEffect>
      
      <h2 className="text-2xl font-display text-center text-white mb-6">
        {isSignUp ? "Begin Your Journey" : "Return to Quanex"}
      </h2>
      
      {authError && (
        <div className="mb-4 p-3 rounded bg-destructive/10 border border-destructive/30 text-destructive-foreground text-sm" role="alert">
          {authError}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <FormLabel 
            htmlFor="email" 
            variant="contrast"
            required={true}
            className="mb-1.5 block"
          >
            Email
          </FormLabel>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white/10 border-white/20 text-white"
            error={!!formErrors.email}
            errorMessage={formErrors.email}
            aria-required="true"
            required
          />
        </div>
        
        <div>
          <FormLabel 
            htmlFor="password" 
            variant="contrast"
            required={true}
            className="mb-1.5 block"
          >
            Password
          </FormLabel>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={isSignUp ? "Create a secure password" : "Enter your password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/10 border-white/20 text-white pr-10"
              error={!!formErrors.password}
              errorMessage={formErrors.password}
              aria-required="true"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        
        <Button
          type="submit"
          className="w-full"
          variant="quantum"
          disabled={isLoading}
          loading={isLoading}
        >
          {isSignUp ? (
            <>
              <UserPlus size={18} />
              Create Account
            </>
          ) : (
            <>
              <LogIn size={18} />
              Sign In
            </>
          )}
        </Button>
      </form>
      
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-quantum-300 hover:text-quantum-200 text-sm hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-quantum-400 focus-visible:ring-offset-2 focus-visible:rounded px-2 py-1"
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
