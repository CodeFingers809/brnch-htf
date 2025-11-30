"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Plus, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface SearchResult {
    symbol: string;
    name: string;
}

interface StockSearchProps {
    onSelect: (symbol: string) => void;
    placeholder?: string;
    selectedStocks?: string[];
    className?: string;
    showSelectedBadges?: boolean;
    onRemove?: (symbol: string) => void;
    inputClassName?: string;
    dropdownClassName?: string;
    clearOnSelect?: boolean;
}

export function StockSearch({
    onSelect,
    placeholder = "Search stocks (e.g., RELIANCE, TCS)...",
    selectedStocks = [],
    className,
    showSelectedBadges = false,
    onRemove,
    inputClassName,
    dropdownClassName,
    clearOnSelect = true,
}: StockSearchProps) {
    const [search, setSearch] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Search for stocks
    useEffect(() => {
        const searchStocks = async () => {
            if (search.length < 1) {
                setResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const response = await fetch(
                    `/api/stocks/search?q=${encodeURIComponent(search)}`
                );
                const data = await response.json();
                // Filter out already selected stocks
                const filtered = data.filter(
                    (result: SearchResult) =>
                        !selectedStocks.includes(result.symbol)
                );
                setResults(filtered);
            } catch (error) {
                console.error("Failed to search stocks:", error);
                setResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        const debounce = setTimeout(searchStocks, 300);
        return () => clearTimeout(debounce);
    }, [search, selectedStocks]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = useCallback(
        (symbol: string) => {
            onSelect(symbol);
            if (clearOnSelect) {
                setSearch("");
            }
            setIsOpen(false);
        },
        [onSelect, clearOnSelect]
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && results.length > 0) {
            handleSelect(results[0].symbol);
        } else if (e.key === "Escape") {
            setIsOpen(false);
        }
    };

    return (
        <div ref={containerRef} className={cn("relative", className)}>
            {/* Selected stocks badges */}
            {showSelectedBadges && selectedStocks.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3 p-3 rounded-lg bg-[#1a1d24] border border-[#2d303a]/50 min-h-[44px]">
                    {selectedStocks.map((symbol) => (
                        <button
                            key={symbol}
                            onClick={() => onRemove?.(symbol)}
                            className="group flex items-center gap-1.5 px-2.5 py-1 bg-[#0c0d10] border border-[#2d303a]/50 rounded-lg hover:border-[#f06c6c] transition-all duration-200"
                        >
                            <span className="text-xs text-[#e8eaed]">
                                {symbol}
                            </span>
                            <X className="h-3 w-3 text-[#8b8f9a] group-hover:text-[#f06c6c]" />
                        </button>
                    ))}
                </div>
            )}

            {/* Search input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b8f9a]" />
                <input
                    type="text"
                    placeholder={placeholder}
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    className={cn(
                        "w-full h-10 rounded-lg border border-[#2d303a]/60 bg-[#1a1d24] pl-10 pr-4 text-sm text-[#e8eaed] placeholder:text-[#8b8f9a]/60 focus:border-[#6c8cff]/50 focus:outline-none focus:ring-1 focus:ring-[#6c8cff]/30 transition-all",
                        inputClassName
                    )}
                />
                {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6c8cff] animate-spin" />
                )}
            </div>

            {/* Dropdown results */}
            {isOpen && search.length > 0 && (
                <div
                    className={cn(
                        "absolute z-50 w-full mt-1 max-h-64 overflow-y-auto rounded-lg border border-[#2d303a]/60 bg-[#1a1d24] shadow-xl",
                        dropdownClassName
                    )}
                >
                    {isSearching ? (
                        <div className="p-3 text-center text-xs text-[#8b8f9a] flex items-center justify-center gap-2">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Searching...
                        </div>
                    ) : results.length > 0 ? (
                        <div className="divide-y divide-[#2d303a]/30">
                            {results.map((result) => (
                                <button
                                    key={result.symbol}
                                    onClick={() => handleSelect(result.symbol)}
                                    className="w-full px-3 py-2.5 text-left transition-colors hover:bg-[#252730] flex items-center justify-between group"
                                >
                                    <div>
                                        <div className="text-xs font-medium text-[#e8eaed]">
                                            {result.symbol}
                                        </div>
                                        <div className="text-[10px] text-[#8b8f9a]">
                                            {result.name}
                                        </div>
                                    </div>
                                    <Plus className="h-4 w-4 text-[#8b8f9a] group-hover:text-[#3dd68c] transition-colors" />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-3 text-center text-xs text-[#8b8f9a]">
                            No results found for &quot;{search}&quot;
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

