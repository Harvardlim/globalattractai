import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export interface ResponsiveSelectOption {
  value: string;
  label: string;
}

interface ResponsiveSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: ResponsiveSelectOption[];
  placeholder?: string;
  title?: string;
  className?: string;
}

export function ResponsiveSelect({
  value,
  onValueChange,
  options,
  placeholder = "请选择",
  title = "选择",
  className,
}: ResponsiveSelectProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  if (isMobile) {
    return (
      <>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal", className)}
          onClick={() => setOpen(true)}
        >
          <span className={cn(!selectedOption && "text-muted-foreground")}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>

        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="max-h-[70vh]">
            <DrawerHeader className="border-b">
              <DrawerTitle>{title}</DrawerTitle>
            </DrawerHeader>
            <div className="flex-1 overflow-y-auto max-h-[55vh]">
              <div className="divide-y">
                {options.map((option) => {
                  const isSelected = value === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={cn(
                        "w-full px-4 py-3 flex items-center justify-between text-left transition-colors",
                        isSelected ? "bg-primary/10" : "hover:bg-muted/50"
                      )}
                      onClick={() => {
                        onValueChange(option.value);
                        setOpen(false);
                      }}
                    >
                      <span className="text-base">{option.label}</span>
                      {isSelected && <Check className="h-5 w-5 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
