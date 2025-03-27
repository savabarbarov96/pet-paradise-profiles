
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

type AuthMode = 'signIn' | 'signUp';

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<AuthMode>('signIn');
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    
    try {
      setLoading(true);
      
      if (mode === 'signUp') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast.success('Registration successful', {
          description: 'Please check your email to confirm your account',
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast.success('Welcome back!');
        navigate('/');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error('Authentication failed', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-paradise-light/30 to-serenity-light/50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-semibold mb-2">
            {mode === 'signIn' ? 'Welcome Back' : 'Join Pet Paradise'}
          </h1>
          <p className="text-muted-foreground">
            {mode === 'signIn' 
              ? 'Sign in to revisit your pet memories' 
              : 'Create an account to memorialize your beloved pets'}
          </p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-soft">
          <form onSubmit={handleAuth}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-paradise hover:bg-paradise-dark text-white py-2 rounded-full shadow-glow"
                disabled={loading}
              >
                {loading ? 'Processing...' : mode === 'signIn' ? 'Sign In' : 'Create Account'}
              </Button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}
              className="text-paradise hover:underline text-sm"
            >
              {mode === 'signIn' 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
