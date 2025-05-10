import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { AlertCircle, Loader2, Mail, Lock, User as UserIcon, AlertTriangle } from 'lucide-react';
const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [resendEmail, setResendEmail] = useState('');
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const {
    login,
    loginWithGoogle,
    register,
    resendConfirmationEmail,
    isAuthenticating,
    authError
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Check if we need to show verification dialog
  useEffect(() => {
    const verification = searchParams.get('verification');
    if (verification === 'pending') {
      setVerificationDialogOpen(true);
      setResendEmail(email);
    }
  }, [searchParams, email]);

  // Handle password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    // Simple password strength calculator
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  }, [password]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeTab === 'login') {
        await login(email, password);
        navigate('/');
      } else {
        await register(name, email, password, role);
        // The redirect happens inside register function
      }
    } catch (err) {
      // Error handling is done in context
    }
  };
  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      // Error handling is done in context
    }
  };
  const handleResendVerification = async () => {
    try {
      await resendConfirmationEmail(resendEmail);
      // Toast handled in context
    } catch (err) {
      // Error handling is done in context
    }
  };
  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
        return "bg-gray-200 dark:bg-gray-700";
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-orange-500";
      case 3:
        return "bg-yellow-500";
      case 4:
        return "bg-green-500";
      default:
        return "bg-gray-200 dark:bg-gray-700";
    }
  };
  return <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-background/80 px-4">
      <Card className="w-full max-w-md shadow-xl border-opacity-50 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Magic: The Gathering Events</CardTitle>
          <CardDescription className="text-center">
            {activeTab === 'login' ? 'Sign in to your account' : 'Create a new account'}
          </CardDescription>
        </CardHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 px-[28px] mx-0">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register" className="px-px">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 pt-4">
                {authError && <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{authError}</AlertDescription>
                  </Alert>}
                
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="transition-all bg-inherit" />
                </div>
                
                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password
                  </Label>
                  <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="transition-all bg-zinc-800" />
                </div>
                
                {/* Google Login Button */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                
                <Button type="button" className="w-full flex items-center justify-center space-x-2 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 shadow-sm" onClick={handleGoogleLogin} disabled={isAuthenticating}>
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span>Sign in with Google</span>
                </Button>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isAuthenticating}>
                  {isAuthenticating ? <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </> : 'Sign In'}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          <TabsContent value="register">
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 pt-4">
                {authError && <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{authError}</AlertDescription>
                  </Alert>}
                
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    Name
                  </Label>
                  <Input id="name" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} className="transition-all" required />
                </div>
                
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="register-email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input id="register-email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="transition-all" required />
                </div>
                
                {/* Password Field with Strength Indicator */}
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password
                  </Label>
                  <Input id="register-password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="transition-all" required />
                  <div className="h-1 w-full rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex">
                    {Array.from({
                    length: 4
                  }).map((_, i) => <div key={i} className={`h-full w-1/4 transition-all duration-300 ${i < passwordStrength ? getPasswordStrengthColor() : 'bg-transparent'}`} />)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {passwordStrength === 0 && "Enter a password"}
                    {passwordStrength === 1 && "Weak - add numbers, symbols, and uppercase letters"}
                    {passwordStrength === 2 && "Fair - make it longer"}
                    {passwordStrength === 3 && "Good - almost there"}
                    {passwordStrength === 4 && "Strong password"}
                  </p>
                </div>
                
                {/* Account Type */}
                <div className="space-y-3">
                  <Label className="flex flex-col gap-2">
                    Account Type
                    <span className="font-normal text-xs text-muted-foreground">
                      Choose what type of account you need
                    </span>
                  </Label>
                  <RadioGroup value={role} onValueChange={val => setRole(val as UserRole)} className="grid grid-cols-2 gap-2">
                    <div className={`flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-accent ${role === 'user' ? 'border-primary bg-primary/10' : 'border-border'}`}>
                      <RadioGroupItem value="user" id="player" className="sr-only" />
                      <Label htmlFor="player" className="cursor-pointer w-full text-center font-medium">
                        Player
                      </Label>
                    </div>
                    <div className={`flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-accent ${role === 'store' ? 'border-primary bg-primary/10' : 'border-border'}`}>
                      <RadioGroupItem value="store" id="store" className="sr-only" />
                      <Label htmlFor="store" className="cursor-pointer w-full text-center font-medium">
                        Store Owner
                      </Label>
                    </div>
                  </RadioGroup>
                  <p className="text-xs text-muted-foreground">
                    Store owners can create and manage events
                  </p>
                </div>

                {/* Google Registration */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or register with
                    </span>
                  </div>
                </div>
                
                <Button type="button" className="w-full flex items-center justify-center space-x-2 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 shadow-sm" onClick={handleGoogleLogin} disabled={isAuthenticating}>
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span>Sign up with Google</span>
                </Button>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isAuthenticating || passwordStrength < 3}>
                  {isAuthenticating ? <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </> : 'Create Account'}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
      
      {/* Email Verification Dialog */}
      <Dialog open={verificationDialogOpen} onOpenChange={setVerificationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Verify your email
            </DialogTitle>
            <DialogDescription>
              We've sent a verification email to <span className="font-medium">{resendEmail || email}</span>.
              Please check your inbox and click the link to activate your account.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            <div className="rounded-full bg-primary/10 p-6 mb-4">
              <Mail className="h-12 w-12 text-primary" />
            </div>
            <p className="text-center text-muted-foreground text-sm mb-4">
              If you don't see the email, please check your spam folder or click the button below to resend the verification email.
            </p>
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <AlertDescription>
                You need to verify your email address before you can sign in.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter className="flex sm:justify-between flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => {
            setVerificationDialogOpen(false);
            navigate('/login');
          }}>
              Back to login
            </Button>
            <Button onClick={handleResendVerification} disabled={isAuthenticating}>
              {isAuthenticating ? <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </> : 'Resend verification email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
};
export default AuthPage;