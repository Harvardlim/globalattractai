import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Eye, EyeOff, Loader2, KeyRound, CheckCircle2 } from 'lucide-react';

export default function ForceChangePassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();

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
    try {
      const { error: pwError } = await supabase.auth.updateUser({ password });
      if (pwError) throw pwError;

      if (user) {
        await supabase
          .from('profiles')
          .update({ must_change_password: false } as any)
          .eq('id', user.id);
      }

      setShowSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-4">
          <img width="120px" src="/images/global-attract-logo-black.png" alt="Global Attract 全球发愿" />
        </div>
        <h1 className="text-2xl font-bold text-center text-foreground mb-2">全球发愿</h1>
        <h2 className="text-lg font-medium text-center text-muted-foreground mb-6">
          首次登录，请设置新密码
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">新密码</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">确认新密码</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmPassword && (
              <p className={`text-xs mt-1 ${confirmPassword === password ? 'text-primary' : 'text-destructive'}`}>
                {confirmPassword === password ? '✓ 密码一致' : '✗ 密码不一致'}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full h-12" disabled={loading || !allPass || password !== confirmPassword}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
              <div className="flex items-center gap-2"><KeyRound className="h-4 w-4" /> 设置密码并进入</div>
            )}
          </Button>
        </form>

        <Dialog open={showSuccess} onOpenChange={() => {}}>
          <DialogContent className="max-w-xs text-center [&>button]:hidden">
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="rounded-full bg-primary/10 p-3">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">密码设置成功！</h3>
              <p className="text-sm text-muted-foreground">您的新密码已生效</p>
              <Button className="w-full" onClick={async () => { await refreshProfile(); navigate('/dashboard', { replace: true }); }}>
                进入首页
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
