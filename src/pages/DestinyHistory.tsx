import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Trash2, MessageSquare, Users, Pencil, Check, X, RefreshCw, AlertCircle, Share2, CheckSquare, Download, FileText } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ExportPdfDialog from "@/components/ExportPdfDialog";
import { Client, Consultation } from "@/types/database";
import { FourPillars, ChartData } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

import { useClients } from "@/hooks/useClients";
import { useConsultations } from "@/hooks/useConsultations";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useClientReports } from "@/hooks/useClientReports";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface ConsultationStats {
  count: number;
  lastMessage: string | null;
}

const DestinyHistory: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get("clientId");
  const validClientId = clientId && UUID_REGEX.test(clientId) ? clientId : null;
  
  const { user, isSuperAdmin } = useAuth();
  
  const { clients } = useClients();
  const { toast } = useToast();
  const {
    consultations,
    loading,
    error,
    hasAttempted,
    fetchConsultations,
    deleteConsultation,
    updateConsultationTitle,
    getConsultationStats,
    loadConsultation,
  } = useConsultations(validClientId || undefined);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [stats, setStats] = useState<Record<string, ConsultationStats>>({});
  const [exportMessages, setExportMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [exportTitle, setExportTitle] = useState('');
  const [exportClientName, setExportClientName] = useState('');
  const [exportPillars, setExportPillars] = useState<FourPillars | undefined>();
  const [exportQimenChart, setExportQimenChart] = useState<ChartData | undefined>();
  const [exportHideHour, setExportHideHour] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  // Multi-select state
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchDeleteConfirm, setBatchDeleteConfirm] = useState(false);
  const [batchDeleting, setBatchDeleting] = useState(false);

  // Get current client
  const currentClient = clients.find((c) => c.id === validClientId);
  
  // Reports
  const { reports, fetchReports, deleteReport, currentReport, setCurrentReport } = useClientReports(validClientId || undefined);
  const [showReportOverlay, setShowReportOverlay] = useState(false);
  const [deleteReportId, setDeleteReportId] = useState<string | null>(null);
  const [deletingReport, setDeletingReport] = useState(false);

  useEffect(() => {
    if (validClientId) {
      fetchConsultations();
      fetchReports();
    }
  }, [validClientId, fetchConsultations]);

  // Filter consultations for current client
  const clientConsultations = validClientId
    ? consultations.filter((c) => c.client_id === validClientId)
    : [];

  // Fetch stats when consultations change
  useEffect(() => {
    const fetchStats = async () => {
      if (clientConsultations.length === 0) return;
      setStatsLoading(true);
      try {
        const result = await getConsultationStats(clientConsultations.map((c) => c.id));
        setStats(result);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [clientConsultations.length, getConsultationStats]);

  // Multi-select handlers
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === clientConsultations.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(clientConsultations.map(c => c.id)));
    }
  }, [selectedIds.size, clientConsultations]);

  const exitSelectMode = useCallback(() => {
    setSelectMode(false);
    setSelectedIds(new Set());
  }, []);

  const enterSelectMode = useCallback(() => {
    setSelectMode(true);
    setSelectedIds(new Set());
  }, []);

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    setBatchDeleting(true);
    try {
      const ids = Array.from(selectedIds);
      await Promise.all(ids.map(id => deleteConsultation(id)));
      toast({ title: `已删除 ${ids.length} 条记录` });
      exitSelectMode();
    } catch {
      toast({ title: "删除失败", variant: "destructive" });
    } finally {
      setBatchDeleting(false);
      setBatchDeleteConfirm(false);
    }
  };

  const handleSelect = useCallback((consultation: Consultation) => {
    if (selectMode) {
      toggleSelection(consultation.id);
      return;
    }
    if (validClientId) {
      navigate(`/destiny?clientId=${validClientId}&consultationId=${consultation.id}`);
      return;
    }
    navigate(`/destiny?consultationId=${consultation.id}`);
  }, [navigate, validClientId, selectMode, toggleSelection]);

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    setDeletingId(confirmDeleteId);
    try {
      await deleteConsultation(confirmDeleteId);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const handleStartEdit = (e: React.MouseEvent, consultation: Consultation) => {
    e.stopPropagation();
    setEditingId(consultation.id);
    setEditValue(consultation.title || consultation.topic || "");
  };

  const handleSaveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingId && editValue.trim()) {
      updateConsultationTitle(editingId, editValue.trim());
    }
    setEditingId(null);
    setEditValue("");
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
    setEditValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (editingId && editValue.trim()) {
        updateConsultationTitle(editingId, editValue.trim());
      }
      setEditingId(null);
      setEditValue("");
    } else if (e.key === "Escape") {
      setEditingId(null);
      setEditValue("");
    }
  };

  // Get mentioned client names for display
  const getMentionedClientNames = (mentionedIds?: string[]): string[] => {
    if (!mentionedIds || mentionedIds.length === 0) return [];
    return clients.filter((c) => mentionedIds.includes(c.id)).map((c) => c.name);
  };

  const handleExportClick = async (e: React.MouseEvent, consultation: Consultation) => {
    e.stopPropagation();
    try {
      const result = await loadConsultation(consultation.id);
      if (result) {
        const msgs = result.messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));
        const chartData = consultation.chart_data as ChartData | null;
        
        setExportMessages(msgs);
        setExportTitle(consultation.title || consultation.topic || '命理分析');
        setExportClientName(currentClient?.name || '');
        
        if (chartData) {
          if (chartData.pillars) {
            setExportPillars(chartData.pillars);
            setExportHideHour(!chartData.pillars?.hour);
          } else {
            setExportPillars(undefined);
            setExportHideHour(false);
          }
          setExportQimenChart(chartData);
        } else {
          setExportPillars(undefined);
          setExportQimenChart(undefined);
          setExportHideHour(false);
        }
        
        setExportDialogOpen(true);
      }
    } catch (error) {
      console.error('Failed to load consultation for export:', error);
    }
  };

  // Render empty/error states
  const renderEmptyState = () => {
    if (clientId && !validClientId) {
      return (
        <div className="text-center py-8 space-y-3">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
          <p className="text-muted-foreground">无效的客户ID（不是UUID）</p>
          <Button variant="outline" size="sm" onClick={() => navigate("/clients")}>
            去客户列表
          </Button>
        </div>
      );
    }

    if (!user) {
      return (
        <div className="text-center py-8 space-y-3">
          <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">请先登录查看历史记录</p>
        </div>
      );
    }

    if (loading || (validClientId && !hasAttempted)) {
      return (
        <div className="text-center text-muted-foreground py-8">
          <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
          加载中...
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8 space-y-3">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
          <p className="text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchConsultations}>
            <RefreshCw className="h-4 w-4 mr-1" />
            重试
          </Button>
        </div>
      );
    }

    if (hasAttempted && clientConsultations.length === 0) {
      return (
        <div className="text-center py-8 space-y-3">
          <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">暂无历史记录</p>
          <Button variant="ghost" size="sm" onClick={fetchConsultations}>
            <RefreshCw className="h-4 w-4 mr-1" />
            刷新
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-4 py-3 max-w-2xl">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (selectMode) {
                  exitSelectMode();
                  return;
                }
                if (currentClient?.category === "自己") {
                  navigate(`/destiny?mode=self&clientId=${validClientId}&skipLoading=1`);
                  return;
                }
                navigate(`/destiny?clientId=${validClientId || ""}&skipLoading=1`);
              }}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">
                {selectMode ? `已选 ${selectedIds.size} 项` : '咨询历史'}
              </h1>
              {currentClient && !selectMode && (
                <p className="text-sm text-muted-foreground">{currentClient.name}</p>
              )}
            </div>
            {selectMode ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={toggleSelectAll}>
                  {selectedIds.size === clientConsultations.length ? '取消全选' : '全选'}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={selectedIds.size === 0 || batchDeleting}
                  onClick={() => setBatchDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  删除
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                {clientConsultations.length > 2 && (
                  <Button variant="ghost" size="sm" onClick={enterSelectMode}>
                    <CheckSquare className="h-4 w-4 mr-1" />
                    选择
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={fetchConsultations} disabled={!validClientId}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controlled Export Dialog */}
      <ExportPdfDialog
        title={exportTitle}
        messages={exportMessages}
        clientName={exportClientName}
        pillars={exportPillars}
        qimenChart={exportQimenChart}
        hideHour={exportHideHour}
        trigger={<span className="hidden" />}
        externalOpen={exportDialogOpen}
        onExternalOpenChange={(open) => {
          setExportDialogOpen(open);
          if (!open) {
            setExportMessages([]);
            setExportTitle('');
            setExportClientName('');
            setExportPillars(undefined);
            setExportQimenChart(undefined);
            setExportHideHour(false);
          }
        }}
      />

      <div className="container mx-auto px-4 py-4 max-w-2xl">
        <ScrollArea className="h-[calc(100vh-120px)]">
          {/* Reports Section */}
          {reports.length > 0 && (
            <div className="space-y-2 mb-4">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 px-1">
                <FileText className="h-4 w-4" />
                命理报告 ({reports.length})
              </h3>
              {reports.map(report => (
                <div
                  key={report.id}
                  className="bg-card rounded-xl border border-primary/20 p-4 cursor-pointer hover:border-primary/40 transition-all"
                  onClick={() => {
                    navigate(`/destiny/report?clientId=${validClientId}&reportId=${report.id}`);
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                      <h4 className="font-medium text-sm truncate">{report.title}</h4>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Badge variant="secondary" className="text-xs">
                        {report.status === 'completed' ? '已完成' : '生成中'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteReportId(report.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {format(new Date(report.created_at), "yyyy-MM-dd HH:mm")}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Consultations */}
          {renderEmptyState() || (
            <div className="space-y-2">
              {clientConsultations.map((consultation) => {
                const mentionedNames = getMentionedClientNames(consultation.mentioned_client_ids);
                const hasMentions = mentionedNames.length > 0;
                const consultationStats = stats[consultation.id];
                const isEditing = editingId === consultation.id;
                const isSelected = selectedIds.has(consultation.id);

                return (
                  <div
                    key={consultation.id}
                    className={cn(
                      "bg-card rounded-xl border p-4 transition-all cursor-pointer",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    )}
                    onClick={() => !isEditing && handleSelect(consultation)}
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          onClick={(e) => e.stopPropagation()}
                          className="h-9 text-sm flex-1"
                          autoFocus
                        />
                        <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={handleSaveEdit}>
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={handleCancelEdit}>
                          <X className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        {/* Title row */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {selectMode ? (
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleSelection(consultation.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="shrink-0"
                              />
                            ) : (
                              <MessageSquare className="h-4 w-4 text-primary shrink-0" />
                            )}
                            <h4 className="font-medium text-sm truncate">
                              {consultation.title || consultation.topic || "命理分析"}
                            </h4>
                          </div>
                          {!selectMode && (
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => handleExportClick(e, consultation)}
                              >
                                <Download className="h-3.5 w-3.5 text-muted-foreground" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => handleStartEdit(e, consultation)}
                              >
                                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:text-destructive hover:bg-destructive/10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDeleteId(consultation.id);
                                }}
                                disabled={deletingId === consultation.id}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Last message preview */}
                        {consultationStats?.lastMessage && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {consultationStats.lastMessage}
                          </p>
                        )}

                        {/* Mentioned clients */}
                        {hasMentions && (
                          <div className="flex items-center gap-1 mb-2">
                            <Users className="h-3 w-3 text-primary" />
                            <div className="flex flex-wrap gap-1">
                              {mentionedNames.map((name) => (
                                <Badge key={name} variant="secondary" className="text-xs">
                                  @{name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                          <span>{format(new Date(consultation.created_at), "yyyy-MM-dd HH:mm")}</span>
                          {consultationStats && !statsLoading && (
                            <span className="flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded-full">
                              <MessageSquare className="h-3 w-3" />
                              {consultationStats.count}条消息
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Single Delete Confirmation */}
      <AlertDialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <AlertDialogContent className="w-[calc(100%-3rem)] max-w-lg rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这条咨询记录吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 sm:gap-2">
            <AlertDialogCancel className="flex-1 mt-0">取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Batch Delete Confirmation */}
      <AlertDialog open={batchDeleteConfirm} onOpenChange={(open) => !open && setBatchDeleteConfirm(false)}>
        <AlertDialogContent className="rounded-lg max-w-xs">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">批量删除</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              确定要删除选中的 {selectedIds.size} 条记录吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2">
            <AlertDialogCancel className="flex-1 mt-0" disabled={batchDeleting}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBatchDelete}
              disabled={batchDeleting}
              className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {batchDeleting ? '删除中...' : `删除 ${selectedIds.size} 条`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report Delete Confirmation */}
      <AlertDialog open={!!deleteReportId} onOpenChange={(open) => !open && setDeleteReportId(null)}>
        <AlertDialogContent className="w-[calc(100%-3rem)] max-w-lg rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>删除报告</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这份命理报告吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 sm:gap-2">
            <AlertDialogCancel className="flex-1 mt-0" disabled={deletingReport}>取消</AlertDialogCancel>
            <AlertDialogAction
              disabled={deletingReport}
              onClick={async () => {
                if (!deleteReportId) return;
                setDeletingReport(true);
                try {
                  await deleteReport(deleteReportId);
                  toast({ title: '报告已删除' });
                } catch {
                  toast({ title: '删除失败', variant: 'destructive' });
                } finally {
                  setDeletingReport(false);
                  setDeleteReportId(null);
                }
              }}
              className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingReport ? '删除中...' : '删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DestinyHistory;
