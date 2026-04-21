import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send } from 'lucide-react';
import { format } from 'date-fns';
import { safeParseDate } from '@/lib/time/beijing';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover';
import { Command, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Client, hourToShichen, RealtimeConsultation } from '@/types/database';
import { cn } from '@/lib/utils';

export interface MentionedItems {
  clients: Client[];
  consultations: RealtimeConsultation[];
}

interface UniversalMentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (content: string, mentionedItems: MentionedItems) => void;
  clients: Client[];
  consultations: RealtimeConsultation[];
  disabled?: boolean;
  placeholder?: string;
}

const UniversalMentionInput: React.FC<UniversalMentionInputProps> = ({
  value,
  onChange,
  onSubmit,
  clients,
  consultations,
  disabled = false,
  placeholder = '输入问题，@提及客户或事项...',
}) => {
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [mentionStartPosition, setMentionStartPosition] = useState<number | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Filter clients by search
  const filteredClients = clients.filter(client => {
    if (mentionSearch) {
      return client.name.toLowerCase().includes(mentionSearch.toLowerCase());
    }
    return true;
  });

  // Filter consultations by search (match issue or title)
  const filteredConsultations = consultations.filter(c => {
    const searchTerm = mentionSearch.toLowerCase();
    const issue = c.issue?.toLowerCase() || '';
    const title = c.title?.toLowerCase() || '';
    return !mentionSearch || issue.includes(searchTerm) || title.includes(searchTerm);
  });

  // Parse mentioned items from text
  const parseMentionedItems = useCallback((text: string): MentionedItems => {
    const mentionedClients: Client[] = [];
    const mentionedConsultations: RealtimeConsultation[] = [];

    // Check for client mentions
    clients.forEach(client => {
      const pattern = new RegExp(`@${escapeRegExp(client.name)}(?:[\\s,.!?，。！？]|$)`, 'i');
      if (pattern.test(text)) {
        mentionedClients.push(client);
      }
    });

    // Check for consultation mentions (by issue or formatted title)
    consultations.forEach(c => {
      const displayName = c.issue || c.title || format(new Date(c.chart_date), 'MM-dd HH:mm');
      const pattern = new RegExp(`@${escapeRegExp(displayName)}(?:[\\s,.!?，。！？]|$)`, 'i');
      if (pattern.test(text)) {
        mentionedConsultations.push(c);
      }
    });

    return { clients: mentionedClients, consultations: mentionedConsultations };
  }, [clients, consultations]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const newCursorPosition = e.target.selectionStart || 0;

    onChange(newValue);
    setCursorPosition(newCursorPosition);

    const textBeforeCursor = newValue.slice(0, newCursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      const charBeforeAt = lastAtIndex > 0 ? newValue[lastAtIndex - 1] : ' ';
      if ((charBeforeAt === ' ' || charBeforeAt === '\n' || lastAtIndex === 0) && !textAfterAt.includes(' ')) {
        setMentionStartPosition(lastAtIndex);
        setMentionSearch(textAfterAt);
        setShowMentionMenu(true);
        return;
      }
    }

    setShowMentionMenu(false);
    setMentionStartPosition(null);
    setMentionSearch('');
  };

  const handleSelectClient = (client: Client) => {
    if (mentionStartPosition === null) return;

    const beforeMention = value.slice(0, mentionStartPosition);
    const afterCursor = value.slice(cursorPosition);
    const newValue = `${beforeMention}@${client.name} ${afterCursor}`;

    onChange(newValue);
    setShowMentionMenu(false);
    setMentionStartPosition(null);
    setMentionSearch('');

    setTimeout(() => {
      if (inputRef.current) {
        const newCursorPos = beforeMention.length + client.name.length + 2;
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleSelectConsultation = (consultation: RealtimeConsultation) => {
    if (mentionStartPosition === null) return;

    const displayName = consultation.issue || consultation.title || format(new Date(consultation.chart_date), 'MM-dd HH:mm');
    const beforeMention = value.slice(0, mentionStartPosition);
    const afterCursor = value.slice(cursorPosition);
    const newValue = `${beforeMention}@${displayName} ${afterCursor}`;

    onChange(newValue);
    setShowMentionMenu(false);
    setMentionStartPosition(null);
    setMentionSearch('');

    setTimeout(() => {
      if (inputRef.current) {
        const newCursorPos = beforeMention.length + displayName.length + 2;
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleSubmit = () => {
    if (!value.trim() || disabled) return;
    const mentionedItems = parseMentionedItems(value);
    onSubmit(value, mentionedItems);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!showMentionMenu) {
        handleSubmit();
      }
    }
    if (e.key === 'Escape' && showMentionMenu) {
      setShowMentionMenu(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setShowMentionMenu(false);
    if (showMentionMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showMentionMenu]);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      const newHeight = Math.min(inputRef.current.scrollHeight, 120);
      inputRef.current.style.height = `${newHeight}px`;
    }
  }, [value]);

  // Render highlighted text
  const renderHighlightedText = () => {
    if (!value) return null;

    // Build patterns for all mentionable items
    const allPatterns: string[] = [];
    
    clients.forEach(c => allPatterns.push(escapeRegExp(c.name)));
    consultations.forEach(c => {
      const displayName = c.issue || c.title || format(new Date(c.chart_date), 'MM-dd HH:mm');
      allPatterns.push(escapeRegExp(displayName));
    });

    if (allPatterns.length === 0) return <span></span>;

    const sortedPatterns = allPatterns.sort((a, b) => b.length - a.length);
    const mentionRegex = new RegExp(`(@(?:${sortedPatterns.join('|')}))`, 'g');
    const parts = value.split(mentionRegex);

    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        const name = part.slice(1);
        const isClient = clients.some(c => c.name === name);
        const isConsultation = consultations.some(c => {
          const displayName = c.issue || c.title || format(new Date(c.chart_date), 'MM-dd HH:mm');
          return displayName === name;
        });
        
        if (isClient) {
          return (
            <span
              key={i}
              className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-primary/15 text-primary font-medium text-sm border border-primary/30"
            >
              {part}
            </span>
          );
        }
        if (isConsultation) {
          return (
            <span
              key={i}
              className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-secondary/50 text-secondary-foreground font-medium text-sm border border-secondary"
            >
              {part}
            </span>
          );
        }
      }
      return <span key={i}>{part}</span>;
    });
  };

  const hasItems = filteredClients.length > 0 || filteredConsultations.length > 0;

  return (
    <div className="relative">
      <Popover open={showMentionMenu && hasItems} onOpenChange={setShowMentionMenu}>
        <PopoverAnchor asChild>
          <div className="relative flex items-center">
<textarea
  ref={inputRef}
  value={value}
  onChange={handleInputChange}
  onKeyDown={handleKeyDown}
  placeholder={placeholder}
  disabled={disabled}
  rows={3}
  className={cn(
    "flex w-full rounded-2xl border border-input bg-background pl-4 pr-12 py-2.5 text-base ring-offset-background",
    "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50 resize-none",
    "overflow-y-auto md:text-sm antialiased",
    // These two lines ensure the text is solid and visible
    "text-foreground opacity-100", 
    "min-h-[44px] max-h-[120px]"
  )}
  style={{ 
    caretColor: 'auto', // Let the browser handle the cursor naturally
    color: 'inherit'    // Force it to use the standard text color
  }}
/>
            <div
              className="absolute inset-0 pl-4 pr-12 py-2.5 text-base md:text-sm pointer-events-none overflow-y-auto whitespace-pre-wrap break-words max-h-[120px] flex items-center"
              aria-hidden="true"
            >
              {/* {value ? renderHighlightedText() : <span className="text-muted-foreground">{placeholder}</span>} */}
            </div>
          </div>
        </PopoverAnchor>
        <PopoverContent
          className="w-72 p-0 max-h-80 overflow-auto"
          align="start"
          side="top"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command>
            <CommandList>
              <CommandEmpty>未找到匹配项</CommandEmpty>
              
              {filteredClients.length > 0 && (
                <CommandGroup heading="👤 客户命盘">
                  {filteredClients.slice(0, 5).map((client) => (
                    <CommandItem
                      key={client.id}
                      value={client.name}
                      onSelect={() => handleSelectClient(client)}
                      className="flex items-center gap-3 py-2"
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className={cn(
                          "text-xs font-medium",
                          client.gender === '男' ? "bg-primary/20 text-primary" : "bg-secondary text-secondary-foreground"
                        )}>
                          {client.name.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{client.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {client.gender} · {format(safeParseDate(client.birth_date), 'yyyy-MM-dd')} · {hourToShichen(client.birth_hour).name}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {filteredConsultations.length > 0 && (
                <CommandGroup heading="📋 事项记录">
                  {filteredConsultations.slice(0, 5).map((c) => {
                    const displayName = c.issue || c.title || format(new Date(c.chart_date), 'MM-dd HH:mm');
                    return (
                      <CommandItem
                        key={c.id}
                        value={displayName}
                        onSelect={() => handleSelectConsultation(c)}
                        className="flex items-center gap-3 py-2"
                      >
                        <div className="h-8 w-8 shrink-0 rounded-full bg-muted flex items-center justify-center text-sm">
                          📅
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{displayName}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(c.chart_date), 'yyyy-MM-dd HH:mm')}
                            {c.topic && ` · ${c.topic}`}
                          </div>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
        <Button 
          onClick={handleSubmit} 
          disabled={disabled || !value.trim()}
          className="mt-4 w-full">
          <Send className="h-4 w-4" /> 提交问题
        </Button>
      </Popover>
    </div>
  );
};

export default UniversalMentionInput;
