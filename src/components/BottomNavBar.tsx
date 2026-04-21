import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Zap, Clock, Star, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/contexts/AuthContext";
import { Language } from "@/types/index";

const tabLabels: Record<string, Record<Language, string>> = {
  "/dashboard": { zh: "首页", en: "Home", ms: "Utama" },
  "/energy": { zh: "数字能量", en: "Energy", ms: "Tenaga" },
  "/realtime": { zh: "实时盘", en: "Realtime", ms: "Masa Nyata" },
  "/destiny": { zh: "命理", en: "Destiny", ms: "Takdir" },
  "/profile": { zh: "我的", en: "Profile", ms: "Profil" },
};

const tabs = [
  { path: "/dashboard", icon: Home },
  { path: "/energy", icon: Zap },
  { path: "/realtime", icon: Clock },
  { path: "/destiny", icon: Star },
  { path: "/profile", icon: User },
];

// Pages where bottom nav should NOT show
const HIDDEN_ROUTES = ['/', '/login', '/create-account', '/reset-password', '/force-change-password', '/wuxing-sales', '/terms', '/destiny/report', '/clients/new', '/admin'
  , '/admin/members', '/admin/platforms', '/flying-stars', 
  '/calendar', '/bazi-encyclopedia', '/energy-encyclopedia', '/qimen-encyclopedia', 
  '/liuyao-encyclopedia', '/sihai-encyclopedia', '/wealth-encyclopedia', 
  '/spending-encyclopedia', '/speech-encyclopedia', '/branch-relations', '/settings', 
  '/admin/orders', '/admin/products',
  '/orders', '/store', '/chat', '/destiny/history'];

export const BottomNavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const { user } = useAuth();
  const [isOverlayActive, setIsOverlayActive] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsOverlayActive(
        document.body.hasAttribute('data-destiny-loading') ||
        document.body.hasAttribute('data-ai-chat-open')
      );
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-destiny-loading', 'data-ai-chat-open'] });
    return () => observer.disconnect();
  }, []);

  // Hide on public pages, when not logged in, or during loading overlays
  const isHiddenDynamic = /^\/clients\/[^/]+\/edit/.test(location.pathname) || /^\/store\/[^/]+/.test(location.pathname) || location.pathname === '/cart' || location.pathname === '/checkout' || /\/products\/(new|[^/]+\/edit)/.test(location.pathname);
  if (!user || HIDDEN_ROUTES.includes(location.pathname) || isHiddenDynamic || isOverlayActive) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1.5">
        {tabs.map(({ icon: Icon, path }) => {
          const isActive = location.pathname === path;
          const label = tabLabels[path]?.[currentLanguage] ?? tabLabels[path]?.zh;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className={cn("leading-none", isActive && "font-semibold")}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
