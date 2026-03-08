'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';
import { loginSchema, registerSchema, type LoginFormData, type RegisterFormData } from '@/lib/validations';
import { 
  Loader2, 
  Eye, 
  EyeOff, 
  BookOpen, 
  GraduationCap, 
  Lightbulb, 
  Sparkles,
  Mail,
  Lock,
  User,
  ArrowRight,
} from 'lucide-react';
import { FloatingLetters } from '@/components/effects/floating-letters';

// Reduced to 3 floating icons, non-infinite
const floatingIcons = [
  { Icon: BookOpen, delay: 0, x: '10%', y: '15%', size: 32 },
  { Icon: GraduationCap, delay: 0.5, x: '85%', y: '20%', size: 40 },
  { Icon: Lightbulb, delay: 1, x: '15%', y: '70%', size: 28 },
];

function FloatingIcon({ Icon, delay, x, y, size }: { 
  Icon: React.ElementType; 
  delay: number; 
  x: string; 
  y: string; 
  size: number;
}) {
  return (
    <motion.div
      className="absolute text-blue-400/20"
      style={{ left: x, top: y }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1, y: -20 }}
      transition={{ duration: 2, delay: delay * 1.5, ease: "easeOut" }}
    >
      <Icon size={size} />
    </motion.div>
  );
}

// Simplified input — plain HTML input with standard styling
function SimpleInput({
  id,
  type = 'text',
  label,
  icon: IconComponent,
  error,
  ...props
}: {
  id: string;
  type?: string;
  label: string;
  icon: React.ElementType;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
          <IconComponent size={18} />
        </div>
        
        <input
          id={id}
          type={inputType}
          className={`
            w-full h-14 pl-12 pr-12
            bg-muted/50
            border-2 rounded-xl
            text-white
            transition-all duration-200
            focus:outline-none focus:ring-0
            ${error 
              ? 'border-red-500/50 focus:border-red-500' 
              : 'border-border focus:border-blue-500/50 hover:border-blue-500/30'
            }
            focus:bg-muted/60
          `}
          placeholder={label}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-400 mt-2 ml-1">{error}</p>
      )}
    </div>
  );
}

// Main component
export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const { login, register: registerUser, loginWithGoogle, isLoading } = useAuthStore();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const handleLoginSubmit = useCallback(async (data: LoginFormData) => {
    try {
      await login(data);
      toast.success('Welcome back!', {
        description: 'Redirecting to your dashboard...',
        icon: '🎉',
      });
      router.push('/home');
    } catch {
      toast.error('Invalid credentials', {
        description: 'Please check your email and password.',
      });
    }
  }, [login, router]);

  const handleRegisterSubmit = useCallback(async (data: RegisterFormData) => {
    try {
      await registerUser(data);
      toast.success('Account created!', {
        description: 'Welcome to EduTrack!',
        icon: '🚀',
      });
      router.push('/home');
    } catch {
      toast.error('Registration failed', {
        description: 'Please try again later.',
      });
    }
  }, [registerUser, router]);

  const handleGoogleLogin = useCallback(async () => {
    try {
      await loginWithGoogle();
      toast.success('Welcome!', {
        description: 'Signed in with Google.',
        icon: '✨',
      });
      router.push('/home');
    } catch {
      toast.error('Google login failed');
    }
  }, [loginWithGoogle, router]);

  const toggleMode = useCallback(() => {
    setIsLogin(prev => !prev);
    loginForm.reset();
    registerForm.reset();
  }, [loginForm, registerForm]);

  return (
    <div className="min-h-screen w-full flex overflow-hidden relative">
      {/* Dark background with subtle gradients */}
      <div className="absolute inset-0 bg-background">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background: 'radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.12) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(139, 92, 246, 0.12) 0%, transparent 50%)',
          }}
        />
      </div>

      {/* Floating letter particles */}
      <FloatingLetters 
        maxLetters={30}
        spawnRate={70}
        minDistance={25}
        sizeRange={[14, 28]}
        lifetime={3000}
      />

      {/* Left side - Illustration area (hidden on mobile) */}
      <div className="hidden lg:flex lg:flex-1 relative items-center justify-center p-12">
        {floatingIcons.map((icon, index) => (
          <FloatingIcon key={index} {...icon} />
        ))}

        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="w-64 h-64 relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl opacity-50" />
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 shadow-2xl flex items-center justify-center">
              <GraduationCap className="w-24 h-24 text-white" />
            </div>
          </div>

          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              EduTrack
            </h2>
            <p className="text-muted-foreground mt-2 text-lg max-w-xs">
              Empowering Education, One Event at a Time
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Right side - Form area */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 80, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 80, damping: 18, delay: 0.2 }}
        >
          {/* Glass card container */}
          <div className="relative backdrop-blur-xl bg-card/80 rounded-3xl shadow-2xl border border-border p-8 sm:p-10 overflow-hidden">
            {/* Static glow accents */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-500 shadow-lg mb-4">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                EduTrack
              </h1>
              <p className="text-xs text-muted-foreground mt-1">Empowering Education</p>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                {isLogin ? 'Welcome Back!' : 'Create Account'}
              </h2>
              <p className="text-muted-foreground mt-2">
                {isLogin 
                  ? 'Sign in to continue your learning journey' 
                  : 'Join our educational community today'}
              </p>
            </div>

            {/* Form */}
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.form
                  key="login-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={loginForm.handleSubmit(handleLoginSubmit)}
                  className="space-y-5"
                >
                  <SimpleInput
                    id="login-email"
                    type="email"
                    label="Email Address"
                    icon={Mail}
                    {...loginForm.register('email')}
                    error={loginForm.formState.errors.email?.message}
                  />
                  <SimpleInput
                    id="login-password"
                    type="password"
                    label="Password"
                    icon={Lock}
                    {...loginForm.register('password')}
                    error={loginForm.formState.errors.password?.message}
                  />

                  <Button 
                    type="submit" 
                    className="w-full h-14 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </motion.form>
              ) : (
                <motion.form
                  key="register-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={registerForm.handleSubmit(handleRegisterSubmit)}
                  className="space-y-4"
                >
                  <SimpleInput
                    id="register-name"
                    label="Full Name"
                    icon={User}
                    {...registerForm.register('name')}
                    error={registerForm.formState.errors.name?.message}
                  />
                  <SimpleInput
                    id="register-email"
                    type="email"
                    label="Email Address"
                    icon={Mail}
                    {...registerForm.register('email')}
                    error={registerForm.formState.errors.email?.message}
                  />
                  <SimpleInput
                    id="register-password"
                    type="password"
                    label="Password"
                    icon={Lock}
                    {...registerForm.register('password')}
                    error={registerForm.formState.errors.password?.message}
                  />
                  <SimpleInput
                    id="register-confirm"
                    type="password"
                    label="Confirm Password"
                    icon={Lock}
                    {...registerForm.register('confirmPassword')}
                    error={registerForm.formState.errors.confirmPassword?.message}
                  />

                  <Button 
                    type="submit" 
                    className="w-full h-14 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Create Account
                        <Sparkles className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card/80 px-4 text-sm text-muted-foreground">
                  or continue with
                </span>
              </div>
            </div>

            {/* Google Login */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-14 text-base font-medium rounded-xl bg-muted/50 border-2 border-border text-foreground hover:border-blue-500/30 hover:bg-muted/60 transition-all duration-300"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </Button>

            {/* Toggle */}
            <p className="text-center mt-8 text-sm text-muted-foreground">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={toggleMode}
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          {/* Demo credentials hint */}
          <p className="text-center mt-6 text-xs text-muted-foreground">
            Demo: admin@edutrack.org / password123
          </p>
        </motion.div>
      </div>
    </div>
  );
}
