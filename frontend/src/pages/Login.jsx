import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Moon, Eye, EyeOff } from 'lucide-react';
import TwinklingStars from '@/components/TwinklingStars';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome back to Dreamscape!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen auth-bg flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70"></div>
      <TwinklingStars />
      
      <div className="relative w-full max-w-md z-10">
        <div className="glass rounded-3xl p-8 md:p-10 shadow-2xl animate-fade-in">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center animate-pulse-glow">
              <Moon className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-serif text-3xl text-white tracking-tight">Dreamscape</h1>
          </div>

          <h2 className="font-serif text-2xl text-center text-white mb-2">Welcome Back</h2>
          <p className="text-center text-slate-400 mb-8">Enter the realm of your dreams</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="bg-slate-950/50 border-white/10 focus:border-purple-500/50 rounded-xl h-12 text-white placeholder:text-slate-600"
                data-testid="login-email-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-slate-950/50 border-white/10 focus:border-purple-500/50 rounded-xl h-12 text-white placeholder:text-slate-600 pr-12"
                  data-testid="login-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-full bg-white text-black font-semibold hover:bg-slate-200 transition-all duration-300 btn-glow"
              data-testid="login-submit-button"
            >
              {loading ? 'Entering...' : 'Enter Dreamscape'}
            </Button>
          </form>

          <p className="mt-8 text-center text-slate-400">
            New to the realm?{' '}
            <Link to="/register" className="text-purple-400 hover:text-purple-300 transition-colors" data-testid="register-link">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
