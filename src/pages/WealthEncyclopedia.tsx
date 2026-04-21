import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Lightbulb, Users, Zap, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { WEALTH_ARCHETYPES } from "@/data/wealthArchetypeData";
import { useMemberPermissions } from "@/hooks/useMemberPermissions";
import LockedContent from "@/components/LockedContent";

const STAR_ORDER = ['天蓬', '天任', '天冲', '天辅', '天禽', '天心', '天柱', '天英', '天芮'];

const WealthEncyclopedia: React.FC = () => {
  const navigate = useNavigate();
  const { canAccess } = useMemberPermissions();
  const canViewFull = canAccess('destiny_full');

  const entries = STAR_ORDER.map(star => WEALTH_ARCHETYPES[star]).filter(Boolean);

  return (
    <div className="min-h-screen bg-background text-foreground mx-4">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-2 sm:px-4 py-3 max-w-7xl">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-500" />
              <h1 className="text-lg sm:text-xl font-bold">创富宝典</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-2 sm:px-4 py-4 max-w-7xl mb-24">
        <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 border border-amber-200/50 dark:border-amber-800/30 mb-6">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-1">九星创富原型</p>
              <p className="text-xs text-muted-foreground">
                基于奇门遁甲九星理论，每颗星代表一种独特的创富模式与财富DNA。了解你的主导星，找到最适合你的财富路径。
              </p>
            </div>
          </div>
        </div>

        {canViewFull ? (
          <div className="space-y-3">
            {entries.map((archetype, idx) => (
              <Collapsible key={archetype.star} defaultOpen={idx === 0}>
                <div className="bg-card rounded-lg border border-border">
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-amber-500 w-6">{idx + 1}.</span>
                      <Star className="h-4 w-4 text-amber-500" />
                      <span className="font-bold text-sm">{archetype.title}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {archetype.subtitle}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4">
                    <div className="space-y-4">
                      {/* 财富密码 */}
                      <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 border border-amber-200/50 dark:border-amber-800/30">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-xs font-medium text-amber-700 dark:text-amber-400">财富密码</span>
                            <p className="text-sm mt-1">{archetype.wealthCode}</p>
                          </div>
                        </div>
                      </div>

                      {/* 形象 */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-medium text-muted-foreground">形象</span>
                        </div>
                        <p className="text-sm pl-5">{archetype.image}</p>
                      </div>

                      {/* 核心行动 */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5">
                          <Zap className="h-3.5 w-3.5 text-primary" />
                          <span className="text-xs font-medium text-muted-foreground">核心行动</span>
                        </div>
                        <div className="space-y-2 pl-1">
                          {archetype.coreActions.map((action, i) => (
                            <div key={i} className="flex gap-2 text-sm">
                              <span className="text-primary font-bold flex-shrink-0">{i + 1}.</span>
                              <span>{action}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 辅星建议 */}
                      <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                        {archetype.auxiliaryStars}
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        ) : (
          <LockedContent isLocked={true} requiredTier="订阅会员">
            <div className="space-y-3">
              {entries.slice(0, 2).map((archetype, idx) => (
                <Card key={archetype.star}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-amber-500">{idx + 1}.</span>
                      <Star className="h-4 w-4 text-amber-500" />
                      <span className="font-bold text-sm">{archetype.title}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {archetype.subtitle}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </LockedContent>
        )}
      </div>
    </div>
  );
};

export default WealthEncyclopedia;
