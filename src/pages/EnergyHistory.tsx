import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Trash2, Loader2, Pencil, Check, X, RefreshCw, AlertCircle, History, CheckSquare, Zap, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useEnergyAnalyses } from '@/hooks/useEnergyAnalyses';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const EnergyHistory: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    history, loading, error, hasAttempted,
    fetchHistory, deleteAnalysis, updateAnalysisTitle,
  } = useEnergyAnalyses();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);

  // Multi-select
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchDeleteConfirm, setBatchDeleteConfirm] = useState(false);
  const [batchDeleting, setBatchDeleting] = useState(false);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds(prev => prev.size === history.length ? new Set() : new Set(history.map(a => a.id)));
  }, [history]);

  const exitSelectMode = useCallback(() => { setSelectMode(false); setSelectedIds(new Set()); }, []);

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    setBatchDeleting(true);
    try {
      await Promise.all(Array.from(selectedIds).map(id => deleteAnalysis(id)));
      toast({ title: `已删除 ${selectedIds.size} 条记录` });
      exitSelectMode();
    } catch { toast({ title: "删除失败", variant: "destructive" }); }
    finally { setBatchDeleting(false); setBatchDeleteConfirm(false); }
  };

  const handleSelect = (item: any) => {
    if (selectMode) { toggleSelection(item.id); return; }
    // Navigate to energy page with the analysis loaded
    navigate(`/energy?analysisId=${item.id}`);
  };

  const handleConfirmDelete = async () => {
    if (deleteDialogId) {
      const success = await deleteAnalysis(deleteDialogId);
      toast({ title: success ? "删除成功" : "删除失败", variant: success ? undefined : "destructive" });
      setDeleteDialogId(null);
    }
  };

  const handleSaveEdit = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingId && editValue.trim()) await updateAnalysisTitle(editingId, editValue.trim());
    setEditingId(null); setEditValue('');
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { if (editingId && editValue.trim()) await updateAnalysisTitle(editingId, editValue.trim()); setEditingId(null); setEditValue(''); }
    else if (e.key === 'Escape') { setEditingId(null); setEditValue(''); }
  };

  const renderContent = () => {
    if (!user) return (
      <div className="text-center py-12 space-y-3">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
        <p className="text-muted-foreground">请先登录查看历史记录</p>
      </div>
    );

    if (loading) return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );

    if (error) return (
      <div className="text-center py-12 space-y-3">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
        <p className="text-muted-foreground">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchHistory}><RefreshCw className="h-4 w-4 mr-1" />重试</Button>
      </div>
    );

    if (hasAttempted && history.length === 0) return (
      <div className="text-center py-12 space-y-3">
        <History className="h-12 w-12 text-muted-foreground mx-auto" />
        <p className="text-muted-foreground">暂无分析历史记录</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/energy')}>返回数字能量</Button>
      </div>
    );

    return (
      <div className="space-y-3">
        {history.map((item) => {
          const isEditing = editingId === item.id;
          const isSelected = selectedIds.has(item.id);

          return (
            <div
              key={item.id}
              className={cn(
                "bg-card rounded-xl border p-4 transition-all cursor-pointer",
                isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
              )}
              onClick={() => !isEditing && handleSelect(item)}
            >
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={handleKeyDown} onClick={(e) => e.stopPropagation()} className="h-9 text-sm flex-1" autoFocus />
                  <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={handleSaveEdit}><Check className="h-4 w-4 text-green-500" /></Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={(e) => { e.stopPropagation(); setEditingId(null); }}><X className="h-4 w-4 text-muted-foreground" /></Button>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {selectMode ? (
                        <Checkbox checked={isSelected} onCheckedChange={() => toggleSelection(item.id)} onClick={(e) => e.stopPropagation()} className="shrink-0" />
                      ) : (
                        <Phone className="h-4 w-4 text-primary shrink-0" />
                      )}
                      <h4 className="font-medium text-sm truncate">
                        {item.title || item.input_number}
                      </h4>
                    </div>
                    {!selectMode && (
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setEditingId(item.id); setEditValue(item.title || item.input_number); }}>
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteDialogId(item.id); }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="mb-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                      <Zap className="h-3 w-3" />
                      {item.input_number}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                    <span>{format(new Date(item.created_at), 'yyyy-MM-dd HH:mm')}</span>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-background text-foreground">
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
          <div className="container mx-auto px-4 py-3 max-w-2xl">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => selectMode ? exitSelectMode() : navigate('/energy')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold flex-1">
                {selectMode ? `已选 ${selectedIds.size} 项` : '数字能量历史'}
              </h1>
              {selectMode ? (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={toggleSelectAll}>{selectedIds.size === history.length ? '取消全选' : '全选'}</Button>
                  <Button variant="destructive" size="sm" disabled={selectedIds.size === 0 || batchDeleting} onClick={() => setBatchDeleteConfirm(true)}>
                    <Trash2 className="h-4 w-4 mr-1" />删除
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  {history.length > 2 && (
                    <Button variant="ghost" size="sm" onClick={() => { setSelectMode(true); setSelectedIds(new Set()); }}>
                      <CheckSquare className="h-4 w-4 mr-1" />选择
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={fetchHistory}><RefreshCw className="h-4 w-4" /></Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-4 max-w-2xl">{renderContent()}</div>
      </div>

      <AlertDialog open={!!deleteDialogId} onOpenChange={(open) => !open && setDeleteDialogId(null)}>
        <AlertDialogContent className="rounded-lg max-w-xs">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">删除分析记录</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">确定要删除此记录吗？此操作无法撤销。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2">
            <AlertDialogCancel className="flex-1 mt-0">取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90">删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={batchDeleteConfirm} onOpenChange={(open) => !open && setBatchDeleteConfirm(false)}>
        <AlertDialogContent className="rounded-lg max-w-xs">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">批量删除</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">确定要删除选中的 {selectedIds.size} 条记录吗？此操作无法撤销。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2">
            <AlertDialogCancel className="flex-1 mt-0" disabled={batchDeleting}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleBatchDelete} disabled={batchDeleting} className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {batchDeleting ? '删除中...' : `删除 ${selectedIds.size} 条`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EnergyHistory;
