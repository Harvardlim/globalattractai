import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Smartphone, Monitor } from "lucide-react";

interface MobileOnlyGuardProps {
  children: React.ReactNode;
  allowDesktop?: boolean;
}

export const MobileOnlyGuard: React.FC<MobileOnlyGuardProps> = ({ children, allowDesktop }) => {
  const isMobile = useIsMobile();

  if (allowDesktop || isMobile) {
    return <>{children}</>;
  }

  // Show warning on non-mobile devices
  if (!isMobile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center gap-4 items-center">
            <div className="p-4 bg-muted rounded-full">
              <Monitor className="h-8 w-8 text-muted-foreground" />
            </div>
            <span className="text-2xl text-muted-foreground">→</span>
            <div className="p-4 bg-primary/10 rounded-full ring-2 ring-primary/20">
              <Smartphone className="h-8 w-8 text-primary" />
            </div>
          </div>

          {/* Message */}
          <div className="space-y-3">
            <h1 className="text-xl font-bold text-foreground">
              请使用手机访问
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              我们暂时不支持电脑和平板访问。<br />
              请使用手机浏览器打开本应用以获得最佳体验。
            </p>
          </div>

          {/* English translation */}
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Web and tablet views are not currently supported.<br />
              Please access this app using a mobile phone.
            </p>
          </div>

          {/* Decorative element */}
          <div className="pt-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full text-sm text-muted-foreground">
              <Smartphone className="h-4 w-4" />
              <span>Mobile Only</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
