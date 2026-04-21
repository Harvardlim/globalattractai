import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { makeBeijingDate, parseYmd } from '@/lib/time/beijing';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowLeft, User, Calendar as CalendarIcon, Shirt, TrendingUp, ShieldCheck, ShieldAlert, Star, ChevronDown, Briefcase, Heart, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Solar } from 'lunar-javascript';
import { UserMenu } from '@/components/UserMenu';
import { useAuth } from '@/contexts/AuthContext';
import { useMemberPermissions } from '@/hooks/useMemberPermissions';
import { supabase } from '@/integrations/supabase/client';
import { getFourPillars, getTenGodsSingleLabel } from '@/lib/ganzhiHelper';
import { HEAVENLY_STEMS } from '@/lib/constants';
import { Gender } from '@/types';
import {
  getClothingRecommendation,
  getDailyClothingByElement,
  getCalendarDaYunInfo,
  getDayFavorability,
  analyzeBaziPattern,
  getTenGodLifeInterpretation,
  getElementFavorability,
} from '@/lib/calendarPersonalAnalysis';
import { STEM_ELEMENTS, ELEMENT_NAMES, FavorableGod, TiaohouInfo } from '@/lib/baziPatternAnalysis';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { useLanguage } from '@/hooks/useLanguage';
import { getCalendarTranslations } from '@/data/destinyTranslations';

const ELEMENT_COLORS: Record<string, string> = {
  '木': 'text-green-600', '火': 'text-red-500', '土': 'text-yellow-700',
  '金': 'text-amber-500', '水': 'text-blue-500',
};

const ELEMENT_BG: Record<string, string> = {
  '木': 'bg-green-500', '火': 'bg-red-500', '土': 'bg-yellow-600',
  '金': 'bg-amber-400', '水': 'bg-blue-500',
};

const STEM_ELEMENT_MAP: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
};

const BRANCH_ELEMENT_MAP: Record<string, string> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木',
  '辰': '土', '巳': '火', '午': '火', '未': '土',
  '申': '金', '酉': '金', '戌': '土', '亥': '水',
};

const TEN_GODS_NAMES: Record<string, string> = {
  '比': '比肩', '劫': '劫财', '食': '食神', '伤': '伤官',
  '才': '偏财', '财': '正财', '杀': '七杀', '官': '正官',
  '枭': '偏印', '印': '正印',
};

interface DayInfo {
  solar: { year: number; month: number; day: number };
  lunarDay: string;
  lunarMonth: string;
  isLeapMonth: boolean;
  ganZhi: string;
  dayGanIdx: number;
  jieQi: string;
  isCurrentMonth: boolean;
  isToday: boolean;
}

const getDayInfo = (year: number, month: number, day: number, currentMonth: number, today: { y: number; m: number; d: number }): DayInfo => {
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();
  const jieQi = lunar.getJieQi();
  const ganZhi = lunar.getDayInGanZhi();
  const gan = ganZhi[0];
  const dayGanIdx = HEAVENLY_STEMS.indexOf(gan);

  return {
    solar: { year, month, day },
    lunarDay: lunar.getDayInChinese(),
    lunarMonth: lunar.getMonthInChinese(),
    isLeapMonth: lunar.getMonth() < 0,
    ganZhi,
    dayGanIdx,
    jieQi: jieQi || '',
    isCurrentMonth: month === currentMonth,
    isToday: year === today.y && month === today.m && day === today.d,
  };
};

interface UserBirthData {
  birth_date: string;
  birth_hour: number | null;
  birth_minute: number | null;
  gender: string | null;
}

const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canAccess } = useMemberPermissions();
  const { currentLanguage } = useLanguage();
  const ct = getCalendarTranslations(currentLanguage);
  const canAccessPersonal = canAccess('personal_calendar');
  const now = new Date();
  const todayInfo = { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() };

  const [mode, setMode] = useState<'general' | 'personal'>('general');
  const [viewYear, setViewYear] = useState(todayInfo.y);
  const [viewMonth, setViewMonth] = useState(todayInfo.m);
  const [selectedDate, setSelectedDate] = useState<{ year: number; month: number; day: number }>({
    year: todayInfo.y, month: todayInfo.m, day: todayInfo.d,
  });
  const [birthData, setBirthData] = useState<UserBirthData | null>(null);
  const [birthDataLoading, setBirthDataLoading] = useState(false);
  const [expandedDaYunIdx, setExpandedDaYunIdx] = useState<number | null>(null);
  const [godsExpanded, setGodsExpanded] = useState(false);

  useEffect(() => {
    if (!user) return;
    setBirthDataLoading(true);
    supabase
      .from('profiles')
      .select('birth_date, birth_hour, birth_minute, gender')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.birth_date) setBirthData(data as UserBirthData);
        setBirthDataLoading(false);
      });
  }, [user]);

  // Use analyzeBaziPattern for strength (follows 八字排盘)
  const userAnalysis = useMemo(() => {
    if (!birthData?.birth_date) return null;
    const { year: y, month: m, day: d } = parseYmd(birthData.birth_date);
    const hour = birthData.birth_hour ?? 12;
    const minute = birthData.birth_minute ?? 0;
    const date = makeBeijingDate({ year: y, month: m, day: d, hour, minute });
    const pillars = getFourPillars(date);
    const baziResult = analyzeBaziPattern(pillars);
    const isFemale = birthData.gender === '女' || birthData.gender === 'female';
    const gender = isFemale ? Gender.FEMALE : Gender.MALE;

    return {
      pillars,
      dayMasterIdx: pillars.day.ganIdx,
      dayMasterGan: baziResult.dayMaster.stem,
      dayMasterElement: baziResult.dayMaster.element,
      strength: baziResult.dayMaster.strength,
      strengthAnalysis: baziResult.dayMaster.strengthAnalysis,
      favorableGods: baziResult.favorableGods,
      unfavorableGods: baziResult.unfavorableGods,
      wealthGods: baziResult.wealthGods,
      tiaohou: baziResult.tiaohou,
      gender,
      birthDate: date,
    };
  }, [birthData]);

  // Da Yun + Liu Nian info — follows the currently viewed year (viewYear)
  const daYunInfo = useMemo(() => {
    if (!userAnalysis) return null;
    return getCalendarDaYunInfo(
      userAnalysis.birthDate,
      userAnalysis.gender,
      userAnalysis.pillars,
      viewYear,
      userAnalysis.strength,
    );
  }, [userAnalysis, viewYear]);

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth - 1, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth - 1, 0).getDate();
    const days: DayInfo[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const m = viewMonth === 1 ? 12 : viewMonth - 1;
      const y = viewMonth === 1 ? viewYear - 1 : viewYear;
      days.push(getDayInfo(y, m, d, viewMonth, todayInfo));
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(getDayInfo(viewYear, viewMonth, d, viewMonth, todayInfo));
    }
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const m = viewMonth === 12 ? 1 : viewMonth + 1;
      const y = viewMonth === 12 ? viewYear + 1 : viewYear;
      days.push(getDayInfo(y, m, d, viewMonth, todayInfo));
    }
    return days;
  }, [viewYear, viewMonth, todayInfo.y, todayInfo.m, todayInfo.d]);

  const getDayTenGod = useCallback((dayGanIdx: number): string | null => {
    if (!userAnalysis) return null;
    return getTenGodsSingleLabel(userAnalysis.dayMasterIdx, dayGanIdx);
  }, [userAnalysis]);

  // Selected day detail
  const selectedDayDetail = useMemo(() => {
    const { year, month, day } = selectedDate;
    const solar = Solar.fromYmd(year, month, day);
    const lunar = solar.getLunar();
    const dayGanZhi = lunar.getDayInGanZhi();
    const dayGanIdx = HEAVENLY_STEMS.indexOf(dayGanZhi[0]);
    const tenGod = userAnalysis ? getTenGodsSingleLabel(userAnalysis.dayMasterIdx, dayGanIdx) : null;

    return {
      solarDate: `${year}年${month}月${day}日`,
      weekDay: ct.weekdays[new Date(year, month - 1, day).getDay()],
      lunarDate: `农历${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
      yearGanZhi: lunar.getYearInGanZhi(),
      monthGanZhi: lunar.getMonthInGanZhi(),
      dayGanZhi,
      dayGanIdx,
      zodiac: lunar.getYearShengXiao(),
      jieQi: lunar.getJieQi() || '',
      chong: lunar.getDayChongDesc(),
      sha: lunar.getDaySha(),
      pengZuGan: lunar.getPengZuGan(),
      pengZuZhi: lunar.getPengZuZhi(),
      yi: lunar.getDayYi() as string[],
      ji: lunar.getDayJi() as string[],
      naYin: lunar.getDayNaYin(),
      xingZuo: solar.getXingZuo(),
      tenGod,
    };
  }, [selectedDate, userAnalysis]);

  // Clothing recommendation — based on the selected day's stem element (both modes)
  const clothingRec = useMemo(() => {
    const dailyStemElement = STEM_ELEMENTS[selectedDayDetail.dayGanIdx];
    return getDailyClothingByElement(dailyStemElement);
  }, [selectedDayDetail.dayGanIdx]);

  const goToPrevMonth = useCallback(() => {
    if (viewMonth === 1) { setViewYear(v => v - 1); setViewMonth(12); }
    else setViewMonth(v => v - 1);
  }, [viewMonth]);

  const goToNextMonth = useCallback(() => {
    if (viewMonth === 12) { setViewYear(v => v + 1); setViewMonth(1); }
    else setViewMonth(v => v + 1);
  }, [viewMonth]);

  const goToToday = useCallback(() => {
    setViewYear(todayInfo.y);
    setViewMonth(todayInfo.m);
    setSelectedDate({ year: todayInfo.y, month: todayInfo.m, day: todayInfo.d });
  }, [todayInfo]);

  const years = useMemo(() => Array.from({ length: 201 }, (_, i) => 1920 + i), []);

  const isPersonal = mode === 'personal';
  const hasPersonalData = userAnalysis !== null;

  // Strength label
  const strengthLabel = userAnalysis
    ? userAnalysis.strength === 'strong' ? ct.bodyStrong
      : userAnalysis.strength === 'weak' ? ct.bodyWeak : ct.bodyNeutral
    : '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3 max-w-lg space-y-2">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="p-1">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold">{ct.title}</h1>
          </div>
          <Tabs value={mode} onValueChange={v => setMode(v as 'general' | 'personal')} className="w-full">
            <TabsList className={cn("w-full grid", canAccessPersonal ? "grid-cols-2" : "grid-cols-1")}>
              <TabsTrigger value="general" className="gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5" />
                {ct.generalTab}
              </TabsTrigger>
              {canAccessPersonal && (
                <TabsTrigger value="personal" className="gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  {ct.personalTab}
                </TabsTrigger>
              )}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="container mx-auto px-4 py-2 max-w-lg space-y-3">

        {/* Personal: user info banner */}
        {isPersonal && (
          <Card className="border-border/50">
            <CardContent className="p-3">
              {birthDataLoading ? (
                <div className="text-sm text-muted-foreground text-center py-1">{ct.loading}</div>
              ) : !hasPersonalData ? (
                <div className="text-center py-2">
                  <p className="text-sm text-muted-foreground mb-2">{ct.setupBirth}</p>
                  <Button size="sm" variant="outline" onClick={() => navigate('/settings')}>
                    {ct.goToSettings}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg",
                    ELEMENT_BG[STEM_ELEMENT_MAP[userAnalysis!.dayMasterGan] || '土']
                  )}>
                    {userAnalysis!.dayMasterGan}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {ct.dayMasterLabel}：{userAnalysis!.dayMasterGan}（{ELEMENT_NAMES[userAnalysis!.dayMasterElement]}）
                      </span>
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                        userAnalysis!.strength === 'strong'
                          ? "bg-primary/10 text-primary"
                          : userAnalysis!.strength === 'weak'
                            ? "bg-destructive/10 text-destructive"
                            : "bg-muted text-muted-foreground"
                      )}>
                        {strengthLabel}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {userAnalysis!.strengthAnalysis.strengthReason}
                    </div>

                    {/* Collapsible toggle for 喜忌用神 */}
                    <button
                      onClick={() => setGodsExpanded(!godsExpanded)}
                      className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ChevronDown className={cn("h-3 w-3 transition-transform", godsExpanded && "rotate-180")} />
                      <span>{ct.favorableDetails}</span>
                    </button>

                    {godsExpanded && (
                      <div className="mt-1 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                        {/* 喜用神 */}
                        <div className="flex items-start gap-1.5">
                          <span className="text-[10px] text-muted-foreground shrink-0 pt-0.5">{ct.favorableUse}</span>
                          <div className="flex flex-wrap gap-1">
                            <TooltipProvider>
                              {userAnalysis!.favorableGods.map((god, idx) => (
                                <Tooltip key={idx}>
                                  <TooltipTrigger asChild>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium cursor-help">
                                      {god.stem || ELEMENT_NAMES[god.element]}
                                      {god.priority <= 3 && <sup className="ml-0.5">{'①②③'[god.priority - 1]}</sup>}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-xs">
                                    <p className="text-xs font-medium mb-0.5">{ct.favorableNth} #{god.priority}</p>
                                    <p className="text-xs">{god.reason}</p>
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                            </TooltipProvider>
                          </div>
                        </div>

                        {/* 忌神 */}
                        <div className="flex items-start gap-1.5">
                          <span className="text-[10px] text-muted-foreground shrink-0 pt-0.5">{ct.unfavorableGod}</span>
                          <div className="flex flex-wrap gap-1">
                            <TooltipProvider>
                              {userAnalysis!.unfavorableGods.length > 0 ? userAnalysis!.unfavorableGods.map((god, idx) => (
                                <Tooltip key={idx}>
                                  <TooltipTrigger asChild>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-medium cursor-help">
                                      {god.stem || ELEMENT_NAMES[god.element]}
                                      {god.priority <= 3 && <sup className="ml-0.5">{'①②③'[god.priority - 1]}</sup>}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-xs">
                                    <p className="text-xs font-medium mb-0.5">{ct.unfavorableNth} #{god.priority}</p>
                                    <p className="text-xs">{god.reason}</p>
                                  </TooltipContent>
                                </Tooltip>
                              )) : (
                                <Badge variant="outline" className="text-[10px] h-auto py-0.5 border-primary/30 text-primary">
                                  {ct.useNeutral}
                                </Badge>
                              )}
                            </TooltipProvider>
                          </div>
                        </div>

                        {/* 财 */}
                        {userAnalysis!.wealthGods && userAnalysis!.wealthGods.length > 0 && (
                          <div className="flex items-start gap-1.5">
                            <span className="text-[10px] text-muted-foreground shrink-0 pt-0.5">{ct.wealthGod}</span>
                            <div className="flex flex-wrap gap-1">
                              <TooltipProvider>
                                {userAnalysis!.wealthGods.map((god, idx) => (
                                  <Tooltip key={idx}>
                                    <TooltipTrigger asChild>
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium cursor-help">
                                        {god.stem || ELEMENT_NAMES[god.element]}
                                        {god.tenGods && <span className="ml-0.5 opacity-70">({god.tenGods.join('/')})</span>}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-xs">
                                      <p className="text-xs font-medium mb-0.5">{ct.wealth}</p>
                                      <p className="text-xs">{god.reason}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                ))}
                              </TooltipProvider>
                            </div>
                          </div>
                        )}

                        {/* 调候用神 */}
                        {userAnalysis!.tiaohou && (
                          <div className={cn(
                            "rounded-md p-2 border",
                            userAnalysis!.strength === 'neutral'
                              ? "bg-primary/5 border-primary/20"
                              : "bg-muted/50 border-border/50"
                          )}>
                            <div className="flex items-center gap-1.5 mb-1">
                              <Star className="h-3 w-3 text-primary" />
                              <span className={cn(
                                "text-[10px] font-semibold",
                                userAnalysis!.strength === 'neutral' ? "text-primary" : "text-muted-foreground"
                              )}>
                                {userAnalysis!.strength === 'neutral' ? ct.tiaohouNeutral : ct.tiaohouRef}（{userAnalysis!.tiaohou.lunarMonthName}·{userAnalysis!.dayMasterGan}{ELEMENT_NAMES[userAnalysis!.dayMasterElement]}）
                              </span>
                            </div>
                            <p className={cn(
                              "text-[10px] mb-1",
                              userAnalysis!.strength === 'neutral' ? "text-primary" : "text-muted-foreground"
                            )}>{userAnalysis!.tiaohou.note}</p>
                            <div className="flex flex-wrap gap-1 mb-1">
                              <span className="text-[10px] text-muted-foreground">{ct.baziHas}</span>
                              {userAnalysis!.tiaohou.allStems.map((stem, idx) => {
                                const matched = userAnalysis!.tiaohou!.matchedStems.find(m => m.stem === stem);
                                return matched ? (
                                  <TooltipProvider key={idx}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="text-[10px] px-1 py-0.5 rounded bg-primary/15 text-primary font-bold cursor-help">
                                          ✓{stem}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent><p className="text-xs">{ct.useShenNth} #{matched.priority} · {ct.seenAt}{matched.location}</p></TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                ) : (
                                  <span key={idx} className="text-[10px] px-1 py-0.5 rounded bg-muted text-muted-foreground">{stem}</span>
                                );
                              })}
                            </div>
                            {userAnalysis!.tiaohou.matchedStems.length > 0 ? (
                              <p className="text-[10px] text-green-600 dark:text-green-400">
                                ✓ {ct.baziSeen}{userAnalysis!.tiaohou.matchedStems.map(m => m.stem).join('、')}
                                {userAnalysis!.strength === 'neutral' && userAnalysis!.tiaohou.matchedStems[0] && (
                                  <>，{userAnalysis!.tiaohou.matchedStems[0].stem}{ct.firstUseGod}
                                  {userAnalysis!.tiaohou.matchedStems.length > 1 ? `，${userAnalysis!.tiaohou.matchedStems[1].stem}${ct.secondUseGod}` : ''}</>
                                )}
                              </p>
                            ) : (
                              <p className="text-[10px] text-amber-600 dark:text-amber-400">
                                ⚠ {ct.baziNoTiaohou}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Personal: Da Yun + Liu Nian Banner */}
        {isPersonal && hasPersonalData && daYunInfo && (
          <Card className="border-border/50">
            <CardContent className="p-3 space-y-2.5">
              {/* Da Yun current + life interpretation */}
              {daYunInfo.currentDaYun && (
                <div className={cn(
                  "rounded-lg p-2.5 border",
                  daYunInfo.daYunFavorability === 'favorable'
                    ? "bg-green-500/5 border-green-500/20"
                    : daYunInfo.daYunFavorability === 'unfavorable'
                      ? "bg-destructive/5 border-destructive/20"
                      : "bg-muted/30 border-border/50"
                )}>
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium">{ct.daYun}</span>
                    <span className="text-[10px] text-muted-foreground">{ct.daYunAdvance}</span>
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full ml-auto",
                      daYunInfo.daYunFavorability === 'favorable'
                        ? "bg-green-500/10 text-green-700"
                        : daYunInfo.daYunFavorability === 'unfavorable'
                          ? "bg-destructive/10 text-destructive"
                          : "bg-muted text-muted-foreground"
                    )}>
                      {daYunInfo.daYunFavorability === 'favorable' ? ct.favorable : daYunInfo.daYunFavorability === 'unfavorable' ? ct.caution : ct.stable}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold">
                      <span className={ELEMENT_COLORS[STEM_ELEMENT_MAP[daYunInfo.currentDaYun.gan] || ''] || ''}>{daYunInfo.currentDaYun.gan}</span>
                      <span className={ELEMENT_COLORS[BRANCH_ELEMENT_MAP[daYunInfo.currentDaYun.zhi] || ''] || ''}>{daYunInfo.currentDaYun.zhi}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({daYunInfo.currentDaYun.year}{ct.yearStart})
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{daYunInfo.daYunHint}</p>
                  {/* Da Yun life interpretation */}
                  <div className="grid grid-cols-3 gap-1.5 mt-2">
                    <div className="bg-background/60 rounded-md p-1.5 text-center">
                      <div className="flex items-center justify-center gap-0.5 mb-0.5">
                        <Briefcase className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[9px] text-muted-foreground">{ct.career}</span>
                      </div>
                      <p className="text-[10px] leading-tight">{daYunInfo.daYunLife.career}</p>
                    </div>
                    <div className="bg-background/60 rounded-md p-1.5 text-center">
                      <div className="flex items-center justify-center gap-0.5 mb-0.5">
                        <Heart className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[9px] text-muted-foreground">{ct.relationship}</span>
                      </div>
                      <p className="text-[10px] leading-tight">{daYunInfo.daYunLife.relationship}</p>
                    </div>
                    <div className="bg-background/60 rounded-md p-1.5 text-center">
                      <div className="flex items-center justify-center gap-0.5 mb-0.5">
                        <Coins className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[9px] text-muted-foreground">{ct.wealthFortune}</span>
                      </div>
                      <p className="text-[10px] leading-tight">{daYunInfo.daYunLife.wealth}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Liu Nian current + life interpretation */}
              {daYunInfo.currentLiuNian && (
                <div className={cn(
                  "rounded-lg p-2.5 border",
                  daYunInfo.liuNianFavorability === 'favorable'
                    ? "bg-green-500/5 border-green-500/20"
                    : daYunInfo.liuNianFavorability === 'unfavorable'
                      ? "bg-destructive/5 border-destructive/20"
                      : "bg-muted/30 border-border/50"
                )}>
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium">{ct.liuNian} · {viewYear}</span>
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full ml-auto",
                      daYunInfo.liuNianFavorability === 'favorable'
                        ? "bg-green-500/10 text-green-700"
                        : daYunInfo.liuNianFavorability === 'unfavorable'
                          ? "bg-destructive/10 text-destructive"
                          : "bg-muted text-muted-foreground"
                    )}>
                      {daYunInfo.liuNianFavorability === 'favorable' ? ct.favorable : daYunInfo.liuNianFavorability === 'unfavorable' ? ct.caution : ct.stable}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold">
                      <span className={ELEMENT_COLORS[STEM_ELEMENT_MAP[daYunInfo.currentLiuNian.gan] || ''] || ''}>{daYunInfo.currentLiuNian.gan}</span>
                      <span className={ELEMENT_COLORS[BRANCH_ELEMENT_MAP[daYunInfo.currentLiuNian.zhi] || ''] || ''}>{daYunInfo.currentLiuNian.zhi}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {daYunInfo.currentLiuNian.age}{ct.age}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{daYunInfo.liuNianHint}</p>
                  {/* Liu Nian life interpretation */}
                  <div className="grid grid-cols-3 gap-1.5 mt-2">
                    <div className="bg-background/60 rounded-md p-1.5 text-center">
                      <div className="flex items-center justify-center gap-0.5 mb-0.5">
                        <Briefcase className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[9px] text-muted-foreground">{ct.career}</span>
                      </div>
                      <p className="text-[10px] leading-tight">{daYunInfo.liuNianLife.career}</p>
                    </div>
                    <div className="bg-background/60 rounded-md p-1.5 text-center">
                      <div className="flex items-center justify-center gap-0.5 mb-0.5">
                        <Heart className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[9px] text-muted-foreground">{ct.relationship}</span>
                      </div>
                      <p className="text-[10px] leading-tight">{daYunInfo.liuNianLife.relationship}</p>
                    </div>
                    <div className="bg-background/60 rounded-md p-1.5 text-center">
                      <div className="flex items-center justify-center gap-0.5 mb-0.5">
                        <Coins className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[9px] text-muted-foreground">{ct.wealthFortune}</span>
                      </div>
                      <p className="text-[10px] leading-tight">{daYunInfo.liuNianLife.wealth}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Expandable Da Yun Timeline */}
              <div className="space-y-1">
                <div className="text-[10px] text-muted-foreground font-medium px-1">{ct.daYunTimeline}</div>
                <div className="flex gap-1 overflow-x-auto pb-1">
                  {daYunInfo.allBigCycles.slice(1).map((cycle, i) => {
                    const isCurrent = daYunInfo.currentDaYun?.year === cycle.year;
                    const cycleGanIdx = HEAVENLY_STEMS.indexOf(cycle.gan);
                    const cycleElement = STEM_ELEMENTS[cycleGanIdx];
                    const dayElement = userAnalysis!.dayMasterElement;
                    const fav = getElementFavorability(cycleElement, dayElement, userAnalysis!.strength);
                    const isExpanded = expandedDaYunIdx === i;

                    return (
                      <div
                        key={i}
                        onClick={() => setExpandedDaYunIdx(isExpanded ? null : i)}
                        className={cn(
                          "flex flex-col items-center px-1.5 py-1 rounded text-[10px] min-w-[40px] border cursor-pointer hover:bg-muted/50 transition-colors",
                          isCurrent ? "border-primary bg-primary/10 font-bold" : "border-transparent",
                          isExpanded ? "border-primary/50 bg-primary/5" : "",
                          fav === 'favorable' ? "text-green-700" : fav === 'unfavorable' ? "text-destructive/80" : "text-muted-foreground"
                        )}>
                        <span><span>{cycle.gan}</span><span>{cycle.zhi}</span></span>
                        <span className="text-[9px]">{cycle.year}</span>
                        <ChevronDown className={cn("h-2.5 w-2.5 mt-0.5 transition-transform", isExpanded && "rotate-180")} />
                      </div>
                    );
                  })}
                </div>

                {/* Expanded Liu Nian list for selected Da Yun */}
                {expandedDaYunIdx !== null && (() => {
                  const expandedCycle = daYunInfo.allBigCycles[expandedDaYunIdx + 1]; // +1 because we sliced(1)
                  if (!expandedCycle) return null;
                  const nextCycle = daYunInfo.allBigCycles[expandedDaYunIdx + 2];
                  const effectiveStart = expandedDaYunIdx === 0 ? expandedCycle.year : expandedCycle.year - 2;
                  const effectiveEnd = nextCycle ? (expandedDaYunIdx + 1 === 0 ? nextCycle.year : nextCycle.year - 2) : expandedCycle.year + 10;
                  
                  const liuNianList = daYunInfo.allAnnualCycles.filter(
                    a => a.year >= effectiveStart && a.year < effectiveEnd
                  );

                  const expandedGanIdx = HEAVENLY_STEMS.indexOf(expandedCycle.gan);
                  const expandedLife = getTenGodLifeInterpretation(
                    getTenGodsSingleLabel(userAnalysis!.dayMasterIdx, expandedGanIdx),
                    userAnalysis!.strength
                  );

                  return (
                    <div className="rounded-lg border border-border/50 bg-muted/20 p-2.5 space-y-2">
                      {/* Da Yun header */}
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">
                          <span className={ELEMENT_COLORS[STEM_ELEMENT_MAP[expandedCycle.gan] || ''] || ''}>{expandedCycle.gan}</span>
                          <span className={ELEMENT_COLORS[BRANCH_ELEMENT_MAP[expandedCycle.zhi] || ''] || ''}>{expandedCycle.zhi}</span>
                          运
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {effectiveStart}–{effectiveEnd - 1}
                        </span>
                      </div>
                      {/* Da Yun life summary */}
                      <div className="grid grid-cols-3 gap-1.5">
                        <div className="bg-background/80 rounded-md p-1.5 text-center">
                          <Briefcase className="h-3 w-3 text-muted-foreground mx-auto mb-0.5" />
                          <p className="text-[10px] leading-tight">{expandedLife.career}</p>
                        </div>
                        <div className="bg-background/80 rounded-md p-1.5 text-center">
                          <Heart className="h-3 w-3 text-muted-foreground mx-auto mb-0.5" />
                          <p className="text-[10px] leading-tight">{expandedLife.relationship}</p>
                        </div>
                        <div className="bg-background/80 rounded-md p-1.5 text-center">
                          <Coins className="h-3 w-3 text-muted-foreground mx-auto mb-0.5" />
                          <p className="text-[10px] leading-tight">{expandedLife.wealth}</p>
                        </div>
                      </div>
                      {/* Liu Nian rows */}
                      <div className="space-y-1">
                        {liuNianList.map(ln => {
                          const lnGanIdx = HEAVENLY_STEMS.indexOf(ln.gan);
                          const lnTenGod = getTenGodsSingleLabel(userAnalysis!.dayMasterIdx, lnGanIdx);
                          const lnElement = STEM_ELEMENTS[lnGanIdx];
                          const lnFav = getElementFavorability(lnElement, userAnalysis!.dayMasterElement, userAnalysis!.strength);
                          const lnLife = getTenGodLifeInterpretation(lnTenGod, userAnalysis!.strength);
                          const isThisYear = ln.year === viewYear;

                          return (
                            <div
                              key={ln.year}
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewYear(ln.year);
                                setViewMonth(1);
                                setSelectedDate({ year: ln.year, month: 1, day: 1 });
                              }}
                              className={cn(
                                "rounded-md border p-2 cursor-pointer hover:bg-muted/30 transition-colors",
                                isThisYear ? "border-primary/40 bg-primary/5" : "border-border/30 bg-background/50",
                                lnFav === 'favorable' ? "border-l-2 border-l-green-500" : lnFav === 'unfavorable' ? "border-l-2 border-l-destructive" : ""
                              )}>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold">
                                  <span className={ELEMENT_COLORS[STEM_ELEMENT_MAP[ln.gan] || ''] || ''}>{ln.gan}</span>
                                  <span className={ELEMENT_COLORS[BRANCH_ELEMENT_MAP[ln.zhi] || ''] || ''}>{ln.zhi}</span>
                                </span>
                                <span className="text-[10px] text-muted-foreground">{ln.year} · {ln.age}{ct.age}</span>
                                <span className="text-[10px] text-muted-foreground">
                                  {TEN_GODS_NAMES[lnTenGod] || lnTenGod}
                                </span>
                                <span className={cn(
                                  "text-[9px] px-1 py-0 rounded-full ml-auto",
                                  lnFav === 'favorable' ? "bg-green-500/10 text-green-700"
                                    : lnFav === 'unfavorable' ? "bg-destructive/10 text-destructive"
                                    : "bg-muted text-muted-foreground"
                                )}>
                                  {lnFav === 'favorable' ? ct.lucky : lnFav === 'unfavorable' ? ct.cautious : ct.neutral}
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-1 text-[9px] text-muted-foreground">
                                <span>💼 {lnLife.career}</span>
                                <span>💕 {lnLife.relationship}</span>
                                <span>💰 {lnLife.wealth}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Year/Month Selector */}
        <div className="flex items-center justify-between gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToPrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Select value={viewYear.toString()} onValueChange={v => setViewYear(parseInt(v))}>
              <SelectTrigger className="h-8 w-[100px] text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {years.map(y => (
                  <SelectItem key={y} value={y.toString()} className="text-sm">{y}年</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={viewMonth.toString()} onValueChange={v => setViewMonth(parseInt(v))}>
              <SelectTrigger className="h-8 w-[75px] text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <SelectItem key={m} value={m.toString()} className="text-sm">{m}月</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={goToToday}>{ct.today}</Button>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <Card className="border-border/50">
          <CardContent className="p-2">
            <div className="grid grid-cols-7 mb-1">
              {ct.weekdays.map((d, i) => (
                <div key={d} className={cn(
                  "text-center text-xs font-medium py-1",
                  i === 0 || i === 6 ? "text-destructive/70" : "text-muted-foreground"
                )}>{d}</div>
              ))}
            </div>
            {/* Legend for personal mode */}
            {isPersonal && hasPersonalData && (
              <div className="flex items-center gap-3 mb-1.5 px-1">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500/40" />
                  <span className="text-[9px] text-muted-foreground">{ct.favorable}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-destructive/40" />
                  <span className="text-[9px] text-muted-foreground">{ct.caution}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted" />
                  <span className="text-[9px] text-muted-foreground">{ct.stable}</span>
                </div>
              </div>
            )}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, idx) => {
                const isWeekend = idx % 7 === 0 || idx % 7 === 6;
                const isSelected = day.solar.year === selectedDate.year &&
                  day.solar.month === selectedDate.month &&
                  day.solar.day === selectedDate.day;

                const tenGod = isPersonal && hasPersonalData ? getDayTenGod(day.dayGanIdx) : null;
                const dayFav = isPersonal && hasPersonalData && tenGod
                  ? getDayFavorability(tenGod, userAnalysis!.strength)
                  : null;

                let subText = day.lunarDay;
                if (isPersonal && tenGod) {
                  subText = TEN_GODS_NAMES[tenGod] || tenGod;
                } else {
                  if (day.jieQi) subText = day.jieQi;
                  else if (day.lunarDay === '初一') subText = `${day.lunarMonth}月`;
                }

                // Background highlight for favorable/unfavorable days in personal mode
                const dayBgClass = isPersonal && dayFav && day.isCurrentMonth && !isSelected
                  ? dayFav === 'good' ? 'bg-green-500/8'
                    : dayFav === 'caution' ? 'bg-destructive/6'
                    : ''
                  : '';

                const tenGodColorClass = isPersonal && dayFav && !isSelected
                  ? dayFav === 'good' ? 'text-green-600 font-medium'
                    : dayFav === 'caution' ? 'text-destructive/80 font-medium'
                    : 'text-muted-foreground'
                  : '';

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDate(day.solar)}
                    className={cn(
                      "flex flex-col items-center justify-center py-1.5 cursor-pointer rounded-lg transition-colors",
                      !day.isCurrentMonth && "opacity-30",
                      dayBgClass,
                      day.isToday && !isSelected && "ring-1 ring-primary/40",
                      isSelected && "bg-primary text-primary-foreground",
                      !isSelected && "hover:bg-muted/50"
                    )}
                  >
                    <span className={cn(
                      "text-sm font-medium leading-tight",
                      isWeekend && !isSelected && day.isCurrentMonth && "text-destructive/80"
                    )}>
                      {day.solar.day}
                    </span>
                    <span className={cn(
                      "text-[10px] leading-tight mt-0.5",
                      isSelected ? "text-primary-foreground/80"
                        : isPersonal && tenGodColorClass ? tenGodColorClass
                        : day.jieQi && !isPersonal ? "text-primary font-medium"
                        : "text-muted-foreground"
                    )}>
                      {subText}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Day Detail */}
        <Card className="border-border/50">
          <CardContent className="p-4 space-y-3">

            {/* GanZhi row */}
            <div className="flex gap-3 text-sm">
              {[
                { label: '年', value: selectedDayDetail.yearGanZhi },
                { label: '月', value: selectedDayDetail.monthGanZhi },
                { label: '日', value: selectedDayDetail.dayGanZhi },
              ].map(item => {
                const gan = item.value[0];
                const zhi = item.value[1];
                return (
                  <div key={item.label} className="flex items-center gap-1">
                    <span className="text-muted-foreground">{item.label}:</span>
                    <span className="font-medium">
                      <span className={ELEMENT_COLORS[STEM_ELEMENT_MAP[gan] || '']}>{gan}</span>
                      <span className={ELEMENT_COLORS[BRANCH_ELEMENT_MAP[zhi] || '']}>{zhi}</span>
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Date header */}
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-bold">{selectedDate.day}</span>
                <span className="text-sm text-muted-foreground ml-2">
                  星期{selectedDayDetail.weekDay}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{selectedDayDetail.lunarDate}</div>
                <div className="text-xs text-muted-foreground">
                  {selectedDayDetail.yearGanZhi}年 【{selectedDayDetail.zodiac}】 {selectedDayDetail.xingZuo}座
                </div>
              </div>
            </div>

            {/* Personal: Ten God analysis */}
            {isPersonal && hasPersonalData && selectedDayDetail.tenGod && (() => {
              const dayFav = getDayFavorability(selectedDayDetail.tenGod!, userAnalysis!.strength);
              return (
                <Card className={cn(
                  "border",
                  dayFav === 'good'
                    ? "bg-green-500/5 border-green-500/20"
                    : dayFav === 'caution'
                      ? "bg-destructive/5 border-destructive/20"
                      : "bg-muted/30 border-border/50"
                )}>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold",
                        ELEMENT_BG[STEM_ELEMENT_MAP[HEAVENLY_STEMS[selectedDayDetail.dayGanIdx]] || '土']
                      )}>
                        {HEAVENLY_STEMS[selectedDayDetail.dayGanIdx]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {ct.todayTenGod}{TEN_GODS_NAMES[selectedDayDetail.tenGod!] || selectedDayDetail.tenGod}
                          </span>
                          <span className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded-full",
                            dayFav === 'good'
                              ? "bg-green-500/10 text-green-700"
                              : dayFav === 'caution'
                                ? "bg-destructive/10 text-destructive"
                                : "bg-muted text-muted-foreground"
                          )}>
                            {dayFav === 'good' ? ct.lucky : dayFav === 'caution' ? ct.cautious : ct.neutral}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {strengthLabel}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {userAnalysis!.dayMasterGan}{ct.dayMasterLabel}（{strengthLabel}）→ {
                            dayFav === 'good' ? ct.dayFavorable
                              : dayFav === 'caution' ? ct.dayCaution
                              : ct.dayStable
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}

            {/* Clothing Recommendation — both modes */}
            {clothingRec && (
              <Card className="border-border/50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Shirt className="h-3.5 w-3.5 text-muted-foreground" />
                     <span className="text-xs font-medium">
                      {selectedDate.month}/{selectedDate.day} {ct.clothingTitle}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      （{ELEMENT_NAMES[STEM_ELEMENTS[selectedDayDetail.dayGanIdx]]}日）
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="h-3 w-3 text-green-600" />
                      <span className="text-[10px] font-medium text-green-700">{ct.recommendedColors}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {clothingRec.recommended.map((rec, i) => (
                        <div key={i} className="flex items-center gap-1.5 bg-green-500/5 border border-green-500/20 rounded-lg px-2 py-1">
                          <div className="flex gap-0.5">
                            {rec.hex.slice(0, 3).map((hex, j) => (
                              <div key={j} className="w-3.5 h-3.5 rounded-full border border-border/50" style={{ backgroundColor: hex }} />
                            ))}
                          </div>
                          <div>
                            <div className="text-[10px] font-medium">{rec.colors.join('/')}</div>
                            <div className="text-[9px] text-muted-foreground">{rec.reason}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* 不宜 (first 2 items) */}
                  <div className="space-y-1.5 mt-2">
                    <div className="flex items-center gap-1.5">
                      <ShieldAlert className="h-3 w-3 text-amber-500" />
                      <span className="text-[10px] font-medium text-amber-600">{ct.avoidColors}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {clothingRec.avoid.filter(a => a.reason.startsWith('不宜')).map((av, i) => (
                        <div key={i} className="flex items-center gap-1.5 bg-amber-500/5 border border-amber-500/20 rounded-lg px-2 py-1">
                          <div className="flex gap-0.5">
                            {av.hex.slice(0, 3).map((hex, j) => (
                              <div key={j} className="w-3.5 h-3.5 rounded-full border border-border/50" style={{ backgroundColor: hex }} />
                            ))}
                          </div>
                          <div>
                            <div className="text-[10px] font-medium">{av.colors.join('/')}</div>
                            <div className="text-[9px] text-muted-foreground">{av.reason}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* 忌 (last item) */}
                  <div className="space-y-1.5 mt-2">
                    <div className="flex items-center gap-1.5">
                      <ShieldAlert className="h-3 w-3 text-destructive/70" />
                      <span className="text-[10px] font-medium text-destructive/80">{ct.forbiddenColors}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {clothingRec.avoid.filter(a => a.reason.startsWith('忌')).map((av, i) => (
                        <div key={i} className="flex items-center gap-1.5 bg-destructive/5 border border-destructive/20 rounded-lg px-2 py-1">
                          <div className="flex gap-0.5">
                            {av.hex.slice(0, 3).map((hex, j) => (
                              <div key={j} className="w-3.5 h-3.5 rounded-full border border-border/50" style={{ backgroundColor: hex }} />
                            ))}
                          </div>
                          <div>
                            <div className="text-[10px] font-medium">{av.colors.join('/')}</div>
                            <div className="text-[9px] text-muted-foreground">{av.reason}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* JieQi */}
            {selectedDayDetail.jieQi && (
              <div className="flex items-center gap-2">
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                  {ct.jieQiLabel}{selectedDayDetail.jieQi}
                </span>
              </div>
            )}

            {/* NaYin + Chong Sha */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-muted/50 rounded-lg p-2">
                <span className="text-muted-foreground">{ct.naYinLabel}</span>
                <span className="font-medium">{selectedDayDetail.naYin}</span>
              </div>
              <div className="bg-muted/50 rounded-lg p-2">
                 <span className="text-muted-foreground">{ct.chongShaLabel}</span>
                 <span className="font-medium">{selectedDayDetail.chong} {ct.sha}{selectedDayDetail.sha}</span>
              </div>
            </div>

            {/* PengZu */}
            <div className="text-xs bg-muted/50 rounded-lg p-2">
              <span className="text-muted-foreground">{ct.pengZuLabel}</span>
              <span>{selectedDayDetail.pengZuGan} {selectedDayDetail.pengZuZhi}</span>
            </div>

            {/* Yi Ji */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-2">
                <div className="text-xs font-medium text-green-700 mb-1">{ct.yi}</div>
                <div className="flex flex-wrap gap-1">
                  {selectedDayDetail.yi.slice(0, 12).map((item, i) => (
                    <span key={i} className="text-[10px] bg-green-500/10 text-green-700 px-1.5 py-0.5 rounded">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-2">
                <div className="text-xs font-medium text-destructive mb-1">{ct.ji}</div>
                <div className="flex flex-wrap gap-1">
                  {selectedDayDetail.ji.slice(0, 12).map((item, i) => (
                    <span key={i} className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarPage;
