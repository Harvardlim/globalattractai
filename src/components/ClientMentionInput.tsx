import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send } from 'lucide-react';
import { format } from 'date-fns';
import { safeParseDate } from '@/lib/time/beijing';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Client, hourToShichen } from '@/types/database';
import { cn } from '@/lib/utils';

interface ClientMentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (content: string, mentionedClients: Client[]) => void;
  clients: Client[];
  currentClientId?: string;
  disabled?: boolean;
  placeholder?: string;
}

const ClientMentionInput: React.FC<ClientMentionInputProps> = ({
  value,
  onChange,
  onSubmit,
  clients,
  currentClientId,
  disabled = false,
  placeholder = '输入问题，@提及其他客户进行双人分析...',
}) => {
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [mentionStartPosition, setMentionStartPosition] = useState<number | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Filter out current client and filter by search term
  const filteredClients = clients.filter(client => {
    if (client.id === currentClientId) return false;
    if (mentionSearch) {
      return client.name.toLowerCase().includes(mentionSearch.toLowerCase());
    }
    return true;
  });

  // Helper function to escape regex special characters
  const escapeRegExp = (str: string) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  // Parse mentioned clients from text - handles names with spaces
  const parseMentionedClients = useCallback((text: string): Client[] => {
    // Filter out current client
    const availableClients = clients.filter(c => c.id !== currentClientId);
    
    // Check if text contains @ClientName for each client
    return availableClients.filter(client => {
      // Match @ClientName followed by space, punctuation, or end of string
      const mentionPattern = new RegExp(`@${escapeRegExp(client.name)}(?:[\\s,.!?，。！？]|$)`, 'i');
      return mentionPattern.test(text);
    });
  }, [clients, currentClientId]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const newCursorPosition = e.target.selectionStart || 0;
    
    onChange(newValue);
    setCursorPosition(newCursorPosition);

    // Check if we should show mention menu
    const textBeforeCursor = newValue.slice(0, newCursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      // Only show menu if @ is at start or preceded by space, and no space after @
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

  // Handle client selection from menu
  const handleSelectClient = (client: Client) => {
    if (mentionStartPosition === null) return;
    
    const beforeMention = value.slice(0, mentionStartPosition);
    const afterCursor = value.slice(cursorPosition);
    const newValue = `${beforeMention}@${client.name} ${afterCursor}`;
    
    onChange(newValue);
    setShowMentionMenu(false);
    setMentionStartPosition(null);
    setMentionSearch('');
    
    // Focus back to input and set cursor after mention
    setTimeout(() => {
      if (inputRef.current) {
        const newCursorPos = beforeMention.length + client.name.length + 2;
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Handle submit
  const handleSubmit = () => {
    if (!value.trim() || disabled) return;
    const mentionedClients = parseMentionedClients(value);
    onSubmit(value, mentionedClients);
  };

  // Handle keyboard events
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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowMentionMenu(false);
    };
    if (showMentionMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showMentionMenu]);

  // Render text with highlighted mentions - handles names with spaces
  const renderHighlightedText = () => {
    if (!value) return null;
    
    // Get valid client names (excluding current client)
    const availableClients = clients.filter(c => c.id !== currentClientId);
    
    // Build regex to match any @ClientName
    if (availableClients.length === 0) {
      return <span>{value}</span>;
    }
    
    // Sort by name length descending to match longer names first
    const sortedClients = [...availableClients].sort((a, b) => b.name.length - a.name.length);
    const clientNamesPattern = sortedClients.map(c => escapeRegExp(c.name)).join('|');
    const mentionRegex = new RegExp(`(@(?:${clientNamesPattern}))`, 'g');
    
    const parts = value.split(mentionRegex);
    
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        const clientName = part.slice(1);
        const isValidMention = availableClients.some(c => c.name === clientName);
        if (isValidMention) {
          return (
            <span
              key={i}
              className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-primary/15 text-primary font-medium text-sm border border-primary/30"
            >
              {part}
            </span>
          );
        }
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="flex items-end gap-2 relative">
      <Popover open={showMentionMenu && filteredClients.length > 0} onOpenChange={setShowMentionMenu}>
        <PopoverAnchor asChild>
          <div className="relative flex-1">
            {/* Hidden textarea for input */}
            <textarea
              ref={inputRef}
              value={value}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                "flex min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50 resize-none",
                "text-transparent caret-foreground"
              )}
              rows={3}
              style={{ caretColor: 'currentColor' }}
            />
            {/* Overlay for highlighting */}
            <div
              className="absolute inset-0 px-3 py-2 text-sm pointer-events-none overflow-hidden whitespace-pre-wrap break-words"
              aria-hidden="true"
            >
              {value ? renderHighlightedText() : null}
            </div>
          </div>
        </PopoverAnchor>
        <PopoverContent 
          className="w-64 p-0" 
          align="start" 
          side="top"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command>
            <CommandInput 
              placeholder="搜索客户..." 
              value={mentionSearch}
              onValueChange={setMentionSearch}
            />
            <CommandList>
              <CommandEmpty>未找到客户</CommandEmpty>
              <CommandGroup heading="选择客户">
                {filteredClients.map((client) => (
                  <CommandItem
                    key={client.id}
                    value={client.name}
                    onSelect={() => handleSelectClient(client)}
                    className="flex items-center gap-3 py-2"
                  >
                    {/* Avatar with initials */}
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className={cn(
                        "text-xs font-medium",
                        client.gender === '男' ? "bg-primary/20 text-primary" : "bg-secondary text-secondary-foreground"
                      )}>
                        {client.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Client info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{client.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {client.gender} · {format(safeParseDate(client.birth_date), 'yyyy-MM-dd')} · {hourToShichen(client.birth_hour).name}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      <Button
        size="icon"
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ClientMentionInput;
