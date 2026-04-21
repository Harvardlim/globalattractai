import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Plus, Search, Check, Settings2, Unlock, CheckSquare, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
import ClientList from "@/components/ClientList";
import ClientAdvancedFilter, { AdvancedFilters } from "@/components/ClientAdvancedFilter";
import CategoryManagerModal from "@/components/CategoryManagerModal";
import { useClients } from "@/hooks/useClients";
import { useCategorySettings } from "@/hooks/useCategorySettings";
import { useUnlockedClients } from "@/hooks/useUnlockedClients";
import { useMemberPermissions } from "@/hooks/useMemberPermissions";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { getClientsTranslations } from "@/data/clientsTranslations";
import { Client } from "@/types/database";
import { cn } from "@/lib/utils";
import { getDayGanZhi } from "@/lib/ganzhiHelper";
import { makeBeijingDate, parseYmd } from "@/lib/time/beijing";

const Clients: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clients, loading, deleteClient, refetch } = useClients();
  const { profile, user } = useAuth();
  const { categoryOrder, loading: categoryLoading } = useCategorySettings();
  const { isClientUnlocked } = useUnlockedClients();
  const { isNormal } = useMemberPermissions();
  const { toast } = useToast();
  const { currentLanguage } = useLanguage();
  const t = getClientsTranslations(currentLanguage);
  const [reportClientIds, setReportClientIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    dayMasters: [],
    genders: [],
    noTimeOnly: false,
    sortBy: 'created-desc',
  });
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);

  // Multi-select state
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchDeleteConfirm, setBatchDeleteConfirm] = useState(false);
  const [batchDeleting, setBatchDeleting] = useState(false);
  const [selfProfileData, setSelfProfileData] = useState<{
    birth_date: string | null; birth_hour: number | null; birth_minute: number | null;
    gender: string | null; display_name: string | null; phone_number: string | null;
    created_at: string; updated_at: string;
  } | null>(null);

  // Check if we're in select mode (coming from Destiny or Synastry page)
  const destinySelectMode = searchParams.get("selectMode");
  const isDestinySelectMode = destinySelectMode === "destiny";
  const isSynastrySelectMode = destinySelectMode === "synastry";
  const isSalesChartSelectMode = destinySelectMode === "sales-chart";
  const isAnySelectMode = isDestinySelectMode || isSynastrySelectMode || isSalesChartSelectMode;
  const synastrySlot = searchParams.get("slot");
  const synastryClientId1 = searchParams.get("clientId1");
  const synastryClientId2 = searchParams.get("clientId2");

  const getDayStem = (birthDate: string, birthHour: number | null): string => {
    const { year, month, day } = parseYmd(birthDate);
    const date = makeBeijingDate({
      year,
      month,
      day,
      hour: birthHour ?? 12,
      minute: 0
    });
    const isLateZi = birthHour === 23;
    const calcDate = isLateZi ? new Date(date.getTime() + 24 * 60 * 60 * 1000) : date;
    const dayGanZhi = getDayGanZhi(calcDate);
    return dayGanZhi.gan;
  };

  const highlightName = searchParams.get("highlight");
  useEffect(() => {
    if (highlightName) {
      setSearchQuery(highlightName);
    }
  }, [highlightName]);

  // Fetch profile birth data for self-client
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('birth_date, birth_hour, birth_minute, gender, display_name, phone_number, created_at, updated_at')
        .eq('id', user.id)
        .single();
      if (data) setSelfProfileData(data);
    })();
  }, [user]);

  // Fetch client IDs that have reports
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('client_reports')
        .select('client_id')
        .eq('user_id', user.id)
        .eq('status', 'completed');
      if (data) {
        setReportClientIds(new Set(data.map(r => r.client_id)));
      }
    })();
  }, [user]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Check if user already has a "自己" client
  const existingSelfClient = useMemo(() => {
    return clients.find(c => c.category === '自己');
  }, [clients]);

  // Create virtual self-client from profile if birth_date is filled and no existing "自己" client
  const selfClient: (Client & { isSelf?: boolean }) | null = useMemo(() => {
    if (existingSelfClient) return null;
    if (!selfProfileData?.birth_date || !selfProfileData?.gender || !user) return null;
    return {
      id: `self-${user.id}`,
      name: selfProfileData.display_name || '我',
      birth_date: selfProfileData.birth_date,
      birth_hour: selfProfileData.birth_hour ?? null,
      birth_minute: selfProfileData.birth_minute ?? 0,
      gender: (selfProfileData.gender === 'male' ? '男' : selfProfileData.gender === 'female' ? '女' : selfProfileData.gender) as '男' | '女',
      notes: null,
      phone_number: selfProfileData.phone_number || null,
      category: '自己',
      created_at: selfProfileData.created_at,
      updated_at: selfProfileData.updated_at,
      isSelf: true,
    };
  }, [selfProfileData, user, existingSelfClient]);

  const allClients = useMemo(() => {
    if (!selfClient) return clients;
    return [selfClient as Client, ...clients];
  }, [clients, selfClient]);

  const clientsWithDayMaster = useMemo(() => {
    return allClients.map((client) => {
      const dayStem = getDayStem(client.birth_date, client.birth_hour);
      const isUnlocked = isNormal && isClientUnlocked(client.id);
      return {
        ...client,
        dayMaster: dayStem,
        isUnlocked,
      };
    });
  }, [allClients, isNormal, isClientUnlocked]);

  const orderedCategories = useMemo(() => {
    const clientCategories = clients
      .map((c) => c.category)
      .filter((cat): cat is string => !!cat);
    const uniqueClientCategories = [...new Set(clientCategories)];
    const result = [...categoryOrder];
    uniqueClientCategories.forEach((cat) => {
      if (!result.includes(cat)) {
        result.push(cat);
      }
    });
    return result;
  }, [clients, categoryOrder]);

  const filteredClients = useMemo(() => {
    let result = clientsWithDayMaster;

    if (selectedCategory) {
      result = result.filter((client) => client.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (client) =>
          client.name.toLowerCase().includes(query) ||
          client.phone_number?.toLowerCase().includes(query) ||
          client.notes?.toLowerCase().includes(query),
      );
    }

    if (advancedFilters.dayMasters.length > 0) {
      result = result.filter((client) =>
        advancedFilters.dayMasters.includes(client.dayMaster)
      );
    }

    if (advancedFilters.genders.length > 0) {
      result = result.filter((client) =>
        advancedFilters.genders.includes(client.gender)
      );
    }

    if (advancedFilters.noTimeOnly) {
      result = result.filter((client) => client.birth_hour === null);
    }

    result.sort((a, b) => {
      const aIsSelf = a.category === '自己';
      const bIsSelf = b.category === '自己';
      if (aIsSelf && !bIsSelf) return -1;
      if (!aIsSelf && bIsSelf) return 1;
      
      switch (advancedFilters.sortBy) {
        case 'name-desc':
          return b.name.localeCompare(a.name, 'zh');
        case 'created-desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'name-asc':
        default:
          return a.name.localeCompare(b.name, 'zh');
      }
    });

    return result;
  }, [clientsWithDayMaster, searchQuery, selectedCategory, advancedFilters]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    clients.forEach((client) => {
      const cat = client.category || "未分类";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [clients]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === filteredClients.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredClients.map(c => c.id)));
    }
  }, [selectedIds.size, filteredClients]);

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
      await Promise.all(ids.map(id => deleteClient(id)));
      toast({ title: t.deletedCount.replace('{count}', String(ids.length)) });
      exitSelectMode();
    } catch {
      toast({ title: t.deleteFailed, variant: "destructive" });
    } finally {
      setBatchDeleting(false);
      setBatchDeleteConfirm(false);
    }
  };

  const handleDelete = async (client: Client) => {
    await deleteClient(client.id);
  };

  const createRealSelfClient = async (): Promise<string | null> => {
    if (!selfClient || !user) return null;
    const { data, error } = await supabase
      .from('clients')
      .insert({
        name: selfClient.name,
        birth_date: selfClient.birth_date,
        birth_hour: selfClient.birth_hour,
        birth_minute: selfClient.birth_minute,
        gender: selfClient.gender,
        category: '自己',
        user_id: user.id,
      })
      .select('id')
      .single();
    if (error || !data) {
      toast({ title: t.createFailed, variant: 'destructive' });
      return null;
    }
    refetch();
    return data.id;
  };

  const handleViewDestiny = async (client: Client) => {
    if (client.id.startsWith('self-')) {
      const realId = await createRealSelfClient();
      if (realId) navigate(`/destiny?clientId=${realId}`);
      return;
    }
    navigate(`/destiny?clientId=${client.id}`);
  };

  const handleSelectClient = async (client: Client) => {
    if (selectMode) {
      if (!client.id.startsWith('self-')) toggleSelection(client.id);
      return;
    }
    // For virtual self-client, create a real client first
    let clientId = client.id;
    if (clientId.startsWith('self-')) {
      const realId = await createRealSelfClient();
      if (!realId) return;
      clientId = realId;
    }
    if (isSynastrySelectMode) {
      const otherClientId = synastrySlot === "1" ? synastryClientId2 : synastryClientId1;
      if (otherClientId && clientId === otherClientId) {
        toast({ title: t.cannotSelectSame, description: t.cannotSelectSameDesc, variant: "destructive" });
        return;
      }
      const params = new URLSearchParams();
      if (synastrySlot === "1") {
        params.set("clientId1", clientId);
        if (synastryClientId2) params.set("clientId2", synastryClientId2);
      } else {
        if (synastryClientId1) params.set("clientId1", synastryClientId1);
        params.set("clientId2", clientId);
      }
      navigate(`/synastry?${params.toString()}`);
      return;
    }
    if (isSalesChartSelectMode) {
      navigate(`/sales-chart?clientId=${clientId}`);
      return;
    }
    if (isDestinySelectMode) {
      navigate(`/destiny?clientId=${clientId}`);
    } else {
      handleViewDestiny(client);
    }
  };

  const handleBack = () => {
    if (selectMode) {
      exitSelectMode();
      return;
    }
    if (isSynastrySelectMode) {
      const params = new URLSearchParams();
      if (synastryClientId1) params.set("clientId1", synastryClientId1);
      if (synastryClientId2) params.set("clientId2", synastryClientId2);
      navigate(`/synastry?${params.toString()}`);
      return;
    }
    if (isDestinySelectMode) {
      navigate("/destiny");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="bg-background text-foreground min-h-screen pb-24">
      {/* Sticky Header + Filter */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-4 py-3 max-w-2xl">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold flex-1">
              {selectMode
                ? `${t.selected} ${selectedIds.size} ${t.items}`
                : isAnySelectMode
                  ? t.selectClient
                  : t.title}
            </h1>
            {selectMode ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={toggleSelectAll}>
                  {selectedIds.size === filteredClients.length ? t.deselectAll : t.selectAll}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={selectedIds.size === 0 || batchDeleting}
                  onClick={() => setBatchDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  {t.delete}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                {!isAnySelectMode && clients.length > 2 && (
                  <Button variant="ghost" size="sm" onClick={enterSelectMode}>
                    <CheckSquare className="h-4 w-4 mr-1" />
                    {t.select}
                  </Button>
                )}
                {!isAnySelectMode && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCategoryManagerOpen(true)}
                  >
                    <Settings2 className="h-5 w-5" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Category Filter Tabs - inside sticky */}
        {!selectMode && (
          <div className="container mx-auto px-4 max-w-2xl">
            {isDestinySelectMode && (
              <div className="mb-3 p-3 bg-primary/10 rounded-lg text-sm text-primary">{t.destinySelectHint}</div>
            )}
            {isSynastrySelectMode && (
              <div className="mb-3 p-3 bg-primary/10 rounded-lg text-sm text-primary">
                {synastrySlot === "1" ? t.synastrySelectHint1 : t.synastrySelectHint2}
              </div>
            )}
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-2 pb-2">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  className="shrink-0"
                  onClick={() => setSelectedCategory(null)}
                >
                  {t.all} ({clients.length})
                </Button>
                {orderedCategories.filter(cat => cat !== '自己').map((category) => {
                  const count = categoryCounts[category] || 0;
                  if (count === 0) return null;
                  return (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      className="shrink-0"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category} ({count})
                    </Button>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {/* Search Input with Advanced Filter - inside sticky */}
            <div className="flex gap-2 py-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-9"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <ClientAdvancedFilter
                filters={advancedFilters}
                onFiltersChange={setAdvancedFilters}
              />
            </div>
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 pt-4 pb-16 max-w-2xl">
        {isAnySelectMode ? (
          <SelectableClientList clients={filteredClients} onSelect={handleSelectClient} loading={loading} t={t} />
        ) : (
          <ClientList
            clients={filteredClients}
            selectedClientId={null}
            onViewDestiny={handleViewDestiny}
            onEditClient={(client) => navigate(`/clients/${client.id}/edit`)}
            onDeleteClient={handleDelete}
            loading={loading}
            selectMode={selectMode}
            selectedIds={selectedIds}
            onToggleSelection={toggleSelection}
            reportClientIds={reportClientIds}
          />
        )}
      </div>

      {/* Floating Action Button */}
      {!isAnySelectMode && !selectMode && (
        <Button
          size="lg"
          className="fixed bottom-16 right-6 h-14 w-14 rounded-full shadow-lg z-50"
          onClick={() => navigate("/clients/new")}
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      {/* Category Manager Modal */}
      <CategoryManagerModal
        open={categoryManagerOpen}
        onOpenChange={setCategoryManagerOpen}
        onCategoriesChanged={refetch}
      />

      {/* Batch Delete Confirmation */}
      <AlertDialog open={batchDeleteConfirm} onOpenChange={(open) => !open && setBatchDeleteConfirm(false)}>
        <AlertDialogContent className="rounded-lg max-w-xs">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">{t.batchDeleteTitle}</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              {t.batchDeleteDesc.replace('{count}', String(selectedIds.size))}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2">
            <AlertDialogCancel className="flex-1 mt-0" disabled={batchDeleting}>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBatchDelete}
              disabled={batchDeleting}
              className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {batchDeleting ? t.deleting : `${t.deleteCount} ${selectedIds.size}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Simplified list for select mode
interface SelectableClientListProps {
  clients: (Client & { dayMaster: string; isUnlocked?: boolean })[];
  onSelect: (client: Client) => void;
  loading: boolean;
  t: ReturnType<typeof getClientsTranslations>;
}

const SelectableClientList: React.FC<SelectableClientListProps> = ({ clients, onSelect, loading, t }) => {
  const navigate = useNavigate();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="mb-4">{t.noClients}</p>
        <Button onClick={() => navigate("/clients/new")}>
          <Plus className="h-4 w-4 mr-2" />
          {t.addClient}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {clients.map((client) => (
        <button
          key={client.id}
          onClick={() => onSelect(client)}
          className={cn(
            "w-full p-4 rounded-lg border bg-card text-left transition-colors",
            "hover:bg-primary/5 hover:border-primary/50 active:bg-primary/10",
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">{client.name}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{client.gender}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">{client.dayMaster}</span>
                {client.category && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">{client.category}</span>
                )}
                {client.isUnlocked && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 flex items-center gap-1">
                    <Unlock className="h-3 w-3" />
                    {t.unlocked}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {client.birth_date}{" "}
                {client.birth_hour !== null
                  ? `${client.birth_hour.toString().padStart(2, "0")}:${(client.birth_minute || 0).toString().padStart(2, "0")}`
                  : t.timeUnknown}
              </p>
            </div>
            <Check className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100" />
          </div>
        </button>
      ))}
    </div>
  );
};

export default Clients;
