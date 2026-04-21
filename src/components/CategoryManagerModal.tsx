import React, { useState } from 'react';
import { GripVertical, Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCategorySettings } from '@/hooks/useCategorySettings';
import { DEFAULT_CATEGORIES } from '@/types/database';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { getClientsTranslations } from '@/data/clientsTranslations';

interface CategoryManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoriesChanged?: () => void;
}

const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({ open, onOpenChange, onCategoriesChanged }) => {
  const { toast } = useToast();
  const { categoryOrder, updateCategoryOrderWithMigration, loading } = useCategorySettings();
  const { currentLanguage } = useLanguage();
  const t = getClientsTranslations(currentLanguage);
  const [localOrder, setLocalOrder] = useState<string[]>([]);
  const [removedCategories, setRemovedCategories] = useState<string[]>([]);
  const [renamedCategories, setRenamedCategories] = useState<Record<string, string>>({});
  const [newCategory, setNewCategory] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const isMobile = useIsMobile();

  React.useEffect(() => {
    if (open) {
      const order = [...categoryOrder];
      if (!order.includes('未分类')) {
        order.push('未分类');
      }
      setLocalOrder(order);
      setRemovedCategories([]);
      setRenamedCategories({});
      setEditingIndex(null);
    }
  }, [open, categoryOrder]);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newOrder = [...localOrder];
    const [moved] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(index, 0, moved);
    setLocalOrder(newOrder);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    if (localOrder.includes(trimmed)) {
      toast({ title: t.categoryExists, variant: 'destructive' });
      return;
    }
    setLocalOrder([...localOrder, trimmed]);
    setNewCategory('');
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditingValue(localOrder[index]);
  };

  const handleConfirmEdit = () => {
    if (editingIndex === null) return;
    const trimmed = editingValue.trim();
    const oldName = localOrder[editingIndex];

    if (!trimmed || trimmed === oldName) {
      setEditingIndex(null);
      return;
    }
    if (localOrder.includes(trimmed)) {
      toast({ title: t.categoryExists, variant: 'destructive' });
      return;
    }

    const newOrder = [...localOrder];
    newOrder[editingIndex] = trimmed;
    setLocalOrder(newOrder);
    setRenamedCategories(prev => ({ ...prev, [oldName]: trimmed }));
    setEditingIndex(null);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...localOrder];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setLocalOrder(newOrder);
  };

  const handleMoveDown = (index: number) => {
    if (index === localOrder.length - 1) return;
    const newOrder = [...localOrder];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setLocalOrder(newOrder);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const actuallyRemoved = removedCategories.filter((c) => !localOrder.includes(c));
      await updateCategoryOrderWithMigration(localOrder, actuallyRemoved, renamedCategories);

      const messages: string[] = [];
      if (actuallyRemoved.length > 0) {
        messages.push(t.deletedCategories.replace('{count}', String(actuallyRemoved.length)));
      }
      if (Object.keys(renamedCategories).length > 0) {
        messages.push(t.renamedCategories.replace('{count}', String(Object.keys(renamedCategories).length)));
      }
      toast({ title: messages.length > 0 ? messages.join('，') : t.categorySaved });
      onCategoriesChanged?.();
      onOpenChange(false);
    } catch (err) {
      toast({ title: t.saveFailed, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const content = (
    <div className="space-y-4">
      <div className="flex gap-2 w-full">
        <div className="w-full">
          <Input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder={t.newCategoryPlaceholder}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
          />
        </div>
        <div>
          <Button type="button" size="icon" onClick={handleAddCategory} disabled={!newCategory.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="overflow-y-auto max-h-[40vh]">
        <div className="space-y-2 pr-2">
          {localOrder.map((category, index) => {
            const isDefault = DEFAULT_CATEGORIES.includes(category as any);
            const isEditing = editingIndex === index;

            return (
              <div
                key={`${category}-${index}`}
                draggable={!isMobile && !isEditing}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  'flex items-center gap-2 p-3 rounded-xl border bg-card transition-colors',
                  draggedIndex === index && 'opacity-50 border-primary'
                )}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />

                {isEditing ? (
                  <div className="flex-1 flex items-center gap-1">
                    <Input
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleConfirmEdit();
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      className="h-7 text-sm"
                      autoFocus
                    />
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={handleConfirmEdit}>
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={handleCancelEdit}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="flex-1 truncate">{category}</span>
                    {isDefault && (
                      <span className="text-xs text-muted-foreground shrink-0">{t.defaultLabel}</span>
                    )}
                    {isMobile && (
                      <div className="flex gap-1">
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleMoveUp(index)} disabled={index === 0}>
                          ↑
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleMoveDown(index)} disabled={index === localOrder.length - 1}>
                          ↓
                        </Button>
                      </div>
                    )}
                    {!isDefault && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => handleStartEdit(index)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <p className="text-xs text-muted-foreground">
        {isMobile ? t.arrowHint : t.dragHint}，{t.editHint}
      </p>
    </div>
  );

  const footerButtons = (
    <div className="flex gap-2 w-full">
      <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
        {t.cancel}
      </Button>
      <Button type="button" className="flex-1" onClick={handleSave} disabled={saving}>
        {saving ? t.saving : t.save}
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader>
            <DrawerTitle>{t.manageCategories}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 py-4 flex-1 overflow-auto">{content}</div>
          <DrawerFooter>{footerButtons}</DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.manageCategories}</DialogTitle>
        </DialogHeader>
        {content}
        <DialogFooter className="flex-row gap-2">{footerButtons}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryManagerModal;
