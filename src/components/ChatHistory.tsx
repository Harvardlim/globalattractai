import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { History, Trash2, MessageSquare, Plus, Pencil, Check, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
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
import { ChatConversation } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ConversationStats {
  count: number;
  lastMessage: string | null;
}

interface ChatHistoryProps {
  conversations: ChatConversation[];
  loading: boolean;
  currentConversationId: string | null;
  onFetch: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  onNew: () => void;
  onUpdateTitle: (id: string, title: string) => void;
  onGetStats: (ids: string[]) => Promise<Record<string, ConversationStats>>;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({
  conversations,
  loading,
  currentConversationId,
  onFetch,
  onSelect,
  onDelete,
  onNew,
  onUpdateTitle,
  onGetStats,
}) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [stats, setStats] = useState<Record<string, ConversationStats>>({});
  const [statsLoading, setStatsLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch stats when conversations change
  useEffect(() => {
    const fetchStats = async () => {
      if (conversations.length === 0) return;
      setStatsLoading(true);
      try {
        const result = await onGetStats(conversations.map(c => c.id));
        setStats(result);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [conversations, onGetStats]);

  const handleOpen = () => {
    setOpen(true);
    onFetch();
  };

  const handleSelectConversation = (id: string) => {
    onSelect(id);
    setOpen(false);
  };

  const handleStartEdit = (e: React.MouseEvent, conv: ChatConversation) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditValue(conv.title || '');
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

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      try {
        await onDelete(deleteId);
        toast({ title: "删除成功" });
      } catch {
        toast({ title: "删除失败", variant: "destructive" });
      }
      setDeleteId(null);
    }
  };

  const handleNewConversation = () => {
    onNew();
    setOpen(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" onClick={handleOpen}>
            <History className="h-4 w-4 mr-3" />
            历史记录
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
          <SheetHeader className="px-4 py-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-lg font-semibold">对话历史</SheetTitle>
              {/* <Button variant="outline" size="sm" onClick={handleNewConversation}>
                <Plus className="h-4 w-4 mr-1" />
                新建对话
              </Button> */}
            </div>
          </SheetHeader>

                  <Button
                    size="lg"
                    className="fixed bottom-16 right-6 rounded-full shadow-lg z-50"
                    onClick={handleNewConversation}
                  >
                       <Plus className="h-4 w-4 mr-1" />
                新建对话
                  </Button>
          
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <span className="text-sm text-muted-foreground">加载中...</span>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground text-center">暂无历史对话</p>
                <p className="text-xs text-muted-foreground text-center mt-1">开始新对话后会显示在这里</p>
              </div>
            ) : (
              <div className="p-3 space-y-3">
                {conversations.map((conv) => {
                  const convStats = stats[conv.id];
                  const isEditing = editingId === conv.id;
                  const isActive = conv.id === currentConversationId;
                  
                  return (
                    <div
                      key={conv.id}
                      className={cn(
                        "bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-all cursor-pointer",
                        isActive && "border-primary/50 bg-primary/5"
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
                              <MessageSquare className="h-4 w-4 text-primary shrink-0" />
                              <h4 className="font-medium text-sm truncate">
                                {conv.title || '新对话'}
                              </h4>
                              {isActive && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium shrink-0">
                                  当前
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => handleStartEdit(e, conv)}
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
                          </div>
                          
                          {/* Last message preview */}
                          {convStats?.lastMessage && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {convStats.lastMessage}
                            </p>
                          )}
                          
                          {/* Footer: Date and message count */}
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
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
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
    </>
  );
};

export default ChatHistory;
