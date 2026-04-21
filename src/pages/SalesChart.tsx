import React, { useState, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, AlertCircle, User, Users, Edit, Calendar, Clock, MessageSquare, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import ChartGrid from "@/components/ChartGrid";
import FourPillarsDisplay, { CyclePillarData } from "@/components/FourPillarsDisplay";
import LiuYaoDisplay from "@/components/LiuYaoDisplay";
import AIChatDrawer from "@/components/AIChatDrawer";
import IronArmyIndicator from "@/components/IronArmyIndicator";
import IronArmyPositionMatch from "@/components/IronArmyPositionMatch";
import CustomerProfileSection from "@/components/CustomerProfileSection";

import { generateChart } from "@/lib/qimenEngine";
import { getLunarDate } from "@/lib/lunar";
import { makeBeijingDate, parseYmd, safeParseDate } from "@/lib/time/beijing";
import { ChartType, Gender } from "@/types";
import { Client, hourToShichen } from "@/types/database";
import { getZodiac, calculateMingGua, getLunarYear, getYearGanZhi, getMonthGanZhi, getDayGanZhi } from "@/lib/ganzhiHelper";
import { getJieQiAndMonthlyGeneral } from "@/lib/tiandiMenhu";
import { useClients } from "@/hooks/useClients";
import { useConsultations } from "@/hooks/useConsultations";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Message } from "@/hooks/useRealtimeConsultations";

const LUNAR_MONTHS = ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "冬", "腊"];
const LUNAR_DAYS = [
  "初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
  "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
  "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十",
];

const SalesChart: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { profile } = useAuth();

  const { clients, loading: clientsLoading } = useClients();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);

  const [currentConsultationId, setCurrentConsultationId] = useState<string | null>(null);
  const [loadedMessages, setLoadedMessages] = useState<Message[]>([]);

  const {
    saveDestinyConsultation,
    saveInterpretation,
  } = useConsultations(selectedClient?.id);

  // Auto-select client from URL
  React.useEffect(() => {
    const clientId = searchParams.get("clientId");
    if (clientId && clients.length > 0) {
      const client = clients.find(c => c.id === clientId);
      if (client && client.id !== selectedClient?.id) {
        setSelectedClient(client);
      }
    }
  }, [searchParams, clients, selectedClient?.id]);

  // Chart computation
  const chartDate = useMemo(() => {
    if (!selectedClient || selectedClient.birth_hour === null) return null;
    const { year, month, day } = parseYmd(selectedClient.birth_date);
    return makeBeijingDate({ year, month, day, hour: selectedClient.birth_hour, minute: selectedClient.birth_minute || 0 });
  }, [selectedClient]);

  const chart = useMemo(() => {
    if (!chartDate || !selectedClient || selectedClient.birth_hour === null) return null;
    const gender = selectedClient.gender === "男" ? Gender.MALE : Gender.FEMALE;
    return generateChart(chartDate, ChartType.LIFETIME, selectedClient.name, gender);
  }, [chartDate, selectedClient]);

  const lunar = useMemo(() => {
    if (!chartDate) return null;
    return getLunarDate(chartDate);
  }, [chartDate]);

  // Current cycle pillars
  const cyclePillars = useMemo<CyclePillarData | undefined>(() => {
    if (!chart) return undefined;
    const now = new Date();
    const currentLunarYear = getLunarYear(now.getFullYear(), now.getMonth() + 1, now.getDate());
    let daYun: import("@/types").GanZhi | undefined;
    const bigCycles = chart.bigCycles;
    for (let i = 0; i < bigCycles.length; i++) {
      const nextYear = i < bigCycles.length - 1 ? bigCycles[i + 1].year : bigCycles[i].year + 10;
      if (currentLunarYear >= bigCycles[i].year && currentLunarYear < nextYear) {
        const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
        const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
        daYun = { gan: bigCycles[i].gan, zhi: bigCycles[i].zhi, ganIdx: STEMS.indexOf(bigCycles[i].gan), zhiIdx: BRANCHES.indexOf(bigCycles[i].zhi) };
        break;
      }
    }
    const liuNian = getYearGanZhi(now);
    const yearGanZhi = getYearGanZhi(now);
    const liuYue = getMonthGanZhi(now, yearGanZhi.ganIdx);
    const liuRi = getDayGanZhi(now);
    return { daYun, liuNian, liuYue, liuRi };
  }, [chart]);

  // Consultation handlers
  const handleSaveConsultation = useCallback(
    async (topic?: string, mentionedClientIds?: string[]): Promise<string | null> => {
      if (!chartDate || !chart || !selectedClient) return null;
      let title = selectedClient.name;
      if (mentionedClientIds && mentionedClientIds.length > 0) {
        const mentionedNames = clients.filter(c => mentionedClientIds.includes(c.id)).map(c => c.name).join(", ");
        if (mentionedNames) title += ` + ${mentionedNames}`;
      }
      title += ` - 销售排盘分析`;
      const id = await saveDestinyConsultation(selectedClient.id, chartDate, chart, { title, topic: topic ?? null, mentionedClientIds });
      if (id) setCurrentConsultationId(id);
      return id;
    },
    [chartDate, chart, selectedClient, clients, saveDestinyConsultation],
  );

  const handleSaveMessage = useCallback(
    async (consultationId: string, role: string, content: string) => {
      await saveInterpretation(consultationId, role as "user" | "assistant", content);
    },
    [saveInterpretation],
  );

  const handleNewConsultation = useCallback(() => {
    setCurrentConsultationId(null);
    setLoadedMessages([]);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground mx-4">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-2 sm:px-4 py-3 max-w-7xl">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg sm:text-xl font-bold flex-1">销售排盘</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 max-w-7xl mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {/* Left Panel - Client Select & Controls */}
          <div className="space-y-3 sm:space-y-4 order-1 lg:order-1">
            {/* Client Card or Select Button */}
            <div className="bg-card rounded-lg p-4 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">客户信息</span>
              </div>

              {selectedClient ? (
                <div className="space-y-3">
                  {/* Client Info Card */}
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        <span className="font-medium">{selectedClient.name}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                          {selectedClient.gender}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => navigate(`/clients/${selectedClient.id}/edit?redirect=${encodeURIComponent(`/sales-chart?clientId=${selectedClient.id}`)}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{format(safeParseDate(selectedClient.birth_date), "yyyy年MM月dd日")}</span>
                        {lunar && (
                          <span className="text-xs text-primary">
                            （{LUNAR_MONTHS[lunar.month - 1]}月{LUNAR_DAYS[lunar.day - 1]}）
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" />
                        {selectedClient.birth_hour !== null ? (
                          <span>
                            {selectedClient.birth_hour.toString().padStart(2, '0')}:
                            {(selectedClient.birth_minute || 0).toString().padStart(2, '0')}
                            （{hourToShichen(selectedClient.birth_hour).name}）
                          </span>
                        ) : (
                          <span className="text-amber-600">未知时辰</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Change Client Button */}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/clients?selectMode=sales-chart")}
                  >
                    更换客户
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>请先选择一位客户来进行销售排盘分析</AlertDescription>
                  </Alert>
                  <Button
                    className="w-full"
                    onClick={() => navigate("/clients?selectMode=sales-chart")}
                  >
                    <User className="h-4 w-4 mr-2" />
                    选择客户
                  </Button>
                </div>
              )}
            </div>

            {/* Chart Info - Qimen details */}
            {chart && lunar && selectedClient && (
              <Collapsible className="bg-card rounded-lg border border-border">
                <CollapsibleTrigger className="w-full flex items-center justify-between p-4">
                  <h3 className="text-sm font-medium">奇门信息</h3>
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 [&[data-state=open]]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4">
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium text-muted-foreground py-1.5 w-16 text-xs">命造</TableCell>
                        <TableCell className="py-1.5 text-sm">
                          {selectedClient.gender === "男" ? "乾造" : "坤造"}
                          <span className="text-muted-foreground ml-2">
                            {getZodiac(chart.pillars.year.zhiIdx)}年生
                          </span>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-muted-foreground py-1.5 text-xs">命宫</TableCell>
                        <TableCell className="py-1.5 text-sm">
                          {(() => {
                            const gender = selectedClient.gender === "男" ? Gender.MALE : Gender.FEMALE;
                            const mingGua = calculateMingGua(chart.date.getFullYear(), gender);
                            return `${mingGua.name}宫`;
                          })()}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-muted-foreground py-1.5 text-xs">局数</TableCell>
                        <TableCell className="py-1.5 text-sm">
                          {chart.yinYang === "Yin" ? "阴遁" : "阳遁"}{chart.juNum}局
                          {chart.isFuYin && (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">伏吟</span>
                          )}
                          {chart.isFanYin && (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300">反吟</span>
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-muted-foreground py-1.5 text-xs">值符</TableCell>
                        <TableCell className="py-1.5 text-sm">{chart.zhiFu}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-muted-foreground py-1.5 text-xs">值使</TableCell>
                        <TableCell className="py-1.5 text-sm">{chart.zhiShi}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-muted-foreground py-1.5 text-xs">旬首</TableCell>
                        <TableCell className="py-1.5 text-sm">{chart.xunShou}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-muted-foreground py-1.5 text-xs">空亡</TableCell>
                        <TableCell className="py-1.5 text-sm">{chart.voidBranches}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-muted-foreground py-1.5 text-xs">马星</TableCell>
                        <TableCell className="py-1.5 text-sm">{chart.horseBranch}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-muted-foreground py-1.5 text-xs">节气</TableCell>
                        <TableCell className="py-1.5 text-sm">
                          {(() => {
                            const jieQiInfo = getJieQiAndMonthlyGeneral(chart.date);
                            return (
                              <>
                                <span className="font-medium">{jieQiInfo.jieQi}</span>
                                <span className="mx-2 text-muted-foreground">|</span>
                                <span className="text-amber-700 font-medium">{jieQiInfo.zhongQi}</span>
                                <span className="mx-1 text-muted-foreground">→</span>
                                <span className="font-medium">{jieQiInfo.monthlyGeneral.name}{jieQiInfo.monthlyGeneral.branch}</span>
                                <span className="text-muted-foreground ml-1">月将</span>
                              </>
                            );
                          })()}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* 铁军指标 */}
            {chart && (
              <IronArmyIndicator chart={chart} />
            )}

            {/* 铁军岗位匹配 */}
            {chart && (
              <IronArmyPositionMatch chart={chart} />
            )}

            {/* 顾客画像 */}
            {chart && (
              <Collapsible className="bg-card rounded-lg border border-border">
                <CollapsibleTrigger className="w-full flex items-center justify-between p-4">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    顾客画像
                  </h3>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4">
                  <CustomerProfileSection chart={chart} />
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>

          {/* Right Panel - Charts */}
          <div className="lg:col-span-2 space-y-4 order-2 lg:order-2">
            {selectedClient && selectedClient.birth_hour === null && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>此客户未设置出生时辰，无法生成排盘</AlertDescription>
              </Alert>
            )}

            {chart && selectedClient && (
              <>
                {/* 六爻 */}
                <Collapsible className="bg-card rounded-lg border border-border">
                  <CollapsibleTrigger className="w-full flex items-center justify-between p-4">
                    <h3 className="text-sm font-medium">六爻</h3>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4">
                    <LiuYaoDisplay pillars={chart.pillars} />
                  </CollapsibleContent>
                </Collapsible>

                {/* 四柱八字 */}
                <Collapsible className="bg-card rounded-lg border border-border">
                  <CollapsibleTrigger className="w-full flex items-center justify-between p-4">
                    <h3 className="text-sm font-medium">四柱八字</h3>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4">
                    <FourPillarsDisplay pillars={chart.pillars} cyclePillars={cyclePillars} />
                  </CollapsibleContent>
                </Collapsible>

                {/* 奇门盘 */}
                <Collapsible className="bg-card rounded-lg border border-border">
                  <CollapsibleTrigger className="w-full flex items-center justify-between p-4">
                    <h3 className="text-sm font-medium">奇门盘</h3>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4">
                    <ChartGrid data={chart} />
                  </CollapsibleContent>
                </Collapsible>
              </>
            )}

            {/* Display for unknown birth time */}
            {selectedClient && selectedClient.birth_hour === null && (
              (() => {
                const { year, month, day } = parseYmd(selectedClient.birth_date);
                const tempDate = makeBeijingDate({ year, month, day, hour: 12, minute: 0 });
                const gender = selectedClient.gender === "男" ? Gender.MALE : Gender.FEMALE;
                const tempChart = generateChart(tempDate, ChartType.LIFETIME, selectedClient.name, gender);
                if (!tempChart) return null;
                const partialPillars = {
                  year: tempChart.pillars.year,
                  month: tempChart.pillars.month,
                  day: tempChart.pillars.day,
                  hour: tempChart.pillars.day,
                };
                return (
                  <>
                    <LiuYaoDisplay pillars={partialPillars} hideHour={true} />
                    <FourPillarsDisplay pillars={partialPillars} hideHour={true} />
                  </>
                );
              })()
            )}
          </div>
        </div>
      </div>

      {/* Floating AI Button */}
      {chart && selectedClient && (
        <Button
          className="fixed bottom-16 right-6 w-fit p-4 shadow-lg z-50"
          size="icon"
          onClick={() => setChatDrawerOpen(true)}
        >
          AI 销售分析 <MessageSquare className="h-6 w-6" />
        </Button>
      )}

      {/* AI Chat Drawer */}
      {chart && selectedClient && (
        <AIChatDrawer
          open={chatDrawerOpen}
          onOpenChange={setChatDrawerOpen}
          chart={chart}
          clientName={selectedClient.name}
          chartMode="销售排盘"
          clients={clients}
          currentClientId={selectedClient.id}
          currentDestinyConsultationId={currentConsultationId}
          loadedDestinyMessages={loadedMessages}
          onSaveDestinyConsultation={handleSaveConsultation}
          onSaveDestinyMessage={handleSaveMessage}
          onNewConversation={handleNewConsultation}
        />
      )}
    </div>
  );
};

export default SalesChart;
