import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calculator, RotateCcw, BookOpen, ArrowRight } from "lucide-react";
import { HEXAGRAM_DATA } from "@/data/hexagramData";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLanguage } from "@/hooks/useLanguage";
import { getEnergyTranslations } from "@/data/energyTranslations";

// 八卦 mapping: remainder → trigram
const TRIGRAMS: Record<number, { name: string; symbol: string; lines: boolean[] }> = {
  1: { name: "乾", symbol: "☰", lines: [true, true, true] },
  2: { name: "兑", symbol: "☱", lines: [true, true, false] },
  3: { name: "离", symbol: "☲", lines: [true, false, true] },
  4: { name: "震", symbol: "☳", lines: [false, false, true] },
  5: { name: "巽", symbol: "☴", lines: [true, true, false] },
  6: { name: "坎", symbol: "☵", lines: [false, true, false] },
  7: { name: "艮", symbol: "☶", lines: [true, false, false] },
  0: { name: "坤", symbol: "☷", lines: [false, false, false] },
};

const HEXAGRAM_NAMES: Record<string, string> = {
  "1-1": "乾为天", "1-2": "天泽履", "1-3": "天火同人", "1-4": "天雷无妄",
  "1-5": "天风姤", "1-6": "天水讼", "1-7": "天山遁", "1-0": "天地否",
  "2-1": "泽天夬", "2-2": "兑为泽", "2-3": "泽火革", "2-4": "泽雷随",
  "2-5": "泽风大过", "2-6": "泽水困", "2-7": "泽山咸", "2-0": "泽地萃",
  "3-1": "火天大有", "3-2": "火泽睽", "3-3": "离为火", "3-4": "火雷噬嗑",
  "3-5": "火风鼎", "3-6": "火水未济", "3-7": "火山旅", "3-0": "火地晋",
  "4-1": "雷天大壮", "4-2": "雷泽归妹", "4-3": "雷火丰", "4-4": "震为雷",
  "4-5": "雷风恒", "4-6": "雷水解", "4-7": "雷山小过", "4-0": "雷地豫",
  "5-1": "风天小畜", "5-2": "风泽中孚", "5-3": "风火家人", "5-4": "风雷益",
  "5-5": "巽为风", "5-6": "风水涣", "5-7": "风山渐", "5-0": "风地观",
  "6-1": "水天需", "6-2": "水泽节", "6-3": "水火既济", "6-4": "水雷屯",
  "6-5": "水风井", "6-6": "坎为水", "6-7": "水山蹇", "6-0": "水地比",
  "7-1": "山天大畜", "7-2": "山泽损", "7-3": "山火贲", "7-4": "山雷颐",
  "7-5": "山风蛊", "7-6": "山水蒙", "7-7": "艮为山", "7-0": "山地剥",
  "0-1": "地天泰", "0-2": "地泽临", "0-3": "地火明夷", "0-4": "地雷复",
  "0-5": "地风升", "0-6": "地水师", "0-7": "地山谦", "0-0": "坤为地",
};

interface HexagramResult {
  input: string;
  upperDigits: string;
  lowerDigits: string;
  upperNum: number;
  lowerNum: number;
  upperRemainder: number;
  lowerRemainder: number;
  upperTrigram: typeof TRIGRAMS[0];
  lowerTrigram: typeof TRIGRAMS[0];
  hexagramName: string;
  changingLinePos: number;
  digitSum: number;
  hexagramLines: boolean[];
  changedHexagramName: string;
  changedLines: boolean[];
}

function calcHexagram(digits: string): HexagramResult {
  const d = digits.split("").map(Number);
  const upperNum = parseInt(digits.slice(0, 2));
  const lowerNum = parseInt(digits.slice(2, 4));
  const upperRemainder = upperNum % 8;
  const lowerRemainder = lowerNum % 8;

  const upperTrigram = TRIGRAMS[upperRemainder];
  const lowerTrigram = TRIGRAMS[lowerRemainder];

  const hexagramName = HEXAGRAM_NAMES[`${upperRemainder}-${lowerRemainder}`] || "未知卦";

  const hexagramLines = [...lowerTrigram.lines, ...upperTrigram.lines];

  const digitSum = d.reduce((s, v) => s + v, 0);
  const changingRemainder = digitSum % 6;
  const changingLinePos = changingRemainder === 0 ? 6 : changingRemainder;

  const changedLines = [...hexagramLines];
  changedLines[changingLinePos - 1] = !changedLines[changingLinePos - 1];

  const changedLower = changedLines.slice(0, 3);
  const changedUpper = changedLines.slice(3, 6);
  const findTrigramRemainder = (lines: boolean[]) => {
    for (const [key, tri] of Object.entries(TRIGRAMS)) {
      if (tri.lines[0] === lines[0] && tri.lines[1] === lines[1] && tri.lines[2] === lines[2]) {
        return parseInt(key);
      }
    }
    return 0;
  };
  const changedUpperR = findTrigramRemainder(changedUpper);
  const changedLowerR = findTrigramRemainder(changedLower);
  const changedHexagramName = HEXAGRAM_NAMES[`${changedUpperR}-${changedLowerR}`] || "未知卦";

  return {
    input: digits,
    upperDigits: digits.slice(0, 2),
    lowerDigits: digits.slice(2, 4),
    upperNum, lowerNum,
    upperRemainder, lowerRemainder,
    upperTrigram, lowerTrigram,
    hexagramName,
    changingLinePos,
    digitSum,
    hexagramLines,
    changedHexagramName,
    changedLines,
  };
}

const LineDisplay: React.FC<{ solid: boolean; isChanging?: boolean; lineNum: number; changeLabel: string }> = ({ solid, isChanging, lineNum, changeLabel }) => (
  <div className="flex items-center gap-2">
    <span className="text-xs text-muted-foreground w-4 text-right">{lineNum}</span>
    <div className="flex-1 flex justify-center gap-1">
      {solid ? (
        <div className={`h-1.5 w-full max-w-[80px] rounded-sm ${isChanging ? 'bg-destructive' : 'bg-foreground'}`} />
      ) : (
        <>
          <div className={`h-1.5 w-[35%] max-w-[34px] rounded-sm ${isChanging ? 'bg-destructive' : 'bg-foreground'}`} />
          <div className="h-1.5 w-[10%] max-w-[12px]" />
          <div className={`h-1.5 w-[35%] max-w-[34px] rounded-sm ${isChanging ? 'bg-destructive' : 'bg-foreground'}`} />
        </>
      )}
    </div>
    {isChanging && <span className="text-xs text-destructive font-bold">{changeLabel}</span>}
  </div>
);

const HexagramDisplay: React.FC<{ lines: boolean[]; changingLine?: number; label: string; changeLabel: string }> = ({ lines, changingLine, label, changeLabel }) => (
  <div className="flex flex-col items-center gap-1">
    <span className="text-sm font-medium mb-1">{label}</span>
    <div className="flex flex-col-reverse gap-1 w-full max-w-[120px]">
      {lines.map((solid, i) => (
        <LineDisplay key={i} solid={solid} lineNum={i + 1} isChanging={changingLine === i + 1} changeLabel={changeLabel} />
      ))}
    </div>
  </div>
);

export const HexagramCalculator: React.FC = () => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<HexagramResult | null>(null);
  const [error, setError] = useState("");
  const { currentLanguage } = useLanguage();
  const et = getEnergyTranslations(currentLanguage);

  const handleCalculate = () => {
    const cleaned = input.replace(/\D/g, "");
    if (cleaned.length < 4) {
      setError(et.hexagramError);
      return;
    }
    const last4 = cleaned.slice(-4);
    setError("");
    setResult(calcHexagram(last4));
  };

  const handleReset = () => {
    setInput("");
    setResult(null);
    setError("");
  };

  return (
    <div className="space-y-4 px-2 mb-16">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            {et.hexagramTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder={et.hexagramPlaceholder}
              maxLength={4}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleCalculate()}
              className="flex-1"
            />
            <Button onClick={handleCalculate} size="sm">{et.hexagramCalc}</Button>
            <Button onClick={handleReset} size="sm" variant="outline"><RotateCcw className="h-4 w-4" /></Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <p className="text-xs text-muted-foreground">{et.hexagramHint}</p>
        </CardContent>
      </Card>

      {result && (
        <>
          {/* Step breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{et.hexagramProcess}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="space-y-1">
                <p><strong>{et.step}1：</strong>{currentLanguage === 'zh' ? '后四位' : currentLanguage === 'en' ? 'Last 4 digits' : '4 digit terakhir'} → {et.upperHexagram} <Badge variant="outline">{result.upperDigits}</Badge> {et.lowerHexagram} <Badge variant="outline">{result.lowerDigits}</Badge></p>
                <p><strong>{et.step}2：</strong>{et.upperHexagram} {result.upperNum} ÷ 8 = {et.quotient}{Math.floor(result.upperNum / 8)} {et.remainder}{result.upperRemainder} → {result.upperTrigram.name} {result.upperTrigram.symbol}</p>
                <p className="pl-[3.5rem]">{et.lowerHexagram} {result.lowerNum} ÷ 8 = {et.quotient}{Math.floor(result.lowerNum / 8)} {et.remainder}{result.lowerRemainder} → {result.lowerTrigram.name} {result.lowerTrigram.symbol}</p>
                <p><strong>{et.step}3：</strong>{result.upperTrigram.name} {result.upperTrigram.symbol} + {result.lowerTrigram.name} {result.lowerTrigram.symbol} = <strong>{result.hexagramName}</strong></p>
                <p><strong>{et.step}4：</strong>{et.digitSumLabel} = {result.input.split("").join("+")} = {result.digitSum}，{result.digitSum} ÷ 6 = {et.remainder}{result.digitSum % 6} → {et.changingLineAt.replace('{pos}', String(result.changingLinePos))}</p>
                <p><strong>{et.step}5：</strong>{et.changedHexagram} → <strong>{result.changedHexagramName}</strong></p>
              </div>
            </CardContent>
          </Card>

          {/* Visual hexagram display */}
          <Card>
            <CardContent className="pt-5">
              <div className="grid grid-cols-3 gap-4">
                <HexagramDisplay lines={result.hexagramLines} changingLine={result.changingLinePos} label={`${et.mainHexagram}：${result.hexagramName}`} changeLabel={et.change} />
                <div className="flex flex-col items-center justify-center">
                  <span className="text-xs text-muted-foreground">{et.changingLineAt.replace('{pos}', String(result.changingLinePos))}</span>
                  <span className="text-lg">→</span>
                </div>
                <HexagramDisplay lines={result.changedLines} label={`${et.changedHexagram}：${result.changedHexagramName}`} changeLabel={et.change} />
              </div>
              <Separator className="my-4" />
              <div className="grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
                <div>
                  <p className="font-medium text-foreground">{et.mainHexagram}</p>
                  <p>{et.originalState}</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">{et.changingLine}</p>
                  <p>{et.developProcess}</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">{et.changedHexagram}</p>
                  <p>{et.resultTrend}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hexagram Interpretations */}
          {(() => {
            const mainInfo = HEXAGRAM_DATA[result.hexagramName];
            const changedInfo = HEXAGRAM_DATA[result.changedHexagramName];
            const natureColors: Record<string, string> = {
              '大吉': 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
              '吉': 'bg-green-500/15 text-green-700 border-green-500/30',
              '中吉': 'bg-blue-500/15 text-blue-700 border-blue-500/30',
              '平': 'bg-muted text-muted-foreground border-border',
              '凶': 'bg-orange-500/15 text-orange-700 border-orange-500/30',
              '大凶': 'bg-destructive/15 text-destructive border-destructive/30',
            };
            return (
              <>
                {mainInfo && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        {et.mainHexagram}：{result.hexagramName}
                        <Badge variant="outline" className={natureColors[mainInfo.nature] || ''}>{mainInfo.nature}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">{et.guaCi}</p>
                        <p className="text-sm">{mainInfo.guaCi}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">{et.summary}</p>
                        <p className="text-sm">{mainInfo.summary}</p>
                      </div>
                      <Separator />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">{et.yaoCi}（{et.changingLineAt.replace('{pos}', String(result.changingLinePos))}）</p>
                        <Accordion type="single" collapsible defaultValue={`yao-${result.changingLinePos - 1}`}>
                          {mainInfo.yaoCi.map((yao, i) => (
                            <AccordionItem key={i} value={`yao-${i}`} className="border-b-0">
                              <AccordionTrigger className={`text-sm py-2 hover:no-underline ${i === result.changingLinePos - 1 ? 'text-destructive font-semibold' : ''}`}>
                                <span className="flex items-center gap-2">
                                  {i === result.changingLinePos - 1 && <ArrowRight className="h-3 w-3" />}
                                  {et.lineNum.replace('{n}', String(i + 1))}{i === result.changingLinePos - 1 ? et.yaoCiChanging : ''}
                                </span>
                              </AccordionTrigger>
                              <AccordionContent className="text-sm pb-2 pl-2">
                                {yao}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {changedInfo && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        {et.changedHexagram}：{result.changedHexagramName}
                        <Badge variant="outline" className={natureColors[changedInfo.nature] || ''}>{changedInfo.nature}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">{et.guaCi}</p>
                        <p className="text-sm">{changedInfo.guaCi}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">{et.summary}</p>
                        <p className="text-sm">{changedInfo.summary}</p>
                      </div>
                      <Separator />
                      <Accordion type="single" collapsible>
                        <AccordionItem value="all-yao" className="border-b-0">
                          <AccordionTrigger className="text-sm py-2 hover:no-underline">
                            {et.viewAllYaoCi}
                          </AccordionTrigger>
                          <AccordionContent className="space-y-2 text-sm pb-2">
                            {changedInfo.yaoCi.map((yao, i) => (
                              <p key={i} className="pl-2 py-1 border-l-2 border-border">{yao}</p>
                            ))}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                )}
              </>
            );
          })()}
        </>
      )}
    </div>
  );
};
