import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { getDestinyTranslations } from "@/data/destinyTranslations";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, AlertCircle, User, Edit, Calendar, Clock, History, MessageSquare, Lock, Crown, Phone, ChevronDown, FileText, Eye } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import DestinyLoadingOverlay from "@/components/DestinyLoadingOverlay";
import ChartGrid from "@/components/ChartGrid";
import ClientForm from "@/components/ClientForm";
import AIChatDrawer from "@/components/AIChatDrawer";
import FourPillarsDisplay, { CyclePillarData } from "@/components/FourPillarsDisplay";
import LiuYaoDisplay from "@/components/LiuYaoDisplay";
import CyclesDisplay from "@/components/CyclesDisplay";
import BaziPatternDisplay from "@/components/BaziPatternDisplay";
import GeJuDisplay from "@/components/GeJuDisplay";
import QimenAnalysisDisplay from "@/components/QimenAnalysisDisplay";
import SiHaiAnalysisDisplay from "@/components/SiHaiAnalysisDisplay";
import BaziEncyclopedia from "@/components/BaziEncyclopedia";
import LockedContent from "@/components/LockedContent";
import { PhoneEnergySection } from "@/components/PhoneEnergySection";
import WealthAnalysisDisplay from "@/components/WealthAnalysisDisplay";
import SpendingAnalysisDisplay from "@/components/SpendingAnalysisDisplay";
import SpeechAnalysisDisplay from "@/components/SpeechAnalysisDisplay";

import BranchRelationsDisplay from "@/components/BranchRelationsDisplay";
import ChartFeedbackSection from "@/components/ChartFeedbackSection";
import SimplifiedDestinyAnalysis from "@/components/SimplifiedDestinyAnalysis";
import { generateChart } from "@/lib/qimenEngine";
import FortuneTimeline from "@/components/FortuneTimeline";
import { analyzeBaziPattern } from "@/lib/baziPatternAnalysis";
import { getLunarDate } from "@/lib/lunar";
import { makeBeijingDate, parseYmd, safeParseDate } from "@/lib/time/beijing";
import { ChartType, Gender } from "@/types";
import { Client, hourToShichen } from "@/types/database";
import { getZodiac, calculateMingGua, getLunarYear, getYearGanZhi, getMonthGanZhi, getDayGanZhi } from "@/lib/ganzhiHelper";
import { getJieQiAndMonthlyGeneral } from "@/lib/tiandiMenhu";
import { useClients } from "@/hooks/useClients";
import { useConsultations } from "@/hooks/useConsultations";
import { useMemberPermissions } from "@/hooks/useMemberPermissions";
import { useAuth } from "@/contexts/AuthContext";

import { useClientReports } from "@/hooks/useClientReports";
import { useToast } from "@/hooks/use-toast";
import { Message } from "@/hooks/useRealtimeConsultations";
import { cn } from "@/lib/utils";

const LUNAR_MONTHS = ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "冬", "腊"];
const LUNAR_DAYS = [
  "初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
  "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
  "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十",
];

type DestinyViewMode = 'simplified' | 'professional';

const Destiny: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { canAccess, isNormal, isSubscriber, isAdmin } = useMemberPermissions();
  const { isSuperAdmin } = useAuth();
  
  const siHaiDisabled = false;
  const { currentLanguage } = useLanguage();
  const dt = getDestinyTranslations(currentLanguage);
  
  // Permission checks
  const canUseAI = canAccess('ai_assistant');
  
  // View mode: simplified vs professional - all tiers can switch
  const [viewMode, setViewMode] = useState<DestinyViewMode>('simplified');
  


  const { clients, loading: clientsLoading, addClient, updateClient, deleteClient, getOrCreateSelfClient } = useClients();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientForm, setShowClientForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  
  const [reportAutoPrompt, setReportAutoPrompt] = useState<string | null>(null);

  // Check for existing reports for selected client
  const { reports: clientReports, fetchReports: fetchClientReports } = useClientReports(selectedClient?.id);
  const existingReport = useMemo(() => clientReports.find(r => r.status === 'completed'), [clientReports]);

  useEffect(() => {
    if (selectedClient?.id) {
      fetchClientReports();
    }
  }, [selectedClient?.id, fetchClientReports]);



  // Consultation state
  const [currentConsultationId, setCurrentConsultationId] = useState<string | null>(null);
  const [loadedMessages, setLoadedMessages] = useState<Message[]>([]);

  // Check for self mode (viewing own profile's destiny) - must be defined before loading overlay
  const selfMode = searchParams.get("mode") === "self";
  const clientIdParam = searchParams.get("clientId");

  // Loading overlay state - show when entering with clientId or selfMode
  // Skip loading animation when returning from consultation history or AI chat
  const consultationIdParam = searchParams.get("consultationId");
  const skipLoading = searchParams.get("skipLoading");
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(
    () => !!(clientIdParam || selfMode) && !consultationIdParam && !skipLoading
  );

  const handleLoadingComplete = useCallback(() => {
    setShowLoadingOverlay(false);
  }, []);

  const {
    consultations,
    loading: consultationsLoading,
    error: consultationsError,
    hasAttempted: consultationsAttempted,
    fetchConsultations,
    saveDestinyConsultation,
    saveInterpretation,
    getInterpretations,
    deleteConsultation,
    updateConsultationTitle,
    getConsultationStats,
  } = useConsultations(selectedClient?.id);

  // Self client ready state
  const [selfClientReady, setSelfClientReady] = useState(false);
  
  // Parse self profile data from URL params OR fetch from database
  const [selfProfileData, setSelfProfileData] = useState<{
    name: string;
    birth_date: string;
    birth_hour: number;
    birth_minute: number;
    gender: "男" | "女";
  } | null>(null);

  useEffect(() => {
    if (!selfMode) return;
    
    // First try URL params
    const birthDate = searchParams.get("birthDate");
    const birthHour = searchParams.get("birthHour");
    const birthMinute = searchParams.get("birthMinute");
    const gender = searchParams.get("gender");
    const name = searchParams.get("name") || "我";
    
    if (birthDate && birthHour !== null && gender) {
      setSelfProfileData({
        name,
        birth_date: birthDate,
        birth_hour: parseInt(birthHour),
        birth_minute: parseInt(birthMinute || "0"),
        gender: gender as "男" | "女",
      });
      return;
    }
    
    // Fallback: fetch profile data from database
    const fetchProfile = async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("display_name, birth_date, birth_hour, birth_minute, gender")
        .eq("id", user.id)
        .single();
      if (data?.birth_date && data?.birth_hour !== null && data?.gender) {
        const genderMap: Record<string, "男" | "女"> = { male: "男", female: "女", "男": "男", "女": "女" };
        setSelfProfileData({
          name: data.display_name || "我",
          birth_date: data.birth_date,
          birth_hour: data.birth_hour!,
          birth_minute: data.birth_minute || 0,
          gender: genderMap[data.gender] || "男",
        });
      }
    };
    fetchProfile();
  }, [selfMode, searchParams]);

  // Track if we've already initiated self client creation to prevent duplicates
  const selfClientInitiated = useRef(false);

  // Auto-select or create self client when in self mode
  useEffect(() => {
    const initSelfClient = async () => {
      if (!selfMode || !selfProfileData || selfClientReady) return;
      
      // Prevent duplicate calls using ref
      if (selfClientInitiated.current) return;
      selfClientInitiated.current = true;
      
      const clientIdFromUrl = searchParams.get("clientId");
      if (clientIdFromUrl) {
        setSelfClientReady(true);
        return;
      }
      
      try {
        const realClient = await getOrCreateSelfClient(selfProfileData);
        setSelectedClient(realClient);
        setSelfClientReady(true);
      } catch (err) {
        console.error("Failed to get/create self client:", err);
        selfClientInitiated.current = false;
        toast({ title: dt.cannotCreateProfile, variant: "destructive" });
      }
    };
    
    initSelfClient();
  }, [selfMode, selfProfileData, selfClientReady, getOrCreateSelfClient, searchParams, toast]);

  // Load consultation messages from URL param
  const loadConsultationFromUrl = useCallback(async (consultationId: string) => {
    try {
      const messages = await getInterpretations(consultationId);
      setCurrentConsultationId(consultationId);
      setLoadedMessages(messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })));
      toast({ title: "已加载历史记录" });
    } catch (err) {
      console.error("Failed to load consultation:", err);
    }
  }, [getInterpretations, toast]);

  // Auto-select client from URL param and load consultation if specified
  useEffect(() => {
    const clientId = searchParams.get("clientId");
    const consultationId = searchParams.get("consultationId");
    
    // Load client from clientId if provided (update even if another client is selected)
    if (clientId && clients.length > 0) {
      const client = clients.find((c) => c.id === clientId);
      if (client && client.id !== selectedClient?.id) {
        setSelectedClient(client);
      }
    }
    
    // Load consultation messages if consultationId is provided
    if (consultationId && consultationId !== currentConsultationId) {
      loadConsultationFromUrl(consultationId);
      // Auto-open AI drawer when loading from history
      setChatDrawerOpen(true);
    }
  }, [searchParams, clients, selectedClient?.id, currentConsultationId, loadConsultationFromUrl]);

  // Compute chart date - only if birth hour is known
  const chartDate = useMemo(() => {
    if (!selectedClient || selectedClient.birth_hour === null) return null;
    const { year, month, day } = parseYmd(selectedClient.birth_date);
    return makeBeijingDate({
      year,
      month,
      day,
      hour: selectedClient.birth_hour,
      minute: selectedClient.birth_minute || 0,
    });
  }, [selectedClient]);

  // Generate chart - only possible with known birth hour
  const chart = useMemo(() => {
    if (!chartDate || !selectedClient || selectedClient.birth_hour === null) return null;
    const gender = selectedClient.gender === "男" ? Gender.MALE : Gender.FEMALE;
    return generateChart(chartDate, ChartType.LIFETIME, selectedClient.name, gender);
  }, [chartDate, selectedClient]);

  // Lunar date
  const lunar = useMemo(() => {
    if (!chartDate) return null;
    return getLunarDate(chartDate);
  }, [chartDate]);

  // 计算当前流运柱（大运、流年、流月、流日）
  const cyclePillars = useMemo<CyclePillarData | undefined>(() => {
    if (!chart) return undefined;
    const now = new Date();
    const currentLunarYear = getLunarYear(now.getFullYear(), now.getMonth() + 1, now.getDate());
    
    // 大运：找到当前所处的大运
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
    
    // 流年：当前年的干支
    const liuNian = getYearGanZhi(now);
    
    // 流月：当前月的干支
    const yearGanZhi = getYearGanZhi(now);
    const liuYue = getMonthGanZhi(now, yearGanZhi.ganIdx);
    
    // 流日：当前日的干支
    const liuRi = getDayGanZhi(now);
    
    return { daYun, liuNian, liuYue, liuRi };
  }, [chart]);

  // Client handlers
  const handleSaveClient = async (clientData: Omit<Client, "id" | "created_at" | "updated_at">) => {
    try {
      if (editingClient) {
        await updateClient(editingClient.id, clientData);
        if (selectedClient?.id === editingClient.id) {
          setSelectedClient({ ...selectedClient, ...clientData } as Client);
        }
        toast({ title: dt.clientUpdated });
      } else {
        const newClient = await addClient(clientData);
        setSelectedClient(newClient);
        toast({ title: dt.clientAdded });
      }
    } catch (err) {
      toast({ title: dt.saveFailed, variant: "destructive" });
      throw err;
    }
  };

  const handleDeleteClient = async (client: Client) => {
    await deleteClient(client.id);
    if (selectedClient?.id === client.id) setSelectedClient(null);
  };

  // Consultation handlers
  const handleSaveConsultation = useCallback(
    async (topic?: string, mentionedClientIds?: string[]): Promise<string | null> => {
      if (!chartDate || !chart || !selectedClient) return null;

      // Build display title for the history list
      let title = selectedClient.name;
      if (mentionedClientIds && mentionedClientIds.length > 0) {
        const mentionedNames = clients
          .filter((c) => mentionedClientIds.includes(c.id))
          .map((c) => c.name)
          .join(", ");
        if (mentionedNames) title += ` + ${mentionedNames}`;
      }
      if (topic && topic !== "综合") {
        title += ` - ${topic}${dt.analysisSuffix}`;
      } else {
        title += ` - ${dt.destinyConsultation}`;
      }

      // Save with title (display) and topic (category enum or null)
      const id = await saveDestinyConsultation(selectedClient.id, chartDate, chart, {
        title,
        topic: topic ?? null,  // topic must be valid enum or null to satisfy DB constraint
        mentionedClientIds,
      });
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

  const handleLoadHistory = useCallback(
    async (consultationId: string, messages: Message[]) => {
      setCurrentConsultationId(consultationId);
      setLoadedMessages(messages);
      toast({ title: dt.historyLoaded });
    },
    [toast],
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
            <h1 className="text-lg sm:text-xl font-bold flex-1">{dt.pageTitle}</h1>
            {/* <BaziEncyclopedia /> */}
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
                <span className="font-medium text-sm">{dt.clientInfo}</span>
                <div className="flex gap-2">
                  {selectedClient && (isAdmin || isSubscriber) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigate(`/destiny/history?clientId=${selectedClient.id}`);
                      }}
                    >
                      <History className="h-4 w-4 mr-1" />
                      {dt.history}
                    </Button>
                  )}
                </div>
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
                      {/* Hide edit button in self mode */}
                      {!selfMode && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => navigate(`/clients/${selectedClient.id}/edit?redirect=${encodeURIComponent(`/destiny?clientId=${selectedClient.id}&skipLoading=1`)}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{format(safeParseDate(selectedClient.birth_date), "yyyy年MM月dd日")}</span>
                        {/* 农历信息 */}
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
                          <span className="text-amber-600">{dt.timeUnknown}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Change Client Button - hide in self mode */}
                  {!selfMode && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate("/clients?selectMode=destiny")}
                    >
                      {dt.changeClient}
                    </Button>
                  )}
                  
                  {/* Back to settings button in self mode */}
                  {selfMode && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate("/settings")}
                    >
                      {dt.backToSettings}
                    </Button>
                  )}
                  
                  {/* Generate/View Report Button */}
                  {chart && (
                    existingReport ? (
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => {
                          if (!selectedClient) return;
                          navigate(`/destiny/report?clientId=${selectedClient.id}&reportId=${existingReport.id}`);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        {dt.viewReport}
                      </Button>
                    ) : (
                      <Button
                        className="w-full gap-2"
                        onClick={() => {
                          if (!selectedClient) return;
                          navigate(`/destiny/report?clientId=${selectedClient.id}`);
                        }}
                      >
                        <FileText className="h-4 w-4" />
                        {dt.generateReport}
                      </Button>
                    )
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{dt.selectClientAlert}</AlertDescription>
                  </Alert>
                  <Button
                    className="w-full"
                    onClick={() => navigate("/clients?selectMode=destiny")}
                  >
                    <User className="h-4 w-4 mr-2" />
                    {dt.selectClient}
                  </Button>
                </div>
              )}
            </div>

            {/* Mode Switch - only when birth time is known and user can switch */}
             {selectedClient && selectedClient.birth_hour !== null && chart && (
               <div className="flex rounded-lg bg-muted p-1">
                 <button
                   className={cn(
                     'flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                     viewMode === 'simplified'
                       ? 'bg-background text-foreground shadow-sm'
                       : 'text-muted-foreground hover:text-foreground'
                   )}
                   onClick={() => setViewMode('simplified')}
                 >
                   {dt.simplifiedView}
                 </button>
                 <button
                   className={cn(
                     'flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                     viewMode === 'professional'
                       ? 'bg-background text-foreground shadow-sm'
                       : 'text-muted-foreground hover:text-foreground'
                   )}
                   onClick={() => setViewMode('professional')}
                 >
                   {dt.professionalView}
                 </button>
               </div>
             )}

            {/* Chart Info - when birth time is known */}
            {chart && lunar && selectedClient && (
              <>
                {/* 奇门信息卡片 - only in professional mode */}
                {viewMode === 'professional' && (
                <div className="bg-card rounded-lg p-4 border border-border">
                  <h3 className="text-sm font-medium mb-3">{dt.qimenInfo}</h3>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium text-muted-foreground py-1.5 w-16 text-xs">{dt.destinyType}</TableCell>
                        <TableCell className="py-1.5 text-sm">
                          {selectedClient.gender === "男" ? dt.maleFate : dt.femaleFate}
                          <span className="text-muted-foreground ml-2">
                            {getZodiac(chart.pillars.year.zhiIdx)}{dt.yearBorn}
                          </span>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-muted-foreground py-1.5 text-xs">{dt.mingGua}</TableCell>
                        <TableCell className="py-1.5 text-sm">
                          {(() => {
                            const gender = selectedClient.gender === "男" ? Gender.MALE : Gender.FEMALE;
                            const mingGua = calculateMingGua(chart.date.getFullYear(), gender);
                            return `${mingGua.name}${dt.guaChar}`;
                          })()}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-muted-foreground py-1.5 text-xs">{dt.juShu}</TableCell>
                        <TableCell className="py-1.5 text-sm">
                          {chart.yinYang === "Yin" ? dt.yinDun : dt.yangDun}{dt.dunSuffix}{chart.juNum}{dt.juSuffix}
                          {chart.isFuYin && (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                              {dt.fuYin}
                            </span>
                          )}
                          {!chart.isFuYin && chart.isStarFuYin && (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                              {dt.xingFuYin}
                            </span>
                          )}
                          {!chart.isFuYin && chart.isDoorFuYin && (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                              {dt.menFuYin}
                            </span>
                          )}
                          {chart.isFanYin && (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300">
                              {dt.fanYin}
                            </span>
                          )}
                          {!chart.isFanYin && chart.isStarFanYin && (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                              {dt.xingFanYin}
                            </span>
                          )}
                          {!chart.isFanYin && chart.isDoorFanYin && (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                              {dt.menFanYin}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-muted-foreground py-1.5 text-xs">{dt.zhiFu}</TableCell>
                        <TableCell className="py-1.5 text-sm">{chart.zhiFu}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-muted-foreground py-1.5 text-xs">{dt.zhiShi}</TableCell>
                        <TableCell className="py-1.5 text-sm">{chart.zhiShi}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-muted-foreground py-1.5 text-xs">{dt.xunShou}</TableCell>
                        <TableCell className="py-1.5 text-sm">{chart.xunShou}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-muted-foreground py-1.5 text-xs">{dt.kongWang}</TableCell>
                        <TableCell className="py-1.5 text-sm">{chart.voidBranches}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-muted-foreground py-1.5 text-xs">{dt.maXing}</TableCell>
                        <TableCell className="py-1.5 text-sm">{chart.horseBranch}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-muted-foreground py-1.5 text-xs">{dt.jieQi}</TableCell>
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
                                <span className="text-muted-foreground ml-1">{dt.yueJiang}</span>
                              </>
                            );
                          })()}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                )}

                {/* === SIMPLIFIED VIEW === */}
                {viewMode === 'simplified' && (
                  <>
                    <FourPillarsDisplay pillars={chart.pillars} cyclePillars={cyclePillars} />
                    <SimplifiedDestinyAnalysis 
                      pillars={chart.pillars} 
                      includeHour={true} 
                      chart={chart}
                      restrictedMode={isNormal}
                      gender={selectedClient?.gender as '男' | '女'}
                    />
                    {/* Phone energy - available for all */}
                    {selectedClient.phone_number && (
                      <PhoneEnergySection phoneNumber={selectedClient.phone_number} />
                    )}
                  </>
                )}

                {/* === PROFESSIONAL VIEW === */}
                {viewMode === 'professional' && (
                  <>
                    {/* === 六爻 - subscriber only, placed above 四柱 === */}
                    {(isAdmin || isSubscriber) ? (
                      <LiuYaoDisplay pillars={chart.pillars} />
                    ) : null}

                    {/* 八字排盘 - all tiers */}
                    <FourPillarsDisplay pillars={chart.pillars} cyclePillars={cyclePillars} />
                    
                    {/* 奇门盘 - all tiers */}
                    <div className="order-2 lg:order-2 py-3">{chart && selectedClient && <ChartGrid data={chart} />}</div>

                    {/* === Subscriber content === */}
                    {(isAdmin || isSubscriber) ? (
                      <>
                        {/* 大运 */}
                        <CyclesDisplay
                          bigCycles={chart.bigCycles}
                          annualCycles={chart.annualCycles}
                          birthYear={chart.date.getFullYear()}
                        />
                        {/* 运势走势图 */}
                        {(() => {
                          const baziForTimeline = analyzeBaziPattern(chart.pillars, true);
                          return (
                            <FortuneTimeline
                              bigCycles={chart.bigCycles}
                              annualCycles={chart.annualCycles}
                              favorableElements={baziForTimeline.favorableGods.map(g => g.elementName)}
                              unfavorableElements={baziForTimeline.unfavorableGods.map(g => g.elementName)}
                              birthYear={chart.date.getFullYear()}
                              dayStemIdx={chart.pillars.day.ganIdx}
                            />
                          );
                        })()}

                        {/* 干支关系, 格局分析, 八字分析, 奇门分析 */}
                        <BranchRelationsDisplay pillars={chart.pillars} includeHour={true} />
                        <GeJuDisplay pillars={chart.pillars} includeHour={true} />
                        <BaziPatternDisplay pillars={chart.pillars} includeHour={true} />
                        <QimenAnalysisDisplay chart={chart} gender={selectedClient?.gender as '男' | '女'} />
                        
                        {selectedClient.phone_number && (
                          <PhoneEnergySection phoneNumber={selectedClient.phone_number} />
                        )}

                        {/* 消费分析 */}
                        <SpendingAnalysisDisplay chart={chart} />

                        {/* 创富, 语商, 四害 */}
                        <WealthAnalysisDisplay chart={chart} />
                        <SpeechAnalysisDisplay chart={chart} />
                        {!siHaiDisabled && <SiHaiAnalysisDisplay chart={chart} />}
                      </>
                    ) : (
                      /* Normal member: locked content with unlock option */
                      <LockedContent isLocked={true} requiredTier={dt.subscriberTier}>
                        <div className="space-y-4">
                          <CyclesDisplay bigCycles={chart.bigCycles} annualCycles={chart.annualCycles} birthYear={chart.date.getFullYear()} />
                          {(() => {
                            const baziForTimeline = analyzeBaziPattern(chart.pillars, true);
                            return (
                              <FortuneTimeline
                                bigCycles={chart.bigCycles}
                                annualCycles={chart.annualCycles}
                                favorableElements={baziForTimeline.favorableGods.map(g => g.elementName)}
                                unfavorableElements={baziForTimeline.unfavorableGods.map(g => g.elementName)}
                                birthYear={chart.date.getFullYear()}
                                dayStemIdx={chart.pillars.day.ganIdx}
                              />
                            );
                          })()}
                          <BranchRelationsDisplay pillars={chart.pillars} includeHour={true} />
                          <GeJuDisplay pillars={chart.pillars} includeHour={true} />
                          <BaziPatternDisplay pillars={chart.pillars} includeHour={true} />
                          <QimenAnalysisDisplay chart={chart} gender={selectedClient?.gender as '男' | '女'} />
                        </div>
                      </LockedContent>
                    )}

                  </>
                )}
              </>
            )}
            
            {/* Display for unknown birth time - only show 6 characters of Bazi */}
            {selectedClient && selectedClient.birth_hour === null && (
              <div className="space-y-4">
                <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/30">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800 dark:text-amber-200">
                    {dt.unknownBirthTimeAlert}
                  </AlertDescription>
                </Alert>
                
                {(() => {
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
                        {/* 六爻 above 四柱 for no-hour charts */}
                        {viewMode === 'professional' && (
                          (isAdmin || isSubscriber) ? (
                            <LiuYaoDisplay pillars={partialPillars} hideHour={true} />
                          ) : (
                            <LockedContent isLocked={true} requiredTier={dt.subscriberTier}>
                              <LiuYaoDisplay pillars={partialPillars} hideHour={true} />
                            </LockedContent>
                          )
                        )}

                        <FourPillarsDisplay pillars={partialPillars} hideHour={true} />
                        
                        {/* Simplified analysis for no-hour charts */}
                        <SimplifiedDestinyAnalysis 
                          pillars={partialPillars} 
                          includeHour={false}
                          restrictedMode={isNormal}
                          gender={selectedClient?.gender as '男' | '女'}
                        />
                        
                        {/* Professional content for no-hour charts */}
                        {viewMode === 'professional' && (
                          <>
                            {(isAdmin || isSubscriber) ? (
                              <>
                                <BranchRelationsDisplay pillars={partialPillars} includeHour={false} />
                                <GeJuDisplay pillars={partialPillars} includeHour={false} />
                                <BaziPatternDisplay pillars={partialPillars} includeHour={false} />
                              </>
                            ) : (
                              <LockedContent isLocked={true} requiredTier={dt.subscriberTier}>
                                <div className="space-y-4">
                                  <BranchRelationsDisplay pillars={partialPillars} includeHour={false} />
                                  <GeJuDisplay pillars={partialPillars} includeHour={false} />
                                  <BaziPatternDisplay pillars={partialPillars} includeHour={false} />
                                </div>
                              </LockedContent>
                            )}
                        </>
                      )}
                    </>
                  );
                })()}

                {/* Phone energy analysis - available regardless of birth time */}
                {selectedClient.phone_number && (
                  <PhoneEnergySection phoneNumber={selectedClient.phone_number} />
                )}
              </div>
            )}

            {/* Feedback Section - always show when client selected */}
              {selectedClient && (
                <div className="mt-2 mb-4">
                  <ChartFeedbackSection chartType={dt.feedbackChartType} />
                </div>
              )}
          </div>

          {/* Center - Chart Grid */}
          {/* <div className="order-2 lg:order-2">{chart && selectedClient && <ChartGrid data={chart} />}</div> */}

          {/* Floating AI Button - only for VIP+ */}
          {chart && selectedClient && canUseAI && (
            <Button
              className="fixed bottom-16 right-6 w-fit p-4 shadow-lg z-50"
              size="icon"
              onClick={() => setChatDrawerOpen(true)}
            >
              {dt.aiInterpret} <MessageSquare className="h-6 w-6" />
            </Button>
          )}
          
          {/* Upgrade prompt for non-VIP+ users */}
          {chart && selectedClient && !canUseAI && (
            <Button
              className="fixed bottom-16 right-6 h-14 rounded-full shadow-lg z-50 gap-2 bg-amber-500 hover:bg-amber-600"
              onClick={() => navigate('/pricing')}
            >
              <Crown className="h-5 w-5" />
              <span className="text-sm">{dt.upgradeVipAI}</span>
            </Button>
          )}

          {/* AI Chat Drawer - only render for VIP+ */}
          {chart && selectedClient && canUseAI && (
            <AIChatDrawer
              open={chatDrawerOpen}
              onOpenChange={setChatDrawerOpen}
              chart={chart}
              clientName={selectedClient.name}
              chartMode="命理盘"
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

        {/* Client Form */}
        <ClientForm
          open={showClientForm}
          onClose={() => {
            setShowClientForm(false);
            setEditingClient(null);
          }}
          onSave={handleSaveClient}
          client={editingClient}
        />
      </div>

      {/* Loading Overlay */}
      <DestinyLoadingOverlay
        isOpen={showLoadingOverlay}
        onComplete={handleLoadingComplete}
      />



    </div>
  );
};

export default Destiny;
