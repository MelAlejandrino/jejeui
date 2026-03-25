'use client';

import { type KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';

import { Check } from 'lucide-react';

import { Command as CommandPrimitive } from 'cmdk';

import { CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Skeleton } from '@/components/ui/skeleton';

import { cn } from '@/lib/utils';

export type Option = Record<'value' | 'label', string> & Record<string, string>;

type AutoCompleteProps = {
  options: Option[];
  emptyMessage?: string;
  value?: Option | null;
  onValueChange?: (value: Option | null) => void;
  onClear?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  openOnFocus?: boolean; // add this
};

export const AutoComplete = ({
  options,
  placeholder,
  emptyMessage = 'No results found.',
  value,
  onValueChange,
  onClear,
  disabled,
  isLoading = false,
  openOnFocus = false,
}: AutoCompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isSelectingRef = useRef(false);

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>(value?.label ?? '');

  // Sync input value when parent changes value externally
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInputValue(value?.label ?? '');
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const filteredOptions = options.filter((o) =>
    o.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  const commitValue = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();

      if (!trimmed) {
        onClear?.();
        onValueChange?.(null);
        setInputValue('');
        return;
      }

      const matched = options.find((o) => o.label.toLowerCase() === trimmed.toLowerCase());
      const resolved: Option = matched ?? { label: trimmed, value: trimmed };

      if (resolved.value === value?.value && resolved.label === value?.label) return;

      setInputValue(resolved.label);
      onValueChange?.(resolved);
    },
    [options, onValueChange, onClear, value]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (!inputRef.current) return;

      if (!isOpen) setIsOpen(true);

      if (event.key === 'Escape') {
        setInputValue(value?.label ?? '');
        setIsOpen(false);
        inputRef.current.blur();
        return;
      }

      if (event.key === 'Enter') {
        const highlighted = containerRef.current?.querySelector<HTMLElement>(
          '[cmdk-item][aria-selected="true"]'
        );
        if (!highlighted) {
          event.preventDefault();
          commitValue(inputRef.current.value);
          setIsOpen(false);
          inputRef.current.blur();
        }
      }
    },
    [isOpen, value, commitValue]
  );

  const handleBlur = useCallback(() => {
    if (isSelectingRef.current) return;
    setIsOpen(false);
    commitValue(inputValue);
  }, [inputValue, commitValue]);

  const handleSelectOption = useCallback(
    (option: Option) => {
      isSelectingRef.current = true;

      setInputValue(option.label);
      onValueChange?.(option);
      setIsOpen(false);

      setTimeout(() => {
        inputRef.current?.blur();
        isSelectingRef.current = false;
      }, 0);
    },
    [onValueChange]
  );

  const showEmpty = !isLoading && filteredOptions.length === 0;

  return (
    <div ref={containerRef} className="relative">
      <CommandPrimitive
        onKeyDown={handleKeyDown}
        shouldFilter={false}
        className="rounded-md **:data-[slot='command-input-wrapper']:border-b-0"
      >
        <CommandInput
          ref={inputRef}
          value={inputValue}
          onFocus={() => {
            if (openOnFocus) setIsOpen(true);
          }}
          onValueChange={
            isLoading
              ? undefined
              : (val) => {
                  setInputValue(val);
                  setIsOpen(true);
                }
          }
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className="text-sm"
        />

        <div
          className={cn(
            'absolute top-[calc(100%+4px)] left-0 z-10 w-full',
            isOpen ? 'block' : 'hidden'
          )}
        >
          <CommandList className="animate-in fade-in-0 zoom-in-95 bg-popover ring-border rounded-lg ring-1">
            {isLoading ? (
              <CommandPrimitive.Loading>
                <div className="p-1">
                  <Skeleton className="h-8 w-full" />
                </div>
              </CommandPrimitive.Loading>
            ) : null}

            {filteredOptions.length > 0 && !isLoading ? (
              <CommandGroup>
                {filteredOptions.map((option) => {
                  const isSelected = value?.value === option.value;
                  return (
                    <CommandItem
                      key={option.value}
                      value={`${option.value}-${option.label}`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        isSelectingRef.current = true;
                      }}
                      onSelect={() => handleSelectOption(option)}
                      className={cn('flex w-full items-center gap-2', !isSelected ? 'pl-8' : null)}
                    >
                      {isSelected ? <Check className="w-4 shrink-0" /> : null}
                      {option.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ) : null}

            {showEmpty && (
              <CommandPrimitive.Empty className="rounded-sm px-2 py-3 text-center text-sm select-none">
                {inputValue.trim() ? (
                  <>
                    {emptyMessage} Press Enter to use &quot;{inputValue.trim()}&quot;.
                  </>
                ) : (
                  emptyMessage
                )}
              </CommandPrimitive.Empty>
            )}
          </CommandList>
        </div>
      </CommandPrimitive>
    </div>
  );
};
