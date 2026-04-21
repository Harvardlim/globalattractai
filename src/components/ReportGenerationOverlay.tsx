import React, { useState, useEffect } from 'react';
import { FileText, Loader2, CheckCircle, Download, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import jsPDF from 'jspdf';
import type { ClientReport } from '@/hooks/useClientReports';

interface ReportGenerationOverlayProps {
  generating: boolean;
  report: ClientReport | null;
  onClose: () => void;
  clientName: string;
}

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

const ReportGenerationOverlay: React.FC<ReportGenerationOverlayProps> = ({
  generating,
  report,
  onClose,
  clientName,
}) => {
  const [progress, setProgress] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(SECTION_ORDER));

  // Simulate progress while generating
  useEffect(() => {
    if (!generating) {
      if (report?.status === 'completed') setProgress(100);
      return;
    }
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 8;
      });
    }, 800);
    return () => clearInterval(interval);
  }, [generating, report]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const handleDownloadPdf = async () => {
    if (!report) return;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    const maxWidth = pageWidth - margin * 2;
    let y = 20;

    // Title
    pdf.setFontSize(18);
    pdf.text(`${clientName} - 命理分析报告`, margin, y);
    y += 12;

    pdf.setFontSize(10);
    pdf.setTextColor(128);
    pdf.text(`生成日期：${new Date(report.created_at).toLocaleDateString('zh-CN')}`, margin, y);
    y += 10;
    pdf.setTextColor(0);

    // Content
    const sections = report.report_sections || {};
    for (const sectionName of SECTION_ORDER) {
      const content = sections[sectionName];
      if (!content) continue;

      if (y > 260) { pdf.addPage(); y = 20; }

      pdf.setFontSize(14);
      pdf.text(`${SECTION_ICONS[sectionName] || ''} ${sectionName}`, margin, y);
      y += 8;

      pdf.setFontSize(10);
      const lines = pdf.splitTextToSize(content.replace(/\*\*/g, '').replace(/\n/g, ' '), maxWidth);
      for (const line of lines) {
        if (y > 275) { pdf.addPage(); y = 20; }
        pdf.text(line, margin, y);
        y += 5;
      }
      y += 6;
    }

    pdf.save(`${clientName}_命理报告_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  if (!generating && !report) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="font-bold text-lg">{clientName} - 命理报告</h2>
        </div>
        <div className="flex items-center gap-2">
          {report?.status === 'completed' && (
            <Button size="sm" variant="outline" onClick={handleDownloadPdf}>
              <Download className="h-4 w-4 mr-1" />
              下载 PDF
            </Button>
          )}
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {generating ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
          </div>
          <div className="text-center space-y-2 max-w-md">
            <h3 className="text-xl font-bold">正在解读命盘...</h3>
            <p className="text-muted-foreground text-sm">
              AI 正在分析八字、奇门盘局，生成您的专属命理报告，请稍候约30秒
            </p>
          </div>
          <div className="w-full max-w-sm">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center mt-2">{Math.round(progress)}%</p>
          </div>
        </div>
      ) : report?.status === 'completed' ? (
        <ScrollArea className="flex-1">
          <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
            {/* Summary header */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-500 shrink-0" />
              <div>
                <p className="font-medium">报告生成完成</p>
                <p className="text-sm text-muted-foreground">
                  生成于 {new Date(report.created_at).toLocaleString('zh-CN')}
                </p>
              </div>
            </div>

            {/* Sections */}
            {SECTION_ORDER.map(sectionName => {
              const content = report.report_sections?.[sectionName];
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

            {/* If no sections parsed, show full content */}
            {SECTION_ORDER.every(s => !report.report_sections?.[s]) && report.report_content && (
              <div className="bg-card border border-border rounded-xl p-4 prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{report.report_content}</ReactMarkdown>
              </div>
            )}
          </div>
        </ScrollArea>
      ) : null}
    </div>
  );
};

export default ReportGenerationOverlay;
