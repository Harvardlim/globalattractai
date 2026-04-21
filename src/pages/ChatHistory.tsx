import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Trash2, MessageSquare, Plus, Pencil, Check, X, Share2, CheckSquare, Square, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ChartData } from '@/types';
import { FourPillars } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import ExportPdfDialog from '@/components/ExportPdfDialog';
import { useChatConversations } from '@/hooks/useChatConversations';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ConversationStats {
  count: number;
  lastMessage: string | null;
}

const ChatHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    conversations,
    loading,
    fetchConversations,
    updateConversationTitle,
    deleteConversation,
    getConversationStats,
    loadConversation,
  } = useChatConversations();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [stats, setStats] = useState<Record<string, ConversationStats>>({});
  const [statsLoading, setStatsLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [exportMessages, setExportMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [exportTitle, setExportTitle] = useState('');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportPillars, setExportPillars] = useState<FourPillars | undefined>(undefined);
  const [exportQimenChart, setExportQimenChart] = useState<ChartData | undefined>(undefined);

  // Multi-select state
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchDeleteConfirm, setBatchDeleteConfirm] = useState(false);
  const [batchDeleting, setBatchDeleting] = useState(false);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Fetch stats when conversations change
  useEffect(() => {
    const fetchStats = async () => {
      if (conversations.length === 0) return;
      setStatsLoading(true);
      try {
        const result = await getConversationStats(conversations.map(c => c.id));
        setStats(result);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [conversations, getConversationStats]);

  const handleSelectConversation = (id: string) => {
    if (selectMode) {
      toggleSelection(id);
      return;
    }
    navigate(`/chat?conversation=${id}`);
  };

  // Multi-select handlers
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === conversations.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(conversations.map(c => c.id)));
    }
  }, [selectedIds.size, conversations]);

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
      await Promise.all(ids.map(id => deleteConversation(id)));
      toast({ title: `已删除 ${ids.length} 条对话` });
      exitSelectMode();
    } catch {
      toast({ title: "删除失败", variant: "destructive" });
    } finally {
      setBatchDeleting(false);
      setBatchDeleteConfirm(false);
    }
  };

  const handleStartEdit = (e: React.MouseEvent, id: string, title: string | null) => {
    e.stopPropagation();
    setEditingId(id);
    setEditValue(title || '');
  };

  const handleSaveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingId && editValue.trim()) {
      updateConversationTitle(editingId, editValue.trim());
    }
    setEditingId(null);
    setEditValue('');
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (editingId && editValue.trim()) {
        updateConversationTitle(editingId, editValue.trim());
      }
      setEditingId(null);
      setEditValue('');
    } else if (e.key === 'Escape') {
      setEditingId(null);
      setEditValue('');
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      try {
        await deleteConversation(deleteId);
        toast({ title: "删除成功" });
      } catch {
        toast({ title: "删除失败", variant: "destructive" });
      }
      setDeleteId(null);
    }
  };

  const handleNewConversation = () => {
    navigate('/chat');
  };

  const handleExportClick = async (e: React.MouseEvent, id: string, title: string | null) => {
    e.stopPropagation();
    try {
      const result = await loadConversation(id);
      if (result && result.messages.length > 0) {
        setExportMessages(result.messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })));
        setExportTitle(title || '对话记录');

        const allConsultationIds = new Set<string>();
        for (const msg of result.messages) {
          const ids = msg.mentioned_consultation_ids || [];
          ids.forEach(cid => allConsultationIds.add(cid));
        }

        const allClientIds = new Set<string>();
        for (const msg of result.messages) {
          const ids = msg.mentioned_client_ids || [];
          ids.forEach(cid => allClientIds.add(cid));
        }

        let chartData: ChartData | undefined;

        if (allConsultationIds.size > 0) {
          const { data: consultations } = await supabase
            .from('realtime_consultations')
            .select('chart_data')
            .in('id', Array.from(allConsultationIds))
            .limit(1);
          
          if (consultations?.[0]?.chart_data) {
            chartData = consultations[0].chart_data as unknown as ChartData;
          }
        }

        if (!chartData && allClientIds.size > 0) {
          const { data: consultations } = await supabase
            .from('consultations')
            .select('chart_data')
            .in('client_id', Array.from(allClientIds))
            .order('created_at', { ascending: false })
            .limit(1);
          
          if (consultations?.[0]?.chart_data) {
            chartData = consultations[0].chart_data as unknown as ChartData;
          }
        }

        if (chartData?.pillars) {
          setExportPillars(chartData.pillars);
          setExportQimenChart(chartData);
        } else {
          setExportPillars(undefined);
          setExportQimenChart(undefined);
        }

        setExportDialogOpen(true);
      } else {
        toast({ title: '该对话没有消息记录', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Failed to load conversation for export:', error);
      toast({ title: '加载对话失败', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-2 sm:px-4 py-3 max-w-3xl">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => selectMode ? exitSelectMode() : navigate('/chat')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg sm:text-xl font-bold flex-1">
              {selectMode ? `已选 ${selectedIds.size} 项` : '对话历史'}
            </h1>
            {selectMode ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={toggleSelectAll}>
                  {selectedIds.size === conversations.length ? '取消全选' : '全选'}
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
              conversations.length > 2 && (
                <Button variant="ghost" size="sm" onClick={enterSelectMode}>
                  <CheckSquare className="h-4 w-4 mr-1" />
                  选择
                </Button>
              )
            )}
          </div>
        </div>
      </div>
      
      {/* Hidden Export Dialog */}
      <ExportPdfDialog
        title={exportTitle}
        messages={exportMessages}
        pillars={exportPillars}
        qimenChart={exportQimenChart}
        trigger={<span className="hidden" />}
        externalOpen={exportDialogOpen}
        onExternalOpenChange={(open) => {
          setExportDialogOpen(open);
          if (!open) {
            setExportMessages([]);
            setExportTitle('');
            setExportPillars(undefined);
            setExportQimenChart(undefined);
          }
        }}
      />

      <div className="container mx-auto px-2 sm:px-4 py-4 max-w-3xl">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="text-sm text-muted-foreground">加载中...</span>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground text-center">暂无历史对话</p>
            <p className="text-xs text-muted-foreground text-center mt-1">开始新对话后会显示在这里</p>
            <Button className="mt-4" onClick={handleNewConversation}>
              <Plus className="h-4 w-4 mr-2" />
              新建对话
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv) => {
              const convStats = stats[conv.id];
              const isEditing = editingId === conv.id;
              const isSelected = selectedIds.has(conv.id);
              
              return (
                <div
                  key={conv.id}
                  className={cn(
                    "bg-card rounded-xl border p-4 transition-all cursor-pointer",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  )}
                  onClick={() => !isEditing && handleSelectConversation(conv.id)}
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0"
                        onClick={handleSaveEdit}
                      >
                        <Check className="h-4 w-4 text-green-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0"
                        onClick={handleCancelEdit}
                      >
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
                              onCheckedChange={() => toggleSelection(conv.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="shrink-0"
                            />
                          ) : (
                            <MessageSquare className="h-4 w-4 text-primary shrink-0" />
                          )}
                          <h4 className="font-medium text-sm truncate">
                            {conv.title || '新对话'}
                          </h4>
                        </div>
                        {!selectMode && (
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => handleExportClick(e, conv.id, conv.title)}
                            >
                              <Download className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => handleStartEdit(e, conv.id, conv.title)}
                            >
                              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={(e) => handleDeleteClick(e, conv.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {/* Last message preview */}
                      {convStats?.lastMessage && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {convStats.lastMessage}
                        </p>
                      )}
                      
                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                        <span>{format(new Date(conv.updated_at), 'yyyy-MM-dd HH:mm')}</span>
                        {convStats && !statsLoading && (
                          <span className="flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded-full">
                            <MessageSquare className="h-3 w-3" />
                            {convStats.count}条消息
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
      </div>

      {/* Floating New Button - hide in select mode */}
      {conversations.length > 0 && !selectMode && (
        <Button
          size="lg"
          className="fixed bottom-16 right-16 rounded-full shadow-lg z-50"
          onClick={handleNewConversation}
        >
          <Plus className="h-4 w-4 mr-1" />
          新建对话
        </Button>
      )}

      {/* Single Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-lg max-w-xs">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">删除对话</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              确定要删除这个对话吗？此操作无法撤销，所有消息记录将被永久删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2">
            <AlertDialogCancel className="flex-1 mt-0">取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
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
              确定要删除选中的 {selectedIds.size} 条对话吗？此操作无法撤销。
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
    </div>
  );
};

export default ChatHistoryPage;