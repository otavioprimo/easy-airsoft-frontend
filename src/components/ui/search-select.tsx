import * as React from "react";
import { ChevronDown, Check, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface SearchSelectItem {
  value: string;
  label: string;
}

interface SearchSelectProps {
  items: SearchSelectItem[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  onSearch?: (searchTerm: string) => void | Promise<void>;
  isLoading?: boolean;
  emptyText?: string;
  className?: string;
  classNameList?: string;
  clearable?: boolean;
  onClear?: () => void;
}

const SearchSelect = React.forwardRef<HTMLDivElement, SearchSelectProps>(
  (
    {
      items,
      value,
      onChange,
      disabled = false,
      placeholder = "Selecione uma opção",
      searchPlaceholder = "Buscar...",
      onSearch,
      isLoading = false,
      emptyText = "Nenhum resultado encontrado.",
      className,
      classNameList,
      clearable = false,
      onClear,
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");

    const selectedItem = items.find((item) => item.value === value);
    const displayLabel = selectedItem?.label || placeholder;

    const handleSearch = React.useCallback(
      (term: string) => {
        setSearchTerm(term);
        if (onSearch) {
          onSearch(term);
        }
      },
      [onSearch],
    );

    const handleSelect = (itemValue: string) => {
      onChange?.(itemValue);
      setSearchTerm("");
      setOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onClear?.();
    };

    const showClearButton = clearable && onClear && value;

    return (
      <div ref={ref} className={cn("w-full", className)}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              disabled={disabled}
              className="flex h-11 w-full items-center justify-between rounded-[var(--radius-md)] border border-slate-300/85 bg-white px-3 py-2 text-sm font-medium text-neutral-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] ring-offset-background transition-colors disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
            >
              <span className="max-w-[calc(100%-32px)] overflow-hidden text-ellipsis">
                {displayLabel}
              </span>
              <div className="flex items-center gap-1">
                {showClearButton && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="rounded-sm opacity-70 hover:opacity-100 focus:outline-none z-10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-neutral-400" />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full rounded-[var(--radius-lg)] border border-slate-200 p-0 shadow-xl" align="start">
            <Command shouldFilter={!onSearch}>
              <CommandInput
                placeholder={searchPlaceholder}
                value={searchTerm}
                onValueChange={handleSearch}
              />
              <CommandList className={classNameList}>
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  <>
                    {items.length === 0 && (
                      <CommandEmpty className="px-4 py-4 text-center text-sm text-neutral-500">
                        {emptyText}
                      </CommandEmpty>
                    )}
                    {items.length > 0 && (
                      <CommandGroup>
                        {items.map((item) => (
                          <CommandItem
                            key={item.value}
                            value={item.label}
                            onSelect={() => handleSelect(item.value)}
                            className="cursor-pointer"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                value === item.value
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {item.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  },
);

SearchSelect.displayName = "SearchSelect";

export { SearchSelect };
export type { SearchSelectItem, SearchSelectProps };
