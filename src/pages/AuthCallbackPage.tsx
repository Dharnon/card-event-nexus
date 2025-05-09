
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const AuthCallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Allow time for Supabase to process the OAuth callback 
    // and set up the session
    const timer = setTimeout(() => {
      navigate('/');
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Completing Authentication</h1>
        <p className="text-muted-foreground">Please wait while we sign you in...</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
