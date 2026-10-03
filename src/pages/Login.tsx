import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { setAdmin } from '@/store/slices/authSlice';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/errors';
import { api } from '@/lib/api';
import logo from '@/assets/logo.png';

interface LoginUser {
  token: string;
  secure: boolean;
  USER_ID: string;
  NAME: string;
  EMAIL: string;
  ROLE: string;
}

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post<{ user: LoginUser }>('/user/login', { EMAIL: email, PASSWORD: password }, { auth: false });
      const user = data!.user;
      const role = user.ROLE.toLowerCase();

      if (!['super_admin', 'manager', 'staff'].includes(role)) {
        toast({
          title: 'Login failed',
          description: 'This account does not have admin access.',
          variant: 'destructive',
        });
        return;
      }

      localStorage.setItem('authToken', user.token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch(setAdmin({
        id: user.USER_ID,
        name: user.NAME,
        email: user.EMAIL,
        role: role as 'super_admin' | 'manager' | 'staff',
      }));

      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login failed',
        description: getErrorMessage(error, 'An error occurred during login. Please try again.'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center space-y-4 pb-2">
          <img src={logo} alt="Brundhavanam Desi Foods" className="mx-auto w-16 h-16 rounded-2xl object-cover" />
          <div>
            <CardTitle className="text-2xl font-heading">Brundhavanam</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Admin Dashboard Login
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@brundhavanam.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full gap-2" disabled={loading}>
              <LogIn className="h-4 w-4" />
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Demo Credentials:</strong><br />
              Email: admin@brundhavanamdesifoods.com<br />
              Password: Admin@12345
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
