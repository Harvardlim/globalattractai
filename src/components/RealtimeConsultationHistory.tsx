import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { History, Trash2, Loader2, MessageSquare, Pencil, Check, X, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from '@/components/ui/sheet';
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
import { RealtimeConsultation } from '@/hooks/useRealtimeConsultations';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ConsultationStats {
  count: number;
  lastMessage: string | null;
}

interface RealtimeConsultationHistoryProps {
  history: RealtimeConsultation[];
  loading: boolean;
  error?: string | null;
  hasAttempted?: boolean;
  onFetch: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => Promise<boolean>;
  onUpdateTitle: (id: string, title: string) => void;
  onGetStats: (ids: string[]) => Promise<Record<string, ConsultationStats>>;
}

const RealtimeConsultationHistory: React.FC<RealtimeConsultationHistoryProps> = ({
  history,
  loading,
  error,
  hasAttempted,
  onFetch,
  onSelect,
  onDelete,
  onUpdateTitle,
  onGetStats,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [stats, setStats] = useState<Record<string, ConsultationStats>>({});
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      onFetch();
    }
  }, [open, onFetch]);

  // Fetch stats when history changes
  useEffect(() => {
    const fetchStats = async () => {
      if (history.length === 0 || !open) return;
      setStatsLoading(true);
      try {
        const result = await onGetStats(history.map(c => c.id));
        setStats(result);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [history.length, open, onGetStats]);

  const handleStartEdit = (e: React.MouseEvent, item: RealtimeConsultation) => {
    e.stopPropagation();
    setEditingId(item.id);
    setEditValue(item.issue || '');
  };

  const handleSaveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingId && editValue.trim()) {
      onUpdateTitle(editingId, editValue.trim());
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
        onUpdateTitle(editingId, editValue.trim());
      }
      setEditingId(null);
      setEditValue('');
    } else if (e.key === 'Escape') {
      setEditingId(null);
      setEditValue('');
    }
  };

  const handleSelect = (id: string) => {
    onSelect(id);
    setOpen(false);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteDialogId(id);
  };

  const handleConfirmDelete = async () => {
    if (deleteDialogId) {
      const success = await onDelete(deleteDialogId);
      if (success) {
        toast({ title: "删除成功" });
      } else {
        toast({ title: "删除失败", variant: "destructive" });
      }
      setDeleteDialogId(null);
    }
  };

  // Render empty/error states
  const renderEmptyState = () => {
    // Not logged in
    if (!user) {
      return (
        <div className="text-center py-8 space-y-3">
          <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">请先登录查看历史记录</p>
        </div>
      );
    }

    // Loading
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      );
    }

    // Error state
    if (error) {
      return (
        <div className="text-center py-8 space-y-3">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
          <p className="text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={onFetch}>
            <RefreshCw className="h-4 w-4 mr-1" />
            重试
          </Button>
        </div>
      );
    }

    // No records
    if (hasAttempted && history.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground text-center">暂无历史记录</p>
          <p className="text-xs text-muted-foreground text-center mt-1">开始问事后会显示在这里</p>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <History className="h-4 w-4 mr-1" />
            历史记录
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col" aria-describedby="realtime-history-description">
          <SheetHeader className="px-4 py-4">
            <SheetTitle className="text-lg font-semibold">问事历史记录</SheetTitle>
            <SheetDescription id="realtime-history-description" className="sr-only">
              查看和管理实时盘问事历史记录
            </SheetDescription>
          </SheetHeader>
          
          <ScrollArea className="flex-1">
            {renderEmptyState() || (
              <div className="p-3 space-y-3">
                {history.map((item) => {
                  const itemStats = stats[item.id];
                  const isEditing = editingId === item.id;
                  
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-all cursor-pointer"
                      )}
                      onClick={() => !isEditing && handleSelect(item.id)}
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
                              <MessageSquare className="h-4 w-4 text-primary shrink-0" />
                              <h4 className="font-medium text-sm truncate">
                                {item.issue || '未填写事项'}
                              </h4>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => handleStartEdit(e, item)}
                              >
                                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={(e) => handleDeleteClick(e, item.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Last message preview */}
                          {itemStats?.lastMessage && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {itemStats.lastMessage}
                            </p>
                          )}
                          
                          {/* Topic badge */}
                          {item.topic && (
                            <div className="mb-2">
                              <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                                {item.topic}
                              </span>
                            </div>
                          )}
                          
                          {/* Footer: Date and message count */}
                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                            <span>{format(new Date(item.chart_date), 'yyyy-MM-dd HH:mm')}</span>
                            {itemStats && !statsLoading && (
                              <span className="flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded-full">
                                <MessageSquare className="h-3 w-3" />
                                {itemStats.count}条消息
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
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDialogId} onOpenChange={(open) => !open && setDeleteDialogId(null)}>
        <AlertDialogContent className="rounded-lg max-w-xs">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">删除问事记录</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              确定要删除这条问事记录吗？此操作无法撤销，所有对话内容将被永久删除。
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
    </>
  );
};

export default RealtimeConsultationHistory;
