
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import LoginForm from '@/components/LoginForm';
import { useAuth } from '@/context/AuthContext';

const LoginPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);
  
  if (user) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-background flex items-center justify-center">
        <div className="w-full max-w-md px-4 py-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-magic-purple text-white mb-4">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold">Welcome to MagicEvents</h1>
            <p className="text-muted-foreground">
              Sign in to access your account or create a new one
            </p>
          </div>
          
          <LoginForm />
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
