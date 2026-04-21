import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, FileText, Loader2, CheckCircle, Download, ChevronDown, ChevronUp, Lock, CreditCard, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import jsPDF from 'jspdf';

import { useAuth } from '@/contexts/AuthContext';

import { useClients } from '@/hooks/useClients';
import { useClientReports, ClientReport } from '@/hooks/useClientReports';
import { useMemberPermissions } from '@/hooks/useMemberPermissions';
import { generateChart } from '@/lib/qimenEngine';
import { parseYmd, makeBeijingDate } from '@/lib/time/beijing';
import { getFourPillars } from '@/lib/ganzhiHelper';
import { analyzeBaziPattern, ELEMENT_NAMES } from '@/lib/baziPatternAnalysis';
import { ChartType, Gender } from '@/types';
import { toast } from 'sonner';
import { OPPOSITE_PALACES } from '@/lib/constants';
import { analyzeLiuYao, YAO_NAMES, YAO_TRAITS } from '@/lib/liuYaoUtils';

const SECTION_ICONS: Record<string, string> = {
  '性格特质': '🧠',
  '关系运势': '❤️',
  '健康提醒': '🏥',
  '适合行业': '💼',
  '财富分析': '💰',
  '学业进修': '📚',
  '贵人运势': '🤝',
  '运势走向': '📈',
  '需要注意的事项': '⚠️',
};

const SECTION_ORDER = ['性格特质', '关系运势', '健康提醒', '适合行业', '财富分析', '学业进修', '贵人运势', '运势走向', '需要注意的事项'];

const DestinyReport: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('clientId');
  const reportId = searchParams.get('reportId');
  const { user } = useAuth();
  const { clients } = useClients();
  const { isNormal, isAdmin } = useMemberPermissions();
  
  const { generating, currentReport, setCurrentReport, generateReport, fetchReports, reports, getQuotaInfo } = useClientReports(clientId || undefined);

  const [progress, setProgress] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(SECTION_ORDER));
  const [started, setStarted] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'idle' | 'confirm' | 'paid'>('idle');
  const [quotaInfo, setQuotaInfo] = useState<{ canGenerate: boolean; requiresPayment?: boolean } | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [regenPaymentStep, setRegenPaymentStep] = useState<'idle' | 'confirm' | 'generating'>('idle');
  const reportContentRef = useRef<HTMLDivElement>(null);
  

  const selectedClient = useMemo(() => clients.find(c => c.id === clientId), [clients, clientId]);

  // Check quota on mount for new reports
  useEffect(() => {
    if (reportId) return; // viewing existing, no quota needed
    const checkQuota = async () => {
      const info = await getQuotaInfo();
      setQuotaInfo(info);
      setPaymentStep('paid'); // Always allow generation
    };
    checkQuota();
  }, [reportId, getQuotaInfo]);

  // If viewing existing report, load it
  useEffect(() => {
    if (reportId && clientId) {
      fetchReports();
    }
  }, [reportId, clientId]);

  useEffect(() => {
    if (reportId && reports.length > 0) {
      const existing = reports.find(r => r.id === reportId);
      if (existing) {
        setCurrentReport(existing);
        setProgress(100);
      }
    }
  }, [reportId, reports, setCurrentReport]);


  // Auto-start generation when payment is done (or not needed)
  useEffect(() => {
    if (started || reportId || !selectedClient || !clientId || !user) return;
    if (paymentStep !== 'paid') return;
    setStarted(true);

    const { year, month, day } = parseYmd(selectedClient.birth_date);
    const hour = selectedClient.birth_hour ?? 12;
    const minute = selectedClient.birth_minute || 0;
    const chartDate = makeBeijingDate({ year, month, day, hour, minute });
    const gender = selectedClient.gender === '男' ? Gender.MALE : Gender.FEMALE;
    const chart = generateChart(chartDate, ChartType.LIFETIME, selectedClient.name, gender);

    if (!chart) return;

    const palaceInfo = chart.palaces
      .filter(p => p.id !== 5)
      .map(p => {
        const tags: string[] = [];
        if (p.empty) tags.push('空亡');
        if (p.horse) tags.push('马星');
        if (p.isMenPo) tags.push(`${p.door}门迫`);
        if (p.skyStatus?.isMu) tags.push(`${p.skyStem}入墓(天盘)`);
        if (p.skyStatus?.isXing) tags.push(`${p.skyStem}击刑(天盘)`);
        if (p.sky2Status?.isMu && p.skyStem2) tags.push(`${p.skyStem2}入墓(天盘)`);
        if (p.sky2Status?.isXing && p.skyStem2) tags.push(`${p.skyStem2}击刑(天盘)`);
        if (p.earthStatus?.isMu) tags.push(`${p.earthStem}入墓(地盘)`);
        if (p.earthStatus?.isXing) tags.push(`${p.earthStem}击刑(地盘)`);
        if (p.earth2Status?.isMu && p.earthStem2) tags.push(`${p.earthStem2}入墓(地盘)`);
        if (p.earth2Status?.isXing && p.earthStem2) tags.push(`${p.earthStem2}击刑(地盘)`);
        const tagStr = tags.length > 0 ? ` [${tags.join(', ')}]` : '';
        return `${p.name}宫: 天盘${p.skyStem}${p.skyStem2 || ''} 地盘${p.earthStem}${p.earthStem2 || ''} ${p.star} ${p.door} ${p.god}${tagStr}`;
      })
      .join('\n');

    // 四害检测
    const siHaiItems: string[] = [];
    chart.palaces.forEach(p => {
      if (p.empty) siHaiItems.push(`空亡: ${p.name}宫落空亡`);
      if (p.skyStatus?.isMu) siHaiItems.push(`入墓: ${p.skyStem}入墓于${p.name}宫`);
      if (p.sky2Status?.isMu && p.skyStem2) siHaiItems.push(`入墓: ${p.skyStem2}入墓于${p.name}宫`);
      if (p.earthStatus?.isMu) siHaiItems.push(`入墓: ${p.earthStem}入墓于${p.name}宫（地盘）`);
      if (p.skyStatus?.isXing) siHaiItems.push(`击刑: ${p.skyStem}击刑于${p.name}宫`);
      if (p.sky2Status?.isXing && p.skyStem2) siHaiItems.push(`击刑: ${p.skyStem2}击刑于${p.name}宫`);
      if (p.earthStatus?.isXing) siHaiItems.push(`击刑: ${p.earthStem}击刑于${p.name}宫（地盘）`);
      if (p.isMenPo) siHaiItems.push(`门迫: ${p.door}入${p.name}宫受迫`);
    });
    const siHaiStr = siHaiItems.length > 0 ? siHaiItems.join('\n') : '盘中未见四害';

    const currentYear = new Date().getFullYear();
    const birthYear = chart.date.getFullYear();
    const currentBigCycleIdx = chart.bigCycles.findIndex((cycle, idx) => {
      if (idx === chart.bigCycles.length - 1) return true;
      return currentYear >= cycle.year && (idx === chart.bigCycles.length - 1 || currentYear < chart.bigCycles[idx + 1].year);
    });
    const bigCyclesStr = chart.bigCycles.map((c, idx) => {
      const age = idx === 0 ? '出生' : `${c.year - birthYear}岁`;
      return `${age}: ${c.gan}${c.zhi} (${c.desc})${idx === currentBigCycleIdx ? ' ←当前' : ''}`;
    }).join('\n');

    // 找命宫：日干落在天盘的宫位
    const dayStem = chart.pillars.day.gan;
    const lifePalace = chart.palaces.find(p => p.id !== 5 && (p.skyStem === dayStem || p.skyStem2 === dayStem));
    const lifePalaceStr = lifePalace 
      ? `${lifePalace.name}宫（天盘${lifePalace.skyStem}${lifePalace.skyStem2 || ''} 地盘${lifePalace.earthStem}${lifePalace.earthStem2 || ''} ${lifePalace.star} ${lifePalace.door} ${lifePalace.god}）`
      : '未找到';

    // 八字十神分析
    const baziResult = analyzeBaziPattern(chart.pillars, true);
    const tenGodsStr = baziResult.stemAnalyses
      .map(s => `${s.pillarName}${s.stem}: ${s.tenGodName}(${s.elementName}) ${s.isRooted ? '有根' : '无根'}`)
      .join('\n');
    
    const strengthStr = `${baziResult.dayMaster.strength === 'strong' ? '身强' : baziResult.dayMaster.strength === 'weak' ? '身弱' : '中和'} (${baziResult.dayMaster.strengthAnalysis.strengthReason})`;
    
    const favorableStr = baziResult.favorableGods
      .map(g => `第${g.priority}喜用: ${g.elementName}(${g.tenGods.join('/')}) - ${g.reason}`)
      .join('\n');
    const unfavorableStr = baziResult.unfavorableGods
      .map(g => `第${g.priority}忌神: ${g.elementName}(${g.tenGods.join('/')}) - ${g.reason}`)
      .join('\n');
    
    const patternStr = baziResult.pattern.isEstablished 
      ? `${baziResult.pattern.name} (${baziResult.pattern.description})` 
      : `未成格 (${baziResult.pattern.failureReason || ''})`;

    // 命宫对宫信息
    const lifePalaceId = lifePalace?.id;
    const oppPalaceId = lifePalaceId ? OPPOSITE_PALACES[lifePalaceId] : undefined;
    const oppPalace = oppPalaceId ? chart.palaces.find(p => p.id === oppPalaceId) : undefined;
    const oppPalaceStr = oppPalace 
      ? `${oppPalace.name}宫（天盘${oppPalace.skyStem}${oppPalace.skyStem2 || ''} ${oppPalace.star} ${oppPalace.door} ${oppPalace.god}）`
      : '无';

    // 六合宫位（关系分析用）
    const liuHePalace = chart.palaces.find(p => p.god === '六合');
    const liuHePalaceStr = liuHePalace
      ? `${liuHePalace.name}宫（天盘${liuHePalace.skyStem}${liuHePalace.skyStem2 || ''} 地盘${liuHePalace.earthStem}${liuHePalace.earthStem2 || ''} ${liuHePalace.star} ${liuHePalace.door} ${liuHePalace.god}）`
      : '未找到';

    // 天干五合分析（关系分析用）
    const TIAN_GAN_WU_HE: [string, string, string][] = [
      ['甲', '己', '甲己合（土）'],
      ['乙', '庚', '乙庚合（金）'],
      ['丙', '辛', '丙辛合（水）'],
      ['丁', '壬', '丁壬合（木）'],
      ['戊', '癸', '戊癸合（火）'],
    ];
    // Check day stem's 五合 partner and find it in the chart palaces
    const dayWuHe = TIAN_GAN_WU_HE.find(([a, b]) => a === dayStem || b === dayStem);
    const dayWuHePartner = dayWuHe ? (dayWuHe[0] === dayStem ? dayWuHe[1] : dayWuHe[0]) : null;
    const dayWuHeName = dayWuHe?.[2] || '';
    const wuHePartnerPalace = dayWuHePartner 
      ? chart.palaces.find(p => p.id !== 5 && (p.skyStem === dayWuHePartner || p.skyStem2 === dayWuHePartner))
      : null;
    const wuHeStr = dayWuHePartner
      ? `日干${dayStem}的五合对象: ${dayWuHePartner}（${dayWuHeName}），落在${wuHePartnerPalace ? `${wuHePartnerPalace.name}宫（${wuHePartnerPalace.star} ${wuHePartnerPalace.door} ${wuHePartnerPalace.god}）` : '天盘未见'}`
      : '无';

    // 命宫与六合宫、五合宫的生克关系
    const PALACE_ELEMENT_MAP: Record<string, string> = {
      '坎': '水', '坤': '土', '震': '木', '巽': '木', '中': '土', '乾': '金', '兑': '金', '艮': '土', '离': '火'
    };
    const lifePalaceElement = lifePalace ? PALACE_ELEMENT_MAP[lifePalace.name] || '' : '';
    const liuHePalaceElement = liuHePalace ? PALACE_ELEMENT_MAP[liuHePalace.name] || '' : '';
    const wuHePalaceElement = wuHePartnerPalace ? PALACE_ELEMENT_MAP[wuHePartnerPalace.name] || '' : '';

    const getRelation = (a: string, b: string) => {
      const shengMap: Record<string, string> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
      const keMap: Record<string, string> = { '木': '土', '火': '金', '土': '水', '金': '木', '水': '火' };
      if (a === b) return '比和';
      if (shengMap[a] === b) return `${a}生${b}`;
      if (shengMap[b] === a) return `${b}生${a}`;
      if (keMap[a] === b) return `${a}克${b}`;
      if (keMap[b] === a) return `${b}克${a}`;
      return '';
    };
    const liuHeRelation = lifePalaceElement && liuHePalaceElement ? `命宫(${lifePalaceElement})与六合宫(${liuHePalaceElement}): ${getRelation(lifePalaceElement, liuHePalaceElement)}` : '';
    const wuHeRelation = lifePalaceElement && wuHePalaceElement ? `命宫(${lifePalaceElement})与五合宫(${wuHePalaceElement}): ${getRelation(lifePalaceElement, wuHePalaceElement)}` : '';

    // 四害宫位汇总（健康分析用）
    const siHaiPalaces: string[] = [];
    chart.palaces.forEach(p => {
      const harms: string[] = [];
      if (p.empty) harms.push('空亡');
      if (p.isMenPo) harms.push('门迫');
      if (p.skyStatus?.isMu) harms.push(`${p.skyStem}入墓`);
      if (p.sky2Status?.isMu && p.skyStem2) harms.push(`${p.skyStem2}入墓`);
      if (p.earthStatus?.isMu) harms.push(`${p.earthStem}入墓`);
      if (p.skyStatus?.isXing) harms.push(`${p.skyStem}击刑`);
      if (p.sky2Status?.isXing && p.skyStem2) harms.push(`${p.skyStem2}击刑`);
      if (p.earthStatus?.isXing) harms.push(`${p.earthStem}击刑`);
      if (harms.length > 0) {
        siHaiPalaces.push(`${p.name}宫(${PALACE_ELEMENT_MAP[p.name] || ''}): ${harms.join('、')} - ${p.star} ${p.door} ${p.god}`);
      }
    });
    const siHaiPalaceStr = siHaiPalaces.length > 0 ? siHaiPalaces.join('\n') : '盘中未见四害';

    // 流年信息
    const annualCyclesStr = chart.annualCycles
      .slice(0, 20)
      .map(c => `${c.year}年(${c.age}岁): ${c.gan}${c.zhi} ${c.desc}`)
      .join('\n');

    const chartContext = `
客户: ${selectedClient.name}
性别: ${selectedClient.gender}
出生: ${selectedClient.birth_date} ${selectedClient.birth_hour !== null ? `${selectedClient.birth_hour}:${(selectedClient.birth_minute || 0).toString().padStart(2, '0')}` : '时辰未知'}
四柱: ${chart.pillars.year.gan}${chart.pillars.year.zhi} ${chart.pillars.month.gan}${chart.pillars.month.zhi} ${chart.pillars.day.gan}${chart.pillars.day.zhi} ${chart.pillars.hour.gan}${chart.pillars.hour.zhi}
日干: ${dayStem} (${ELEMENT_NAMES[baziResult.dayMaster.element]})
身强/身弱: ${strengthStr}
格局: ${patternStr}

【八字十神分析】
${tenGodsStr}

【喜用神】
${favorableStr}

【忌神】
${unfavorableStr}

局数: ${chart.yinYang === 'Yin' ? '阴' : '阳'}遁${chart.juNum}局
命宫（日干${dayStem}天盘所落宫位）: ${lifePalaceStr}
命宫对宫: ${oppPalaceStr}
六合宫位: ${liuHePalaceStr}
天干五合: ${wuHeStr}
${liuHeRelation ? `命宫与六合关系: ${liuHeRelation}` : ''}
${wuHeRelation ? `命宫与五合关系: ${wuHeRelation}` : ''}
值符: ${chart.zhiFu}
值使: ${chart.zhiShi}
空亡: ${chart.voidBranches}
马星: ${chart.horseBranch}

九宫信息:
${palaceInfo}

四害检测（空亡/入墓/击刑/门迫）:
${siHaiStr}

【四害宫位详情（健康分析用）】
${siHaiPalaceStr}

【大运排盘】
${bigCyclesStr}

【流年排盘（近20年）】
${annualCyclesStr}

【六爻分析（性格层次）】
${(() => {
      const liuYao = analyzeLiuYao(chart.pillars);
      const lines = [
        ...liuYao.summary,
        ...liuYao.personalityInsights,
      ];
      return lines.join('\n');
    })()}
`;


    const title = `${selectedClient.name} - 命理分析报告`;
    generateReport(chartContext, selectedClient.name, clientId, title);
  }, [started, reportId, selectedClient, clientId, user, generateReport, paymentStep]);

  // Progress animation
  useEffect(() => {
    if (!generating) {
      if (currentReport?.status === 'completed') setProgress(100);
      return;
    }
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => prev >= 90 ? prev : prev + Math.random() * 8);
    }, 800);
    return () => clearInterval(interval);
  }, [generating, currentReport]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section); else next.add(section);
      return next;
    });
  };

  const handlePaymentConfirm = () => {
    // Simulate payment success (in real app, integrate payment gateway)
    toast.success('付费成功！正在生成报告...');
    setPaymentStep('paid');
  };

  const handleRegenerate = async () => {
    if (!selectedClient || !clientId || !user || regenerating) return;
    
    // Always allow generation
    doRegenerate();
  };

  const handleRegenPaymentConfirm = () => {
    toast.success('付费成功！正在重新生成报告...');
    setRegenPaymentStep('generating');
    doRegenerate();
  };

  const doRegenerate = async () => {
    if (!selectedClient || !clientId) return;
    setRegenerating(true);
    setCurrentReport(null);

    const { year, month, day } = parseYmd(selectedClient.birth_date);
    const hour = selectedClient.birth_hour ?? 12;
    const minute = selectedClient.birth_minute || 0;
    const chartDate = makeBeijingDate({ year, month, day, hour, minute });
    const gender = selectedClient.gender === '男' ? Gender.MALE : Gender.FEMALE;
    const chart = generateChart(chartDate, ChartType.LIFETIME, selectedClient.name, gender);

    if (!chart) {
      setRegenerating(false);
      return;
    }

    // Reuse same chart context building logic
    const palaceInfo = chart.palaces
      .filter(p => p.id !== 5)
      .map(p => {
        const tags: string[] = [];
        if (p.empty) tags.push('空亡');
        if (p.horse) tags.push('马星');
        if (p.isMenPo) tags.push(`${p.door}门迫`);
        if (p.skyStatus?.isMu) tags.push(`${p.skyStem}入墓(天盘)`);
        if (p.skyStatus?.isXing) tags.push(`${p.skyStem}击刑(天盘)`);
        if (p.sky2Status?.isMu && p.skyStem2) tags.push(`${p.skyStem2}入墓(天盘)`);
        if (p.sky2Status?.isXing && p.skyStem2) tags.push(`${p.skyStem2}击刑(天盘)`);
        if (p.earthStatus?.isMu) tags.push(`${p.earthStem}入墓(地盘)`);
        if (p.earthStatus?.isXing) tags.push(`${p.earthStem}击刑(地盘)`);
        if (p.earth2Status?.isMu && p.earthStem2) tags.push(`${p.earthStem2}入墓(地盘)`);
        if (p.earth2Status?.isXing && p.earthStem2) tags.push(`${p.earthStem2}击刑(地盘)`);
        const tagStr = tags.length > 0 ? ` [${tags.join(', ')}]` : '';
        return `${p.name}宫: 天盘${p.skyStem}${p.skyStem2 || ''} 地盘${p.earthStem}${p.earthStem2 || ''} ${p.star} ${p.door} ${p.god}${tagStr}`;
      })
      .join('\n');

    const dayStem = chart.pillars.day.gan;
    const baziResult = analyzeBaziPattern(chart.pillars, true);
    const tenGodsStr = baziResult.stemAnalyses
      .map(s => `${s.pillarName}${s.stem}: ${s.tenGodName}(${s.elementName}) ${s.isRooted ? '有根' : '无根'}`)
      .join('\n');
    const strengthStr = `${baziResult.dayMaster.strength === 'strong' ? '身强' : baziResult.dayMaster.strength === 'weak' ? '身弱' : '中和'} (${baziResult.dayMaster.strengthAnalysis.strengthReason})`;
    const favorableStr = baziResult.favorableGods.map(g => `第${g.priority}喜用: ${g.elementName}(${g.tenGods.join('/')}) - ${g.reason}`).join('\n');
    const unfavorableStr = baziResult.unfavorableGods.map(g => `第${g.priority}忌神: ${g.elementName}(${g.tenGods.join('/')}) - ${g.reason}`).join('\n');
    const patternStr = baziResult.pattern.isEstablished ? `${baziResult.pattern.name} (${baziResult.pattern.description})` : `未成格 (${baziResult.pattern.failureReason || ''})`;

    const lifePalace = chart.palaces.find(p => p.id !== 5 && (p.skyStem === dayStem || p.skyStem2 === dayStem));
    const lifePalaceStr = lifePalace ? `${lifePalace.name}宫（天盘${lifePalace.skyStem}${lifePalace.skyStem2 || ''} 地盘${lifePalace.earthStem}${lifePalace.earthStem2 || ''} ${lifePalace.star} ${lifePalace.door} ${lifePalace.god}）` : '未找到';

    const PALACE_ELEMENT_MAP: Record<string, string> = { '坎': '水', '坤': '土', '震': '木', '巽': '木', '中': '土', '乾': '金', '兑': '金', '艮': '土', '离': '火' };
    
    const siHaiItems: string[] = [];
    chart.palaces.forEach(p => {
      if (p.empty) siHaiItems.push(`空亡: ${p.name}宫落空亡`);
      if (p.skyStatus?.isMu) siHaiItems.push(`入墓: ${p.skyStem}入墓于${p.name}宫`);
      if (p.sky2Status?.isMu && p.skyStem2) siHaiItems.push(`入墓: ${p.skyStem2}入墓于${p.name}宫`);
      if (p.earthStatus?.isMu) siHaiItems.push(`入墓: ${p.earthStem}入墓于${p.name}宫（地盘）`);
      if (p.skyStatus?.isXing) siHaiItems.push(`击刑: ${p.skyStem}击刑于${p.name}宫`);
      if (p.sky2Status?.isXing && p.skyStem2) siHaiItems.push(`击刑: ${p.skyStem2}击刑于${p.name}宫`);
      if (p.earthStatus?.isXing) siHaiItems.push(`击刑: ${p.earthStem}击刑于${p.name}宫（地盘）`);
      if (p.isMenPo) siHaiItems.push(`门迫: ${p.door}入${p.name}宫受迫`);
    });
    const siHaiStr = siHaiItems.length > 0 ? siHaiItems.join('\n') : '盘中未见四害';

    const siHaiPalaces: string[] = [];
    chart.palaces.forEach(p => {
      const harms: string[] = [];
      if (p.empty) harms.push('空亡');
      if (p.isMenPo) harms.push('门迫');
      if (p.skyStatus?.isMu) harms.push(`${p.skyStem}入墓`);
      if (p.sky2Status?.isMu && p.skyStem2) harms.push(`${p.skyStem2}入墓`);
      if (p.earthStatus?.isMu) harms.push(`${p.earthStem}入墓`);
      if (p.skyStatus?.isXing) harms.push(`${p.skyStem}击刑`);
      if (p.sky2Status?.isXing && p.skyStem2) harms.push(`${p.skyStem2}击刑`);
      if (p.earthStatus?.isXing) harms.push(`${p.earthStem}击刑`);
      if (harms.length > 0) siHaiPalaces.push(`${p.name}宫(${PALACE_ELEMENT_MAP[p.name] || ''}): ${harms.join('、')} - ${p.star} ${p.door} ${p.god}`);
    });

    const currentYear = new Date().getFullYear();
    const birthYear = chart.date.getFullYear();
    const currentBigCycleIdx = chart.bigCycles.findIndex((cycle, idx) => {
      if (idx === chart.bigCycles.length - 1) return true;
      return currentYear >= cycle.year && (idx === chart.bigCycles.length - 1 || currentYear < chart.bigCycles[idx + 1].year);
    });
    const bigCyclesStr = chart.bigCycles.map((c, idx) => {
      const age = idx === 0 ? '出生' : `${c.year - birthYear}岁`;
      return `${age}: ${c.gan}${c.zhi} (${c.desc})${idx === currentBigCycleIdx ? ' ←当前' : ''}`;
    }).join('\n');

    const oppPalaceId = lifePalace?.id ? OPPOSITE_PALACES[lifePalace.id] : undefined;
    const oppPalace = oppPalaceId ? chart.palaces.find(p => p.id === oppPalaceId) : undefined;
    const oppPalaceStr = oppPalace ? `${oppPalace.name}宫（天盘${oppPalace.skyStem}${oppPalace.skyStem2 || ''} ${oppPalace.star} ${oppPalace.door} ${oppPalace.god}）` : '无';

    const liuHePalace = chart.palaces.find(p => p.god === '六合');
    const liuHePalaceStr = liuHePalace ? `${liuHePalace.name}宫（天盘${liuHePalace.skyStem}${liuHePalace.skyStem2 || ''} 地盘${liuHePalace.earthStem}${liuHePalace.earthStem2 || ''} ${liuHePalace.star} ${liuHePalace.door} ${liuHePalace.god}）` : '未找到';

    const TIAN_GAN_WU_HE: [string, string, string][] = [['甲', '己', '甲己合（土）'], ['乙', '庚', '乙庚合（金）'], ['丙', '辛', '丙辛合（水）'], ['丁', '壬', '丁壬合（木）'], ['戊', '癸', '戊癸合（火）']];
    const dayWuHe = TIAN_GAN_WU_HE.find(([a, b]) => a === dayStem || b === dayStem);
    const dayWuHePartner = dayWuHe ? (dayWuHe[0] === dayStem ? dayWuHe[1] : dayWuHe[0]) : null;
    const dayWuHeName = dayWuHe?.[2] || '';
    const wuHePartnerPalace = dayWuHePartner ? chart.palaces.find(p => p.id !== 5 && (p.skyStem === dayWuHePartner || p.skyStem2 === dayWuHePartner)) : null;
    const wuHeStr = dayWuHePartner ? `日干${dayStem}的五合对象: ${dayWuHePartner}（${dayWuHeName}），落在${wuHePartnerPalace ? `${wuHePartnerPalace.name}宫（${wuHePartnerPalace.star} ${wuHePartnerPalace.door} ${wuHePartnerPalace.god}）` : '天盘未见'}` : '无';

    const lifePalaceElement = lifePalace ? PALACE_ELEMENT_MAP[lifePalace.name] || '' : '';
    const liuHePalaceElement = liuHePalace ? PALACE_ELEMENT_MAP[liuHePalace.name] || '' : '';
    const wuHePalaceElement = wuHePartnerPalace ? PALACE_ELEMENT_MAP[wuHePartnerPalace.name] || '' : '';
    const getRelation = (a: string, b: string) => {
      const shengMap: Record<string, string> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
      const keMap: Record<string, string> = { '木': '土', '火': '金', '土': '水', '金': '木', '水': '火' };
      if (a === b) return '比和';
      if (shengMap[a] === b) return `${a}生${b}`;
      if (shengMap[b] === a) return `${b}生${a}`;
      if (keMap[a] === b) return `${a}克${b}`;
      if (keMap[b] === a) return `${b}克${a}`;
      return '';
    };
    const liuHeRelation = lifePalaceElement && liuHePalaceElement ? `命宫(${lifePalaceElement})与六合宫(${liuHePalaceElement}): ${getRelation(lifePalaceElement, liuHePalaceElement)}` : '';
    const wuHeRelation = lifePalaceElement && wuHePalaceElement ? `命宫(${lifePalaceElement})与五合宫(${wuHePalaceElement}): ${getRelation(lifePalaceElement, wuHePalaceElement)}` : '';

    const annualCyclesStr = chart.annualCycles.slice(0, 20).map(c => `${c.year}年(${c.age}岁): ${c.gan}${c.zhi} ${c.desc}`).join('\n');

    const liuYao = analyzeLiuYao(chart.pillars);

    const chartContext = `
客户: ${selectedClient.name}
性别: ${selectedClient.gender}
出生: ${selectedClient.birth_date} ${selectedClient.birth_hour !== null ? `${selectedClient.birth_hour}:${(selectedClient.birth_minute || 0).toString().padStart(2, '0')}` : '时辰未知'}
四柱: ${chart.pillars.year.gan}${chart.pillars.year.zhi} ${chart.pillars.month.gan}${chart.pillars.month.zhi} ${chart.pillars.day.gan}${chart.pillars.day.zhi} ${chart.pillars.hour.gan}${chart.pillars.hour.zhi}
日干: ${dayStem} (${ELEMENT_NAMES[baziResult.dayMaster.element]})
身强/身弱: ${strengthStr}
格局: ${patternStr}

【八字十神分析】
${tenGodsStr}

【喜用神】
${favorableStr}

【忌神】
${unfavorableStr}

局数: ${chart.yinYang === 'Yin' ? '阴' : '阳'}遁${chart.juNum}局
命宫（日干${dayStem}天盘所落宫位）: ${lifePalaceStr}
命宫对宫: ${oppPalaceStr}
六合宫位: ${liuHePalaceStr}
天干五合: ${wuHeStr}
${liuHeRelation ? `命宫与六合关系: ${liuHeRelation}` : ''}
${wuHeRelation ? `命宫与五合关系: ${wuHeRelation}` : ''}
值符: ${chart.zhiFu}
值使: ${chart.zhiShi}
空亡: ${chart.voidBranches}
马星: ${chart.horseBranch}

九宫信息:
${palaceInfo}

四害检测（空亡/入墓/击刑/门迫）:
${siHaiStr}

【四害宫位详情（健康分析用）】
${siHaiPalaces.length > 0 ? siHaiPalaces.join('\n') : '盘中未见四害'}

【大运排盘】
${bigCyclesStr}

【流年排盘（近20年）】
${annualCyclesStr}

【六爻分析（性格层次）】
${[...liuYao.summary, ...liuYao.personalityInsights].join('\n')}
`;

    const title = `${selectedClient.name} - 命理分析报告`;
    const result = await generateReport(chartContext, selectedClient.name, clientId, title);
    setRegenerating(false);
    setRegenPaymentStep('idle');
    if (result) {
      setProgress(100);
    }
  };

  const handleDownloadPdf = useCallback(async () => {
    if (!currentReport) return;
    setDownloadingPdf(true);

    try {
      // Fetch a Chinese-supporting font from Google Fonts CDN
      const fontUrl = 'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-sc@latest/chinese-simplified-400-normal.ttf';
      const fontResponse = await fetch(fontUrl);
      const fontBuffer = await fontResponse.arrayBuffer();

      // Convert ArrayBuffer to base64
      const uint8 = new Uint8Array(fontBuffer);
      let binary = '';
      for (let i = 0; i < uint8.length; i++) {
        binary += String.fromCharCode(uint8[i]);
      }
      const base64Font = btoa(binary);

      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addFileToVFS('NotoSansSC-Regular.ttf', base64Font);
      pdf.addFont('NotoSansSC-Regular.ttf', 'NotoSansSC', 'normal');
      pdf.setFont('NotoSansSC');

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const maxWidth = pageWidth - margin * 2;
      let y = 20;

      const checkPage = (needed: number) => {
        if (y + needed > pageHeight - margin) {
          pdf.addPage();
          y = 20;
        }
      };

      // Title
      pdf.setFontSize(18);
      pdf.text(`${selectedClient?.name || ''} - 命理分析报告`, margin, y);
      y += 10;

      pdf.setFontSize(9);
      pdf.setTextColor(128, 128, 128);
      pdf.text(`生成日期：${new Date(currentReport.created_at).toLocaleDateString('zh-CN')}`, margin, y);
      y += 10;
      pdf.setTextColor(0, 0, 0);

      // Helper to strip markdown formatting
      const stripMd = (text: string) =>
        text
          .replace(/\*\*(.+?)\*\*/g, '$1')
          .replace(/\*(.+?)\*/g, '$1')
          .replace(/^#{1,6}\s+/gm, '')
          .replace(/^[-*]\s+/gm, '• ')
          .replace(/^\d+\.\s+/gm, (m) => m)
          .trim();

      const sections = currentReport.report_sections || {};
      for (const sectionName of SECTION_ORDER) {
        const content = sections[sectionName as keyof typeof sections] as string | undefined;
        if (!content) continue;

        checkPage(15);

        // Section header
        pdf.setFontSize(14);
        pdf.text(`${SECTION_ICONS[sectionName] || ''} ${sectionName}`, margin, y);
        y += 8;

        // Section content
        pdf.setFontSize(10);
        const cleanText = stripMd(content);
        const paragraphs = cleanText.split('\n').filter(l => l.trim());

        for (const para of paragraphs) {
          const lines = pdf.splitTextToSize(para, maxWidth);
          for (const line of lines) {
            checkPage(6);
            pdf.text(line, margin, y);
            y += 5;
          }
          y += 2;
        }
        y += 4;
      }

      // Fallback: if no sections, use full content
      if (SECTION_ORDER.every(s => !sections[s as keyof typeof sections]) && currentReport.report_content) {
        pdf.setFontSize(10);
        const lines = pdf.splitTextToSize(stripMd(currentReport.report_content), maxWidth);
        for (const line of lines) {
          checkPage(6);
          pdf.text(line, margin, y);
          y += 5;
        }
      }

      pdf.save(`${selectedClient?.name || 'report'}_命理报告_${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success('PDF 下载成功');
    } catch (err) {
      console.error('PDF generation failed:', err);
      toast.error('PDF 生成失败，请重试');
    } finally {
      setDownloadingPdf(false);
    }
  }, [currentReport, selectedClient]);

  const clientName = selectedClient?.name || '';

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-4 py-3 max-w-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!generating && (
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            )}
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h1 className="font-bold text-lg truncate">{clientName} - 命理报告</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Payment confirmation for normal members */}
      {paymentStep === 'confirm' && !reportId && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8">
          <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center">
            <Lock className="h-10 w-10 text-amber-500" />
          </div>
          <div className="text-center space-y-2 max-w-md">
            <h3 className="text-xl font-bold">生成完整命理报告</h3>
            <p className="text-muted-foreground text-sm">
              此报告将由 AI 深度分析您的八字与奇门盘局，涵盖性格、关系、健康、事业、财富等7大维度
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">报告费用</span>
              <span className="text-2xl font-bold">RM 99.99</span>
            </div>
            <p className="text-xs text-muted-foreground">
              升级订阅会员即可享受免费报告额度
            </p>
            <Button className="w-full gap-2" onClick={handlePaymentConfirm}>
              <CreditCard className="h-4 w-4" />
              确认付费并生成报告
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => navigate(-1)}>
              返回
            </Button>
          </div>
        </div>
      )}

      {/* Generating state */}
      {(generating || regenerating || (paymentStep === 'paid' && !currentReport && started)) && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8 overflow-hidden">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          </div>
          <div className="text-center space-y-2 max-w-md">
            <h3 className="text-xl font-bold">正在解读命盘...</h3>
            <p className="text-muted-foreground text-sm">
              AI 正在分析八字、奇门盘局，生成专属命理报告，请稍候约30秒
            </p>
          </div>
          <div className="w-full max-w-sm">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center mt-2">{Math.round(progress)}%</p>
          </div>
        </div>
      )}

      {/* Completed report */}
      {currentReport?.status === 'completed' && !generating && (
        <ScrollArea className="flex-1 mb-12">
          <div ref={reportContentRef} className="max-w-2xl mx-auto px-4 py-6 space-y-4 pb-8">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-500 shrink-0" />
              <div>
                <p className="font-medium">报告生成完成</p>
                <p className="text-sm text-muted-foreground">
                  生成于 {new Date(currentReport.created_at).toLocaleString('zh-CN')}
                </p>
              </div>
            </div>


            {SECTION_ORDER.map(sectionName => {
              const content = currentReport.report_sections?.[sectionName];
              if (!content) return null;
              const isExpanded = expandedSections.has(sectionName);

              return (
                <div key={sectionName} className="bg-card border border-border rounded-xl overflow-hidden">
                  <button
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
                    onClick={() => toggleSection(sectionName)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{SECTION_ICONS[sectionName]}</span>
                      <span className="font-medium">{sectionName}</span>
                    </div>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              );
            })}

            {SECTION_ORDER.every(s => !currentReport.report_sections?.[s]) && currentReport.report_content && (
              <div className="bg-card border border-border rounded-xl p-4 prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{currentReport.report_content}</ReactMarkdown>
              </div>
            )}
          </div>
        </ScrollArea>
      )}

      {/* Bottom actions: Download + Regenerate */}
      {currentReport?.status === 'completed' && (
        <div className="p-4 fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="flex gap-2 max-w-2xl mx-auto">
            <Button size="sm" className='flex-1' onClick={handleDownloadPdf} disabled={downloadingPdf}>
              {downloadingPdf ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
              下载 PDF
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={handleRegenerate}
              disabled={generating || regenerating}
            >
              {regenerating ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1" />}
              重新生成
            </Button>
          </div>
        </div>
      )}

      {/* Regenerate payment dialog for normal members */}
      {regenPaymentStep === 'confirm' && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-lg font-bold text-center">重新生成报告</h3>
            <p className="text-sm text-muted-foreground text-center">重新生成需要再次付费</p>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">报告费用</span>
              <span className="text-2xl font-bold">RM 99.99</span>
            </div>
            <Button className="w-full gap-2" onClick={handleRegenPaymentConfirm}>
              <CreditCard className="h-4 w-4" />
              确认付费并重新生成
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setRegenPaymentStep('idle')}>
              取消
            </Button>
          </div>
        </div>
      )}

      {/* Loading fallback */}
      {!generating && !regenerating && !currentReport && paymentStep !== 'confirm' && reportId && (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
};

export default DestinyReport;
