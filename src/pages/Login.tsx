import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeClosed, Globe, Loader2, LogIn, X } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const loginTranslations = {
  zh: {
    brand: '全球发愿',
    title: '登录',
    email: '邮件',
    password: '密码',
    emailRequired: '请输入邮件地址',
    passwordRequired: '请输入密码',
    accountFrozen: '该账号已被冻结，无法登录。请联系管理员。',
    invalidCredentials: '邮箱或密码错误。若密码最近被管理员更改，请使用下方「忘记密码」重新设置。',
    forgotPassword: '忘记密码？',
    rememberMe: '记住我',
    login: '登录',
  },
  en: {
    brand: 'Global Attract',
    title: 'Login',
    email: 'Email',
    password: 'Password',
    emailRequired: 'Please enter your email',
    passwordRequired: 'Please enter your password',
    accountFrozen: 'This account has been frozen. Please contact the administrator.',
    invalidCredentials: 'Incorrect email or password. If your password was recently changed by an admin, use "Forgot Password" below to reset it.',
    forgotPassword: 'Forgot password?',
    rememberMe: 'Remember me',
    login: 'Login',
  },
  ms: {
    brand: 'Global Attract',
    title: 'Log Masuk',
    email: 'E-mel',
    password: 'Kata Laluan',
    emailRequired: 'Sila masukkan e-mel anda',
    passwordRequired: 'Sila masukkan kata laluan anda',
    accountFrozen: 'Akaun ini telah dibekukan. Sila hubungi pentadbir.',
    invalidCredentials: 'E-mel atau kata laluan salah. Jika kata laluan anda baru-baru ini ditukar oleh pentadbir, gunakan "Lupa Kata Laluan" di bawah untuk menetapkan semula.',
    forgotPassword: 'Lupa kata laluan?',
    rememberMe: 'Ingat saya',
    login: 'Log Masuk',
  },
} as const;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load remembered email on mount
  useEffect(() => {
    const saved = localStorage.getItem('remembered_email');
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);
  
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentLanguage, setLanguage } = useLanguage();
  const t = loginTranslations[currentLanguage] || loginTranslations.zh;
  
  const from = location.state?.from?.pathname || '/dashboard';

  const handleResetPassword = () => {
    const url = 'https://theglobalattract.com/reset-password';
    window.open(url, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailError('');
    setPasswordError('');

    let hasError = false;
    if (!email.trim()) {
      setEmailError(t.emailRequired);
      hasError = true;
    }
    if (!password) {
      setPasswordError(t.passwordRequired);
      hasError = true;
    }
    if (hasError) return;

    setLoading(true);

    const { error } = await signIn(email.trim().toLowerCase(), password);
    
    if (error) {
      if (error.message === 'ACCOUNT_FROZEN') {
        setError(t.accountFrozen);
      } else if (error.message === 'Invalid login credentials') {
        setError(t.invalidCredentials);
      } else {
        setError(error.message);
      }
      setLoading(false);
    } else {
      if (rememberMe) {
        localStorage.setItem('remembered_email', email);
      } else {
        localStorage.removeItem('remembered_email');
      }
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background items-center justify-center p-6 flex flex-col relative">
      {/* Language switcher */}
      <div className="absolute top-4 right-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                <Globe className="h-4 w-4" />
                {currentLanguage === 'zh' ? '中文' : currentLanguage === 'en' ? 'EN' : 'BM'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage('zh')}>中文</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('en')}>English</DropdownMenuItem>
              {/* <DropdownMenuItem onClick={() => setLanguage('ms')}>Bahasa Melayu</DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      <div className="w-full max-w-sm text-center">
        <div className="flex justify-center mb-4">
          <img width="120px" src='/images/global-attract-logo-black.png' alt='Global Attract 全球发愿'></img>
        </div>
      
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {t.brand}
        </h1>

        <h2 className="text-xl font-bold text-foreground mb-8">
          {t.title}
        </h2>
        
        <div className='text-left'>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              {t.email}
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                }}
                disabled={loading}
                className={`pr-10 rounded-full border-input ${emailError ? 'border-destructive' : ''}`}
              />
              {email && (
                <button
                  type="button"
                  onClick={() => setEmail('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            {emailError && <p className="text-sm text-destructive">{emailError}</p>}
          </div>
          
          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-foreground">
              {t.password}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError('');
                }}
                disabled={loading}
                className={`pr-16 rounded-full border-input ${passwordError ? 'border-destructive' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-foreground hover:text-muted-foreground"
              >
                {showPassword ? <EyeClosed /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
          </div>
          
          {/* Remember Me & Reset Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <Label htmlFor="rememberMe" className="text-sm font-medium text-foreground cursor-pointer">
                {t.rememberMe}
              </Label>
            </div>
            <button
              type="button"
              onClick={handleResetPassword}
              className="text-sm font-medium text-foreground"
            >
              {t.forgotPassword}
            </button>
          </div>
          
          {/* Login Button */}
          <Button 
            type="submit" 
            className="w-full h-12 font-medium"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <div className="flex flex-row gap-2 items-center"><LogIn /> {t.login}</div>
            )}
          </Button>
        </form>
        </div>
      </div>
    </div>
  );
}
