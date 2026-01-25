import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, ArrowRight, Zap, Shield, Globe } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const [secretKey, setSecretKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!secretKey.trim()) {
      toast.error('Please enter your secret key');
      return;
    }

    if (!secretKey.startsWith('sk_')) {
      toast.error('Invalid secret key format. Keys start with sk_live_ or sk_test_');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock login - in production this would validate against the API
    login(secretKey, {
      businessName: 'Tech Store Nigeria',
      email: 'merchant@techstore.ng',
      testMode: secretKey.includes('test'),
    });

    toast.success('Welcome back!');
    navigate('/dashboard');
    setIsLoading(false);
  };

  const handleDemoLogin = () => {
    setSecretKey('sk_test_demo123456789');
  };

  return (
    <div className="min-h-screen gradient-hero flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-primary-text">CryptoExpense</span>
          </div>
        </div>

        <div className="space-y-8 max-w-md">
          <h1 className="text-4xl font-bold leading-tight">
            Accept crypto payments.{' '}
            <span className="gradient-primary-text">Get settled in NGN.</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            The simplest way to accept USDT payments from customers worldwide and receive instant settlements to your bank account.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Escrow Protection</p>
                <p className="text-sm text-muted-foreground">Funds secured until confirmation</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="font-medium">Multi-Chain Support</p>
                <p className="text-sm text-muted-foreground">Tron, Base, Arbitrum, Solana</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          © 2024 CryptoExpense. Secure crypto payments.
        </p>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-scale-in">
          <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-xl p-8 shadow-2xl">
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-primary-text">CryptoExpense</span>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Merchant Login</h2>
              <p className="text-muted-foreground">
                Enter your secret API key to access your dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="secretKey">Secret Key</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="secretKey"
                    type="password"
                    placeholder="sk_live_xxxxxxxxxx"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    className="pl-10 h-12 bg-muted/50 border-border focus:border-primary"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Your secret key was provided when you registered. Never share it publicly.
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 gradient-primary text-white font-semibold hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Access Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border">
              <Button 
                variant="ghost" 
                className="w-full text-muted-foreground hover:text-foreground"
                onClick={handleDemoLogin}
              >
                Use demo credentials
              </Button>
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <a href="#" className="text-primary hover:underline">
                Register your business
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
