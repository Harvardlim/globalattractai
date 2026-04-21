import React, { useState, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, User, Users, MessageSquare, Crown, Eye, EyeOff, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ChartGrid from "@/components/ChartGrid";
import AIChatDrawer from "@/components/AIChatDrawer";
import FourPillarsDisplay, { CyclePillarData } from "@/components/FourPillarsDisplay";
import LiuYaoDisplay from "@/components/LiuYaoDisplay";
import CyclesDisplay from "@/components/CyclesDisplay";
import BaziPatternDisplay from "@/components/BaziPatternDisplay";
import GeJuDisplay from "@/components/GeJuDisplay";
import LockedContent from "@/components/LockedContent";
import SynastryAnalysis from "@/components/SynastryAnalysis";
import SpendingAnalysisDisplay from "@/components/SpendingAnalysisDisplay";
import SpeechAnalysisDisplay from "@/components/SpeechAnalysisDisplay";
import WealthAnalysisDisplay from "@/components/WealthAnalysisDisplay";
import { generateChart } from "@/lib/qimenEngine";
import { makeBeijingDate, parseYmd } from "@/lib/time/beijing";
import { ChartType, Gender, ChartData, GanZhi } from "@/types";
import { Client } from "@/types/database";
import { getLunarYear, getYearGanZhi, getMonthGanZhi, getDayGanZhi } from "@/lib/ganzhiHelper";
import { useClients } from "@/hooks/useClients";
import { useMemberPermissions } from "@/hooks/useMemberPermissions";
import { useSynastryConsultations } from "@/hooks/useSynastryConsultations";
import ChartFeedbackSection from "@/components/ChartFeedbackSection";

const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

function computeCyclePillars(chart: ChartData): CyclePillarData | undefined {
  const now = new Date();
  const currentLunarYear = getLunarYear(now.getFullYear(), now.getMonth() + 1, now.getDate());

  let daYun: GanZhi | undefined;
  const bigCycles = chart.bigCycles;
  for (let i = 0; i < bigCycles.length; i++) {
    const nextYear = i < bigCycles.length - 1 ? bigCycles[i + 1].year : bigCycles[i].year + 10;
    if (currentLunarYear >= bigCycles[i].year && currentLunarYear < nextYear) {
      daYun = {
        gan: bigCycles[i].gan,
        zhi: bigCycles[i].zhi,
        ganIdx: STEMS.indexOf(bigCycles[i].gan),
        zhiIdx: BRANCHES.indexOf(bigCycles[i].zhi),
      };
      break;
    }
  }

  const liuNian = getYearGanZhi(now);
  const yearGanZhi = getYearGanZhi(now);
  const liuYue = getMonthGanZhi(now, yearGanZhi.ganIdx);
  const liuRi = getDayGanZhi(now);

  return { daYun, liuNian, liuYue, liuRi };
}

function generateClientChart(client: Client): ChartData | null {
  if (client.birth_hour === null) return null;
  const { year, month, day } = parseYmd(client.birth_date);
  const date = makeBeijingDate({ year, month, day, hour: client.birth_hour, minute: client.birth_minute || 0 });
  const gender = client.gender === "男" ? Gender.MALE : Gender.FEMALE;
  return generateChart(date, ChartType.LIFETIME, client.name, gender);
}

// Generate partial chart (BaZi only) for clients without birth time
function generatePartialChart(client: Client): ChartData | null {
  const { year, month, day } = parseYmd(client.birth_date);
  // Use noon as placeholder - only year/month/day pillars matter
  const date = makeBeijingDate({ year, month, day, hour: 12, minute: 0 });
  const gender = client.gender === "男" ? Gender.MALE : Gender.FEMALE;
  const chart = generateChart(date, ChartType.LIFETIME, client.name, gender);
  return chart;
}

const Synastry: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clients } = useClients();
  const { canAccess } = useMemberPermissions();
  const { saveConsultation, saveMessage, loadConsultation } = useSynastryConsultations();
  const canUseSynastry = canAccess('synastry');
  const canUseAI = canAccess('ai_assistant');
  const canViewFull = canAccess('destiny_full');

  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [showLiuYao, setShowLiuYao] = useState(true);
  const [showBazi, setShowBazi] = useState(true);
  const [showQimen, setShowQimen] = useState(true);
  const [showCycles, setShowCycles] = useState(true);
  const [loadedMessages, setLoadedMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);

  const clientId1 = searchParams.get("clientId1");
  const clientId2 = searchParams.get("clientId2");
  const consultationIdParam = searchParams.get("consultationId");

  // Auto-load messages and open drawer when consultationId is in URL
  React.useEffect(() => {
    if (!consultationIdParam || !canUseAI) return;
    let cancelled = false;
    (async () => {
      const result = await loadConsultation(consultationIdParam);
      if (cancelled || !result) return;
      setLoadedMessages(result.messages);
      setChatDrawerOpen(true);
    })();
    return () => { cancelled = true; };
  }, [consultationIdParam, canUseAI, loadConsultation]);

  const client1 = useMemo(() => clients.find(c => c.id === clientId1) || null, [clients, clientId1]);
  const client2 = useMemo(() => clients.find(c => c.id === clientId2) || null, [clients, clientId2]);

  const chart1 = useMemo(() => client1 ? generateClientChart(client1) : null, [client1]);
  const chart2 = useMemo(() => client2 ? generateClientChart(client2) : null, [client2]);
  // Partial charts for clients without birth time (BaZi only)
  const partialChart1 = useMemo(() => (client1 && !chart1) ? generatePartialChart(client1) : null, [client1, chart1]);
  const partialChart2 = useMemo(() => (client2 && !chart2) ? generatePartialChart(client2) : null, [client2, chart2]);
  // Effective charts: full or partial
  const effectiveChart1 = chart1 || partialChart1;
  const effectiveChart2 = chart2 || partialChart2;
  const hasNoTime1 = client1?.birth_hour === null;
  const hasNoTime2 = client2?.birth_hour === null;
  const anyNoTime = hasNoTime1 || hasNoTime2;

  const handleSelectSlot = (slot: number) => {
    const params = new URLSearchParams();
    params.set("selectMode", "synastry");
    params.set("slot", String(slot));
    if (clientId1) params.set("clientId1", clientId1);
    if (clientId2) params.set("clientId2", clientId2);
    navigate(`/clients?${params.toString()}`);
  };

  const formatBirthInfo = (client: Client) => {
    const hourLabels = ['早子时(00)', '丑时(01)', '丑时(02)', '寅时(03)', '寅时(04)', '卯时(05)', '卯时(06)', '辰时(07)', '辰时(08)', '巳时(09)', '巳时(10)', '午时(11)', '午时(12)', '未时(13)', '未时(14)', '申时(15)', '申时(16)', '酉时(17)', '酉时(18)', '戌时(19)', '戌时(20)', '亥时(21)', '亥时(22)', '晚子时(23)'];
    const hourStr = client.birth_hour !== null ? hourLabels[client.birth_hour] || `${client.birth_hour}时` : '未知';
    const minStr = client.birth_minute !== undefined ? String(client.birth_minute).padStart(2, '0') : '00';
    return { date: client.birth_date, hour: hourStr, minute: minStr };
  };

  const cyclePillars1 = useMemo(() => chart1 ? computeCyclePillars(chart1) : undefined, [chart1]);
  const cyclePillars2 = useMemo(() => chart2 ? computeCyclePillars(chart2) : undefined, [chart2]);

  const renderPersonSection = (client: Client, label: string) => {
    const birth = formatBirthInfo(client);
    const noTime = client.birth_hour === null;
    const fullChart = noTime ? null : (client === client1 ? chart1 : chart2);
    const partialChart = noTime ? (client === client1 ? partialChart1 : partialChart2) : null;
    const effectiveChart = fullChart || partialChart;
    const cyclePillars = fullChart ? (client === client1 ? cyclePillars1 : cyclePillars2) : undefined;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 py-2 border-b border-border">
          <User className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">{label}：{client.name}</h2>
          <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">{client.gender}</span>
        </div>

        {showInfo && (
          <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
            <span>出生日期：{birth.date}</span>
            <span>时辰：{birth.hour}</span>
            {!noTime && <span>分钟：{birth.minute}</span>}
          </div>
        )}

        {effectiveChart ? (
          <>
            {!noTime && canViewFull && showLiuYao && <LiuYaoDisplay pillars={effectiveChart.pillars} />}
            {showBazi && (
              <FourPillarsDisplay pillars={effectiveChart.pillars} cyclePillars={cyclePillars} hideHour={noTime} />
            )}
            {!noTime && showQimen && <ChartGrid data={effectiveChart} />}
            {!noTime && showCycles && <CyclesDisplay bigCycles={effectiveChart.bigCycles} annualCycles={effectiveChart.annualCycles} birthYear={effectiveChart.date.getFullYear()} />}
            {!noTime && canViewFull && (
              <>
                <WealthAnalysisDisplay chart={effectiveChart} />
                <SpendingAnalysisDisplay chart={effectiveChart} />
                <SpeechAnalysisDisplay chart={effectiveChart} />
              </>
            )}
          </>
        ) : (
          <Alert>
            <AlertDescription>无法生成命盘。</AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  if (!canUseSynastry) {
    return (
      <div className="min-h-screen bg-background text-foreground mx-4">
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
          <div className="container mx-auto px-2 sm:px-4 py-3 max-w-7xl">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg sm:text-xl font-bold flex-1">合盘</h1>
            </div>
          </div>
        </div>
        <LockedContent isLocked={true} requiredTier="订阅会员">
          <div className="h-64" />
        </LockedContent>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground mx-4">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-2 sm:px-4 py-3 max-w-7xl">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg sm:text-xl font-bold flex-1">合盘</h1>
            <Button variant="outline" size="sm" onClick={() => navigate("/synastry/history")}>
              <History className="h-4 w-4 mr-3" />
              历史记录
            </Button>
          </div>
          {/* Visibility toggles */}
          <div className="flex gap-2 mt-2 flex-wrap">
            <Button
              variant={showInfo ? "default" : "outline"}
              size="sm"
              className="text-xs h-7"
              onClick={() => setShowInfo(!showInfo)}
            >
              {showInfo ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
              出生信息
            </Button>
            {canViewFull && (
              <Button
                variant={showLiuYao ? "default" : "outline"}
                size="sm"
                className="text-xs h-7"
                onClick={() => setShowLiuYao(!showLiuYao)}
              >
                {showLiuYao ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                六爻
              </Button>
            )}
            <Button
              variant={showBazi ? "default" : "outline"}
              size="sm"
              className="text-xs h-7"
              onClick={() => setShowBazi(!showBazi)}
            >
              {showBazi ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
              八字
            </Button>
            <Button
              variant={showQimen ? "default" : "outline"}
              size="sm"
              className="text-xs h-7"
              onClick={() => setShowQimen(!showQimen)}
            >
              {showQimen ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
              奇门盘
            </Button>
            <Button
              variant={showCycles ? "default" : "outline"}
              size="sm"
              className="text-xs h-7"
              onClick={() => setShowCycles(!showCycles)}
            >
              {showCycles ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
              大运流年
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-2 sm:px-4 py-4 max-w-7xl mb-24">
        {/* Client Selection */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => handleSelectSlot(1)}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">第一人</p>
                <p className="font-medium truncate">{client1?.name || "选择客户"}</p>
              </div>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => handleSelectSlot(2)}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">第二人</p>
                <p className="font-medium truncate">{client2?.name || "选择客户"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Person Charts - side by side on tablet+ */}
        {(client1 || client2) && (
          <div className="grid grid-cols-1 gap-6 synastry-side-by-side">
            {client1 && <div>{renderPersonSection(client1, "第一人")}</div>}
            {client2 && <div>{renderPersonSection(client2, "第二人")}</div>}
          </div>
        )}

        {/* Synastry Analysis */}
        {effectiveChart1 && effectiveChart2 && (
          <div className="mt-8">
            {canViewFull ? (
              <SynastryAnalysis chart1={effectiveChart1} chart2={effectiveChart2} hideQimen={anyNoTime} />
            ) : (
              <LockedContent isLocked={true} requiredTier="订阅会员">
                <SynastryAnalysis chart1={effectiveChart1} chart2={effectiveChart2} hideQimen={anyNoTime} />
              </LockedContent>
            )}
          </div>
        )}

        {/* Feedback Section */}
        {(client1 || client2) && (
          <div className="mt-6">
            <ChartFeedbackSection chartType="合盘" />
          </div>
        )}

        {/* Floating AI Button */}
        {effectiveChart1 && effectiveChart2 && canUseAI && (
          <Button
            className="fixed bottom-16 right-6 w-fit p-4 shadow-lg z-50"
            size="icon"
            onClick={() => setChatDrawerOpen(true)}
          >
            AI 解读 <MessageSquare className="h-6 w-6" />
          </Button>
        )}

        {effectiveChart1 && effectiveChart2 && !canUseAI && (
          <Button
            className="fixed bottom-16 right-6 h-14 rounded-full shadow-lg z-50 gap-2 bg-amber-500 hover:bg-amber-600"
            onClick={() => navigate('/pricing')}
          >
            <Crown className="h-5 w-5" />
            <span className="text-sm">升级订阅会员解锁 AI</span>
          </Button>
        )}

        {/* AI Chat Drawer for synastry */}
        {effectiveChart1 && effectiveChart2 && canUseAI && (
          <AIChatDrawer
            open={chatDrawerOpen}
            onOpenChange={setChatDrawerOpen}
            chart={effectiveChart1}
            chart2={effectiveChart2}
            clientName={`${client1!.name} & ${client2!.name}`}
            clientName1={client1!.name}
            clientName2={client2!.name}
            chartMode="合盘"
            clients={clients}
            currentClientId={client1!.id}
            currentConsultationId={consultationIdParam}
            loadedMessages={loadedMessages.length > 0 ? loadedMessages : undefined}
            onSaveConsultation={async (topic?: string) => {
              if (!clientId1 || !clientId2 || !effectiveChart1 || !effectiveChart2) return null;
              return saveConsultation(
                clientId1, clientId2,
                effectiveChart1, effectiveChart2,
                `${client1!.name} & ${client2!.name}`,
                topic
              );
            }}
            onSaveMessage={async (consultationId: string, role: string, content: string) => {
              await saveMessage(consultationId, role, content);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Synastry;
