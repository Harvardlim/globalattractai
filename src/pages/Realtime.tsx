import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ArrowLeft, Check, History, MessageSquare, Crown, Sparkles, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import ChartGrid from "@/components/ChartGrid";
import AIChatDrawer from "@/components/AIChatDrawer";
import FourPillarsDisplay from "@/components/FourPillarsDisplay";
import LiuYaoDisplay from "@/components/LiuYaoDisplay";
import { generateChart } from "@/lib/qimenEngine";
import { getLunarDate } from "@/lib/lunar";
import { makeBeijingDate, getBeijingParts } from "@/lib/time/beijing";
import { ChartType, Gender } from "@/types";
import { HOUR_OPTIONS } from "@/types/database";
import { checkTimingPatterns, TimingPatternResult } from "@/lib/qimenTimingPatterns";

// Helper: Convert hour (0-23) to corresponding HOUR_OPTIONS value
const hourToShichenValue = (hour: number): number => {
  // Find the shichen that contains this hour
  // 早子时: 0, 丑时: 1-2, 寅时: 3-4, 卯时: 5-6, 辰时: 7-8, 巳时: 9-10
  // 午时: 11-12, 未时: 13-14, 申时: 15-16, 酉时: 17-18, 戌时: 19-20, 亥时: 21-22, 晚子时: 23
  if (hour === 0) return 0; // 早子时
  if (hour === 23) return 23; // 晚子时
  // For hours 1-22, find the odd hour that starts the shichen
  // 1-2 -> 1, 3-4 -> 3, 5-6 -> 5, etc.
  return hour % 2 === 1 ? hour : hour - 1;
};
import { useRealtimeConsultations, Message } from "@/hooks/useRealtimeConsultations";
import { useMemberPermissions } from "@/hooks/useMemberPermissions";
import { useToast } from "@/hooks/use-toast";

const LUNAR_MONTHS = ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "冬", "腊"];
const LUNAR_DAYS = [
  "初一",
  "初二",
  "初三",
  "初四",
  "初五",
  "初六",
  "初七",
  "初八",
  "初九",
  "初十",
  "十一",
  "十二",
  "十三",
  "十四",
  "十五",
  "十六",
  "十七",
  "十八",
  "十九",
  "二十",
  "廿一",
  "廿二",
  "廿三",
  "廿四",
  "廿五",
  "廿六",
  "廿七",
  "廿八",
  "廿九",
  "三十",
];

const Realtime: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { canAccess } = useMemberPermissions();
  
  const canUseAI = canAccess('ai_assistant');
  const canViewHistory = canAccess('destiny_full'); // VIP or VIP+ only

  const { saveConsultation, saveMessage, loadConsultation } = useRealtimeConsultations();

  // Realtime chart controls - use Beijing time for initialization
  const [realtimeDate, setRealtimeDate] = useState<Date>(() => new Date());
  // 存储实际小时值 (0-23)，使用北京时间初始化
  const [realtimeHour, setRealtimeHour] = useState<number>(() => {
    const beijingHour = getBeijingParts(new Date()).hour;
    return hourToShichenValue(beijingHour);
  });
  const [dateDrawerOpen, setDateDrawerOpen] = useState(false);
  const [hourDrawerOpen, setHourDrawerOpen] = useState(false);

  // Event chart state
  const [issue, setIssue] = useState("");
  const [currentConsultationId, setCurrentConsultationId] = useState<string | null>(null);
  const [loadedMessages, setLoadedMessages] = useState<Message[]>([]);
  const [chartGenerated, setChartGenerated] = useState(false);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);

  // Compute chart date - realtimeHour 现在是实际小时值 (0-23)
  const chartDate = useMemo(() => {
    const baseY = realtimeDate.getFullYear();
    const baseM = realtimeDate.getMonth() + 1;
    const baseD = realtimeDate.getDate();
    return makeBeijingDate({
      year: baseY,
      month: baseM,
      day: baseD,
      hour: realtimeHour,
      minute: 0,
    });
  }, [realtimeDate, realtimeHour]);

  // Generate chart
  const chart = useMemo(() => {
    if (!chartDate) return null;
    return generateChart(chartDate, ChartType.REALTIME, "实时盘", Gender.MALE);
  }, [chartDate]);

  // Lunar date
  const lunar = useMemo(() => {
    if (!chartDate) return null;
    return getLunarDate(chartDate);
  }, [chartDate]);

  // Timing patterns detection (天显时格 / 五不遇时)
  const timingPatterns = useMemo((): TimingPatternResult | null => {
    if (!chart?.pillars) return null;
    return checkTimingPatterns(chart.pillars);
  }, [chart?.pillars]);

  // Load consultation from URL param
  useEffect(() => {
    const consultationId = searchParams.get("consultationId");
    if (consultationId && consultationId !== currentConsultationId) {
      loadConsultation(consultationId).then((result) => {
        if (result) {
          setCurrentConsultationId(consultationId);
          setLoadedMessages(result.messages);
          setIssue(result.consultation.issue || "");

          const cDate = new Date(result.consultation.chart_date);
          setRealtimeDate(cDate);
          // 直接使用小时值
          setRealtimeHour(cDate.getHours());
          setChartGenerated(true);

          // Clear the URL param after loading
          setSearchParams({}, { replace: true });
          toast({ title: "已加载历史记录" });
        }
      });
    }
  }, [searchParams, currentConsultationId, loadConsultation, setSearchParams, toast]);

  // Save consultation handler
  const handleSaveConsultation = useCallback(
    async (topic?: string): Promise<string | null> => {
      if (!chartDate || !chart) return null;

      let title = issue || "实时占卜";
      if (title.length > 30) title = title.slice(0, 30) + "...";
      if (topic && topic !== "综合") title += ` - ${topic}`;

      const id = await saveConsultation(chartDate, chart, issue, title);
      if (id) setCurrentConsultationId(id);
      return id;
    },
    [chartDate, chart, issue, saveConsultation],
  );

  // Save message handler
  const handleSaveMessage = useCallback(
    async (consultationId: string, role: string, content: string) => {
      await saveMessage(consultationId, role, content);
    },
    [saveMessage],
  );

  // New chart handler
  const handleNewChart = useCallback(() => {
    if (chartGenerated) {
      setCurrentConsultationId(null);
      setLoadedMessages([]);
      setIssue("");
      const now = new Date();
      setRealtimeDate(now);
      setRealtimeHour(hourToShichenValue(getBeijingParts(now).hour));
      setChartGenerated(false);
    } else {
      setChartGenerated(true);
    }
  }, [chartGenerated]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-2 sm:px-4 py-3 max-w-7xl">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg sm:text-xl font-bold flex-1">实时盘</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 max-w-7xl">

        {canViewHistory && (
          <div className="flex justify-end mb-4">
            <Button variant="outline" size="sm" onClick={() => navigate("/realtime/history")}>
              <History className="h-4 w-4 mr-1" />
              历史记录
            </Button>
          </div>
        )}

        {/* 时格提示横幅 */}
        {/* {timingPatterns?.tianXian && (
          <Alert className="mb-4 border-green-500/50 bg-green-50 dark:bg-green-900/20">
            <Sparkles className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-700 dark:text-green-400 flex items-center gap-2">
              天显时格 · {timingPatterns.tianXian.hourPillar}
              <span className="text-xs font-normal text-muted-foreground">
                ({timingPatterns.tianXian.timeRange})
              </span>
            </AlertTitle>
            <AlertDescription className="text-green-600 dark:text-green-300">
              <span className="font-medium">{timingPatterns.tianXian.effect}</span> — {timingPatterns.tianXian.advice}
            </AlertDescription>
          </Alert>
        )} */}
        
        {/* {timingPatterns?.wuBuYu && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="flex items-center gap-2">
              五不遇时 · {timingPatterns.wuBuYu.hourGan}{timingPatterns.wuBuYu.hourZhi}时
            </AlertTitle>
            <AlertDescription>
              {timingPatterns.wuBuYu.keRelation}，时干克日干，诸事不宜，建议避开此时辰行事。
            </AlertDescription>
          </Alert>
        )} */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {/* Left Panel - Controls */}
          <div className="space-y-3 sm:space-y-4 order-1 lg:order-1">
            {/* Issue Input */}
            {/* <div className="bg-card rounded-lg p-4 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">事项内容（可选）</label>
                <div className="flex gap-2"> */}
            {/* <Input
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                    placeholder="例如：求职面试、项目合作..."
                    disabled={!!currentConsultationId}
                  /> */}
            {/* </div>
              </div>
              <Input
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                placeholder="例如：求职面试、项目合作..."
                disabled={!!currentConsultationId}
              />
            </div> */}

            <div className="bg-card rounded-lg p-4 border border-border">
              {/* Issue Input */}
              <div className="mb-4">
                <label className="text-sm font-medium">事项内容（可选）</label>
                <div className="mb-2"></div>
                <Input
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  placeholder="例如：求职面试、项目合作..."
                  disabled={!!currentConsultationId}
                />
              </div>

              <div className="mb-4">
                {/* Date Picker - Modal on mobile */}
                <label className="text-sm font-medium mb-2 block">选择日期</label>
                {isMobile ? (
                  <>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      onClick={() => setDateDrawerOpen(true)}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(realtimeDate, "yyyy年M月d日")}
                    </Button>
                    <Dialog open={dateDrawerOpen} onOpenChange={setDateDrawerOpen}>
                      <DialogContent className="w-[calc(100%-3rem)] max-w-lg left-1/2 -translate-x-1/2 rounded-lg">
                        <DialogHeader>
                          <DialogTitle>选择日期</DialogTitle>
                        </DialogHeader>
                        <div className="flex justify-center py-2">
                          <Calendar
                            mode="single"
                            selected={realtimeDate}
                            onSelect={(d) => d && setRealtimeDate(d)}
                            defaultMonth={realtimeDate}
                            className="pointer-events-auto"
                          />
                        </div>
                        <DialogFooter className="flex-row gap-2">
                          <Button variant="outline" className="flex-1" onClick={() => setRealtimeDate(new Date())}>
                            今天
                          </Button>
                          <Button className="flex-1" onClick={() => setDateDrawerOpen(false)}>
                            确认
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </>
                ) : (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(realtimeDate, "yyyy-MM-dd")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={realtimeDate}
                        onSelect={(d) => d && setRealtimeDate(d)}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              {/* Hour Picker - Drawer on mobile */}
              <label className="text-sm font-medium mb-2 block">选择时辰</label>
              {isMobile ? (
                <>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    onClick={() => setHourDrawerOpen(true)}
                  >
                    {HOUR_OPTIONS.find(opt => opt.value === realtimeHour)?.label || "子时"}
                  </Button>
                  <Drawer open={hourDrawerOpen} onOpenChange={setHourDrawerOpen}>
                    <DrawerContent className="max-h-[70vh]">
                      <DrawerHeader className="border-b">
                        <DrawerTitle>选择时辰</DrawerTitle>
                      </DrawerHeader>
                      <ScrollArea className="max-h-[55vh] overflow-y-auto">
                        <div className="divide-y">
                          {HOUR_OPTIONS.map((opt, idx) => {
                            const isSelected = realtimeHour === opt.value;
                            return (
                              <button
                                key={`${opt.value}-${idx}`}
                                className={cn(
                                  "w-full px-4 py-3 flex items-center justify-between text-left transition-colors",
                                  isSelected ? "bg-primary/10" : "hover:bg-muted/50",
                                )}
                                onClick={() => {
                                  setRealtimeHour(opt.value);
                                  setHourDrawerOpen(false);
                                }}
                              >
                                <span className="text-base">{opt.label}</span>
                                {isSelected && <Check className="h-5 w-5 text-primary" />}
                              </button>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    </DrawerContent>
                  </Drawer>
                </>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {HOUR_OPTIONS.map((opt, idx) => (
                    <Button
                      key={`${opt.value}-${idx}`}
                      variant={realtimeHour === opt.value ? "default" : "outline"}
                      size="sm"
                      className="text-xs"
                      onClick={() => setRealtimeHour(opt.value)}
                    >
                      {opt.shichen}
                    </Button>
                  ))}
                </div>
              )}

              <div className="mt-4">
                <Button className="w-full" variant={chartGenerated? "outline" : "default"} onClick={handleNewChart}>
                  {chartGenerated ? "重起" : "起盘"}
                </Button>
              </div>
            </div>

            {/* Chart Info */}
            {chart && lunar && chartGenerated && (
              <>
                {/* <LiuYaoDisplay pillars={chart.pillars} /> */}
                <div className="bg-card rounded-lg p-4 border border-border">
                  <h3 className="text-sm font-medium mb-3">农历信息</h3>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p>
                      农历：{LUNAR_MONTHS[lunar.month - 1]}月{LUNAR_DAYS[lunar.day - 1]}
                    </p>
                    <p>
                      局数：{chart.yinYang === "Yin" ? "阴" : "阳"}遁{chart.juNum}局
                      {chart.isFuYin && (
                        <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                          伏吟
                        </span>
                      )}
                      {!chart.isFuYin && chart.isStarFuYin && (
                        <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                          星伏吟
                        </span>
                      )}
                      {!chart.isFuYin && chart.isDoorFuYin && (
                        <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                          门伏吟
                        </span>
                      )}
                      {chart.isFanYin && (
                        <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300">
                          反吟
                        </span>
                      )}
                      {!chart.isFanYin && chart.isStarFanYin && (
                        <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                          星反吟
                        </span>
                      )}
                      {!chart.isFanYin && chart.isDoorFanYin && (
                        <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                          门反吟
                        </span>
                      )}
                    </p>
                    <p>
                      值符：{chart.zhiFu} | 值使：{chart.zhiShi}
                    </p>
                    <p>
                      旬首：{chart.xunShou}
                    </p>
                    <p>
                      空亡：{chart.voidBranches} | 马星：{chart.horseBranch}
                    </p>
                  </div>
                </div>
                <FourPillarsDisplay pillars={chart.pillars} />
              </>
            )}
          </div>

          {/* Center - Chart Grid */}
          <div className="order-2 lg:order-2 lg:col-span-2 mb-24">
            {chart && chartGenerated && <ChartGrid data={chart} />}
          </div>


          {/* Floating AI Button - only for VIP+ */}
          {chart && chartGenerated && canUseAI && (
            <Button
              className="fixed bottom-16 right-6 w-fit p-4 shadow-lg z-50"
              size="icon"
              onClick={() => setChatDrawerOpen(true)}
            >
              AI 解读 <MessageSquare className="h-6 w-6" />
            </Button>
          )}
          
          {/* Upgrade prompt for non-VIP+ users */}
          {chart && chartGenerated && !canUseAI && (
            <Button
              className="fixed bottom-16 right-6 h-14 rounded-full shadow-lg z-50 gap-2 bg-amber-500 hover:bg-amber-600"
              onClick={() => navigate('/pricing')}
            >
              <Crown className="h-5 w-5" />
              <span className="text-sm">升级订阅会员解锁 AI</span>
            </Button>
          )}

          {/* AI Chat Drawer - only render for VIP+ */}
          {chart && chartGenerated && canUseAI && (
            <AIChatDrawer
              open={chatDrawerOpen}
              onOpenChange={setChatDrawerOpen}
              chart={chart}
              chartMode="实时盘"
              issue={issue}
              currentConsultationId={currentConsultationId}
              loadedMessages={loadedMessages}
              onSaveConsultation={handleSaveConsultation}
              onSaveMessage={handleSaveMessage}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Realtime;
