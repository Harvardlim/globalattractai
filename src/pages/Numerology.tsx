import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/hooks/useLanguage";
import { calculateLifeCode, getNumberMeaning, getCombinedCodeMeaning, LifeCodeResult } from "@/lib/pyramidNumerology";

const translations = {
  zh: {
    title: '数字学',
    subtitle: '生命密码金字塔',
    solarTab: '公历生日',
    lunarTab: '农历生日',
    placeholder: '请输入出生日期，如 19880101',
    innerNumber: '内心数字',
    outerNumber: '外心数字',
    subconsciousNumber: '潜意识数字',
    lateYearsNumber: '晚年数字',
    combinedCodes: '联合数字',
    baseRow: '基础层（出生日期）',
    numberMeaning: '数字含义',
    mainPersonality: '主性格密码',
  },
  en: {
    title: 'Numerology',
    subtitle: 'Life Code Pyramid',
    solarTab: 'Solar Birthday',
    lunarTab: 'Lunar Birthday',
    placeholder: 'Enter birth date, e.g. 19880101',
    innerNumber: 'Inner Number',
    outerNumber: 'Outer Number',
    subconsciousNumber: 'Subconscious',
    lateYearsNumber: 'Late Years',
    combinedCodes: 'Combined Codes',
    baseRow: 'Base (birth date)',
    numberMeaning: 'Number Meanings',
    mainPersonality: 'Main Personality',
  },
  ms: {
    title: 'Numerologi',
    subtitle: 'Piramid Kod Kehidupan',
    solarTab: 'Hari Lahir Solar',
    lunarTab: 'Hari Lahir Lunar',
    placeholder: 'Masukkan tarikh lahir, cth 19880101',
    innerNumber: 'Nombor Dalaman',
    outerNumber: 'Nombor Luaran',
    subconsciousNumber: 'Separa Sedar',
    lateYearsNumber: 'Tahun Akhir',
    combinedCodes: 'Kod Gabungan',
    baseRow: 'Asas (tarikh lahir)',
    numberMeaning: 'Makna Nombor',
    mainPersonality: 'Personaliti Utama',
  },
} as const;

const Numerology: React.FC = () => {
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage] || translations.zh;

  const [inputValue, setInputValue] = useState('');
  const [activeTab, setActiveTab] = useState<'solar' | 'lunar'>('solar');

  const result = useMemo<LifeCodeResult | null>(() => {
    if (inputValue.length !== 8) return null;
    const y = parseInt(inputValue.slice(0, 4));
    const m = parseInt(inputValue.slice(4, 6));
    const d = parseInt(inputValue.slice(6, 8));
    if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
    if (m < 1 || m > 12 || d < 1 || d > 31) return null;
    const date = new Date(y, m - 1, d);
    if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
    return calculateLifeCode(date);
  }, [inputValue]);

  const handleInput = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 8);
    setInputValue(cleaned);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-2 sm:px-4 py-3 max-w-7xl">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold">{t.title}</h1>
              <p className="text-xs text-muted-foreground">{t.subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 max-w-7xl space-y-4 pb-24">
        {/* Pyramid Display */}
        {result && <PyramidDisplay result={result} t={t} />}

        {/* Main Personality */}
        {result && <MainPersonality num={result.O} lang={currentLanguage} t={t} />}

        {/* Special Numbers */}
        {result && <SpecialNumbers result={result} t={t} lang={currentLanguage} />}

        {/* Combined Codes */}
        {result && <CombinedCodesGrid result={result} t={t} lang={currentLanguage} />}

        {/* Input Section */}
        <div className="space-y-3">
          {/* Tabs */}
          <div className="flex justify-center gap-0 border-b border-border">
            <button
              onClick={() => setActiveTab('solar')}
              className={`px-6 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'solar'
                  ? 'border-amber-500 text-foreground'
                  : 'border-transparent text-muted-foreground'
              }`}
            >
              {t.solarTab}
            </button>
            <button
              onClick={() => setActiveTab('lunar')}
              className={`px-6 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'lunar'
                  ? 'border-amber-500 text-foreground'
                  : 'border-transparent text-muted-foreground'
              }`}
            >
              {t.lunarTab}
            </button>
          </div>

          {/* Input */}
          <div className="relative">
            <Input
              type="text"
              inputMode="numeric"
              value={inputValue}
              onChange={(e) => handleInput(e.target.value)}
              placeholder={t.placeholder}
              className="pr-10 text-base h-12 rounded-full border-border/50"
            />
            {inputValue && (
              <button
                onClick={() => setInputValue('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-full"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Pyramid Visual ─── */
function PyramidDisplay({ result, t }: { result: LifeCodeResult; t: any }) {
  const { I, J, K, L, M, N, O, T, S, U, V, W, X, P, Q, R, pairs } = result;

  const numCell = (n: number, size = 'w-9 h-9 text-base', extra = '') => (
    <span className={`inline-flex items-center justify-center font-bold ${size} ${extra}`}>
      {n}
    </span>
  );

  const starMark = <span className="text-red-500 text-xs font-bold">*</span>;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 pt-6">
        <div className="flex flex-col items-center gap-0.5 relative">
          {/* Peak (R) */}
          <div className="flex items-center justify-center">
            {numCell(R, 'w-8 h-8 text-base')}
          </div>

          {/* P, Q row */}
          <div className="flex items-center justify-center gap-4 mb-1">
            <div className="border-b border-foreground/30 px-2">
              {numCell(P, 'w-7 h-7 text-sm')}
              {numCell(Q, 'w-7 h-7 text-sm')}
            </div>
          </div>

          {/* Triangle with SVG */}
          <div className="relative w-full max-w-[320px] mx-auto">
            {/* SVG Triangle background */}
            <svg viewBox="0 0 320 200" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
              <polygon
                points="160,15 30,185 290,185"
                fill="hsl(var(--accent) / 0.15)"
                stroke="hsl(40, 80%, 65%)"
                strokeWidth="2"
              />
            </svg>

            {/* Numbers overlaid on triangle */}
            <div className="absolute inset-0 flex flex-col items-center justify-between py-[8%]">
              {/* Top of triangle: O with star */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2">{starMark}</span>
                  {numCell(O, 'w-10 h-10 text-xl text-amber-700')}
                </div>
              </div>

              {/* Middle: M, N */}
              <div className="flex items-center justify-center gap-6">
                {numCell(M, 'w-10 h-10 text-lg font-bold')}
                {numCell(N, 'w-10 h-10 text-lg font-bold')}
              </div>

              {/* Bottom: I, J, K, L with stars on I and L */}
              <div className="flex items-center justify-center gap-3">
                <div className="relative">
                  <span className="absolute -bottom-4 -left-2">{starMark}</span>
                  {numCell(I, 'w-10 h-10 text-lg font-bold')}
                </div>
                {numCell(J, 'w-10 h-10 text-lg font-bold')}
                {numCell(K, 'w-10 h-10 text-lg font-bold')}
                <div className="relative">
                  <span className="absolute -bottom-4 -right-2">{starMark}</span>
                  {numCell(L, 'w-10 h-10 text-lg font-bold')}
                </div>
              </div>
            </div>

            {/* Left outside: U=T, S */}
            <div className="absolute left-0 top-[12%] flex items-center gap-1 text-sm">
              <span className="font-bold">{U}</span>
              <span className="text-muted-foreground">=</span>
              <span className="font-bold">{T}</span>
              <span className="ml-2 font-bold">{S}</span>
            </div>

            {/* Right outside: V, W=X */}
            <div className="absolute right-0 top-[12%] flex items-center gap-1 text-sm">
              <span className="font-bold mr-2">{V}</span>
              <span className="font-bold">{W}</span>
              <span className="text-muted-foreground">=</span>
              <span className="font-bold">{X}</span>
            </div>
          </div>

          {/* Base pairs */}
          <div className="flex items-center justify-center gap-6 mt-2 text-sm text-muted-foreground font-medium">
            {pairs.map((p, i) => (
              <span key={i}>{p}</span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Main Personality ─── */
function MainPersonality({ num, lang, t }: { num: number; lang: string; t: any }) {
  const [open, setOpen] = useState(false);
  const meaning = getNumberMeaning(num, lang);

  return (
    <Card className="cursor-pointer" onClick={() => setOpen(!open)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">{num}</span>
            <span className="text-sm font-medium">{t.mainPersonality}</span>
            <span className="text-sm text-muted-foreground">- {meaning.title}</span>
          </div>
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
        {open && (
          <p className="mt-2 text-sm text-muted-foreground">{meaning.description}</p>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Special Numbers ─── */
function SpecialNumbers({ result, t, lang }: { result: LifeCodeResult; t: any; lang: string }) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const items = [
    { value: result.innerNumber, display: String(result.innerNumber), label: t.innerNumber },
    { value: result.outerNumber, display: String(result.outerNumber), label: t.outerNumber },
    { value: result.subconsciousNumber, display: String(result.subconsciousNumber), label: t.subconsciousNumber },
    { value: 0, display: result.lateYearsCode, label: t.lateYearsNumber, isCode: true },
  ];

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="grid grid-cols-4 gap-2 text-center">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
              className="space-y-1 p-1 rounded-lg hover:bg-accent/50 transition-colors"
            >
              <p className="text-xl font-bold">{item.display}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
              {expandedIdx === i ? <ChevronUp className="h-3 w-3 mx-auto text-muted-foreground" /> : <ChevronDown className="h-3 w-3 mx-auto text-muted-foreground" />}
            </button>
          ))}
        </div>
        {expandedIdx !== null && (() => {
          const item = items[expandedIdx];
          if (item.isCode) {
            // Late years code: show meaning for each digit
            const digits = item.display.split('').map(Number);
            return (
              <div className="border-t border-border pt-3 space-y-2">
                {digits.map((d, di) => {
                  const m = getNumberMeaning(d, lang);
                  return (
                    <div key={di} className="text-sm">
                      <span className="font-bold text-primary">{d}</span>
                      <span className="text-muted-foreground ml-1">- {m.title}：{m.description}</span>
                    </div>
                  );
                })}
              </div>
            );
          }
          const m = getNumberMeaning(item.value, lang);
          return (
            <div className="border-t border-border pt-3 text-sm">
              <span className="font-bold text-primary">{item.value}</span>
              <span className="ml-1 font-medium">{m.title}</span>
              <p className="mt-1 text-muted-foreground">{m.description}</p>
            </div>
          );
        })()}
      </CardContent>
    </Card>
  );
}

/* ─── Combined Codes Grid ─── */
function CombinedCodesGrid({ result, t, lang }: { result: LifeCodeResult; t: any; lang: string }) {
  const [expandedCode, setExpandedCode] = useState<number | null>(null);
  const codes = result.combinedCodes;
  const rows = [codes.slice(0, 4), codes.slice(4, 8), codes.slice(8, 12)];

  let flatIdx = 0;

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <p className="text-xs text-muted-foreground">{t.combinedCodes}</p>
        <div className="space-y-1">
          {rows.map((row, ri) => (
            <div key={ri} className="grid grid-cols-4 gap-2 text-center">
              {row.map((code, ci) => {
                const idx = ri * 4 + ci;
                return (
                  <button
                    key={ci}
                    onClick={() => setExpandedCode(expandedCode === idx ? null : idx)}
                    className={`font-bold text-base p-1 rounded-lg transition-colors ${
                      expandedCode === idx ? 'bg-accent' : 'hover:bg-accent/50'
                    }`}
                  >
                    {code.join('')}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        {expandedCode !== null && (() => {
          const code = codes[expandedCode];
          return (
            <div className="border-t border-border pt-3 space-y-2">
              {code.map((n, ni) => {
                const m = getNumberMeaning(n, lang);
                return (
                  <div key={ni} className="text-sm">
                    <span className="font-bold text-primary">{n}</span>
                    <span className="text-muted-foreground ml-1">- {m.title}：{m.description}</span>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </CardContent>
    </Card>
  );
}

export default Numerology;
