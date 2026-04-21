import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Zap, Clock, Star, MessageCircle, Table2, BookOpen, Lock, Crown, Compass, Layers, AlertTriangle, Users, Shirt, TrendingUp, ShoppingBag, CalendarDays, 
  Grid3X3, Store, BarChart3, Clipboard, Globe, Shield, Dice1, Triangle, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { UserMenu } from "@/components/UserMenu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useMemberPermissions, Feature } from "@/hooks/useMemberPermissions";
import { useFeaturePackages } from "@/hooks/useFeaturePackages";
import { getFourPillars } from "@/lib/ganzhiHelper";
import { getBeijingParts } from "@/lib/time/beijing";
import { Solar } from "lunar-javascript";
import { cn } from "@/lib/utils";

import { useLanguage } from "@/hooks/useLanguage";
import { getDashboardTranslations } from "@/data/dashboardTranslations";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BottomNavBar } from "@/components/BottomNavBar";


// 五行配色
const ELEMENT_COLORS: Record<string, string> = {
  '木': 'bg-green-500',
  '火': 'bg-red-500',
  '土': 'bg-yellow-600',
  '金': 'bg-amber-300',
  '水': 'bg-blue-500',
};

const STEM_ELEMENTS: Record<string, string> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
};

const BRANCH_ELEMENTS: Record<string, string> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木',
  '辰': '土', '巳': '火', '午': '火', '未': '土',
  '申': '金', '酉': '金', '戌': '土', '亥': '水',
};

// 五行相生：木→火→土→金→水→木
const ELEMENT_GENERATES: Record<string, string> = {
  '木': '火', '火': '土', '土': '金', '金': '水', '水': '木',
};

const ELEMENT_CLOTHING_COLORS: Record<string, { bgClass: string }> = {
  '木': { bgClass: 'bg-green-500' },
  '火': { bgClass: 'bg-red-500' },
  '土': { bgClass: 'bg-yellow-600' },
  '金': { bgClass: 'bg-amber-300' },
  '水': { bgClass: 'bg-blue-500' },
};

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  locked?: boolean;
  requiredTier?: string;
  comingSoon?: boolean;
  comingSoonLabel?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, onClick, locked, requiredTier, comingSoon, comingSoonLabel }) => (
  <Card
    className={cn(
      "transition-all duration-200 border-border/50",
      comingSoon ? "opacity-50 cursor-not-allowed" : locked ? "opacity-60 cursor-pointer" : "cursor-pointer hover:bg-muted/50"
    )}
    onClick={comingSoon ? undefined : onClick}
  >
    <CardContent className="p-3 flex flex-col items-center text-center gap-2">
      <div className={cn(
        "w-11 h-11 rounded-full flex items-center justify-center shrink-0",
        comingSoon ? "bg-muted text-muted-foreground" : locked ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
      )}>
        {locked && !comingSoon ? <Lock className="w-5 h-5" /> : icon}
      </div>
      <div className="min-w-0">
        <div className="flex items-center justify-center gap-1">
          <h3 className="font-semibold text-sm">{title}</h3>
        </div>
          {locked && !comingSoon && requiredTier && (
            <Badge variant="outline" className="text-[9px] px-1 py-0 gap-0.5 border-amber-500/50 text-amber-600">
              <Crown className="h-2.5 w-2.5" />
              {requiredTier}
            </Badge>
          )}
          {comingSoon && (
            <Badge variant="outline" className="text-[9px] px-1 py-0 gap-0.5 border-muted-foreground/50 text-muted-foreground">
              {comingSoonLabel || '即将上线'}
            </Badge>
          )}
        {!(comingSoon) && !(locked && !comingSoon && requiredTier) && (
          <p className="text-xs text-muted-foreground line-clamp-1">{description}</p>
        )}
      </div>
    </CardContent>
  </Card>
);

interface PillarDisplayProps {
  label: string;
  gan: string;
  zhi: string;
}

const PillarDisplay: React.FC<PillarDisplayProps> = ({ label, gan, zhi }) => {
  const ganElement = STEM_ELEMENTS[gan] || '土';
  const zhiElement = BRANCH_ELEMENTS[zhi] || '土';
  
  return (
    <div className="flex flex-col items-center">
      <span className="text-xs text-muted-foreground mb-1">{label}</span>
      <div className="flex flex-col gap-1">
        <div className={`w-9 h-9 rounded-lg ${ELEMENT_COLORS[ganElement]} flex items-center justify-center text-white font-bold text-lg shadow-sm`}>
          {gan}
        </div>
        <div className={`w-9 h-9 rounded-lg ${ELEMENT_COLORS[zhiElement]} flex items-center justify-center text-white font-bold text-lg shadow-sm`}>
          {zhi}
        </div>
      </div>
    </div>
  );
};

const LANG_LABELS = { zh: '中文', en: 'EN', ms: 'BM' } as const;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, isAdmin, isSuperAdmin, isOwner } = useAuth();
  const { canAccess, getRequiredTier, getTierLabel } = useMemberPermissions();
  const { hasFeature, isPackageGated } = useFeaturePackages();
  
  const { currentLanguage, setLanguage } = useLanguage();
  const t = getDashboardTranslations(currentLanguage);

  const todayPillars = useMemo(() => {
    const now = new Date();
    return getFourPillars(now);
  }, []);

  const { beijingTimeDisplay, lunarDateDisplay } = useMemo(() => {
    const parts = getBeijingParts(new Date());
    const timeStr = `${parts.year}年${parts.month}月${parts.day}日 ${parts.hour.toString().padStart(2, '0')}:${parts.minute.toString().padStart(2, '0')}`;
    
    const solar = Solar.fromYmd(parts.year, parts.month, parts.day);
    const lunar = solar.getLunar();
    const lunarStr = `${t.lunarPrefix}${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;
    
    return { beijingTimeDisplay: timeStr, lunarDateDisplay: lunarStr };
  }, [t]);

  const todayClothing = useMemo(() => {
    const dayElement = STEM_ELEMENTS[todayPillars.day.gan];
    const generatedElement = ELEMENT_GENERATES[dayElement];
    const clothing = ELEMENT_CLOTHING_COLORS[generatedElement];
    const elementColors = t.elementColors[generatedElement as keyof typeof t.elementColors];
    return { dayElement, generatedElement, ...clothing, colors: elementColors?.colors || [], colorDesc: elementColors?.desc || '' };
  }, [todayPillars, t]);

  const displayName = profile?.display_name || t.user;

  const adminFetures: (FeatureCardProps & { feature?: Feature; whitelistKey?: string })[] = [
    ...(isAdmin ? [
      {
        title: t.adminDashboard,
        description: t.adminDashboardDesc,
        icon: <BarChart3 className="w-6 h-6" />,
        onClick: () => navigate("/admin"),
      },
      {
        title: '会员管理',
        description: '管理会员',
        icon: <Crown className="w-6 h-6" />,
        onClick: () => navigate("/admin/members"),
      },
    ] : []),
    ...(isSuperAdmin ? [
      {
        title: '平台管理',
        description: '管理来源',
        icon: <Globe className="w-6 h-6" />,
        onClick: () => navigate("/admin/platforms"),
      },
            {
        title: '推广管理',
        description: '推广',
        icon: <Globe className="w-6 h-6" />,
        onClick: () => navigate("/admin/referrals"),
      },
    ] : []),
  ];

  const mainFeatures: (FeatureCardProps & { feature?: Feature; whitelistKey?: string })[] = [
    {
      title: t.records,
      description: t.recordsDesc,
      icon: <UserPlus className="w-6 h-6" />,
      onClick: () => navigate("/clients"),
      feature: 'clients',
    },
    {
      title: t.digitalEnergy,
      description: t.digitalEnergyDesc,
      icon: <Zap className="w-6 h-6" />,
      onClick: () => navigate("/energy"),
      feature: 'energy',
    },
    {
      title: t.realtimeChart,
      description: t.realtimeChartDesc,
      icon: <Clock className="w-6 h-6" />,
      onClick: () => navigate("/realtime"),
      feature: 'realtime',
    },
    {
      title: t.destinyChart,
      description: t.destinyChartDesc,
      icon: <Star className="w-6 h-6" />,
      onClick: () => navigate("/clients?selectMode=destiny"),
      feature: 'destiny',
    },
    {
      title: t.synastry,
      description: t.synastryDesc,
      icon: <Users className="w-6 h-6" />,
      onClick: () => canAccess('synastry') ? navigate("/synastry") : navigate("/pricing"),
      feature: 'synastry' as Feature,
      whitelistKey: 'synastry',
    },
    {
      title: t.aiChat,
      description: t.aiChatDesc,
      icon: <MessageCircle className="w-6 h-6" />,
      onClick: () => canAccess('ai_chat') ? navigate("/chat") : navigate("/pricing"),
      feature: 'ai_chat',
      whitelistKey: 'ai_chat',
    },
    // {
    //   title: t.store,
    //   description: t.storeDesc,
    //   icon: <Store className="w-6 h-6" />,
    //   onClick: () => navigate("/store"),
    //   whitelistKey: 'store',
    // },
    {
      title: t.calendar,
      description: t.calendarDesc,
      icon: <CalendarDays className="w-6 h-6" />,
      onClick: () => navigate("/calendar"),
    },
    {
      title: t.flyingStars,
      description: t.flyingStarsDesc,
      icon: <Grid3X3 className="w-6 h-6" />,
      onClick: () => canAccess('flying_stars') ? navigate("/flying-stars") : navigate("/pricing"),
      feature: 'flying_stars' as Feature,
      whitelistKey: 'flying_stars',
    },
    // {
    //   title: t.myOrders,
    //   description: t.myOrdersDesc,
    //   icon: <Clipboard className="w-6 h-6"/>,
    //   onClick: () => navigate("/orders"),
    //   whitelistKey: 'my_orders',
    // },
    {
      title: '小六壬',
      description: '快速占卜',
      icon: <Dice1 className="w-6 h-6" />,
      onClick: () => canAccess('xiao_liu_ren') ? navigate("/xiao-liu-ren") : navigate("/pricing"),
      feature: 'xiao_liu_ren' as Feature,
      whitelistKey: 'xiao_liu_ren',
    },
    {
      title: currentLanguage === 'zh' ? '数字学' : currentLanguage === 'en' ? 'Numerology' : 'Numerologi',
      description: currentLanguage === 'zh' ? '金字塔数字学' : currentLanguage === 'en' ? 'Pyramid Numerology' : 'Numerologi Piramid',
      icon: <Triangle className="w-6 h-6" />,
      onClick: () => navigate("/numerology"),
      feature: 'numerology' as Feature,
      whitelistKey: 'numerology',
    },
    ...(hasFeature('sales_chart') ? [{
      title: '销售排盘',
      description: '奇门八字分析',
      icon: <TrendingUp className="w-6 h-6" />,
      onClick: () => navigate("/sales-chart"),
      whitelistKey: 'sales_chart',
    }] : []),
    ...(hasFeature('real_estate') ? [{
      title: '查单位',
      description: '门牌号吉星分析',
      icon: <Building2 className="w-6 h-6" />,
      onClick: () => navigate("/unit-check"),
      whitelistKey: 'real_estate',
    }] : []),
  ];

  const bookFeatures: (FeatureCardProps & { feature?: Feature; whitelistKey?: string })[] = [
    {
      title: t.branchRelations,
      description: t.branchRelationsDesc,
      icon: <Table2 className="w-6 h-6" />,
      onClick: () => canAccess('branch_relations') ? navigate("/branch-relations") : navigate("/pricing"),
      feature: 'branch_relations',
    },
    {
      title: t.baziEncyclopedia,
      description: t.baziEncyclopediaDesc,
      icon: <BookOpen className="w-6 h-6" />,
      onClick: () => canAccess('bazi_encyclopedia') ? navigate("/bazi-encyclopedia") : navigate("/pricing"),
      feature: 'bazi_encyclopedia',
      whitelistKey: 'bazi_encyclopedia',
    },
    {
      title: t.energyEncyclopedia,
      description: t.energyEncyclopediaDesc,
      icon: <Zap className="w-6 h-6" />,
      onClick: () => canAccess('energy_encyclopedia') ? navigate("/energy-encyclopedia") : navigate("/pricing"),
      feature: 'energy_encyclopedia',
      whitelistKey: 'energy_encyclopedia',
    },
    {
      title: t.qimenEncyclopedia,
      description: t.qimenEncyclopediaDesc,
      icon: <Compass className="w-6 h-6" />,
      onClick: () => canAccess('qimen_encyclopedia') ? navigate("/qimen-encyclopedia") : navigate("/pricing"),
      feature: 'qimen_encyclopedia',
      whitelistKey: 'qimen_encyclopedia',
    },
    {
      title: t.liuyaoEncyclopedia,
      description: t.liuyaoEncyclopediaDesc,
      icon: <Layers className="w-6 h-6" />,
      onClick: () => canAccess('liuyao_encyclopedia') ? navigate("/liuyao-encyclopedia") : navigate("/pricing"),
      feature: 'liuyao_encyclopedia',
      whitelistKey: 'liuyao_encyclopedia',
    },
    {
      title: t.sihaiEncyclopedia,
      description: t.sihaiEncyclopediaDesc,
      icon: <AlertTriangle className="w-6 h-6" />,
      onClick: () => canAccess('sihai_encyclopedia') ? navigate("/sihai-encyclopedia") : navigate("/pricing"),
      feature: 'sihai_encyclopedia',
      whitelistKey: 'sihai_encyclopedia',
    },
    {
      title: t.wealthEncyclopedia,
      description: t.wealthEncyclopediaDesc,
      icon: <TrendingUp className="w-6 h-6" />,
      onClick: () => canAccess('destiny_full') ? navigate("/wealth-encyclopedia") : navigate("/pricing"),
      feature: 'destiny_full',
      whitelistKey: 'wealth_encyclopedia',
    },
    {
      title: t.spendingEncyclopedia,
      description: t.spendingEncyclopediaDesc,
      icon: <ShoppingBag className="w-6 h-6" />,
      onClick: () => canAccess('destiny_full') ? navigate("/spending-encyclopedia") : navigate("/pricing"),
      feature: 'destiny_full',
      whitelistKey: 'spending_encyclopedia',
    },
    {
      title: t.speechEncyclopedia,
      description: t.speechEncyclopediaDesc,
      icon: <MessageCircle className="w-6 h-6" />,
      onClick: () => canAccess('destiny_full') ? navigate("/speech-encyclopedia") : navigate("/pricing"),
      feature: 'destiny_full',
      whitelistKey: 'speech_encyclopedia',
    },
  ];

  const addPermissions = (features: (FeatureCardProps & { feature?: Feature; whitelistKey?: string })[]) => 
    features
      .map(f => {
        // Check feature package gating
        const controlKey = f.whitelistKey || f.feature;
        if (controlKey && isPackageGated(controlKey) && !hasFeature(controlKey)) {
          return null; // Hide features user doesn't have package for
        }

        if (!f.feature) return { ...f, locked: false };
        const hasAccess = canAccess(f.feature);
        const required = getRequiredTier(f.feature);
        return {
          ...f,
          locked: !hasAccess,
          requiredTier: !hasAccess ? getTierLabel(required) : undefined,
        };
      })
      .filter(Boolean) as (FeatureCardProps & { feature?: Feature; whitelistKey?: string })[];

  const mainFeaturesWithPermissions = addPermissions(mainFeatures);
  const bookFeaturesWithPermissions = addPermissions(bookFeatures);
  

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-b from-primary/5 to-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 max-w-lg">
          <div className="flex items-center justify-between">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    {LANG_LABELS[currentLanguage]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => setLanguage('zh')}>中文</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('en')}>English</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('ms')}>Bahasa Melayu</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            <div className="flex items-center gap-2" />
              <UserMenu />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 max-w-lg">

        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            {t.greeting}，{displayName} 
          </h1>
        </div>

        {/* Daily Four Pillars Card */}
        <Card className="mb-6 border-border/50 overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-3 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">{t.todayFourPillars}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground block">{beijingTimeDisplay}</span>
                <span className="text-xs text-muted-foreground/70">{lunarDateDisplay}</span>
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="flex justify-center gap-6">
              <PillarDisplay label={t.yearPillar} gan={todayPillars.year.gan} zhi={todayPillars.year.zhi} />
              <PillarDisplay label={t.monthPillar} gan={todayPillars.month.gan} zhi={todayPillars.month.zhi} />
              <PillarDisplay label={t.dayPillar} gan={todayPillars.day.gan} zhi={todayPillars.day.zhi} />
              <PillarDisplay label={t.hourPillar} gan={todayPillars.hour.gan} zhi={todayPillars.hour.zhi} />
            </div>
            {/* Clothing advice */}
            <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full ${todayClothing.bgClass} flex items-center justify-center shrink-0`}>
                <Shirt className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">
                  {t.todayClothing} · {t.dayPillarLabel}{todayPillars.day.gan}（{todayClothing.dayElement}）{t.generates}{todayClothing.generatedElement}
                </p>
                <p className="text-sm font-medium">
                  {t.suitableWear} <span className="text-primary">{todayClothing.colors.join('、')}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Admin Section */}
        {isAdmin && 
          <div>
            <div className="mb-4">
              <h2 className="text-sm font-medium text-muted-foreground mb-3">{t.adminSection}</h2>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {adminFetures.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </div>
          </div>
        }

        {/* Features Section */}
        <div className="mb-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">{t.featuresSection}</h2>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {mainFeaturesWithPermissions.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>

        {/* Books Section */}
        <div className="mb-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">{t.booksSection}</h2>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-24">
          {bookFeaturesWithPermissions.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>

      <BottomNavBar/>
      </div>
    </div>
  );
};

export default Home;
