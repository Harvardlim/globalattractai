import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/hooks/useCart';
import { useGuestCart } from '@/hooks/useGuestCart';

export default function PreLoginNav() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const authCart = useCart();
  const guestCart = useGuestCart();
  const totalItems = user ? authCart.totalItems : guestCart.totalItems;
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const navLinks = [
    // { label: '五行营销', path: '/wuxing-sales' },
    // { label: '商城', path: '/store' },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left: Logo + desktop links */}
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/')} className="flex items-center gap-1">
              <img src="/images/global-attract-logo-black.png" alt="Logo" className="h-8" />
              <span className="font-bold text-lg">全球发愿</span>
            </button>
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Button key={link.path} variant="ghost" size="sm" onClick={() => navigate(link.path)}>
                  {link.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Right: Cart + CTA + hamburger */}
          <div className="flex items-center gap-2">
            {/* <Button variant="ghost" size="icon" className="relative" onClick={() => navigate('/cart')}>
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button> */}
            <div className="block">
              {user ? (
                <Button variant="default" onClick={() => navigate('/dashboard')}>主页</Button>
              ) : (
                <Button variant="default" onClick={() => navigate('/')}>登录</Button>
              )}
            </div>
            {/* Mobile hamburger */}
            {/* <Button variant="ghost" size="icon" className="md:hidden text-base" onClick={() => setMenuOpen(!menuOpen)}>
              <Menu className="h-12 w-12" />
            </Button> */}
          </div>
        </div>
      </nav>

      {/* Mobile fullscreen menu - rendered outside nav to avoid stacking issues */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-[60] bg-white flex flex-col overflow-hidden">
          <div className="flex-1 flex flex-col gap-4 px-6 pt-8">
            {navLinks.map(link => (
              <Button
                key={link.path}
                variant="ghost"
                className="justify-start text-lg h-12"
                onClick={() => { navigate(link.path); setMenuOpen(false); }}
              >
                {link.label}
              </Button>
            ))}
            {/* <div className="border-t border-border my-2" /> */}
            {user ? (
              <Button variant="default" className="h-12 text-lg" onClick={() => { navigate('/dashboard'); setMenuOpen(false); }}>
                主页
              </Button>
            ) : (
              <Button variant="default" className="h-12 text-lg" onClick={() => { navigate('/'); setMenuOpen(false); }}>
                登录
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
