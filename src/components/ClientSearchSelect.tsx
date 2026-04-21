import React, { useState, useMemo } from "react";
import { Check, ChevronsUpDown, User, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Client } from "@/types/database";
import { useIsMobile } from "@/hooks/use-mobile";

interface ClientSearchSelectProps {
  clients: Client[];
  selectedClient: Client | null;
  onSelect: (client: Client | null) => void;
  loading?: boolean;
  placeholder?: string;
}

const ClientSearchSelect: React.FC<ClientSearchSelectProps> = ({
  clients,
  selectedClient,
  onSelect,
  loading = false,
  placeholder = "选择客户...",
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();

  const filteredClients = useMemo(() => {
    if (!searchQuery) return clients;
    const query = searchQuery.toLowerCase();
    return clients.filter((client) => client.name.toLowerCase().includes(query));
  }, [clients, searchQuery]);

  const triggerButton = (
    <Button
      variant="outline"
      role="combobox"
      aria-expanded={open}
      className="w-full justify-between"
      disabled={loading}
      onClick={() => setOpen(true)}
    >
      {loading ? (
        <span className="text-muted-foreground">加载中...</span>
      ) : selectedClient ? (
        <span className="flex items-center gap-2">
          <User className="h-4 w-4" />
          {selectedClient.name}
        </span>
      ) : (
        <span className="text-muted-foreground">{placeholder}</span>
      )}
      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  );

  // Mobile: Bottom Drawer
  if (isMobile) {
    return (
      <>
        {triggerButton}
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="max-h-[70vh]">
            <DrawerHeader className="border-b pb-3">
              <DrawerTitle>选择客户</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 py-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索客户姓名..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <ScrollArea className="flex-1 overflow-y-auto">
              {filteredClients.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">未找到客户</div>
              ) : (
                <div className="divide-y">
                  {filteredClients.map((client) => {
                    const isSelected = selectedClient?.id === client.id;
                    return (
                      <button
                        key={client.id}
                        type="button"
                        className={cn(
                          "w-full px-4 py-3 flex items-center justify-between text-left transition-colors",
                          isSelected ? "bg-primary/10" : "hover:bg-muted/50",
                        )}
                        onClick={() => {
                          onSelect(client);
                          setOpen(false);
                          setSearchQuery("");
                        }}
                      >
                        <span className="text-base font-medium">{client.name}</span>
                        {isSelected && <Check className="h-5 w-5 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  // Desktop: Popover with Command
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="搜索客户姓名..." value={searchQuery} onValueChange={setSearchQuery} />
          <CommandList>
            <CommandEmpty>
              <div className="py-6 text-center text-sm text-muted-foreground">未找到客户</div>
            </CommandEmpty>
            <CommandGroup>
              {filteredClients.map((client) => (
                <CommandItem
                  key={client.id}
                  value={client.id}
                  onSelect={() => {
                    onSelect(client);
                    setOpen(false);
                    setSearchQuery("");
                  }}
                >
                  <Check
                    className={cn("mr-2 h-4 w-4", selectedClient?.id === client.id ? "opacity-100" : "opacity-0")}
                  />
                  {client.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ClientSearchSelect;
