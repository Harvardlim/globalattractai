import { useNavigate } from 'react-router-dom';
import { Facebook, Instagram, Linkedin } from 'lucide-react';

export default function PreLoginFooter() {
  const navigate = useNavigate();

  return (
    <footer className="border-t border-border bg-background py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src="/images/global-attract-logo-black.png" alt="Logo" className="h-7" />
              <span className="font-bold text-lg">全球发愿</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              融合AI智能与东方智慧的一站式玄学咨询平台。
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-sm mb-3">快速链接</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              {/* <button onClick={() => navigate('/')} className="text-left hover:text-foreground transition-colors">首页</button> */}
              {/* <button onClick={() => navigate('/wuxing-sales')} className="text-left hover:text-foreground transition-colors">五行营销</button> */}
              <button onClick={() => navigate('/')} className="text-left hover:text-foreground transition-colors">登录</button>
              <button onClick={() => navigate('/terms')} className="text-left hover:text-foreground transition-colors">条款与条件</button>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm mb-3">联系我们</h4>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>📞 +60 14-3686319</p>
              <p>📍 Kuala Lumpur, Malaysia</p>
            </div>
            <div className="flex items-center gap-3 mt-4">
              {/* <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors">
                <Instagram className="h-4 w-4" />
              </a> */}
              <a href="https://www.linkedin.com/company/global-attract-1319" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© 2026 Global Attract 全球发愿. All rights reserved.</span>
          <button onClick={() => navigate('/terms')} className="hover:text-foreground transition-colors">
            条款与条件 (T&C)
          </button>
        </div>
      </div>
    </footer>
  );
}
