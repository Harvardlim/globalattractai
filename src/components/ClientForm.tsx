import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { safeParseDate } from "@/lib/time/beijing";
import { Calendar as CalendarIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveSelect } from "@/components/ui/responsive-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Client, hourToShichen } from "@/types/database";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCategorySettings } from "@/hooks/useCategorySettings";
import { useLanguage } from "@/hooks/useLanguage";
import { getClientsTranslations } from "@/data/clientsTranslations";

interface ClientFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (client: Omit<Client, "id" | "created_at" | "updated_at">) => Promise<void>;
  client?: Client | null;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

const ClientForm: React.FC<ClientFormProps> = ({ open, onClose, onSave, client }) => {
  const { categoryOrder, loading: categoryLoading } = useCategorySettings();
  const { currentLanguage } = useLanguage();
  const t = getClientsTranslations(currentLanguage);
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState<Date>(new Date());
  const [birthHour, setBirthHour] = useState<number | null>(12);
  const [birthMinute, setBirthMinute] = useState(0);
  const [gender, setGender] = useState<"男" | "女">("男");
  const [notes, setNotes] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [category, setCategory] = useState("未分类");
  const [saving, setSaving] = useState(false);
  const [hourDrawerOpen, setHourDrawerOpen] = useState(false);
  const [minuteDrawerOpen, setMinuteDrawerOpen] = useState(false);
  const [dateDrawerOpen, setDateDrawerOpen] = useState(false);
  const [unknownTime, setUnknownTime] = useState(false);
  const isMobile = useIsMobile();

  const categoryOptions = React.useMemo(() => {
    const options = [...categoryOrder];
    if (!options.includes('未分类')) {
      options.push('未分类');
    }
    return options;
  }, [categoryOrder]);

  useEffect(() => {
    if (client) {
      setName(client.name);
      setBirthDate(safeParseDate(client.birth_date));
      setBirthHour(client.birth_hour);
      setBirthMinute(client.birth_minute || 0);
      setGender(client.gender);
      setNotes(client.notes || "");
      setPhoneNumber(client.phone_number || "");
      setCategory(client.category || "未分类");
      setUnknownTime(client.birth_hour === null);
    } else {
      setName("");
      setBirthDate(new Date());
      setBirthHour(12);
      setBirthMinute(0);
      setGender("男");
      setNotes("");
      setPhoneNumber("");
      setCategory("未分类");
      setUnknownTime(false);
    }
  }, [client, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSaving(true);
      await onSave({
        name: name.trim(),
        birth_date: format(birthDate, "yyyy-MM-dd"),
        birth_hour: unknownTime ? null : birthHour,
        birth_minute: unknownTime ? 0 : birthMinute,
        gender,
        notes: notes.trim() || null,
        phone_number: phoneNumber.trim() || null,
        category,
      });
      onClose();
    } catch (err) {
      console.error("Error saving client:", err);
    } finally {
      setSaving(false);
    }
  };

  const shichen = birthHour !== null ? hourToShichen(birthHour) : null;
  const title = client ? t.editClient : t.addClient;

  // Mobile time picker using Drawer
  const mobileTimePicker = (
    <div className="space-y-3">
      <Label>{t.birthTime}</Label>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="unknownTime-mobile" 
          checked={unknownTime} 
          onCheckedChange={(checked) => {
            setUnknownTime(checked === true);
            if (checked) {
              setBirthHour(null);
            } else {
              setBirthHour(12);
            }
          }}
        />
        <label 
          htmlFor="unknownTime-mobile" 
          className="text-sm text-muted-foreground cursor-pointer select-none"
        >
          {t.unknownTime}
        </label>
      </div>
      
      {!unknownTime && (
        <>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" className="w-20" onClick={() => setHourDrawerOpen(true)}>
              {(birthHour ?? 0).toString().padStart(2, "0")}{t.hourUnit}
            </Button>
            <span className="text-muted-foreground">:</span>
            <Button type="button" variant="outline" className="w-20" onClick={() => setMinuteDrawerOpen(true)}>
              {birthMinute.toString().padStart(2, "0")}{t.minuteUnit}
            </Button>
            {shichen && (
              <span className="text-sm text-muted-foreground ml-2">
                {shichen.name} ({shichen.range})
              </span>
            )}
          </div>

          <Drawer open={hourDrawerOpen} onOpenChange={setHourDrawerOpen}>
            <DrawerContent className="max-h-[70vh]">
              <DrawerHeader className="border-b">
                <DrawerTitle>{t.selectHour}</DrawerTitle>
              </DrawerHeader>
              <ScrollArea className="flex-1 max-h-[50vh] overflow-y-scroll">
                <div className="divide-y">
                  {HOURS.map((h) => {
                    const isSelected = birthHour === h;
                    return (
                      <button
                        key={h}
                        type="button"
                        className={cn(
                          "w-full px-4 py-3 flex items-center justify-between text-left transition-colors",
                          isSelected ? "bg-primary/10" : "hover:bg-muted/50",
                        )}
                        onClick={() => {
                          setBirthHour(h);
                          setUnknownTime(false);
                          setHourDrawerOpen(false);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-base font-medium">{h.toString().padStart(2, "0")}{t.hourUnit}</span>
                        </div>
                        {isSelected && <Check className="h-5 w-5 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </DrawerContent>
          </Drawer>

          <Drawer open={minuteDrawerOpen} onOpenChange={setMinuteDrawerOpen}>
            <DrawerContent className="max-h-[60vh]">
              <DrawerHeader className="border-b">
                <DrawerTitle>{t.selectMinute}</DrawerTitle>
              </DrawerHeader>
              <ScrollArea className="flex-1 max-h-[50vh] overflow-y-scroll">
                <div className="divide-y">
                  {MINUTES.map((m) => {
                    const isSelected = birthMinute === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        className={cn(
                          "w-full px-4 py-3 flex items-center justify-between text-left transition-colors",
                          isSelected ? "bg-primary/10" : "hover:bg-muted/50",
                        )}
                        onClick={() => {
                          setBirthMinute(m);
                          setMinuteDrawerOpen(false);
                        }}
                      >
                        <span className="text-base font-medium">{m.toString().padStart(2, "0")}{t.minuteUnit}</span>
                        {isSelected && <Check className="h-5 w-5 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </DrawerContent>
          </Drawer>
        </>
      )}
      
      {unknownTime && (
        <p className="text-sm text-muted-foreground">{t.unknownTimeHint}</p>
      )}
    </div>
  );

  // Desktop time picker using Select
  const desktopTimePicker = (
    <div className="space-y-3">
      <Label>{t.birthTime}</Label>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="unknownTime-desktop" 
          checked={unknownTime} 
          onCheckedChange={(checked) => {
            setUnknownTime(checked === true);
            if (checked) {
              setBirthHour(null);
            } else {
              setBirthHour(12);
            }
          }}
        />
        <label 
          htmlFor="unknownTime-desktop" 
          className="text-sm text-muted-foreground cursor-pointer select-none"
        >
          {t.unknownTime}
        </label>
      </div>
      
      {!unknownTime && (
        <div className="flex items-center gap-2">
          <Select value={(birthHour ?? 12).toString()} onValueChange={(v) => { setBirthHour(parseInt(v)); setUnknownTime(false); }}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {HOURS.map((h) => (
                <SelectItem key={h} value={h.toString()}>
                  {h.toString().padStart(2, "0")}{t.hourUnit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-muted-foreground">:</span>
          <Select value={birthMinute.toString()} onValueChange={(v) => setBirthMinute(parseInt(v))}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MINUTES.map((m) => (
                <SelectItem key={m} value={m.toString()}>
                  {m.toString().padStart(2, "0")}{t.minuteUnit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {shichen && (
            <span className="text-sm text-muted-foreground ml-2">
              {shichen.name} ({shichen.range})
            </span>
          )}
        </div>
      )}
      
      {unknownTime && (
        <p className="text-sm text-muted-foreground">{t.unknownTimeHint}</p>
      )}
    </div>
  );

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{t.name}</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t.namePlaceholder} required />
      </div>

      {isMobile ? (
        <div className="space-y-2">
          <Label>{t.birthDate}</Label>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start text-left font-normal"
            onClick={() => setDateDrawerOpen(true)}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(birthDate, "yyyy-MM-dd")}
          </Button>

          <Dialog open={dateDrawerOpen} onOpenChange={setDateDrawerOpen}>
            <DialogContent className="w-[calc(100%-3rem)] max-w-lg left-1/2 -translate-x-1/2 rounded-lg">
              <DialogHeader>
                <DialogTitle>{t.selectBirthDate}</DialogTitle>
              </DialogHeader>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={birthDate}
                  onSelect={(d) => {
                    if (d) {
                      setBirthDate(d);
                    }
                  }}
                  defaultMonth={birthDate}
                  className="pointer-events-auto"
                />
              </div>
              <DialogFooter className="flex-row gap-2 sm:gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setBirthDate(new Date());
                  }}
                >
                  {t.today}
                </Button>
                <Button type="button" className="flex-1" onClick={() => setDateDrawerOpen(false)}>
                  {t.confirm}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div className="space-y-2">
          <Label>{t.birthDate}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(birthDate, "yyyy-MM-dd")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={birthDate}
                onSelect={(d) => d && setBirthDate(d)}
                defaultMonth={birthDate}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      {isMobile ? mobileTimePicker : desktopTimePicker}

      <div className="space-y-2">
        <Label>{t.gender}</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={gender === "男" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setGender("男")}
          >
            {t.male}
          </Button>
          <Button
            type="button"
            variant={gender === "女" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setGender("女")}
          >
            {t.female}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">{t.phoneOptional}</Label>
        <Input
          id="phone"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder={t.phonePlaceholder}
          type="tel"
        />
      </div>

      <div className="space-y-2">
        <Label>{t.category}</Label>
        <ResponsiveSelect
          value={category}
          onValueChange={setCategory}
          options={categoryOptions.map((cat) => ({ value: cat, label: cat }))}
          placeholder={t.selectCategory}
          title={t.selectCategory}
        />
      </div>

      <div className="space-y-2 pb-4">
        <Label htmlFor="notes">{t.notes}</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t.notesPlaceholder}
          rows={2}
        />
      </div>
    </form>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          <ScrollArea className="px-4 max-h-[50vh] mb-3 overflow-y-scroll">{formContent}</ScrollArea>
          <DrawerFooter className="flex-row gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              {t.cancel}
            </Button>
            <Button onClick={handleSubmit} disabled={saving || !name.trim()} className="flex-1">
              {saving ? t.saving : t.save}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {formContent}
        <DialogFooter className="flex-row gap-2 sm:gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            {t.cancel}
          </Button>
          <Button onClick={handleSubmit} disabled={saving || !name.trim()}>
            {saving ? t.saving : t.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClientForm;
