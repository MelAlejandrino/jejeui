import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { ChevronDown, Loader2 } from 'lucide-react';

import { useVirtualizer } from '@tanstack/react-virtual';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { cn } from '@/lib/utils';

export type LimitlessBaseOption = { id: string | number; [key: string]: unknown };

type LimitlessDropdownProps<T extends LimitlessBaseOption> = {
  items: T[];
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;

  search: string;
  onSearchChange: (search: string) => void;

  label?: string;
  single?: boolean;
  value: T[] | T | null;
  onChange?: (val: T[] | T | null) => void;

  disabled?: boolean;
  keepOpenOnSelect?: boolean;
  className?: string;
  nameSet?: string | ((item: T) => string);
  idSet?: string | ((item: T) => string);
  customEmptyMessage?: string;
};

function LimitlessDropdown<T extends LimitlessBaseOption>({
  items,
  isLoading = false,
  isFetchingNextPage = false,
  hasNextPage = false,
  onLoadMore,
  search,
  onSearchChange,
  label = 'Select...',
  single = false,
  value,
  onChange,
  disabled,
  keepOpenOnSelect = false,
  className,
  nameSet = 'name',
  idSet = 'id',
  customEmptyMessage,
}: LimitlessDropdownProps<T>) {
  const [open, setOpen] = useState(false);

  const getOptionName = useCallback(
    (opt: T): string => {
      if (typeof nameSet === 'function') return String(nameSet(opt) ?? '');
      if (typeof nameSet === 'string' && nameSet.includes('+')) {
        return nameSet
          .split('+')
          .map((k) => String(opt[k.trim()] ?? ''))
          .filter(Boolean)
          .join(' ');
      }
      return String(opt[nameSet as keyof T] ?? '');
    },
    [nameSet]
  );

  const getOptionId = useCallback(
    (opt: T): string | number => {
      if (typeof idSet === 'function') return idSet(opt);
      return (opt[idSet as keyof T] ?? opt.id) as string | number;
    },
    [idSet]
  );

  const getOptionKey = useCallback(
    (opt: T) => `${getOptionId(opt)}::${getOptionName(opt)}`,
    [getOptionId, getOptionName]
  );

  const selected: T[] = useMemo(() => {
    if (!value) return [];
    return single ? [value as T] : (value as T[]);
  }, [value, single]);

  const isSelected = useCallback(
    (opt: T) => selected.some((s) => getOptionId(s) === getOptionId(opt)),
    [selected, getOptionId]
  );

  const toggleValue = useCallback(
    (option: T) => {
      if (!onChange) return;
      if (single) {
        onChange(option);
        setOpen(false);
        return;
      }
      const exists = isSelected(option);
      const newSelected = exists
        ? selected.filter((s) => getOptionId(s) !== getOptionId(option))
        : [...selected, option];
      onChange(newSelected);
      if (!keepOpenOnSelect) setOpen(false);
    },
    [onChange, single, selected, isSelected, getOptionId, keepOpenOnSelect]
  );

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36,
    overscan: 5,
  });

  useLayoutEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => rowVirtualizer.measure());
      return () => cancelAnimationFrame(id);
    }
  }, [open, items, rowVirtualizer]);

  const loadingRef = useRef(false);

  const virtualItems = rowVirtualizer.getVirtualItems();
  useLayoutEffect(() => {
    if (!virtualItems.length) return;
    const lastItem = virtualItems[virtualItems.length - 1];
    if (
      lastItem.index >= items.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage &&
      !loadingRef.current
    ) {
      loadingRef.current = true;
      onLoadMore?.();
    }
    if (!isFetchingNextPage) loadingRef.current = false;
  }, [virtualItems, items.length, hasNextPage, isFetchingNextPage, onLoadMore]);

  const triggerLabel = selected.length ? selected.map((s) => getOptionName(s)).join(', ') : label;

  return (
    <Popover
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) onSearchChange('');
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'h-auto w-full cursor-pointer justify-between py-2 text-left font-normal',
            !selected.length && 'text-muted-foreground',
            className
          )}
        >
          <span className="block w-full break-words whitespace-normal">{triggerLabel}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="popover-content-width-full p-0"
        align="start"
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search..." value={search} onValueChange={onSearchChange} />
          <CommandList
            ref={parentRef}
            className="max-h-[300px] overflow-y-auto pt-2"
            style={{ paddingBottom: isFetchingNextPage ? '32px' : undefined }}
          >
            {isLoading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
              </div>
            )}

            {!isLoading && items.length === 0 && (
              <CommandEmpty>{customEmptyMessage ?? 'No results found.'}</CommandEmpty>
            )}

            {!isLoading && items.length > 0 && (
              <>
                <CommandGroup
                  style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    position: 'relative',
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const option = items[virtualRow.index];
                    return (
                      <CommandItem
                        key={getOptionKey(option)}
                        value={getOptionKey(option)}
                        onSelect={() => toggleValue(option)}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      >
                        <Checkbox checked={isSelected(option)} className="mr-2" />
                        <span className="flex-1 truncate" title={getOptionName(option)}>
                          {getOptionName(option)}
                        </span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>

                {isFetchingNextPage && (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="text-muted-foreground h-3 w-3 animate-spin" />
                  </div>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default LimitlessDropdown;
