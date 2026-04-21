import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Loader2, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const source = '全球发愿';
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const refFromUrl = searchParams.get('ref') || '';
  const [refCodeInput, setRefCodeInput] = useState(refFromUrl);
  
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const passwordChecks = [
    { label: '至少12个字符', pass: password.length >= 12 },
    { label: '至少1个小写字母', pass: /[a-z]/.test(password) },
    { label: '至少1个大写字母', pass: /[A-Z]/.test(password) },
    { label: '至少1个数字', pass: /[0-9]/.test(password) },
    { label: '至少1个特殊字符', pass: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password) },
  ];
  const allPass = passwordChecks.every(c => c.pass);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!allPass) {
      setError('密码不符合要求');
      return;
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password, displayName || undefined, source, refCodeInput || undefined);
    
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">

      <h1 className="text-2xl font-bold text-center mb-2">
        全球发愿奇门遁甲
      </h1>

      <p className="text-lg text-slate-600 mb-8">创建新账户</p>

      <div>
        <form onSubmit={handleSubmit}>
          <div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2 mb-4">
              <Label htmlFor="displayName">显示名称</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="您的名称"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2 mb-4">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2 mb-4">
              <Label htmlFor="password">密码</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password && (
                <div className="text-xs space-y-0.5 mt-1">
                  {passwordChecks.map((c, i) => (
                    <p key={i} className={c.pass ? 'text-primary' : 'text-muted-foreground'}>
                      {c.pass ? '✓' : '○'} {c.label}
                    </p>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2 mb-4">
              <Label htmlFor="confirmPassword">确认密码</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="请输入密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <Label htmlFor="refCode">推荐码（选填）</Label>
              <Input
                id="refCode"
                type="text"
                placeholder="请输入推荐码"
                value={refCodeInput}
                onChange={(e) => setRefCodeInput(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className='mt-8'>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="mr-2 h-4 w-4" />
                )}
                注册
              </Button>
              <p className="text-sm text-center text-muted-foreground mt-4">
                已有账户？{' '}
                <Link to="/" className="text-primary hover:underline">
                  立即登录
                </Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
