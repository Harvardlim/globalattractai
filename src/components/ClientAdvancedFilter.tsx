import React, { useState, useMemo } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/hooks/useLanguage';
import { getClientsTranslations } from '@/data/clientsTranslations';
import { cn } from '@/lib/utils';
import { HEAVENLY_STEMS } from '@/lib/constants';

const DAY_MASTERS = HEAVENLY_STEMS.map((stem, idx) => ({
  value: stem,
  label: stem,
  element: ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水'][idx],
  yinYang: idx % 2 === 0 ? '阳' : '阴',
}));

export type SortOption = 'name-asc' | 'name-desc' | 'created-desc';

export interface AdvancedFilters {
  dayMasters: string[];
  genders: string[];
  noTimeOnly: boolean;
  sortBy: SortOption;
}

interface ClientAdvancedFilterProps {
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
}

const ClientAdvancedFilter: React.FC<ClientAdvancedFilterProps> = ({
  filters,
  onFiltersChange,
}) => {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<AdvancedFilters>(filters);
  const isMobile = useIsMobile();
  const { currentLanguage } = useLanguage();
  const t = getClientsTranslations(currentLanguage);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.dayMasters.length > 0) count++;
    if (filters.genders.length > 0) count++;
    if (filters.noTimeOnly) count++;
    if (filters.sortBy !== 'name-asc') count++;
    return count;
  }, [filters]);

  const handleOpen = () => {
    setLocalFilters(filters);
    setOpen(true);
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    setOpen(false);
  };

  const handleReset = () => {
    const empty: AdvancedFilters = { dayMasters: [], genders: [], noTimeOnly: false, sortBy: 'name-asc' };
    setLocalFilters(empty);
    onFiltersChange(empty);
    setOpen(false);
  };

  const toggleDayMaster = (stem: string) => {
    setLocalFilters(prev => ({
      ...prev,
      dayMasters: prev.dayMasters.includes(stem)
        ? prev.dayMasters.filter(s => s !== stem)
        : [...prev.dayMasters, stem],
    }));
  };

  const toggleGender = (gender: string) => {
    setLocalFilters(prev => ({
      ...prev,
      genders: prev.genders.includes(gender)
        ? prev.genders.filter(g => g !== gender)
        : [...prev.genders, gender],
    }));
  };

  const genderOptions = [
    { value: '男', label: t.male },
    { value: '女', label: t.female },
  ];

  const content = (
    <div className="space-y-6">
      {/* Day Master Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">{t.dayMasterLabel}</Label>
        <div className="grid grid-cols-5 gap-2">
          {DAY_MASTERS.map((dm) => {
            const isSelected = localFilters.dayMasters.includes(dm.value);
            return (
              <button
                key={dm.value}
                type="button"
                onClick={() => toggleDayMaster(dm.value)}
                className={cn(
                  'p-2 rounded-lg border text-center transition-colors',
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card hover:bg-muted/50 border-border'
                )}
              >
                <div className="font-medium">{dm.value}</div>
                <div className="text-xs opacity-70">
                  {dm.yinYang}{dm.element}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Gender Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">{t.gender}</Label>
        <div className="flex gap-2">
          {genderOptions.map((g) => {
            const isSelected = localFilters.genders.includes(g.value);
            return (
              <Button
                key={g.value}
                type="button"
                variant={isSelected ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => toggleGender(g.value)}
              >
                {g.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* No Time Filter */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="noTimeOnly"
          checked={localFilters.noTimeOnly}
          onCheckedChange={(checked) =>
            setLocalFilters(prev => ({ ...prev, noTimeOnly: checked === true }))
          }
        />
        <label
          htmlFor="noTimeOnly"
          className="text-sm cursor-pointer select-none"
        >
          {t.noTimeOnlyLabel}
        </label>
      </div>

      {/* Sort */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">{t.sort}</Label>
        <div className="flex flex-wrap gap-2">
          {([
            { value: 'name-asc' as const, label: 'A → Z' },
            { value: 'name-desc' as const, label: 'Z → A' },
            { value: 'created-desc' as const, label: t.sortNewest },
          ]).map((opt) => (
            <Button
              key={opt.value}
              type="button"
              variant={localFilters.sortBy === opt.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLocalFilters(prev => ({ ...prev, sortBy: opt.value }))}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  const footerButtons = (
    <div className="flex gap-2 w-full">
      <Button type="button" variant="outline" onClick={handleReset} className="flex-1">
        {t.reset}
      </Button>
      <Button type="button" onClick={handleApply} className="flex-1">
        {t.applyFilter}
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <Button
          variant="outline"
          size="icon"
          onClick={handleOpen}
          className="relative shrink-0"
        >
          <Filter className="h-4 w-4" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>

        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="max-h-[80vh]">
            <DrawerHeader>
              <DrawerTitle>{t.advancedFilter}</DrawerTitle>
            </DrawerHeader>
            <ScrollArea className="flex-1 px-4 py-4 max-h-[55vh] overflow-y-auto">
              {content}
            </ScrollArea>
            <DrawerFooter>
              {footerButtons}
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpen}
        className="gap-2 shrink-0"
      >
        <Filter className="h-4 w-4" />
        {t.advancedFilter}
        {activeFilterCount > 0 && (
          <Badge variant="secondary" className="ml-1 h-5 px-1.5">
            {activeFilterCount}
          </Badge>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.advancedFilter}</DialogTitle>
          </DialogHeader>
          {content}
          <DialogFooter className="flex-row gap-2 sm:gap-2">
            {footerButtons}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClientAdvancedFilter;
