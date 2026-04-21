import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getRedirectUrl } from '@/lib/redirectUrl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronLeft, Eye, EyeOff, Loader2, Mail, KeyRound, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Step = 'email' | 'emailSent' | 'newPassword';

const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/;

export default function ResetPassword() {
  const navigate = useNavigate();
  
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isInvite, setIsInvite] = useState(false);

  // Listen for PASSWORD_RECOVERY or invite sign-in event
  useEffect(() => {
    // Check URL hash for invite type
    const hash = window.location.hash;
    if (hash.includes('type=invite') || hash.includes('type=signup')) {
      setIsInvite(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setStep('newPassword');
      }
      // For invited users, they get SIGNED_IN event
      if (event === 'SIGNED_IN' && (window.location.hash.includes('type=invite') || window.location.hash.includes('type=signup'))) {
        setIsInvite(true);
        setStep('newPassword');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Step 1: Send reset link to email
  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('请输入邮箱地址');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getRedirectUrl('/reset-password'),
      });
      if (error) {
        setError(error.message);
      } else {
        setStep('emailSent');
      }
    } catch {
      setError('发送失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Set new password (after clicking magic link)
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 12) {
      setError('新密码至少需要12个字符');
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      setError('新密码必须包含至少一个小写字母');
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setError('新密码必须包含至少一个大写字母');
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setError('新密码必须包含至少一个数字');
      return;
    }
    if (!SPECIAL_CHAR_REGEX.test(newPassword)) {
      setError('新密码必须包含至少一个特殊字符');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('两次输入的新密码不一致');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setError('密码更新失败: ' + error.message);
      } else {
        toast.success('密码已成功更新，请重新登录');
        await supabase.auth.signOut();
        navigate('/');
      }
    } catch {
      setError('密码更新失败');
    } finally {
      setLoading(false);
    }
  };

  const stepConfig = {
    email: { title: '重置密码', subtitle: '输入您的邮箱，我们将发送重置链接', icon: Mail },
    emailSent: { title: '邮件已发送', subtitle: `重置链接已发送到 ${email}，请查看您的邮箱并点击链接`, icon: CheckCircle },
    newPassword: { 
      title: isInvite ? '设置密码' : '设置新密码', 
      subtitle: isInvite ? '欢迎加入！请设置您的登录密码' : '请输入您的新密码', 
      icon: KeyRound 
    },
  };

  const current = stepConfig[step];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background items-center justify-center p-6 flex flex-col">
      <div className="w-full max-w-sm">
        {/* Back button */}
        <button
          onClick={() => {
            if (step === 'email' || step === 'emailSent') navigate('/');
            else navigate('/');
          }}
          className="mb-6 p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <current.icon className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{current.title}</h1>
          <p className="text-sm text-muted-foreground mt-2">{current.subtitle}</p>
        </div>

        {/* {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )} */}

        {/* Step 1: Email */}
        {step === 'email' && (
          <form onSubmit={handleSendLink} className="space-y-4">
            <div className="space-y-2">
              <Label>邮箱地址</Label>
              <div>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="输入您的邮箱"
                  disabled={loading}
                  className={`pr-10 rounded-full border-input ${error ? 'border-destructive' : ''}`}
                />
                {error && <p className="text-sm pl-1 text-destructive">{error}</p>}
              </div>
            </div>
            <Button type="submit" className="w-full h-12" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : '发送重置链接'}
            </Button>
          </form>
        )}

        {/* Step 2: Email sent confirmation */}
        {step === 'emailSent' && (
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              请打开您的邮箱，点击重置链接后将自动跳转回此页面设置新密码。
            </p>
            <Button variant="outline" className="w-full" onClick={() => setStep('email')}>
              重新发送
            </Button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              返回登录
            </button>
          </div>
        )}

        {/* Step 3: New Password (after magic link click) */}
        {step === 'newPassword' && (
          <form onSubmit={handleSetPassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label>新密码</Label>
              <div className="relative">
                <Input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="输入新密码"
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="text-xs space-y-0.5 mt-1">
                <p className={newPassword.length >= 12 ? 'text-primary' : 'text-muted-foreground'}>
                  {newPassword.length >= 12 ? '✓' : '○'} 至少12个字符
                </p>
                <p className={/[a-z]/.test(newPassword) ? 'text-primary' : 'text-muted-foreground'}>
                  {/[a-z]/.test(newPassword) ? '✓' : '○'} 至少1个小写字母
                </p>
                <p className={/[A-Z]/.test(newPassword) ? 'text-primary' : 'text-muted-foreground'}>
                  {/[A-Z]/.test(newPassword) ? '✓' : '○'} 至少1个大写字母
                </p>
                <p className={/[0-9]/.test(newPassword) ? 'text-primary' : 'text-muted-foreground'}>
                  {/[0-9]/.test(newPassword) ? '✓' : '○'} 至少1个数字
                </p>
                <p className={SPECIAL_CHAR_REGEX.test(newPassword) ? 'text-primary' : 'text-muted-foreground'}>
                  {SPECIAL_CHAR_REGEX.test(newPassword) ? '✓' : '○'} 至少1个特殊字符
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>确认新密码</Label>
              <div className="relative">
                <Input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="再次输入新密码"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && (
                <p className={cn("text-xs mt-1", confirmPassword === newPassword ? 'text-primary' : 'text-destructive')}>
                  {confirmPassword === newPassword ? '✓ 密码一致' : '✗ 密码不一致'}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full h-12" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : '确认更换密码'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
