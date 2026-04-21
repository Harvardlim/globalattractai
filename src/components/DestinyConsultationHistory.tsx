import React, { useEffect, useState } from "react";
import { History, Trash2, MessageSquare, Users, Pencil, Check, X, RefreshCw, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
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
import { Client, Consultation } from "@/types/database";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ConsultationStats {
  count: number;
  lastMessage: string | null;
}

interface DestinyConsultationHistoryProps {
  clientId: string;
  clients: Client[];
  consultations: Consultation[];
  loading: boolean;
  error?: string | null;
  hasAttempted?: boolean;
  onFetch: () => void;
  onSelect: (consultationId: string, messages: Message[]) => void;
  onDelete: (consultationId: string) => Promise<void>;
  getMessages: (consultationId: string) => Promise<{ role: string; content: string }[]>;
  onUpdateTitle: (id: string, title: string) => void;
  onGetStats: (ids: string[]) => Promise<Record<string, ConsultationStats>>;
}

const DestinyConsultationHistory: React.FC<DestinyConsultationHistoryProps> = ({
  clientId,
  clients,
  consultations,
  loading,
  error,
  hasAttempted,
  onFetch,
  onSelect,
  onDelete,
  getMessages,
  onUpdateTitle,
  onGetStats,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [stats, setStats] = useState<Record<string, ConsultationStats>>({});
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    if (open && clientId) {
      onFetch();
    }
  }, [open, clientId, onFetch]);

  // Filter consultations for current client
  const clientConsultations = consultations.filter((c) => c.client_id === clientId);

  // Fetch stats when consultations change
  useEffect(() => {
    const fetchStats = async () => {
      if (clientConsultations.length === 0 || !open) return;
      setStatsLoading(true);
      try {
        const result = await onGetStats(clientConsultations.map((c) => c.id));
        setStats(result);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [clientConsultations.length, open, onGetStats]);

  const handleSelect = async (consultation: Consultation) => {
    const messages = await getMessages(consultation.id);
    onSelect(
      consultation.id,
      messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    );
    setOpen(false);
  };

  const handleDeleteClick = (e: React.MouseEvent, consultationId: string) => {
    e.stopPropagation();
    setDeleteDialogId(consultationId);
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialogId) return;
    setDeletingId(deleteDialogId);
    try {
      await onDelete(deleteDialogId);
      toast({ title: "删除成功" });
    } catch {
      toast({ title: "删除失败", variant: "destructive" });
    } finally {
      setDeletingId(null);
      setDeleteDialogId(null);
    }
  };

  const handleStartEdit = (e: React.MouseEvent, consultation: Consultation) => {
    e.stopPropagation();
    setEditingId(consultation.id);
    setEditValue(consultation.topic || "");
  };

  const handleSaveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingId && editValue.trim()) {
      onUpdateTitle(editingId, editValue.trim());
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
        onUpdateTitle(editingId, editValue.trim());
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
        <div className="text-center text-muted-foreground py-8">
          <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
          加载中...
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
    if (hasAttempted && clientConsultations.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground text-center">暂无历史记录</p>
          <p className="text-xs text-muted-foreground text-center mt-1">开始咨询后会显示在这里</p>
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
            历史
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col" aria-describedby="destiny-history-description">
          <SheetHeader className="px-4 py-4 border-b border-border">
            <SheetTitle className="text-lg font-semibold">咨询历史记录</SheetTitle>
            <SheetDescription id="destiny-history-description" className="sr-only">
              查看和管理命理盘咨询历史记录
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1">
            {renderEmptyState() || (
              <div className="p-3 space-y-3">
                {clientConsultations.map((consultation) => {
                  const mentionedNames = getMentionedClientNames(consultation.mentioned_client_ids);
                  const hasMentions = mentionedNames.length > 0;
                  const consultationStats = stats[consultation.id];
                  const isEditing = editingId === consultation.id;

                  return (
                    <div
                      key={consultation.id}
                      className={cn(
                        "bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-all cursor-pointer"
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
                                {consultation.topic || "命理分析"}
                              </h4>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
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
                                onClick={(e) => handleDeleteClick(e, consultation.id)}
                                disabled={deletingId === consultation.id}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>

                          {/* Last message preview */}
                          {consultationStats?.lastMessage && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {consultationStats.lastMessage}
                            </p>
                          )}

                          {/* Mentioned clients */}
                          {hasMentions && (
                            <div className="flex items-center gap-1.5 mb-2">
                              <Users className="h-3.5 w-3.5 text-primary shrink-0" />
                              <div className="flex flex-wrap gap-1">
                                {mentionedNames.map((name) => (
                                  <Badge key={name} variant="secondary" className="text-xs">
                                    @{name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Footer: Date and message count */}
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
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDialogId} onOpenChange={(open) => !open && setDeleteDialogId(null)}>
        <AlertDialogContent className="mx-6 rounded-lg max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">删除咨询记录</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              确定要删除这条咨询记录吗？此操作无法撤销，所有对话内容将被永久删除。
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

export default DestinyConsultationHistory;
