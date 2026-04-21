import React, { useState } from 'react';
import { Download, FileText, Loader2, Check } from 'lucide-react';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { FourPillars, ChartData, PalaceData } from '@/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ExportPdfDialogProps {
  title: string;
  messages: Message[];
  chartInfo?: string;
  clientName?: string;
  pillars?: FourPillars;
  qimenChart?: ChartData | any;
  hideHour?: boolean;
  trigger?: React.ReactNode;
  disabled?: boolean;
  externalOpen?: boolean;
  onExternalOpenChange?: (open: boolean) => void;
}

/** Strip markdown syntax for plain text rendering */
function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/!\[.*?\]\(.+?\)/g, '')
    .replace(/^>\s?/gm, '')
    .replace(/^[-*_]{3,}$/gm, '---')
    .replace(/^[\s]*[-*+]\s/gm, '• ')
    .replace(/^[\s]*\d+\.\s/gm, '• ')
    .trim();
}

const FONT_URL = 'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-sc@latest/chinese-simplified-400-normal.ttf';

const HEAVENLY_STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const STEM_ELEMENTS = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
const BRANCH_ELEMENTS = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];
const ELEMENT_NAMES = ["木", "火", "土", "金", "水"];
// RGB colors for five elements: 木-green, 火-red, 土-amber, 金-gold, 水-blue
const ELEMENT_RGB: [number, number, number][] = [
  [5, 150, 105],   // 木 emerald-600
  [239, 68, 68],   // 火 red-500
  [217, 119, 6],   // 土 amber-600
  [234, 179, 8],   // 金 yellow-500
  [59, 130, 246],  // 水 blue-500
];
const getStemRGB = (stemIdx: number): [number, number, number] => ELEMENT_RGB[STEM_ELEMENTS[stemIdx]];
const getBranchRGB = (branchIdx: number): [number, number, number] => ELEMENT_RGB[BRANCH_ELEMENTS[branchIdx]];
const isYangStem = (idx: number) => idx % 2 === 0;

const getTenGodShort = (selfIdx: number, targetIdx: number): string => {
  const selfEl = STEM_ELEMENTS[selfIdx];
  const targetEl = STEM_ELEMENTS[targetIdx];
  const same = isYangStem(selfIdx) === isYangStem(targetIdx);
  const diff = (targetEl - selfEl + 5) % 5;
  switch (diff) {
    case 0: return same ? "比" : "劫";
    case 1: return same ? "食" : "伤";
    case 2: return same ? "才" : "财";
    case 3: return same ? "杀" : "官";
    case 4: return same ? "枭" : "印";
    default: return "";
  }
};

// Qimen grid visual order: 巽4 离9 坤2 / 震3 中5 兑7 / 艮8 坎1 乾6
const VISUAL_ORDER = [4, 9, 2, 3, 5, 7, 8, 1, 6];

/** Render Four Pillars as a text table in jsPDF */
function renderPillarsToPdf(
  pdf: jsPDF,
  pillars: FourPillars,
  hideHour: boolean,
  margin: number,
  maxW: number,
  startY: number,
  checkPage: (n: number) => void,
  getY: () => number,
  setY: (v: number) => void,
) {
  let y = startY;

  pdf.setFontSize(13);
  pdf.setTextColor(0, 0, 0);
  pdf.text('八字命盘', margin, y);
  y += 8;

  const cols = hideHour
    ? [{ label: '年柱', gz: pillars.year }, { label: '月柱', gz: pillars.month }, { label: '日柱', gz: pillars.day }]
    : [{ label: '年柱', gz: pillars.year }, { label: '月柱', gz: pillars.month }, { label: '日柱', gz: pillars.day }, { label: '时柱', gz: pillars.hour }];

  const colCount = cols.length;
  const colW = Math.min(35, maxW / colCount);
  const tableW = colW * colCount;
  const startX = margin + (maxW - tableW) / 2;

  const dayStemIdx = pillars.day.ganIdx;

  // Header row
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  for (let i = 0; i < colCount; i++) {
    pdf.text(cols[i].label, startX + i * colW + colW / 2, y, { align: 'center' });
  }
  y += 5;

  // Ten Gods row
  pdf.setFontSize(9);
  pdf.setTextColor(80, 80, 80);
  for (let i = 0; i < colCount; i++) {
    const gz = cols[i].gz;
    const tenGod = gz.ganIdx === dayStemIdx && cols[i].label === '日柱' ? '日主' : getTenGodShort(dayStemIdx, gz.ganIdx);
    pdf.text(tenGod, startX + i * colW + colW / 2, y, { align: 'center' });
  }
  y += 6;

  // Heavenly Stems row (with element colors)
  pdf.setFontSize(14);
  for (let i = 0; i < colCount; i++) {
    const rgb = getStemRGB(cols[i].gz.ganIdx);
    pdf.setTextColor(rgb[0], rgb[1], rgb[2]);
    pdf.text(cols[i].gz.gan, startX + i * colW + colW / 2, y, { align: 'center' });
  }
  y += 7;

  // Earthly Branches row (with element colors)
  pdf.setFontSize(14);
  for (let i = 0; i < colCount; i++) {
    const rgb = getBranchRGB(cols[i].gz.zhiIdx);
    pdf.setTextColor(rgb[0], rgb[1], rgb[2]);
    pdf.text(cols[i].gz.zhi, startX + i * colW + colW / 2, y, { align: 'center' });
  }
  y += 8;
  pdf.setTextColor(0, 0, 0);

  // Separator
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, y, margin + maxW, y);
  y += 4;

  setY(y);
}

/** Render Qimen chart as a 3x3 text grid in jsPDF */
function renderQimenToPdf(
  pdf: jsPDF,
  chart: ChartData,
  margin: number,
  maxW: number,
  startY: number,
  checkPage: (n: number) => void,
  setY: (v: number) => void,
) {
  let y = startY + 8; // add spacing from previous section

  pdf.setFontSize(13);
  pdf.setTextColor(0, 0, 0);
  pdf.text('奇门遁甲盘', margin, y);
  y += 6;

  // Chart meta info
  pdf.setFontSize(9);
  pdf.setTextColor(80, 80, 80);
  const metaLine = `${chart.yinYang === 'Yin' ? '阴' : '阳'}遁${chart.juNum}局 | 值符：${chart.zhiFu} | 值使：${chart.zhiShi} | 马星：${chart.horseBranch} | 空亡：${chart.voidBranches}`;
  pdf.text(metaLine, margin, y);
  y += 7;

  const palaces = chart.palaces;
  if (!palaces || palaces.length === 0) { setY(y); return; }

  // Build a map id -> palace
  const palaceMap: Record<number, PalaceData> = {};
  for (const p of palaces) palaceMap[p.id] = p;

  const cellW = Math.min(55, maxW / 3);
  const cellH = 28;
  const gridW = cellW * 3;
  const startX = margin + (maxW - gridW) / 2;

  checkPage(cellH * 3 + 10);

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const idx = row * 3 + col;
      const palaceId = VISUAL_ORDER[idx];
      const palace = palaceMap[palaceId];
      if (!palace || palaceId === 5) continue;

      const cx = startX + col * cellW;
      const cy = y + row * cellH;

      // Cell border
      pdf.setDrawColor(180, 180, 180);
      pdf.rect(cx, cy, cellW, cellH);

      // Palace name + position (top-left)
      pdf.setFontSize(7);
      pdf.setTextColor(120, 120, 120);
      pdf.text(`${palace.position} ${palace.bagua}`, cx + 2, cy + 4);

      // Stars / Door / God
      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0);
      const line1 = `${palace.star}  ${palace.door}  ${palace.god}`;
      pdf.text(line1, cx + cellW / 2, cy + 10, { align: 'center' });

      // Sky stem / Earth stem / Hidden stem
      pdf.setFontSize(9);
      pdf.setTextColor(30, 30, 30);
      const skyLabel = palace.skyStem2 ? `天:${palace.skyStem}/${palace.skyStem2}` : `天:${palace.skyStem}`;
      const earthLabel = palace.earthStem2 ? `地:${palace.earthStem}/${palace.earthStem2}` : `地:${palace.earthStem}`;
      pdf.text(skyLabel, cx + cellW / 2, cy + 17, { align: 'center' });
      pdf.text(earthLabel, cx + cellW / 2, cy + 22, { align: 'center' });

      // Markers (top-right)
      const markers: string[] = [];
      if (palace.empty) markers.push('空');
      if (palace.horse) markers.push('马');
      if (markers.length > 0) {
        pdf.setFontSize(7);
        // 空 in gray, 马 in red
        for (let mi = 0; mi < markers.length; mi++) {
          const mkr = markers[mi];
          const mkrX = cx + cellW - 2 - (markers.length - 1 - mi) * 8;
          if (mkr === '马') {
            pdf.setTextColor(220, 38, 38);
          } else {
            pdf.setTextColor(100, 100, 100);
          }
          pdf.text(mkr, mkrX, cy + 4, { align: 'right' });
        }
      }

      // Status markers (bottom of cell): 门迫, 击刑, 入墓 with stem names
      const statusTags: string[] = [];
      if (palace.isMenPo) statusTags.push('门迫');

      // Collect which stems have 击刑 / 入墓
      const xingStems: string[] = [];
      const muStems: string[] = [];
      if (palace.skyStatus?.isXing) xingStems.push(palace.skyStem);
      if (palace.sky2Status?.isXing && palace.skyStem2) xingStems.push(palace.skyStem2);
      if (palace.earthStatus?.isXing) xingStems.push(palace.earthStem);
      if (palace.earth2Status?.isXing && palace.earthStem2) xingStems.push(palace.earthStem2);
      if (palace.skyStatus?.isMu) muStems.push(palace.skyStem);
      if (palace.sky2Status?.isMu && palace.skyStem2) muStems.push(palace.skyStem2);
      if (palace.earthStatus?.isMu) muStems.push(palace.earthStem);
      if (palace.earth2Status?.isMu && palace.earthStem2) muStems.push(palace.earthStem2);

      if (xingStems.length > 0) statusTags.push(`${xingStems.join('')}击刑`);
      if (muStems.length > 0) statusTags.push(`${muStems.join('')}入墓`);

      if (statusTags.length > 0) {
        pdf.setFontSize(6);
        pdf.setTextColor(200, 50, 50);
        pdf.text(statusTags.join(' '), cx + cellW / 2, cy + cellH - 1.5, { align: 'center' });
      }
    }
  }

  y += cellH * 3 + 6;
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, y, margin + maxW, y);
  y += 4;

  setY(y);
}

const ExportPdfDialog: React.FC<ExportPdfDialogProps> = ({
  title,
  messages,
  chartInfo,
  clientName,
  pillars,
  qimenChart,
  hideHour = false,
  trigger,
  disabled = false,
  externalOpen,
  onExternalOpenChange,
}) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [showShareOptions, setShowShareOptions] = useState(false);

  const generatePdf = async () => {
    setGenerating(true);
    try {
      // Load Chinese font
      const fontResponse = await fetch(FONT_URL);
      const fontBuffer = await fontResponse.arrayBuffer();
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

      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const maxW = pageW - margin * 2;
      let y = 20;

      const checkPage = (needed: number) => {
        if (y + needed > pageH - margin) {
          pdf.addPage();
          y = 20;
        }
      };

      // --- TITLE ---
      pdf.setFontSize(18);
      pdf.text('报告', margin, y);
      y += 10;

      if (clientName) {
        pdf.setFontSize(12);
        pdf.text(`客户：${clientName}`, margin, y);
        y += 8;
      }

      if (chartInfo) {
        pdf.setFontSize(9);
        pdf.setTextColor(100, 100, 100);
        const infoLines = pdf.splitTextToSize(chartInfo, maxW);
        for (const line of infoLines) {
          checkPage(5);
          pdf.text(line, margin, y);
          y += 4.5;
        }
        pdf.setTextColor(0, 0, 0);
        y += 4;
      }

      // --- BAZI PILLARS (text-based) ---
      if (pillars) {
        checkPage(50);
        renderPillarsToPdf(pdf, pillars, hideHour, margin, maxW, y, checkPage, () => y, (v) => { y = v; });
      }

      // --- QIMEN CHART (text-based 3x3 grid) ---
      if (qimenChart?.palaces) {
        checkPage(100);
        renderQimenToPdf(pdf, qimenChart as ChartData, margin, maxW, y, checkPage, (v) => { y = v; });
      }

      // --- CONVERSATION (always start on a new page) ---
      if (messages.length > 0) {
        pdf.addPage();
        y = 20;

        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        pdf.text('对话记录', margin, y);
        y += 8;

        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, y, pageW - margin, y);
        y += 6;

        for (const msg of messages) {
          const roleLabel = msg.role === 'user' ? '【用户提问】' : '【AI 分析】';
          const cleanText = stripMarkdown(msg.content);
          const paragraphs = cleanText.split('\n').filter(l => l.trim());

          checkPage(10);
          pdf.setFontSize(10);
          pdf.setTextColor(msg.role === 'user' ? 29 : 5, msg.role === 'user' ? 78 : 150, msg.role === 'user' ? 216 : 105);
          pdf.text(roleLabel, margin, y);
          y += 6;

          pdf.setTextColor(50, 50, 50);
          pdf.setFontSize(10);
          for (const para of paragraphs) {
            const lines = pdf.splitTextToSize(para, maxW);
            for (const line of lines) {
              checkPage(6);
              pdf.text(line, margin, y);
              y += 5;
            }
            y += 2;
          }
          y += 4;
        }
      }

      // --- FOOTER ---
      checkPage(10);
      pdf.setFontSize(8);
      pdf.setTextColor(170, 170, 170);
      pdf.text(`导出时间：${new Date().toLocaleString('zh-CN')} | 由 GlobalAttract 生成`, margin, y);

      const pdfOutput = pdf.output('blob');
      setPdfBlob(pdfOutput);
      setShowShareOptions(true);
      toast({ title: '报告生成成功' });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({ title: '生成失败，请重试', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!pdfBlob) return;
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: '下载成功' });
    handleOpenChangeInternal(false);
  };

  const resetState = () => {
    setPdfBlob(null);
    setShowShareOptions(false);
  };

  const isOpen = externalOpen !== undefined ? externalOpen : open;
  const handleOpenChangeInternal = (newOpen: boolean) => {
    if (onExternalOpenChange) {
      onExternalOpenChange(newOpen);
    } else {
      setOpen(newOpen);
    }
    if (!newOpen) {
      resetState();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChangeInternal}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" disabled={disabled || messages.length === 0}>
            <Download className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            导出对话记录
          </DialogTitle>
        </DialogHeader>
        
        {!showShareOptions ? (
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              将当前对话导出为PDF报告，可选择下载或发送给他人。
            </p>
            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <p className="font-medium text-foreground mb-1">{title}</p>
              <p>{messages.length} 条消息</p>
            </div>
            <Button 
              className="w-full" 
              onClick={generatePdf}
              disabled={generating || messages.length === 0}
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  生成PDF报告
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <Check className="h-4 w-4" />
              报告已生成
            </div>
            <Button className="w-full" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              下载报告
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExportPdfDialog;
