import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ChartData, PalaceData, StemStatus } from "@/types";
import { getPalaceKeYing, KeYingInfo } from "@/lib/shiGanKeYing";
import { getDoorPalaceHexagram, getStarDoorHexagram, HexagramInfo } from "@/lib/qimenHexagram";
import { analyzeZhiFuZhiShi } from "@/data/zhifuZhishiData";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  calculateTianDiMenHuByDate, 
  getPalaceSpirits, 
  getGateName,
  TWELVE_GENERALS,
  JIAN_CHU_SPIRITS,
  TianDiMenHuData 
} from "@/lib/tiandiMenhu";

const VISUAL_ORDER = [4, 9, 2, 3, 5, 7, 8, 1, 6];

interface ChartGridProps {
  data: ChartData | null;
}

interface KeYingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  palaceData: PalaceData | null;
}

const HexagramCard: React.FC<{ hex: HexagramInfo; label: string; colorClass: string }> = ({ hex, label, colorClass }) => (
  <Collapsible>
    <div className="rounded-lg border bg-card overflow-hidden">
      <CollapsibleTrigger className="flex items-center gap-3 p-3 w-full group">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-lg leading-none">{hex.upperSymbol}</span>
          <span className="text-lg leading-none">{hex.lowerSymbol}</span>
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-1.5 mb-1">
            <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded", colorClass)}>{label}</span>
            <span className="text-sm font-bold text-foreground">{hex.name}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            <span>{hex.upperLabel}（{hex.upperTrigram}）</span>
            <span className="mx-1">+</span>
            <span>{hex.lowerLabel}（{hex.lowerTrigram}）</span>
          </div>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      {hex.meaning && (
        <CollapsibleContent>
          <div className="px-3 pb-3">
            <p className="text-xs text-muted-foreground leading-relaxed pl-2 border-l-2 border-muted">
              {hex.meaning}
            </p>
          </div>
        </CollapsibleContent>
      )}
    </div>
  </Collapsible>
);

const KeYingModal: React.FC<KeYingModalProps> = ({ open, onOpenChange, palaceData }) => {
  if (!palaceData) return null;

  const keYingList = getPalaceKeYing(
    palaceData.skyStem,
    palaceData.skyStem2,
    palaceData.earthStem,
    palaceData.earthStem2
  );

  const doorPalaceHex = palaceData.door ? getDoorPalaceHexagram(palaceData.door, palaceData.id) : null;
  const starDoorHex = (palaceData.star && palaceData.door) ? getStarDoorHexagram(palaceData.star, palaceData.door) : null;

  const getNatureColor = (nature: KeYingInfo['nature']) => {
    switch (nature) {
      case 'auspicious':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 rounded-md';
      case 'inauspicious':
        return 'bg-red-100 text-red-800 border-red-300 rounded-md';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300 rounded-md';
    }
  };

  const getNatureText = (nature: KeYingInfo['nature']) => {
    switch (nature) {
      case 'auspicious':
        return '吉';
      case 'inauspicious':
        return '凶';
      default:
        return '平';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm bg-white rounded-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-lg">宫位详解</span>
            <span className="text-sm text-muted-foreground">
              {palaceData.position}（{palaceData.bagua}）
            </span>
          </DialogTitle>
        </DialogHeader>
        
        {/* 卦象区 */}
        {(doorPalaceHex || starDoorHex) && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">卦象</p>
            {doorPalaceHex && (
              <HexagramCard hex={doorPalaceHex} label="门宫卦" colorClass="bg-amber-100 text-amber-700" />
            )}
            {starDoorHex && (
              <HexagramCard hex={starDoorHex} label="星门卦" colorClass="bg-sky-100 text-sky-700" />
            )}
          </div>
        )}

        {(doorPalaceHex || starDoorHex) && keYingList.length > 0 && <Separator />}

        {/* 十干克应区 */}
        {keYingList.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">十干克应</p>
            {keYingList.map((item, index) => (
              <Collapsible key={index}>
                <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 group">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-primary">{item.sky}</span>
                      <span className="text-muted-foreground text-sm">+</span>
                      <span className="text-lg font-bold text-secondary-foreground">{item.earth}</span>
                      <span className="text-sm font-semibold text-foreground ml-1">{item.keYing.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge 
                        variant="outline" 
                        className={cn("font-medium text-xs", getNatureColor(item.keYing.nature))}
                      >
                        {getNatureText(item.keYing.nature)}
                      </Badge>
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-3 pb-3">
                      <p className="text-sm text-muted-foreground leading-relaxed pl-2 border-l-2 border-muted">
                        {item.keYing.description}
                      </p>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

interface PalaceCellProps {
  data: PalaceData;
  onPalaceClick: (data: PalaceData) => void;
}

const PalaceCell = React.forwardRef<HTMLDivElement, PalaceCellProps>(({ data, onPalaceClick }, ref) => {
  const isCenter = data.id === 5;

  const mainFontBase = "text-[14px] sm:text-[16px] md:text-[16px] pb-1 leading-none";
  const lifeFont = "text-[9px] text-slate-500 font-normal leading-none scale-90 origin-left ml-[1px]";

  if (isCenter) {
    return (
      <div className="relative border-t border-l border-r border-slate-700 bg-white flex flex-col pb-2 justify-center items-center aspect-square select-none overflow-hidden" style={{ height: 'stretch' }}>
        <span className="text-3xl sm:text-4xl md:text-6xl text-slate-100 font-bold opacity-50 pb-5"></span>
      </div>
    );
  }

  const getStemColorClass = (status: StemStatus | undefined) => {
    if (!status) return "text-slate-900";
    if (status.isMu && status.isXing) return "text-blue-600 font-black";
    if (status.isXing) return "text-purple-600 font-black";
    if (status.isMu) return "text-orange-500 font-black";
    return "text-slate-900";
  };

  const getGodDisplay = (god: string) => {
    if (!god) return "";
    if (god === "六合") return "六";
    if (god === "白虎") return "白";
    if (god === "玄武") return "玄";
    return god.charAt(god.length - 1);
  };

  // 长生简称映射
  const abbreviateStage = (stage: string): string => {
    const map: Record<string, string> = {
      长生: "生",
      沐浴: "沐",
      冠带: "冠",
      临官: "临",
      帝旺: "旺",
      衰: "衰",
      病: "病",
      死: "死",
      墓: "墓",
      绝: "绝",
      胎: "胎",
      养: "养",
    };
    return map[stage] || stage;
  };

  // 特定组合需要反转顺序
  const fixStageOrder = (stages: string): string => {
    const reverseMap: Record<string, string> = {
      "墓死": "死墓",
      "冠沐": "沐冠",
      "养胎": "胎养",
    };
    return reverseMap[stages] || stages;
  };

  // 解析lifeStages数组：四隅宫每个干有2个长生，四正宫每个干1个长生
  const hasTwoSkyStems = !!data.skyStem2;
  const hasTwoEarthStems = !!data.earthStem2;
  const isSiYu = [2, 4, 6, 8].includes(data.id); // 四隅宫有2个地支
  const stagesPerStem = isSiYu ? 2 : 1;

  let idx = 0;
  const skyLife = fixStageOrder(data.lifeStages
    .slice(idx, idx + stagesPerStem)
    .map(abbreviateStage)
    .join(""));
  idx += stagesPerStem;

  const skyLife2 = hasTwoSkyStems
    ? fixStageOrder(data.lifeStages
        .slice(idx, idx + stagesPerStem)
        .map(abbreviateStage)
        .join(""))
    : null;
  if (hasTwoSkyStems) idx += stagesPerStem;

  const earthLife = fixStageOrder(data.lifeStages
    .slice(idx, idx + stagesPerStem)
    .map(abbreviateStage)
    .join(""));
  idx += stagesPerStem;

  const earthLife2 = hasTwoEarthStems
    ? fixStageOrder(data.lifeStages
        .slice(idx, idx + stagesPerStem)
        .map(abbreviateStage)
        .join(""))
    : null;

  return (
    <div 
      ref={ref}
      className="relative border border-slate-700 bg-white p-1.5 sm:p-2 md:p-3 aspect-square select-none flex flex-col justify-between shadow-sm hover:bg-slate-50 hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
      onClick={() => onPalaceClick(data)}
    >
      {/* 上层: 神 (左) - 空亡 (右) */}
      <div className="flex justify-between items-start">
        <span className={cn(mainFontBase, "text-slate-900")}>{getGodDisplay(data.god)}</span>
        {data.empty && (
          <span className="text-base sm:text-lg md:text-xl text-slate-400 leading-none font-light -mt-0.5">○</span>
        )}
      </div>
      {/* 中层: 天盘干 (左) - 星 (右) */}
      <div className="flex justify-between items-center my-0.5">
        <div className="flex flex-row items-end gap-0.5 relative z-10 flex-nowrap min-w-0 shrink">
          <div className="flex flex-col items-center">
            <span className={cn(lifeFont, "mb-0")}>{skyLife}</span>
            <span className={cn(mainFontBase, getStemColorClass(data.skyStatus))}>{data.skyStem}</span>
          </div>
          {data.skyStem2 && (
            <div className="flex flex-col items-center">
              <span className={cn(lifeFont, "mb-0")}>{skyLife2}</span>
              <span className={cn(mainFontBase, getStemColorClass(data.sky2Status))}>{data.skyStem2}</span>
            </div>
          )}
        </div>

        <span className={cn(mainFontBase, "text-slate-800 pt-3 ml-1")}>{data.star.charAt(data.star.length - 1)}</span>
      </div>
      {/* 下层: 地盘干 (左) - 门 (右) */}
      <div className="flex justify-between items-end">
        <div className="flex flex-row items-end flex-nowrap min-w-0 shrink">
          <div className="flex flex-col items-center">
            <span className={cn(lifeFont, "mb-0")}>{earthLife}</span>
            <span className={cn(mainFontBase, getStemColorClass(data.earthStatus))}>{data.earthStem}</span>
          </div>
          {data.earthStem2 && (
            <div className="flex flex-col items-center">
              <span className={cn(lifeFont, "mb-0")}>{earthLife2}</span>
              <span className={cn(mainFontBase, getStemColorClass(data.earth2Status))}>{data.earthStem2}</span>
            </div>
          )}
        </div>

        <span
          className={cn(mainFontBase, data.isMenPo ? "text-red-600 font-black scale-110" : "text-slate-800", "ml-1")}
        >
          {data.door.charAt(0)}
        </span>
      </div>
    </div>
  );
});

PalaceCell.displayName = "PalaceCell";

const ChartGrid: React.FC<ChartGridProps> = ({ data }) => {
  const [selectedPalace, setSelectedPalace] = useState<PalaceData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // 计算天地门户数据（月将加临时支法：从时支所在宫位开始飞布）
  const tianDiData = useMemo(() => {
    if (!data) return null;
    // 获取时柱地支索引
    const hourBranchIdx = data.pillars.hour.zhiIdx;
    return calculateTianDiMenHuByDate(
      data.date,
      hourBranchIdx,
      data.juNum,
      data.yinYang
    );
  }, [data]);

  const handlePalaceClick = (palaceData: PalaceData) => {
    setSelectedPalace(palaceData);
    setModalOpen(true);
  };

  if (!data)
    return (
      <div className="h-96 flex flex-col items-center justify-center text-muted-foreground italic font-serif space-y-4">
        <div className="w-12 h-12 border-2 border-muted border-t-primary rounded-full animate-spin"></div>
        <span>正在参透天机...</span>
      </div>
    );

  const pm = new Map<number, PalaceData>();
  data.palaces.forEach((p) => pm.set(p.id, p));

  const getHidden = (id: number) => pm.get(id)?.hiddenStem || "";
  const horsePalace = data.palaces.find((p) => p.horse);

  // 获取宫位的天地门户信息（月将临时支法：建除随月将飞布）
  const getTianDiInfo = (palaceId: number) => {
    if (!tianDiData || palaceId === 5) return null;
    const palaceGeneralBranches = tianDiData.generalPositions[palaceId] || [];
    const palaceJianChuSpirits = tianDiData.jianChuPositions[palaceId] || [];
    // 获取该宫位的门（从 ChartData 中获取）
    const palaceData = pm.get(palaceId);
    const doorName = palaceData?.door || '';
    const { entries } = getPalaceSpirits(
      palaceId,
      palaceGeneralBranches,
      palaceJianChuSpirits,
      doorName
    );
    const gateName = getGateName(palaceId);
    return { entries, gateName };
  };

  const getHorsePosition = (pid: number | undefined) => {
    switch (pid) {
      case 4:
        return "top-0 left-0 -translate-x-full -translate-y-1/2 pr-1";
      case 2:
        return "top-0 right-0 translate-x-full -translate-y-1/2 pl-1";
      case 8:
        return "bottom-0 left-0 -translate-x-full translate-y-1/2 pr-1";
      case 6:
        return "bottom-0 right-0 translate-x-full translate-y-1/2 pl-1";
      default:
        return "hidden";
    }
  };

  // 渲染单个月将条目（垂直排列：月将名+地支+建除）
  const renderSingleEntry = (entry: { general: string; branch: string; jianChu: string }, key: number | string) => (
    <div key={key} className="flex flex-col items-center text-[9px] sm:text-[10px] md:text-xs leading-[1.1] font-medium">
      <span className="text-slate-600">{entry.general.charAt(0)}</span>
      <span className="text-slate-600">{entry.general.charAt(1)}</span>
      <span className="text-slate-600">{entry.branch}</span>
      <span className="text-amber-700">{entry.jianChu}</span>
    </div>
  );

  // 渲染单个月将条目（横排：月将名+地支+建除）
  const renderHorizontalEntry = (entry: { general: string; branch: string; jianChu: string }, key: number | string) => (
    <div key={key} className="flex flex-row items-center text-[9px] sm:text-[10px] md:text-xs leading-[1.1] font-medium">
      <span className="text-slate-600">{entry.general}</span>
      <span className="text-slate-600">{entry.branch}</span>
      <span className="text-amber-700">{entry.jianChu}</span>
    </div>
  );

  // 渲染天地门户信息（根据位置调整布局）
  // position: 'top' | 'bottom' | 'left' | 'right' | 'corner-top' | 'corner-bottom'
  const renderTianDiInfo = (palaceId: number, position: 'top' | 'bottom' | 'left' | 'right') => {
    const info = getTianDiInfo(palaceId);
    if (!info || info.entries.length === 0) return null;

    // 上下宫位(9, 1)：横排显示
    if (position === 'top' || position === 'bottom') {
      return (
        <div className="flex flex-row gap-1.5">
          {info.entries.map((entry, i) => renderHorizontalEntry(entry, i))}
        </div>
      );
    }

    // 左右宫位：垂直排列，多个条目横向并排
    return (
      <div className="flex flex-row gap-0.5">
        {info.entries.map((entry, i) => renderSingleEntry(entry, i))}
      </div>
    );
  };

  // 角落宫位专用：分开返回两个条目（一个旁边，一个上/下方）
  const getCornerEntries = (palaceId: number) => {
    const info = getTianDiInfo(palaceId);
    if (!info || info.entries.length === 0) return { side: null, topBottom: null };
    
    let sideEntry
    let topBottomEntry

    if(palaceId == 2 || palaceId == 8){
      sideEntry = info.entries[0] ? renderHorizontalEntry(info.entries[0], 'side') : null;
      topBottomEntry = info.entries[1] ? renderSingleEntry(info.entries[1], 'tb') : null;
    } else {
      sideEntry = info.entries[0] ? renderSingleEntry(info.entries[0], 'side') : null;
      topBottomEntry = info.entries[1] ? renderHorizontalEntry(info.entries[1], 'tb') : null;
    }
    
    return { side: sideEntry, topBottom: topBottomEntry };
  };

  return (
    <div>
      <div className="relative p-10 sm:p-14 md:p-20 lg:p-24 w-[320px] sm:w-[480px] md:w-[680px] lg:w-[780px] mx-auto">
        {/* 隐干/外盘 + 天地门户 - 按照洛书方位排列，角落围绕九宫格 */}
        
        {/* 上方横排：巽4第二条目 + 离9隐干 + 离9条目 + 坤2第二条目 */}
        <div className="container max-w-[250px] absolute -top-1 sm:top-1 lg:top-3 left-0 right-0 flex justify-between items-start px-2 font-bold text-sm md:text-lg text-slate-600">
          <div className="flex items-center gap-1">
            <span className="text-md">{getCornerEntries(4).topBottom}</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span>{renderTianDiInfo(9, 'top')}</span>
            <span>{getHidden(9)}</span>
          </div>
          <div className="flex items-center gap-1">
            {getCornerEntries(2).side}
          </div>
        </div>
        
        {/* 下方横排：艮8第二条目 + 坎1隐干 + 坎1条目 + 乾6第二条目 */}
        <div className="container max-w-[250px] absolute -bottom-1 sm:bottom-1 lg:bottom-3 left-0 right-0 flex justify-between items-end px-2 font-bold text-sm md:text-lg text-slate-600">
          <div className="flex items-center gap-1 text-right">
            {getCornerEntries(8).side}
          </div>
          <div className="flex flex-col items-center gap-2 text-right">
            <span>{getHidden(1)}</span>
            <span>{renderTianDiInfo(1, 'bottom')}</span>
          </div>
          <div className="flex items-center gap-1 text-right">
            {getCornerEntries(6).topBottom}
          </div>
        </div>

        {/* 左侧：巽4第一条目+隐干、震3、艮8第一条目+隐干 从上到下 */}
        <div
          className="absolute flex flex-col justify-between text-right font-bold text-sm md:text-lg text-slate-600"
          style={{
            top: "38%",
            transform: "translateY(-50%)",
            left: "-18px",
            height: "calc(100% - 10rem)",
          }}
        >
          <div className="flex items-center gap-2" style={{paddingTop: "30px"}}>
            {getCornerEntries(4).side}
            <span className="w-8 text-right">{getHidden(4)}</span>
          </div>
          <div className="flex items-center gap-1" style={{paddingTop: "60px"}}>
            {renderTianDiInfo(3, 'left')}
            <span className="w-8 text-right">{getHidden(3)}</span>
          </div>
          <div className="flex items-center gap-1" style={{paddingTop: "50px"}}>
            {getCornerEntries(8).topBottom}
            <span className="w-8 text-right">{getHidden(8)}</span>
          </div>
        </div>
        
        {/* 右侧：坤2第一条目+隐干、兑7、乾6第一条目+隐干 从上到下 */}
        <div
          className="absolute flex flex-col justify-between text-left font-bold text-sm md:text-lg text-slate-600"
          style={{
            top: "38%",
            transform: "translateY(-50%)",
            right: "-18px",
            height: "calc(100% - 10rem)",
          }}
        >
          <div className="flex items-center gap-2" style={{paddingTop: "30px"}}>
            <span className="w-8">{getHidden(2)}</span>
              {getCornerEntries(2).topBottom}
          </div>
          <div className="flex items-center gap-1" style={{paddingTop: "60px"}}>
            <span className="w-8">{getHidden(7)}</span>
            {renderTianDiInfo(7, 'right')}
          </div>
          <div className="flex items-center gap-1" style={{paddingTop: "50px"}}>
            <span className="w-8">{getHidden(6)}</span>
            {getCornerEntries(6).side}
          </div>
        </div>

        <div className="relative">
          {/* 马星 */}
          {horsePalace && (
            <div
              className={cn(
                "absolute z-30 font-bold text-md sm:text-xl md:text-2xl lg:text-3xl text-destructive",
                getHorsePosition(horsePalace.id),
              )}
            >
              马
            </div>
          )}

          {/* 奇门九宫格 */}
          <div className="grid grid-cols-3 gap-0 border-[2px] border-foreground/80 bg-background shadow-2xl overflow-hidden rounded-sm">
            {VISUAL_ORDER.map((id) => (
              <PalaceCell key={id} data={pm.get(id)!} onPalaceClick={handlePalaceClick} />
            ))}
          </div>
        </div>
      </div>

      {/* 值符值使 */}
      {data && (() => {
        const relation = analyzeZhiFuZhiShi(data.zhiFu, data.zhiShi, data.palaces);
        const isKe = relation.type === '相克';
        const isSheng = relation.type === '相生';
        const isTongGong = relation.type === '同宫';

        // Determine which side is affected
        const fuIsKed = relation.subType === '值使克值符';
        const shiIsKed = relation.subType === '值符克值使';
        const fuIsSheng = relation.subType === '值使生值符';
        const shiIsSheng = relation.subType === '值符生值使';

        const getStyle = (side: 'fu' | 'shi') => {
          if (isTongGong) return 'bg-amber-500/10 border-amber-500/30';
          if (isKe) {
            if (side === 'fu' && fuIsKed) return 'bg-red-500/15 border-red-500/40 text-red-600';
            if (side === 'shi' && shiIsKed) return 'bg-red-500/15 border-red-500/40 text-red-600';
          }
          if (isSheng) {
            if (side === 'fu' && fuIsSheng) return 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600';
            if (side === 'shi' && shiIsSheng) return 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600';
          }
          return 'bg-muted/60 border-border';
        };

        return (
          <div className="flex justify-center gap-4 pt-3">
            <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md border", getStyle('fu'))}>
              <span className="text-xs text-muted-foreground">值符</span>
              <span className="text-sm font-bold">{data.zhiFu}</span>
            </div>
            <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md border", getStyle('shi'))}>
              <span className="text-xs text-muted-foreground">值使</span>
              <span className="text-sm font-bold">{data.zhiShi}</span>
            </div>
            {data.xunShou && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted/60 border border-border">
                <span className="text-xs text-muted-foreground">旬首</span>
                <span className="text-sm font-bold text-foreground">{data.xunShou}</span>
              </div>
            )}
          </div>
        );
      })()}

      <p className="text-sm text-center pt-3">
        奇门颜色说明（<span className="text-orange-500 font-bold">入墓</span>，
        <span className="text-purple-600 font-bold">击刑</span>，<span className="text-destructive font-bold">门迫</span>，
        <span className="text-blue-600 font-bold">刑+墓</span>）
      </p>
      <p className="text-xs text-center text-muted-foreground mt-1">
        点击宫位查看卦象与克应
      </p>

      {/* 十干克应弹窗 */}
      <KeYingModal 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
        palaceData={selectedPalace} 
      />
    </div>
  );
};

export default ChartGrid;
