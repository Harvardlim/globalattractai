import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMemberPermissions } from "@/hooks/useMemberPermissions";
import LockedContent from "@/components/LockedContent";
import { ArrowLeft, Dice1, RotateCcw, BookOpen, Scale, Clock, Sparkles, Hash, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  LIU_SHEN_DATA, DOUBLE_PALACE_READINGS, getNatureVariant,
  SHICHEN_NAMES, LUNAR_MONTH_NAMES, LUNAR_DAY_NAMES, hourToShichenIndex,
  type LiuShenInfo
} from "@/data/xiaoLiuRenData";
import { getLunarDate } from "@/lib/lunar";
import { getBeijingParts } from "@/lib/time/beijing";
import { EARTHLY_BRANCHES, HEAVENLY_STEMS, ZODIACS } from "@/lib/constants";
import { Solar } from "lunar-javascript";

interface XiaoLiuRenResult {
  digits: number[];
  levels: { shen: LiuShenInfo; index: number }[];
  lunarInfo?: { month: number; day: number; shichen: number };
  /** 3-group qike mode */
  groupMode?: boolean;
  groups?: number[];
  remainders?: number[];
  divisors?: number[];
}

function calculate(nums: number[], lunarInfo?: XiaoLiuRenResult['lunarInfo']): XiaoLiuRenResult {
  const pos0 = ((nums[0] - 1) % 6 + 6) % 6;
  const pos1 = ((pos0 + nums[1] - 1) % 6 + 6) % 6;
  const pos2 = ((pos1 + nums[2] - 1) % 6 + 6) % 6;
  const pos3 = ((pos2 + nums[3] - 1) % 6 + 6) % 6;

  return {
    digits: nums,
    levels: [
      { shen: LIU_SHEN_DATA[pos0], index: pos0 },
      { shen: LIU_SHEN_DATA[pos1], index: pos1 },
      { shen: LIU_SHEN_DATA[pos2], index: pos2 },
      { shen: LIU_SHEN_DATA[pos3], index: pos3 },
    ],
    lunarInfo,
  };
}

/** 3组号码起课：÷12, ÷30, ÷12 取余数，逐级推宫 */
function calculateThreeGroups(g1: number, g2: number, g3: number): XiaoLiuRenResult {
  const divisors = [12, 30, 12];
  let r1 = g1 % 12; if (r1 === 0) r1 = 12;
  let r2 = g2 % 30; if (r2 === 0) r2 = 30;
  let r3 = g3 % 12; if (r3 === 0) r3 = 12;

  const pos0 = ((r1 - 1) % 6 + 6) % 6;
  const pos1 = ((pos0 + r2 - 1) % 6 + 6) % 6;
  const pos2 = ((pos1 + r3 - 1) % 6 + 6) % 6;

  return {
    digits: [g1, g2, g3],
    groups: [g1, g2, g3],
    remainders: [r1, r2, r3],
    divisors,
    groupMode: true,
    levels: [
      { shen: LIU_SHEN_DATA[pos0], index: pos0 },
      { shen: LIU_SHEN_DATA[pos1], index: pos1 },
      { shen: LIU_SHEN_DATA[pos2], index: pos2 },
    ],
  };
}

/** 传统小六壬：年→月→日→时 四级推算（年位用地支/生肖） */
function calculateFromLunar(lunarYear: number, lunarMonth: number, lunarDay: number, shichenIdx: number): XiaoLiuRenResult {
  const branchIdx = getYearBranch(lunarYear); // 0=子 to 11=亥
  const posYear = branchIdx % 6;
  const posMonth = ((posYear + lunarMonth - 1) % 6 + 6) % 6;
  const posDay = ((posMonth + lunarDay - 1) % 6 + 6) % 6;
  const posHour = ((posDay + shichenIdx) % 6 + 6) % 6;

  return {
    digits: [lunarYear, lunarMonth, lunarDay, shichenIdx + 1],
    levels: [
      { shen: LIU_SHEN_DATA[posYear], index: posYear },
      { shen: LIU_SHEN_DATA[posMonth], index: posMonth },
      { shen: LIU_SHEN_DATA[posDay], index: posDay },
      { shen: LIU_SHEN_DATA[posHour], index: posHour },
    ],
    lunarInfo: { month: lunarMonth, day: lunarDay, shichen: shichenIdx },
  };
}

/** 号码吉凶：任意数字除以6，用余数断吉凶 */
function calculateNumberFortune(numStr: string): { remainder: number; palaceIndex: number; shen: LiuShenInfo } {
  // Use BigInt for large numbers
  const num = BigInt(numStr);
  const rem = Number(num % 6n); // 0-5
  // 余数1=大安, 2=留连, 3=速喜, 4=赤口, 5=小吉, 0(整除)=空亡
  const palaceIndex = rem === 0 ? 5 : rem - 1;
  return { remainder: rem === 0 ? 6 : rem, palaceIndex, shen: LIU_SHEN_DATA[palaceIndex] };
}

/** 根据年份计算地支序号 (0=子, 1=丑, ..., 11=亥) */
function getYearBranch(year: number): number {
  return ((year - 4) % 12 + 12) % 12;
}

/** 公历转农历，返回农历月日 */
function solarToLunar(year: number, month: number, day: number): { lunarMonth: number; lunarDay: number } {
  try {
    const solar = Solar.fromYmd(year, month, day);
    const lunar = solar.getLunar();
    return { lunarMonth: lunar.getMonth(), lunarDay: lunar.getDay() };
  } catch {
    return { lunarMonth: month, lunarDay: day };
  }
}

/** 获取时辰显示名。h: 1-13, 其中1=早子, 2=丑...12=亥, 13=晚子 */
function getShichenDisplayName(h: number): string {
  if (h === 1) return "早子时";
  if (h === 13) return "晚子时";
  return SHICHEN_NAMES[h - 1];
}

/** 晚子时需要日期+1 */
function adjustDateForLateZi(year: number, month: number, day: number, h: number): { year: number; month: number; day: number } {
  if (h !== 13) return { year, month, day };
  const d = new Date(year, month - 1, day + 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
}


/**
 * 流年运势：以地支（生肖）定年位，以出生月日时为固定值
 * 1. 年位：地支序号 % 6（子=大安, 丑=留连, ...）
 * 2. 月位：从年位起数农历出生月
 * 3. 日位：从月位起数农历出生日
 * 4. 时位：从日位起数出生时辰
 */
interface YearlyFortune {
  year: number;
  yearPos: number;
  monthPos: number;
  dayPos: number;
  hourPos: number;
  yearShen: LiuShenInfo;
  monthShen: LiuShenInfo;
  dayShen: LiuShenInfo;
  hourShen: LiuShenInfo;  // final result
}

function calculateYearlyFortune(
  targetYear: number,
  lunarMonth: number,
  lunarDay: number,
  shichenIdx: number  // 1-based (1=子时...12=亥时)
): YearlyFortune {
  // Step 1: Year - 地支(生肖)起数，从大安(0)起子，顺推
  const branchIdx = getYearBranch(targetYear); // 0=子 to 11=亥
  const yearPos = branchIdx % 6;
  // Step 2: Month - from year position, count lunar month
  const monthPos = ((yearPos + lunarMonth - 1) % 6 + 6) % 6;
  // Step 3: Day - from month position, count lunar day
  const dayPos = ((monthPos + lunarDay - 1) % 6 + 6) % 6;
  // Step 4: Hour - from day position, count shichen
  const hourPos = ((dayPos + shichenIdx - 1) % 6 + 6) % 6;

  return {
    year: targetYear,
    yearPos, monthPos, dayPos, hourPos,
    yearShen: LIU_SHEN_DATA[yearPos],
    monthShen: LIU_SHEN_DATA[monthPos],
    dayShen: LIU_SHEN_DATA[dayPos],
    hourShen: LIU_SHEN_DATA[hourPos],
  };
}

/** 季度运势：年位固定，月用季度代表月（1,4,7,10），日时用出生信息 */
interface QuarterFortune {
  quarter: number;       // 1-4
  label: string;         // Q1, Q2, Q3, Q4
  months: string;        // "正月-三月"
  quarterMonth: number;  // 代表月
  yearPos: number;
  monthPos: number;
  dayPos: number;
  hourPos: number;
  resultShen: LiuShenInfo;
  dayShen: LiuShenInfo;
}

const QUARTER_INFO = [
  { quarter: 1, label: "Q1", months: "正月～三月", month: 1 },
  { quarter: 2, label: "Q2", months: "四月～六月", month: 4 },
  { quarter: 3, label: "Q3", months: "七月～九月", month: 7 },
  { quarter: 4, label: "Q4", months: "十月～腊月", month: 10 },
];

function calculateQuarterlyFortune(
  yearPos: number,
  targetYear: number,
  lunarDay: number,
  shichenIdx: number
): QuarterFortune[] {
  return QUARTER_INFO.map(q => {
    const monthPos = ((yearPos + q.month - 1) % 6 + 6) % 6;
    const dayPos = ((monthPos + lunarDay - 1) % 6 + 6) % 6;
    const hourPos = ((dayPos + shichenIdx - 1) % 6 + 6) % 6;
    return {
      quarter: q.quarter,
      label: q.label,
      months: q.months,
      quarterMonth: q.month,
      yearPos,
      monthPos,
      dayPos,
      hourPos,
      resultShen: LIU_SHEN_DATA[hourPos],
      dayShen: LIU_SHEN_DATA[dayPos],
    };
  });
}

function getFortuneScore(nature: string): number {
  switch (nature) {
    case '大吉': return 5;
    case '吉': return 4;
    case '小吉': return 3;
    case '凶': return 1;
    case '大凶': return 0;
    default: return 2;
  }
}

const LEVEL_LABELS_4 = ["第一数", "第二数", "第三数", "第四数（结果）"];
const LEVEL_LABELS_3 = ["年（第一宫）", "月（第二宫）", "日（第三宫）", "时（第四宫·结果）"];
const GROUP_LABELS = ["起始", "过程", "结果"];
const GROUP_DESCRIPTIONS = ["事情一开始进行的情况", "事情进行的过程", "最终事情的情况"];

const ASPECT_LABELS: Record<string, string> = {
  general: "总论", wealth: "求财", career: "事业", love: "感情",
  health: "健康", travel: "出行", lostItem: "失物", lawsuit: "诉讼", timing: "应期",
};

const NATURE_COLORS: Record<string, string> = {
  '大吉': 'text-green-600',
  '吉': 'text-emerald-500',
  '小吉': 'text-cyan-500',
  '凶': 'text-orange-500',
  '大凶': 'text-red-500',
};

const XiaoLiuRen: React.FC = () => {
  const navigate = useNavigate();
  const { canAccess } = useMemberPermissions();
  const [group1, setGroup1] = useState("");
  const [group2, setGroup2] = useState("");
  const [group3, setGroup3] = useState("");
  const [result, setResult] = useState<XiaoLiuRenResult | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("qike");

  // 当前农历信息
  const currentLunar = useMemo(() => {
    const now = new Date();
    const lunar = getLunarDate(now);
    const bj = getBeijingParts(now);
    const shichenIdx = hourToShichenIndex(bj.hour);
    const solar = Solar.fromYmd(bj.year, bj.month, bj.day);
    const lunarObj = solar.getLunar();
    const lunarYear = lunarObj.getYear();
    return { year: lunarYear, month: lunar.month, day: lunar.day, shichen: shichenIdx };
  }, []);

  // 号码吉凶
  const [fortuneInput, setFortuneInput] = useState("");
  const [fortuneResult, setFortuneResult] = useState<{ remainder: number; palaceIndex: number; shen: LiuShenInfo } | null>(null);
  const [fortuneError, setFortuneError] = useState("");

  // 流年运势
  const [lnBirthYear, setLnBirthYear] = useState("");
  const [lnBirthMonth, setLnBirthMonth] = useState("");
  const [lnBirthDay, setLnBirthDay] = useState("");
  const [lnBirthHour, setLnBirthHour] = useState("");
  const [lnStartYear, setLnStartYear] = useState(new Date().getFullYear());
  const [lnFortunes, setLnFortunes] = useState<YearlyFortune[] | null>(null);
  const [lnSelectedYear, setLnSelectedYear] = useState<number | null>(null);
  const [lnSelectedQuarter, setLnSelectedQuarter] = useState<number | null>(null);
  const [lnLunarInfo, setLnLunarInfo] = useState<{ lunarMonth: number; lunarDay: number } | null>(null);

  const handleGroupInput = (value: string, setter: (v: string) => void) => {
    setter(value.replace(/\D/g, "").slice(0, 3));
  };

  const handleCalculate = () => {
    if (!group1 || !group2 || !group3) {
      setError("请输入3组号码");
      return;
    }
    const g1 = parseInt(group1), g2 = parseInt(group2), g3 = parseInt(group3);
    if (isNaN(g1) || isNaN(g2) || isNaN(g3) || g1 < 1 || g2 < 1 || g3 < 1) {
      setError("每组号码需为正整数");
      return;
    }
    setError("");
    setResult(calculateThreeGroups(g1, g2, g3));
  };

  const handleReset = () => {
    setGroup1(""); setGroup2(""); setGroup3("");
    setResult(null);
    setError("");
  };

  const handleFortuneCalculate = () => {
    const cleaned = fortuneInput.replace(/\D/g, "");
    if (!cleaned) {
      setFortuneError("请输入数字");
      return;
    }
    setFortuneError("");
    setFortuneResult(calculateNumberFortune(cleaned));
  };

  const handleFortuneReset = () => {
    setFortuneInput("");
    setFortuneResult(null);
    setFortuneError("");
  };

  const handleLnCalculate = () => {
    const y = parseInt(lnBirthYear), m = parseInt(lnBirthMonth), d = parseInt(lnBirthDay), h = parseInt(lnBirthHour);
    if (isNaN(y) || y < 1900 || y > 2100) return;
    if (isNaN(m) || m < 1 || m > 12) return;
    if (isNaN(d) || d < 1 || d > 31) return;
    if (isNaN(h) || h < 1 || h > 13) return;
    const adjusted = adjustDateForLateZi(y, m, d, h);
    const { lunarMonth, lunarDay } = solarToLunar(adjusted.year, adjusted.month, adjusted.day);
    const stepValue = h === 13 ? 1 : h;
    setLnLunarInfo({ lunarMonth, lunarDay });
    const fortunes: YearlyFortune[] = [];
    for (let yr = lnStartYear; yr < lnStartYear + 10; yr++) {
      fortunes.push(calculateYearlyFortune(yr, lunarMonth, lunarDay, stepValue));
    }
    setLnFortunes(fortunes);
    setLnSelectedYear(null);
    setLnSelectedQuarter(null);
  };

  const handleLnReset = () => {
    setLnBirthYear(""); setLnBirthMonth(""); setLnBirthDay(""); setLnBirthHour("");
    setLnFortunes(null); setLnSelectedYear(null); setLnSelectedQuarter(null); setLnLunarInfo(null);
  };

  // Recalculate when start year changes
  const handleLnPageChange = (delta: number) => {
    const newStart = lnStartYear + delta;
    setLnStartYear(newStart);
    if (lnLunarInfo && lnBirthHour) {
      const h = parseInt(lnBirthHour);
      const stepValue = h === 13 ? 1 : h;
      const fortunes: YearlyFortune[] = [];
      for (let yr = newStart; yr < newStart + 10; yr++) {
        fortunes.push(calculateYearlyFortune(yr, lnLunarInfo.lunarMonth, lnLunarInfo.lunarDay, stepValue));
      }
      setLnFortunes(fortunes);
      setLnSelectedYear(null);
      setLnSelectedQuarter(null);
    }
  };

  const lnCanCalculate = lnBirthYear.length === 4 && lnBirthMonth && lnBirthDay && lnBirthHour;
  const lnSelectedFortune = lnFortunes?.find(f => f.year === lnSelectedYear) ?? null;
  const lnQuarters = useMemo(() => {
    if (!lnSelectedFortune || !lnLunarInfo || !lnBirthHour) return null;
    const h = parseInt(lnBirthHour);
    const stepValue = h === 13 ? 1 : h;
    return calculateQuarterlyFortune(lnSelectedFortune.yearPos, lnSelectedFortune.year, lnLunarInfo.lunarDay, stepValue);
  }, [lnSelectedFortune, lnLunarInfo, lnBirthHour]);
  const lnSelectedQ = lnQuarters?.find(q => q.quarter === lnSelectedQuarter) ?? null;

  const isGroupMode = result?.groupMode === true;
  const finalShen = result?.levels[result.levels.length - 1].shen;
  const levelLabels = isGroupMode ? GROUP_LABELS : LEVEL_LABELS_4;

  const doublePalaceKey = result && result.levels.length >= 2
    ? `${result.levels[result.levels.length - 2].shen.name}-${result.levels[result.levels.length - 1].shen.name}`
    : "";
  const doublePalace = doublePalaceKey ? DOUBLE_PALACE_READINGS[doublePalaceKey] : null;




  if (!canAccess('xiao_liu_ren')) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
          <div className="container mx-auto px-2 sm:px-4 py-3 max-w-7xl">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg sm:text-xl font-bold flex-1">小六壬</h1>
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
    <div className="min-h-screen bg-background text-foreground">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-2 sm:px-4 py-3 max-w-7xl">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg sm:text-xl font-bold flex-1">小六壬</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 py-4 max-w-lg space-y-4 pb-24">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="qike" className="gap-1.5 text-xs">
              <Dice1 className="h-3.5 w-3.5" />
              掐指起课
            </TabsTrigger>
            <TabsTrigger value="haoma" className="gap-1.5 text-xs">
              <Hash className="h-3.5 w-3.5" />
              号码吉凶
            </TabsTrigger>
            <TabsTrigger value="liunian" className="gap-1.5 text-xs">
              <CalendarDays className="h-3.5 w-3.5" />
              流年运势
            </TabsTrigger>
          </TabsList>

          {/* === 掐指起课 Tab === */}
          <TabsContent value="qike" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Dice1 className="h-4 w-4" />
                  掐指起课
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  输入3组号码（每组3位数字）
                </p>

                <div className="space-y-2">
                  {[
                    { label: "第一组（起始）", value: group1, setter: setGroup1, desc: "÷12" },
                    { label: "第二组（过程）", value: group2, setter: setGroup2, desc: "÷30" },
                    { label: "第三组（结果）", value: group3, setter: setGroup3, desc: "÷12" },
                  ].map((g, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-24 shrink-0">{g.label}</span>
                      <Input
                        type="text"
                        inputMode="numeric"
                        maxLength={3}
                        placeholder="3位数字"
                        value={g.value}
                        onChange={e => handleGroupInput(e.target.value, g.setter)}
                        onKeyDown={e => e.key === "Enter" && group1 && group2 && group3 && handleCalculate()}
                        className="text-center font-mono flex-1"
                      />
                      {/* <span className="text-[10px] text-muted-foreground w-8">{g.desc}</span> */}
                    </div>
                  ))}
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <div className="flex gap-2">
                  <Button onClick={handleCalculate} className="flex-1" disabled={!group1 || !group2 || !group3}>
                    起课
                  </Button>
                  <Button onClick={handleReset} variant="outline" size="icon">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>

                {/* 六神速查表 */}
                <Separator />
                <div className="grid grid-cols-3 gap-1.5">
                  {LIU_SHEN_DATA.map(shen => (
                    <div key={shen.name} className="text-center p-1.5 rounded-lg border border-border">
                      <p className={`font-semibold text-sm ${shen.color}`}>{shen.name}</p>
                      <p className="text-[10px] text-muted-foreground">{shen.keywords}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {result && finalShen && (
              <>
                {/* 三宫结果卡片 */}
                <div className="grid gap-2 grid-cols-3">
                  {result.levels.map((level, i) => {
                    const isLast = i === result.levels.length - 1;
                    return (
                      <Card key={i} className={isLast ? "border-primary/50 shadow-md" : ""}>
                        <CardContent className="p-2.5 text-center space-y-0.5">
                          <p className="text-[10px] text-muted-foreground font-medium">{GROUP_LABELS[i]}</p>
                          <p className="text-[10px] text-muted-foreground">{GROUP_DESCRIPTIONS[i]}</p>
                          <p className={`text-lg font-bold ${level.shen.color}`}>{level.shen.name}</p>
                          <p className="text-[10px] text-muted-foreground">{level.shen.keywords}</p>
                          <Badge variant={getNatureVariant(level.shen.nature)} className="text-[9px] px-1">
                            {level.shen.nature}
                          </Badge>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* 推算过程 */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">推算过程</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs space-y-1.5">
                    {result.remainders && result.groups && (
                      <>
                        <p>第一组 <strong className="font-mono">{result.groups[0]}</strong> ÷ 12 = 余 <strong>{result.remainders[0]}</strong>：从大安起数{result.remainders[0]}步 → <strong className={result.levels[0].shen.color}>{result.levels[0].shen.name}</strong></p>
                        <p>第二组 <strong className="font-mono">{result.groups[1]}</strong> ÷ 30 = 余 <strong>{result.remainders[1]}</strong>：从{result.levels[0].shen.name}起数{result.remainders[1]}步 → <strong className={result.levels[1].shen.color}>{result.levels[1].shen.name}</strong></p>
                        <p>第三组 <strong className="font-mono">{result.groups[2]}</strong> ÷ 12 = 余 <strong>{result.remainders[2]}</strong>：从{result.levels[1].shen.name}起数{result.remainders[2]}步 → <strong className={result.levels[2].shen.color}>{result.levels[2].shen.name}</strong>（最终结果）</p>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* 各宫详解 */}
                {result.levels.map((level, i) => (
                  <Card key={i} className={i === result.levels.length - 1 ? "border-primary/30" : ""}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        {GROUP_LABELS[i]} · {level.shen.name}
                        <span className="text-xs text-muted-foreground font-normal ml-auto">{GROUP_DESCRIPTIONS[i]}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className={`text-xl font-bold ${level.shen.color}`}>{level.shen.name}</span>
                        <Badge variant={getNatureVariant(level.shen.nature)}>{level.shen.nature}</Badge>
                        <span className="text-xs text-muted-foreground">{level.shen.element} · {level.shen.position} · {level.shen.guardian}</span>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-xs italic leading-relaxed">{level.shen.poem}</p>
                      </div>

                      <p className="text-sm">{level.shen.detail}</p>
                      <Separator />

                      <Accordion type="multiple" defaultValue={i === result.levels.length - 1 ? ["general"] : []}>
                        {Object.entries(level.shen.singlePalace).map(([key, value]) => (
                          <AccordionItem key={key} value={key}>
                            <AccordionTrigger className="text-sm py-2">
                              {ASPECT_LABELS[key] || key}
                            </AccordionTrigger>
                            <AccordionContent className="text-sm text-muted-foreground">
                              {value}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                ))}

                {/* 双宫断事 */}
                {doublePalace && (
                  <Card className="border-accent/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Scale className="h-4 w-4" />
                        雙宮斷事 · {doublePalace.combo}
                      </CardTitle>
                      <p className="text-[10px] text-muted-foreground">取过程宫与结果宫组合断事</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${result.levels[result.levels.length - 2].shen.color}`}>
                          {result.levels[result.levels.length - 2].shen.name}
                        </span>
                        <span className="text-muted-foreground">+</span>
                        <span className={`font-bold ${result.levels[result.levels.length - 1].shen.color}`}>
                          {result.levels[result.levels.length - 1].shen.name}
                        </span>
                        <Sparkles className="h-3 w-3 text-primary ml-auto" />
                      </div>

                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-sm font-semibold mb-1">{doublePalace.overview}</p>
                        <p className="text-xs text-muted-foreground">{doublePalace.detail}</p>
                      </div>

                      <div className="border border-border rounded-lg p-3">
                        <p className="text-xs font-medium mb-1">建议</p>
                        <p className="text-sm">{doublePalace.advice}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* === 号码吉凶 Tab === */}
          <TabsContent value="haoma" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  号码吉凶
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  输入任意数字（电话号、QQ号、车牌号等），系统将数字除以6，用余数断吉凶。从大安起数，余数落在哪个宫位即为结果。
                </p>

                <div className="flex gap-2">
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="输入数字，如 15114117548"
                    value={fortuneInput}
                    onChange={e => {
                      setFortuneInput(e.target.value);
                      if (fortuneError) setFortuneError("");
                    }}
                    onKeyDown={e => e.key === "Enter" && handleFortuneCalculate()}
                    className="flex-1 font-mono"
                  />
                  <Button onClick={handleFortuneReset} variant="outline" size="icon">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>

                {fortuneError && <p className="text-sm text-destructive">{fortuneError}</p>}

                <Button onClick={handleFortuneCalculate} className="w-full" disabled={!fortuneInput.trim()}>
                  断吉凶
                </Button>
              </CardContent>
            </Card>

            {fortuneResult && (
              <>
                {/* Calculation display */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">计算过程</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs space-y-2">
                    <p>输入号码：<strong className="font-mono">{fortuneInput.replace(/\D/g, "")}</strong></p>
                    <p>计算：{fortuneInput.replace(/\D/g, "")} ÷ 6 = 余数 <strong>{fortuneResult.remainder}</strong></p>
                    <p>从大安起数第 <strong>{fortuneResult.remainder}</strong> 位 → 落宫 <strong className={fortuneResult.shen.color}>{fortuneResult.shen.name}</strong></p>
                  </CardContent>
                </Card>

                {/* Result card */}
                <Card className="border-primary/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      断卦结果 · {fortuneResult.shen.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className={`text-2xl font-bold ${fortuneResult.shen.color}`}>{fortuneResult.shen.name}</span>
                      <Badge variant={getNatureVariant(fortuneResult.shen.nature)}>{fortuneResult.shen.nature}</Badge>
                      <span className="text-xs text-muted-foreground">{fortuneResult.shen.element} · {fortuneResult.shen.position} · {fortuneResult.shen.guardian}</span>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs italic leading-relaxed">{fortuneResult.shen.poem}</p>
                    </div>

                    <p className="text-sm">{fortuneResult.shen.detail}</p>
                    <Separator />

                    <Accordion type="multiple" defaultValue={["general"]}>
                      {Object.entries(fortuneResult.shen.singlePalace).map(([key, value]) => (
                        <AccordionItem key={key} value={key}>
                          <AccordionTrigger className="text-sm py-2">
                            {ASPECT_LABELS[key] || key}
                          </AccordionTrigger>
                          <AccordionContent className="text-sm text-muted-foreground">
                            {value as string}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>

                {/* Six palaces reference */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">六神对照表（余数对应）</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2">
                      {LIU_SHEN_DATA.map((shen, i) => (
                        <div key={shen.name} className={`text-center p-2 rounded-lg border ${fortuneResult.palaceIndex === i ? 'border-primary bg-primary/5' : 'border-border'}`}>
                          <p className="text-[10px] text-muted-foreground mb-0.5">余数 {i + 1 === 6 ? '0(6)' : i + 1}</p>
                          <p className={`font-semibold text-sm ${shen.color}`}>{shen.name}</p>
                          <Badge variant={getNatureVariant(shen.nature)} className="text-[9px] mt-1">{shen.nature}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* === 流年运势 Tab === */}
          <TabsContent value="liunian" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  流年运势推算
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  输入公历出生日期，以标准小六壬起法（大安起年，月上起日，日上起时）推算每年运势。
                </p>

                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-muted-foreground block mb-1 text-center">公历年</label>
                    <Input type="text" inputMode="numeric" maxLength={4} placeholder="1990" value={lnBirthYear}
                      onChange={e => setLnBirthYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      className="text-center font-mono text-sm px-1" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground block mb-1 text-center">公历月</label>
                    <Input type="text" inputMode="numeric" maxLength={2} placeholder="1-12" value={lnBirthMonth}
                      onChange={e => setLnBirthMonth(e.target.value.replace(/\D/g, "").slice(0, 2))}
                      className="text-center font-mono text-sm px-1" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground block mb-1 text-center">公历日</label>
                    <Input type="text" inputMode="numeric" maxLength={2} placeholder="1-31" value={lnBirthDay}
                      onChange={e => setLnBirthDay(e.target.value.replace(/\D/g, "").slice(0, 2))}
                      className="text-center font-mono text-sm px-1" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground block mb-1 text-center">时辰</label>
                    <Select value={lnBirthHour} onValueChange={setLnBirthHour}>
                      <SelectTrigger className="text-center font-mono text-sm px-1">
                        <SelectValue placeholder="选择" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem key="early-zi" value="1">早子时（1）</SelectItem>
                        {SHICHEN_NAMES.slice(1).map((name, i) => (
                          <SelectItem key={i + 1} value={String(i + 2)}>{name}（{i + 2}）</SelectItem>
                        ))}
                        <SelectItem key="late-zi" value="13">晚子时（13）</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleLnCalculate} className="flex-1" disabled={!lnCanCalculate}>
                    推算流年
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleLnReset}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {lnFortunes && lnLunarInfo && (
              <>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">出生农历信息</p>
                  <p className="text-sm font-medium">
                    农历{LUNAR_MONTH_NAMES[lnLunarInfo.lunarMonth - 1]} · {LUNAR_DAY_NAMES[lnLunarInfo.lunarDay - 1]} · {getShichenDisplayName(parseInt(lnBirthHour))}
                  </p>
                </div>

                {/* Year navigation */}
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="sm" onClick={() => handleLnPageChange(-10)}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> 前10年
                  </Button>
                  <span className="text-sm font-medium">{lnStartYear} - {lnStartYear + 9}</span>
                  <Button variant="ghost" size="sm" onClick={() => handleLnPageChange(10)}>
                    后10年 <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>

                {/* Fortune overview grid */}
                <div className="grid grid-cols-5 gap-2">
                  {lnFortunes.map(f => {
                    const isSelected = lnSelectedYear === f.year;
                    const isCurrent = f.year === new Date().getFullYear();
                    const score = getFortuneScore(f.hourShen.nature);
                    return (
                      <Card
                        key={f.year}
                        className={`cursor-pointer transition-all ${
                          isSelected ? "border-primary shadow-md ring-1 ring-primary/30" :
                          isCurrent ? "border-primary/40" : "hover:border-primary/30"
                        }`}
                        onClick={() => { setLnSelectedYear(isSelected ? null : f.year); setLnSelectedQuarter(null); }}
                      >
                        <CardContent className="p-2 text-center space-y-0.5">
                          <p className={`text-[10px] ${isCurrent ? 'text-primary font-bold' : 'text-muted-foreground'}`}>{f.year}{ZODIACS[getYearBranch(f.year)]}</p>
                          <div className={`w-full h-1.5 rounded-full ${
                            score >= 4 ? 'bg-green-500' : score === 3 ? 'bg-cyan-400' : score >= 1 ? 'bg-orange-400' : 'bg-red-500'
                          }`} />
                          <p className={`text-sm font-bold ${f.hourShen.color}`}>{f.hourShen.name}</p>
                          <Badge variant={getNatureVariant(f.hourShen.nature)} className="text-[8px] px-0.5">
                            {f.hourShen.nature}
                          </Badge>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Overall trend bar */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      十年运势走势
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end gap-1 h-20">
                      {lnFortunes.map(f => {
                        const score = getFortuneScore(f.hourShen.nature);
                        const heightPct = ((score + 1) / 6) * 100;
                        const isCurrent = f.year === new Date().getFullYear();
                        return (
                          <div key={f.year} className="flex-1 flex flex-col items-center justify-end h-full">
                            <div
                              className={`w-full rounded-t transition-all ${
                                score >= 4 ? 'bg-green-500' : score === 3 ? 'bg-cyan-400' : score >= 1 ? 'bg-orange-400' : 'bg-red-500'
                              } ${isCurrent ? 'ring-1 ring-primary' : ''}`}
                              style={{ height: `${heightPct}%` }}
                            />
                            <p className={`text-[8px] mt-1 ${isCurrent ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                              {String(f.year).slice(2)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Selected year detail */}
                {lnSelectedFortune && lnQuarters && (
                  <>
                    {/* Year base info */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{lnSelectedFortune.year}年 · 年位落宫</CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs space-y-1">
                        <p>{lnSelectedFortune.year}年属<strong>{ZODIACS[getYearBranch(lnSelectedFortune.year)]}</strong>（{EARTHLY_BRANCHES[getYearBranch(lnSelectedFortune.year)]}），地支序{getYearBranch(lnSelectedFortune.year) % 6 + 1} → 落宫 <strong className={lnSelectedFortune.yearShen.color}>{lnSelectedFortune.yearShen.name}</strong>（{lnSelectedFortune.yearShen.nature}）</p>
                      </CardContent>
                    </Card>

                    {/* Q1-Q4 cards */}
                    <div className="grid grid-cols-4 gap-2">
                      {lnQuarters.map(q => {
                        const isSelected = lnSelectedQuarter === q.quarter;
                        const score = getFortuneScore(q.resultShen.nature);
                        return (
                          <Card
                            key={q.quarter}
                            className={`cursor-pointer transition-all ${
                              isSelected ? "border-primary shadow-md ring-1 ring-primary/30" : "hover:border-primary/30"
                            }`}
                            onClick={() => setLnSelectedQuarter(isSelected ? null : q.quarter)}
                          >
                            <CardContent className="p-2 text-center space-y-0.5">
                              <p className="text-[10px] font-bold text-primary">{q.label}</p>
                              <p className="text-[9px] text-muted-foreground">{q.months}</p>
                              <div className={`w-full h-1.5 rounded-full ${
                                score >= 4 ? 'bg-green-500' : score === 3 ? 'bg-cyan-400' : score >= 1 ? 'bg-orange-400' : 'bg-red-500'
                              }`} />
                              <p className={`text-sm font-bold ${q.resultShen.color}`}>{q.resultShen.name}</p>
                              <Badge variant={getNatureVariant(q.resultShen.nature)} className="text-[8px] px-0.5">
                                {q.resultShen.nature}
                              </Badge>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>

                    {/* Quarterly trend bar */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          {lnSelectedFortune.year}年 季度走势
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-end gap-2 h-16">
                          {lnQuarters.map(q => {
                            const score = getFortuneScore(q.resultShen.nature);
                            const heightPct = ((score + 1) / 6) * 100;
                            return (
                              <div key={q.quarter} className="flex-1 flex flex-col items-center justify-end h-full">
                                <div
                                  className={`w-full rounded-t transition-all ${
                                    score >= 4 ? 'bg-green-500' : score === 3 ? 'bg-cyan-400' : score >= 1 ? 'bg-orange-400' : 'bg-red-500'
                                  }`}
                                  style={{ height: `${heightPct}%` }}
                                />
                                <p className="text-[9px] mt-1 text-muted-foreground">{q.label}</p>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Selected quarter detail */}
                    {lnSelectedQ && (
                      <>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">{lnSelectedFortune.year}年 {lnSelectedQ.label} 推算过程</CardTitle>
                          </CardHeader>
                          <CardContent className="text-xs space-y-1.5">
                            <p>第1步 · <strong>年</strong>：{lnSelectedFortune.year}年属{ZODIACS[getYearBranch(lnSelectedFortune.year)]}（{EARTHLY_BRANCHES[getYearBranch(lnSelectedFortune.year)]}） → 落宫 <strong className={lnSelectedFortune.yearShen.color}>{lnSelectedFortune.yearShen.name}</strong></p>
                            <p>第2步 · <strong>季月</strong>：从{lnSelectedFortune.yearShen.name}起数{LUNAR_MONTH_NAMES[lnSelectedQ.quarterMonth - 1]}（{lnSelectedQ.quarterMonth}） → 落宫 <strong className={LIU_SHEN_DATA[lnSelectedQ.monthPos].color}>{LIU_SHEN_DATA[lnSelectedQ.monthPos].name}</strong></p>
                            <p>第3步 · <strong>日</strong>：从{LIU_SHEN_DATA[lnSelectedQ.monthPos].name}起数农历{lnLunarInfo!.lunarDay}日 → 落宫 <strong className={lnSelectedQ.dayShen.color}>{lnSelectedQ.dayShen.name}</strong></p>
                            <p>第4步 · <strong>时</strong>：从{lnSelectedQ.dayShen.name}起数{getShichenDisplayName(parseInt(lnBirthHour))} → 落宫 <strong className={lnSelectedQ.resultShen.color}>{lnSelectedQ.resultShen.name}</strong>（最终结果）</p>
                          </CardContent>
                        </Card>

                        {/* Four step mini cards for quarter */}
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { label: "年", shen: lnSelectedFortune.yearShen, pos: lnSelectedFortune.yearPos },
                            { label: "季月", shen: LIU_SHEN_DATA[lnSelectedQ.monthPos], pos: lnSelectedQ.monthPos },
                            { label: "日", shen: lnSelectedQ.dayShen, pos: lnSelectedQ.dayPos },
                            { label: "时", shen: lnSelectedQ.resultShen, pos: lnSelectedQ.hourPos },
                          ].map((item, i) => (
                            <Card key={i} className={i === 3 ? "border-primary/50 shadow-md" : ""}>
                              <CardContent className="p-2 text-center space-y-0.5">
                                <p className="text-[10px] text-muted-foreground">{item.label}</p>
                                <p className="text-[10px] font-mono text-primary">{item.pos + 1}</p>
                                <p className={`text-sm font-bold ${item.shen.color}`}>{item.shen.name}</p>
                                <Badge variant={getNatureVariant(item.shen.nature)} className="text-[9px] px-1">{item.shen.nature}</Badge>
                              </CardContent>
                            </Card>
                          ))}
                        </div>

                        {/* Single palace reading for quarter */}
                        <Card className="border-primary/30">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <BookOpen className="h-4 w-4" />
                              {lnSelectedFortune.year}年 {lnSelectedQ.label}（{lnSelectedQ.months}）· {lnSelectedQ.resultShen.name}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center gap-3">
                              <span className={`text-2xl font-bold ${lnSelectedQ.resultShen.color}`}>{lnSelectedQ.resultShen.name}</span>
                              <Badge variant={getNatureVariant(lnSelectedQ.resultShen.nature)}>{lnSelectedQ.resultShen.nature}</Badge>
                              <span className="text-xs text-muted-foreground">{lnSelectedQ.resultShen.element} · {lnSelectedQ.resultShen.guardian}</span>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-3">
                              <p className="text-xs italic leading-relaxed">{lnSelectedQ.resultShen.poem}</p>
                            </div>
                            <p className="text-sm">{lnSelectedQ.resultShen.detail}</p>
                            <Separator />
                            <Accordion type="multiple" defaultValue={["general", "wealth", "career"]}>
                              {Object.entries(lnSelectedQ.resultShen.singlePalace).map(([key, value]) => (
                                <AccordionItem key={key} value={key}>
                                  <AccordionTrigger className="text-sm py-2">{ASPECT_LABELS[key] || key}</AccordionTrigger>
                                  <AccordionContent className="text-sm text-muted-foreground">{value}</AccordionContent>
                                </AccordionItem>
                              ))}
                            </Accordion>
                          </CardContent>
                        </Card>

                        {/* Double palace for quarter */}
                        {(() => {
                          const dpKey = `${lnSelectedQ.dayShen.name}-${lnSelectedQ.resultShen.name}`;
                          const dp = DOUBLE_PALACE_READINGS[dpKey];
                          if (!dp) return null;
                          return (
                            <Card className="border-accent/30">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm flex items-center gap-2">
                                  <Scale className="h-4 w-4" />
                                  双宫断事 · {dp.combo}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">日</span>
                                  <span className={`font-bold ${lnSelectedQ.dayShen.color}`}>{lnSelectedQ.dayShen.name}</span>
                                  <span className="text-muted-foreground">→</span>
                                  <span className="text-xs text-muted-foreground">时</span>
                                  <span className={`font-bold ${lnSelectedQ.resultShen.color}`}>{lnSelectedQ.resultShen.name}</span>
                                </div>
                                <div className="bg-muted/50 rounded-lg p-3">
                                  <p className="text-sm font-semibold mb-1">{dp.overview}</p>
                                  <p className="text-xs text-muted-foreground">{dp.detail}</p>
                                </div>
                                <div className="border border-border rounded-lg p-3">
                                  <p className="text-xs font-medium mb-1">建议</p>
                                  <p className="text-sm">{dp.advice}</p>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })()}
                      </>
                    )}

                    {!lnSelectedQuarter && (
                      <div className="text-center text-sm text-muted-foreground py-4">
                        👆 点击上方季度卡片查看详细分析
                      </div>
                    )}
                  </>
                )}

                {!lnSelectedYear && (
                  <div className="text-center text-sm text-muted-foreground py-4">
                    👆 点击上方年份卡片查看详细分析
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default XiaoLiuRen;
