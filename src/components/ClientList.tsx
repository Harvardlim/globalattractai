import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { safeParseDate } from "@/lib/time/beijing";
import { getLunarDate } from "@/lib/lunar";
import { User, Trash2, Edit, Eye, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { Client, hourToShichen } from "@/types/database";
import { cn } from "@/lib/utils";
import { getDayGanZhi } from "@/lib/ganzhiHelper";
import { makeBeijingDate, parseYmd } from "@/lib/time/beijing";
import { useLanguage } from "@/hooks/useLanguage";
import { getClientsTranslations } from "@/data/clientsTranslations";


interface ClientListProps {
  clients: Client[];
  selectedClientId: string | null;
  onViewDestiny: (client: Client) => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (client: Client) => Promise<void>;
  loading: boolean;
  selectMode?: boolean;
  selectedIds?: Set<string>;
  onToggleSelection?: (id: string) => void;
  reportClientIds?: Set<string>;
}

const ClientList: React.FC<ClientListProps> = ({
  clients,
  selectedClientId,
  onViewDestiny,
  onEditClient,
  onDeleteClient,
  loading,
  selectMode = false,
  selectedIds = new Set(),
  onToggleSelection,
  reportClientIds = new Set(),
}) => {
  const { toast } = useToast();
  const { currentLanguage } = useLanguage();
  const t = getClientsTranslations(currentLanguage);
  
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const handleConfirmDelete = async () => {
    if (clientToDelete) {
      try {
        await onDeleteClient(clientToDelete);
        toast({ title: t.deleteSuccess });
      } catch {
        toast({ title: t.deleteFailed, variant: "destructive" });
      }
      setClientToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>{t.noClients}</p>
        <p className="text-sm">{t.noClientsHint}</p>
      </div>
    );
  }

  const LUNAR_MONTH_NAMES = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '腊'];
  const LUNAR_DAY_NAMES = [
    '', '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十',
  ];

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

  const calculateAge = (birthDate: string): number => {
    const { year, month, day } = parseYmd(birthDate);
    const today = new Date();
    let age = today.getFullYear() - year;
    const monthDiff = today.getMonth() + 1 - month;
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < day)) {
      age--;
    }
    return age;
  };

  const getLunarLabel = (birthDate: string, birthHour: number | null): string => {
    const { year, month, day } = parseYmd(birthDate);
    const date = makeBeijingDate({ year, month, day, hour: birthHour ?? 12, minute: 0 });
    const lunar = getLunarDate(date);
    const leapPrefix = lunar.isLeap ? '闰' : '';
    const monthName = LUNAR_MONTH_NAMES[lunar.month - 1] || String(lunar.month);
    const dayName = LUNAR_DAY_NAMES[lunar.day] || String(lunar.day);
    return `${leapPrefix}${monthName}月${dayName}`;
  };

  const getGenderDisplay = (gender: string) => {
    if (currentLanguage === 'zh') return gender;
    if (gender === '男') return t.male;
    if (gender === '女') return t.female;
    return gender;
  };

  return (
    <>
      <ScrollArea>
        <div className="space-y-2">
          {clients.map((client) => {
            const shichen = client.birth_hour !== null ? hourToShichen(client.birth_hour) : null;
            const dayStem = getDayStem(client.birth_date, client.birth_hour);
            
            const isSelected = selectedIds.has(client.id);

            return (
              <div
                key={client.id}
                className={cn(
                  "p-3 rounded-lg border transition-colors group cursor-pointer",
                  selectMode && isSelected
                    ? "bg-primary/10 border-primary"
                    : selectedClientId === client.id
                      ? "bg-primary/10 border-primary"
                      : "bg-card border-border",
                )}
                onClick={() => selectMode && onToggleSelection ? onToggleSelection(client.id) : undefined}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {selectMode && (
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleSelection?.(client.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-1 w-full" onClick={() => !selectMode && onViewDestiny(client)}>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium truncate">{client.name}</p>
                          <span className="text-xs text-muted-foreground">
                            {calculateAge(client.birth_date)}{t.ageUnit}
                          </span>
                        </div>
                        <div className="flex flex-row items-center gap-2 flex-wrap">
                          <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            {getGenderDisplay(client.gender)}
                          </span>
                          {client.category && client.category !== '自己' && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                              {client.category}
                            </span>
                          )}
                          {client.category === '自己' && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-primary text-primary-foreground font-medium">
                              {t.self}
                            </span>
                          )}
                          <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                            {t.dayMasterLabel}: {dayStem}
                          </span>
                        </div>
                          {reportClientIds.has(client.id) && (
                            <span className="w-fit text-xs px-1.5 py-0.5 rounded bg-accent text-accent-foreground flex items-center gap-0.5">
                              📄 {t.hasReport}
                            </span>
                          )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 mb-0.5">
                        {format(safeParseDate(client.birth_date), "yyyy-MM-dd")}{" "}
                        {client.birth_hour !== null ? (
                          <>
                            {client.birth_hour.toString().padStart(2, "0")}:
                            {(client.birth_minute || 0).toString().padStart(2, "0")} ({shichen?.name})
                          </>
                        ) : (
                          <span className="text-amber-600">{t.timeUnknown}</span>
                        )}
                      </p>
                      <p className="text-xs mb-0.5">
                        <span className="text-muted-foreground/70">
                        {t.lunarPrefix}{getLunarLabel(client.birth_date, client.birth_hour)}
                        </span>
                      </p>
                      {client.phone_number && (
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {client.phone_number}
                        </p>
                      )}
                    </div>
                  </div>

                  {!selectMode && !client.id.startsWith('self-') && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                        onClick={() => onViewDestiny(client)}
                        title={t.viewDestiny}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEditClient(client)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      {client.category !== '自己' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => setClientToDelete(client)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <AlertDialog open={!!clientToDelete} onOpenChange={(open) => !open && setClientToDelete(null)}>
        <AlertDialogContent className="w-[calc(100%-3rem)] max-w-lg left-1/2 -translate-x-1/2 rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[16px]">{t.confirmDelete}</AlertDialogTitle>
            <AlertDialogDescription className="text-[14px]">
              {t.confirmDeleteDesc.replace('{name}', clientToDelete?.name || '')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 sm:gap-2">
            <AlertDialogCancel className="flex-1 mt-0">{t.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ClientList;
