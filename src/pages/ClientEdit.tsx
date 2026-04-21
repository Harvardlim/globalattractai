import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { safeParseDate } from "@/lib/time/beijing";
import { ArrowLeft, Calendar as CalendarIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveSelect } from "@/components/ui/responsive-select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { useClients } from "@/hooks/useClients";
import { useCategorySettings } from "@/hooks/useCategorySettings";
import { hourToShichen } from "@/types/database";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { getClientsTranslations } from "@/data/clientsTranslations";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

const ClientEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const isNew = !id || id === "new";
  const redirectTo = searchParams.get("redirect") || "/clients";
  const { toast } = useToast();
  const { currentLanguage } = useLanguage();
  const t = getClientsTranslations(currentLanguage);

  const { clients, addClient, updateClient, loading: clientsLoading } = useClients();
  const { categoryOrder, addCategory } = useCategorySettings();
  const client = !isNew ? clients.find((c) => c.id === id) : null;

  const categoryOptions = React.useMemo(() => {
    const options = [...categoryOrder];
    if (!options.includes('未分类')) {
      options.push('未分类');
    }
    return options;
  }, [categoryOrder]);

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
  const [customCategoryOpen, setCustomCategoryOpen] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  const isMobile = useIsMobile();

  useEffect(() => {
    if (client) {
      setName(client.name);
      setBirthDate(safeParseDate(client.birth_date));
      setBirthHour(client.birth_hour);
      setBirthMinute(client.birth_minute || 0);
      setGender(client.gender as "男" | "女");
      setNotes(client.notes || "");
      setPhoneNumber(client.phone_number || "");
      setCategory(client.category || "其他");
      setUnknownTime(client.birth_hour === null);
    }
  }, [client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSaving(true);
      const clientData = {
        name: name.trim(),
        birth_date: format(birthDate, "yyyy-MM-dd"),
        birth_hour: unknownTime ? null : birthHour,
        birth_minute: unknownTime ? 0 : birthMinute,
        gender,
        notes: notes.trim() || null,
        phone_number: phoneNumber.trim() || null,
        category,
      };

      if (isNew) {
        const newClient = await addClient(clientData);
        toast({ title: t.clientAdded });
        navigate(`/clients?highlight=${encodeURIComponent(clientData.name)}`);
        return;
      } else {
        await updateClient(id!, clientData);
        
        if (client?.category === '自己' && user) {
          const profileGender = gender === '男' ? 'male' : 'female';
          await supabase
            .from('profiles')
            .update({
              display_name: name.trim(),
              birth_date: format(birthDate, "yyyy-MM-dd"),
              birth_hour: unknownTime ? null : birthHour,
              birth_minute: unknownTime ? 0 : birthMinute,
              gender: profileGender,
              phone_number: phoneNumber.trim() || null,
            })
            .eq('id', user.id);
        }
        
        toast({ title: t.clientUpdated });
      }
      if (redirectTo === '/clients') {
        navigate(`/clients?highlight=${encodeURIComponent(clientData.name)}`);
      } else {
        navigate(redirectTo);
      }
    } catch (err) {
      console.error("Error saving client:", err);
      toast({ title: t.saveFailed, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const shichen = birthHour !== null ? hourToShichen(birthHour) : null;
  const title = isNew ? t.addClient : t.editClient;

  if (!isNew && clientsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isNew && !client && !clientsLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(redirectTo)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">{t.clientNotFound}</h1>
          </div>
          <p className="text-muted-foreground">{t.clientNotFoundDesc}</p>
        </div>
      </div>
    );
  }

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
              <ScrollArea className="max-h-[55vh] overflow-y-auto">
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
            <DrawerContent className="max-h-[70vh]">
              <DrawerHeader className="border-b">
                <DrawerTitle>{t.selectMinute}</DrawerTitle>
              </DrawerHeader>
              <ScrollArea className="max-h-[55vh] overflow-y-auto">
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

  return (
    <div className="bg-background text-foreground overflow-y-auto mb-24">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(redirectTo)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">{title}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t.name}</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t.enterName} required />
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
                  <div className="flex justify-center py-2">
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
                  <DialogFooter className="flex-row gap-2">
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
            <Label htmlFor="phone">{t.phoneOptionalLabel}</Label>
            <Input
              id="phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder={t.enterPhone}
              type="tel"
            />
          </div>

          <div className="space-y-2">
            <Label>{t.category}</Label>
            <ResponsiveSelect
              value={category}
              onValueChange={(val) => {
                if (val === '__custom__') {
                  setCustomCategoryInput('');
                  setCustomCategoryOpen(true);
                } else {
                  setCategory(val);
                }
              }}
              options={[
                ...categoryOptions.map((cat) => ({ value: cat, label: cat })),
                { value: '__custom__', label: t.customCategory },
              ]}
              placeholder={t.selectCategory}
              title={t.selectCategory}
            />

            <Dialog open={customCategoryOpen} onOpenChange={setCustomCategoryOpen}>
              <DialogContent className="w-[calc(100%-3rem)] max-w-sm rounded-2xl">
                <DialogHeader>
                  <DialogTitle>{t.addCustomCategory}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <Input
                    value={customCategoryInput}
                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                    placeholder={t.enterCategoryName}
                    autoFocus
                  />
                </div>
                <DialogFooter className="flex-row gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setCustomCategoryOpen(false)}
                  >
                    {t.cancel}
                  </Button>
                  <Button
                    type="button"
                    className="flex-1"
                    disabled={!customCategoryInput.trim()}
                    onClick={async () => {
                      const newCategory = customCategoryInput.trim();
                      if (newCategory && !categoryOptions.includes(newCategory)) {
                        await addCategory(newCategory);
                      }
                      setCategory(newCategory);
                      setCustomCategoryOpen(false);
                      setCustomCategoryInput('');
                    }}
                  >
                    {t.confirm}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t.notesOptionalLabel}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.notesOptionalPlaceholder}
              rows={3}
            />
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white flex gap-3 z-50">
            <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(redirectTo)}>
              {t.cancel}
            </Button>
            <Button type="submit" className="flex-1" disabled={saving || !name.trim()}>
              {saving ? t.saving : t.save}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientEdit;
