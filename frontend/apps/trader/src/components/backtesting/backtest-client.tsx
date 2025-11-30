"use client";

import { useState, useCallback, useMemo } from "react";
import type { BacktestResponse } from "@trader/types";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    TrendingUp,
    Target,
    DollarSign,
    BarChart3,
    Zap,
    Plus,
    X,
    Play,
    Calendar,
    ChevronDown,
    ArrowRightLeft,
    ChevronRight,
    ChevronLeft,
    Clock,
    Building2,
    Wallet,
    AlertTriangle,
    Check,
    Settings2,
} from "lucide-react";

import { BacktestResults } from "@/components/backtesting/backtest-results";
import { AgenticLoader } from "@/components/backtesting/agentic-loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TerminalLayout } from "@/components/layout/terminal-layout";
import { Badge } from "@/components/ui/badge";
import { StockSearch } from "@/components/ui/stock-search";
import { cn } from "@/lib/utils/cn";

// Time frame options
const TIME_FRAMES = [
    { label: "1 Year", value: "1y", description: "Short-term analysis" },
    { label: "2 Years", value: "2y", description: "Recent market cycles" },
    { label: "5 Years", value: "5y", description: "Medium-term trends" },
    { label: "10 Years", value: "10y", description: "Long-term performance" },
    { label: "Lifetime", value: "max", description: "All available data" },
];

// NIFTY 50 stocks (as of 2024)
const NIFTY_50_STOCKS = [
    "RELIANCE.NS",
    "TCS.NS",
    "HDFCBANK.NS",
    "INFY.NS",
    "ICICIBANK.NS",
    "HINDUNILVR.NS",
    "ITC.NS",
    "SBIN.NS",
    "BHARTIARTL.NS",
    "KOTAKBANK.NS",
    "LT.NS",
    "AXISBANK.NS",
    "ASIANPAINT.NS",
    "MARUTI.NS",
    "TITAN.NS",
    "SUNPHARMA.NS",
    "BAJFINANCE.NS",
    "WIPRO.NS",
    "ULTRACEMCO.NS",
    "ONGC.NS",
    "NTPC.NS",
    "NESTLEIND.NS",
    "TATAMOTORS.NS",
    "M&M.NS",
    "HCLTECH.NS",
    "POWERGRID.NS",
    "ADANIENT.NS",
    "TATASTEEL.NS",
    "ADANIPORTS.NS",
    "BAJAJFINSV.NS",
    "COALINDIA.NS",
    "JSWSTEEL.NS",
    "TECHM.NS",
    "HDFCLIFE.NS",
    "GRASIM.NS",
    "INDUSINDBK.NS",
    "DIVISLAB.NS",
    "DRREDDY.NS",
    "CIPLA.NS",
    "BPCL.NS",
    "SBILIFE.NS",
    "BRITANNIA.NS",
    "EICHERMOT.NS",
    "APOLLOHOSP.NS",
    "TATACONSUM.NS",
    "HEROMOTOCO.NS",
    "BAJAJ-AUTO.NS",
    "UPL.NS",
    "HINDALCO.NS",
    "LTIM.NS",
];

// SENSEX 30 stocks
const SENSEX_30_STOCKS = [
    "RELIANCE.NS",
    "TCS.NS",
    "HDFCBANK.NS",
    "INFY.NS",
    "ICICIBANK.NS",
    "HINDUNILVR.NS",
    "ITC.NS",
    "SBIN.NS",
    "BHARTIARTL.NS",
    "KOTAKBANK.NS",
    "LT.NS",
    "AXISBANK.NS",
    "ASIANPAINT.NS",
    "MARUTI.NS",
    "TITAN.NS",
    "SUNPHARMA.NS",
    "BAJFINANCE.NS",
    "WIPRO.NS",
    "ULTRACEMCO.NS",
    "NTPC.NS",
    "NESTLEIND.NS",
    "TATAMOTORS.NS",
    "M&M.NS",
    "HCLTECH.NS",
    "POWERGRID.NS",
    "TECHM.NS",
    "INDUSINDBK.NS",
    "TATASTEEL.NS",
    "JSWSTEEL.NS",
    "BAJAJFINSV.NS",
];

// Market basket options
const MARKET_BASKETS = [
    {
        id: "nifty50",
        label: "NIFTY 50",
        description: "Top 50 Indian companies by market cap",
        icon: "🇮🇳",
        tickers: NIFTY_50_STOCKS,
    },
    {
        id: "sensex",
        label: "SENSEX 30",
        description: "BSE 30 index companies",
        icon: "📊",
        tickers: SENSEX_30_STOCKS,
    },
    {
        id: "top10",
        label: "Top 10 Stocks",
        description: "India's largest companies",
        icon: "🏆",
        tickers: [
            "RELIANCE.NS",
            "TCS.NS",
            "HDFCBANK.NS",
            "INFY.NS",
            "ICICIBANK.NS",
            "HINDUNILVR.NS",
            "ITC.NS",
            "SBIN.NS",
            "BHARTIARTL.NS",
            "KOTAKBANK.NS",
        ],
    },
    {
        id: "it_sector",
        label: "IT Sector",
        description: "Major IT companies",
        icon: "💻",
        tickers: [
            "TCS.NS",
            "INFY.NS",
            "WIPRO.NS",
            "HCLTECH.NS",
            "TECHM.NS",
            "LTIM.NS",
            "PERSISTENT.NS",
            "COFORGE.NS",
        ],
    },
    {
        id: "banking",
        label: "Banking",
        description: "Top banking stocks",
        icon: "🏦",
        tickers: [
            "HDFCBANK.NS",
            "ICICIBANK.NS",
            "SBIN.NS",
            "KOTAKBANK.NS",
            "AXISBANK.NS",
            "INDUSINDBK.NS",
            "BANKBARODA.NS",
            "PNB.NS",
        ],
    },
    {
        id: "pharma",
        label: "Pharma",
        description: "Healthcare & Pharma stocks",
        icon: "💊",
        tickers: [
            "SUNPHARMA.NS",
            "DRREDDY.NS",
            "CIPLA.NS",
            "DIVISLAB.NS",
            "APOLLOHOSP.NS",
            "BIOCON.NS",
            "LUPIN.NS",
        ],
    },
    {
        id: "auto",
        label: "Auto",
        description: "Automobile sector",
        icon: "🚗",
        tickers: [
            "TATAMOTORS.NS",
            "M&M.NS",
            "MARUTI.NS",
            "BAJAJ-AUTO.NS",
            "HEROMOTOCO.NS",
            "EICHERMOT.NS",
            "TVSMOTOR.NS",
        ],
    },
    {
        id: "custom",
        label: "Custom Selection",
        description: "Choose your own stocks",
        icon: "✏️",
        tickers: [],
    },
];

// Capital presets
const CAPITAL_PRESETS = [
    { label: "₹10K", value: 10000 },
    { label: "₹50K", value: 50000 },
    { label: "₹1L", value: 100000 },
    { label: "₹5L", value: 500000 },
    { label: "₹10L", value: 1000000 },
];

// Risk management options
const RISK_PROFILES = [
    {
        id: "conservative",
        label: "Conservative",
        stopLoss: 3,
        takeProfit: 6,
        description: "Lower risk, smaller moves",
    },
    {
        id: "moderate",
        label: "Moderate",
        stopLoss: 5,
        takeProfit: 10,
        description: "Balanced approach",
    },
    {
        id: "aggressive",
        label: "Aggressive",
        stopLoss: 8,
        takeProfit: 15,
        description: "Higher risk, bigger rewards",
    },
    {
        id: "custom",
        label: "Custom",
        stopLoss: 0,
        takeProfit: 0,
        description: "Set your own levels",
    },
];

const ENTRY_SUGGESTIONS = [
    "Buy when RSI < 30 and price is above 200-day SMA",
    "Buy when price crosses above 50-day SMA with increasing volume",
    "Buy on golden cross (50 SMA above 200 SMA) with RSI between 40-60",
    "Buy when MACD crosses above signal line and RSI is below 50",
];

const EXIT_SUGGESTIONS = [
    "Sell when RSI > 70 or trailing stop loss at 8%",
    "Sell when price drops 5% below 20-day SMA or take profit at 15%",
    "Sell on death cross or stop loss at 10% below entry",
    "Sell when MACD crosses below signal line with trailing stop at 7%",
];

// Step definitions
type Step = "timeframe" | "stocks" | "capital" | "strategy" | "risk" | "review";

const STEPS: { id: Step; label: string; icon: React.ReactNode }[] = [
    {
        id: "timeframe",
        label: "Time Frame",
        icon: <Clock className="h-4 w-4" />,
    },
    { id: "stocks", label: "Stocks", icon: <Building2 className="h-4 w-4" /> },
    { id: "capital", label: "Capital", icon: <Wallet className="h-4 w-4" /> },
    {
        id: "strategy",
        label: "Strategy",
        icon: <TrendingUp className="h-4 w-4" />,
    },
    { id: "risk", label: "Risk", icon: <AlertTriangle className="h-4 w-4" /> },
    { id: "review", label: "Review", icon: <Check className="h-4 w-4" /> },
];

export function BacktestClient({
    initialResult,
}: {
    initialResult?: BacktestResponse | null;
}) {
    // Step state
    const [currentStep, setCurrentStep] = useState<Step>("timeframe");

    // Form state
    const [timeFrame, setTimeFrame] = useState("2y");
    const [selectedBasket, setSelectedBasket] = useState("nifty50");
    const [customStocks, setCustomStocks] = useState<string[]>([]);
    const [capital, setCapital] = useState(100000);
    const [entryStrategy, setEntryStrategy] = useState("");
    const [exitStrategy, setExitStrategy] = useState("");
    const [riskProfile, setRiskProfile] = useState("moderate");
    const [customStopLoss, setCustomStopLoss] = useState(5);
    const [customTakeProfit, setCustomTakeProfit] = useState(10);

    // Result state
    const [result, setResult] = useState<BacktestResponse | null>(
        initialResult ?? null
    );
    const [showLoader, setShowLoader] = useState(false);
    const [isResultReady, setIsResultReady] = useState(false);
    const [pendingResult, setPendingResult] = useState<BacktestResponse | null>(
        null
    );

    // Computed values
    const selectedBasketData = useMemo(
        () => MARKET_BASKETS.find((b) => b.id === selectedBasket),
        [selectedBasket]
    );

    const stocks = useMemo(() => {
        if (selectedBasket === "custom") {
            return customStocks;
        }
        return selectedBasketData?.tickers || [];
    }, [selectedBasket, selectedBasketData, customStocks]);

    const currentRiskData = useMemo(
        () => RISK_PROFILES.find((r) => r.id === riskProfile),
        [riskProfile]
    );

    const stopLoss =
        riskProfile === "custom"
            ? customStopLoss
            : currentRiskData?.stopLoss || 5;
    const takeProfit =
        riskProfile === "custom"
            ? customTakeProfit
            : currentRiskData?.takeProfit || 10;

    const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

    const mutation = useMutation({
        mutationFn: async () => {
            // Build strategy with risk management included
            const fullEntryStrategy = `${entryStrategy}. Use stop loss at ${stopLoss}% and take profit at ${takeProfit}%.`;

            const response = await fetch("/api/backtest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    entryStrategy: fullEntryStrategy,
                    exitStrategy,
                    stocks,
                    capital,
                    period: timeFrame,
                    riskProfile: {
                        stopLoss,
                        takeProfit,
                    },
                }),
            });
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.error || "Backtest failed");
            }
            return response.json();
        },
        onSuccess: (payload: BacktestResponse) => {
            setPendingResult(payload);
            setIsResultReady(true);
        },
        onError: (error) => {
            setShowLoader(false);
            setIsResultReady(false);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Unable to run backtest"
            );
        },
    });

    const handleViewResults = useCallback(() => {
        if (pendingResult) {
            setResult(pendingResult);
            setPendingResult(null);
            setShowLoader(false);
            setIsResultReady(false);
        }
    }, [pendingResult]);

    const handleSubmit = () => {
        if (!entryStrategy.trim() || !exitStrategy.trim() || mutation.isPending)
            return;
        setShowLoader(true);
        setIsResultReady(false);
        setPendingResult(null);
        mutation.mutate();
    };

    const removeCustomStock = (symbolToRemove: string) => {
        setCustomStocks(customStocks.filter((s) => s !== symbolToRemove));
    };

    const goToNextStep = () => {
        const nextIndex = currentStepIndex + 1;
        if (nextIndex < STEPS.length) {
            setCurrentStep(STEPS[nextIndex].id);
        }
    };

    const goToPreviousStep = () => {
        const prevIndex = currentStepIndex - 1;
        if (prevIndex >= 0) {
            setCurrentStep(STEPS[prevIndex].id);
        }
    };

    const canProceed = useMemo(() => {
        switch (currentStep) {
            case "timeframe":
                return !!timeFrame;
            case "stocks":
                return stocks.length > 0;
            case "capital":
                return capital > 0;
            case "strategy":
                return (
                    entryStrategy.trim().length > 0 &&
                    exitStrategy.trim().length > 0
                );
            case "risk":
                return !!riskProfile;
            case "review":
                return true;
            default:
                return false;
        }
    }, [
        currentStep,
        timeFrame,
        stocks,
        capital,
        entryStrategy,
        exitStrategy,
        riskProfile,
    ]);

    const resetForm = () => {
        setCurrentStep("timeframe");
        setResult(null);
    };

    return (
        <TerminalLayout
            title={
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1d24] border border-[#2d303a]/40">
                    <BarChart3 className="h-3.5 w-3.5 text-[#6c8cff]" />
                    <span className="text-xs text-[#8b8f9a]">Backtesting</span>
                </div>
            }
            centerContent={
                result ? (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1d24]/80 border border-[#2d303a]/40">
                            <TrendingUp className="h-4 w-4 text-[#6c8cff]" />
                            <span className="text-xs text-[#8b8f9a]">
                                Portfolio Return
                            </span>
                            <span
                                className={cn(
                                    "text-lg font-bold font-mono",
                                    (result.portfolio_metrics
                                        ?.portfolio_return_pct ?? 0) >= 0
                                        ? "text-[#3dd68c]"
                                        : "text-[#f06c6c]"
                                )}
                            >
                                {(result.portfolio_metrics
                                    ?.portfolio_return_pct ?? 0) > 0
                                    ? "+"
                                    : ""}
                                {(
                                    result.portfolio_metrics
                                        ?.portfolio_return_pct ?? 0
                                ).toFixed(2)}
                                %
                            </span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1d24]/60 border border-[#2d303a]/30">
                            <span className="text-xs text-[#8b8f9a]">
                                Win Rate
                            </span>
                            <span className="text-sm font-semibold text-[#e8eaed]">
                                {(
                                    result.portfolio_metrics
                                        ?.avg_win_rate_pct ?? 0
                                ).toFixed(1)}
                                %
                            </span>
                        </div>
                    </div>
                ) : !showLoader ? (
                    <div className="flex items-center gap-2">
                        {STEPS.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <button
                                    onClick={() =>
                                        index <= currentStepIndex &&
                                        setCurrentStep(step.id)
                                    }
                                    className={cn(
                                        "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all",
                                        currentStep === step.id
                                            ? "bg-[#6c8cff] text-white"
                                            : index < currentStepIndex
                                            ? "bg-[#3dd68c]/20 text-[#3dd68c] cursor-pointer hover:bg-[#3dd68c]/30"
                                            : "bg-[#1a1d24] text-[#8b8f9a]"
                                    )}
                                >
                                    {index < currentStepIndex ? (
                                        <Check className="h-3 w-3" />
                                    ) : (
                                        step.icon
                                    )}
                                    <span className="hidden sm:inline">
                                        {step.label}
                                    </span>
                                </button>
                                {index < STEPS.length - 1 && (
                                    <ChevronRight className="h-3 w-3 text-[#8b8f9a] mx-1" />
                                )}
                            </div>
                        ))}
                    </div>
                ) : null
            }
        >
            <div className="flex-1 flex flex-col bg-[#0c0d10] overflow-hidden">
                {/* Agentic Loading State */}
                {showLoader && (
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="min-h-full flex items-center justify-center p-6">
                            <AgenticLoader
                                isLoading={showLoader}
                                isResultReady={isResultReady}
                                onViewResults={handleViewResults}
                                entryStrategy={entryStrategy}
                                exitStrategy={exitStrategy}
                                stocks={stocks}
                                capital={capital}
                            />
                        </div>
                    </div>
                )}

                {/* Step-wise Input */}
                {!result && !showLoader && (
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="min-h-full flex items-center justify-center p-6">
                            <div className="w-full max-w-xl my-auto">
                                <div className="rounded-2xl bg-[#12141a] border border-[#2d303a]/50 p-6 shadow-xl">
                                    {/* Step 1: Time Frame */}
                                    {currentStep === "timeframe" && (
                                        <div className="space-y-6">
                                            <div className="text-center">
                                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#6c8cff]/10 border border-[#6c8cff]/20 mb-4">
                                                    <Clock className="h-6 w-6 text-[#6c8cff]" />
                                                </div>
                                                <h2 className="text-xl font-semibold text-[#e8eaed] mb-2">
                                                    Select Time Frame
                                                </h2>
                                                <p className="text-sm text-[#8b8f9a]">
                                                    How far back should we
                                                    analyze the market?
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 gap-3">
                                                {TIME_FRAMES.map((tf) => (
                                                    <button
                                                        key={tf.value}
                                                        onClick={() =>
                                                            setTimeFrame(
                                                                tf.value
                                                            )
                                                        }
                                                        className={cn(
                                                            "flex items-center justify-between p-4 rounded-xl border transition-all",
                                                            timeFrame ===
                                                                tf.value
                                                                ? "bg-[#6c8cff]/10 border-[#6c8cff] text-[#e8eaed]"
                                                                : "bg-[#1a1d24] border-[#2d303a]/50 text-[#8b8f9a] hover:border-[#6c8cff]/50"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className={cn(
                                                                    "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                                                                    timeFrame ===
                                                                        tf.value
                                                                        ? "border-[#6c8cff]"
                                                                        : "border-[#8b8f9a]"
                                                                )}
                                                            >
                                                                {timeFrame ===
                                                                    tf.value && (
                                                                    <div className="w-2 h-2 rounded-full bg-[#6c8cff]" />
                                                                )}
                                                            </div>
                                                            <span className="font-medium">
                                                                {tf.label}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-[#8b8f9a]">
                                                            {tf.description}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 2: Stocks Selection */}
                                    {currentStep === "stocks" && (
                                        <div className="space-y-6">
                                            <div className="text-center">
                                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#6c8cff]/10 border border-[#6c8cff]/20 mb-4">
                                                    <Building2 className="h-6 w-6 text-[#6c8cff]" />
                                                </div>
                                                <h2 className="text-xl font-semibold text-[#e8eaed] mb-2">
                                                    Select Stocks
                                                </h2>
                                                <p className="text-sm text-[#8b8f9a]">
                                                    Choose a market basket or
                                                    select custom stocks
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                {MARKET_BASKETS.map(
                                                    (basket) => (
                                                        <button
                                                            key={basket.id}
                                                            onClick={() =>
                                                                setSelectedBasket(
                                                                    basket.id
                                                                )
                                                            }
                                                            className={cn(
                                                                "flex flex-col items-start p-4 rounded-xl border transition-all text-left",
                                                                selectedBasket ===
                                                                    basket.id
                                                                    ? "bg-[#6c8cff]/10 border-[#6c8cff]"
                                                                    : "bg-[#1a1d24] border-[#2d303a]/50 hover:border-[#6c8cff]/50"
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="text-xl">
                                                                    {
                                                                        basket.icon
                                                                    }
                                                                </span>
                                                                <span
                                                                    className={cn(
                                                                        "font-medium text-sm",
                                                                        selectedBasket ===
                                                                            basket.id
                                                                            ? "text-[#e8eaed]"
                                                                            : "text-[#8b8f9a]"
                                                                    )}
                                                                >
                                                                    {
                                                                        basket.label
                                                                    }
                                                                </span>
                                                            </div>
                                                            <span className="text-xs text-[#8b8f9a]">
                                                                {
                                                                    basket.description
                                                                }
                                                            </span>
                                                            {basket.tickers
                                                                .length > 0 && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="mt-2 text-[10px] bg-[#0c0d10] border-[#2d303a]/50"
                                                                >
                                                                    {
                                                                        basket
                                                                            .tickers
                                                                            .length
                                                                    }{" "}
                                                                    stocks
                                                                </Badge>
                                                            )}
                                                        </button>
                                                    )
                                                )}
                                            </div>

                                            {/* Custom stock input */}
                                            {selectedBasket === "custom" && (
                                                <div className="space-y-3 pt-4 border-t border-[#2d303a]/50">
                                                    <StockSearch
                                                        onSelect={(symbol) => {
                                                            if (
                                                                !customStocks.includes(
                                                                    symbol
                                                                )
                                                            ) {
                                                                setCustomStocks(
                                                                    [
                                                                        ...customStocks,
                                                                        symbol,
                                                                    ]
                                                                );
                                                            }
                                                        }}
                                                        placeholder="Search and add stocks (e.g., RELIANCE.NS)"
                                                        selectedStocks={
                                                            customStocks
                                                        }
                                                        showSelectedBadges={
                                                            true
                                                        }
                                                        onRemove={
                                                            removeCustomStock
                                                        }
                                                    />
                                                </div>
                                            )}

                                            {/* Show selected stocks preview */}
                                            {selectedBasket !== "custom" &&
                                                stocks.length > 0 && (
                                                    <div className="p-3 rounded-lg bg-[#0c0d10] border border-[#2d303a]/30">
                                                        <div className="flex flex-wrap gap-2">
                                                            {stocks
                                                                .slice(0, 6)
                                                                .map((s) => (
                                                                    <Badge
                                                                        key={s}
                                                                        variant="outline"
                                                                        className="text-xs bg-[#1a1d24] border-[#2d303a]/50 text-[#e8eaed]"
                                                                    >
                                                                        {s}
                                                                    </Badge>
                                                                ))}
                                                            {stocks.length >
                                                                6 && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-xs bg-[#1a1d24] border-[#2d303a]/50 text-[#8b8f9a]"
                                                                >
                                                                    +
                                                                    {stocks.length -
                                                                        6}{" "}
                                                                    more
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                        </div>
                                    )}

                                    {/* Step 3: Capital */}
                                    {currentStep === "capital" && (
                                        <div className="space-y-6">
                                            <div className="text-center">
                                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#6c8cff]/10 border border-[#6c8cff]/20 mb-4">
                                                    <Wallet className="h-6 w-6 text-[#6c8cff]" />
                                                </div>
                                                <h2 className="text-xl font-semibold text-[#e8eaed] mb-2">
                                                    Set Initial Capital
                                                </h2>
                                                <p className="text-sm text-[#8b8f9a]">
                                                    How much capital do you want
                                                    to invest?
                                                </p>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="text-center">
                                                    <span className="text-4xl font-bold text-[#e8eaed]">
                                                        ₹
                                                        {capital.toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </span>
                                                </div>

                                                <Input
                                                    type="number"
                                                    value={capital}
                                                    onChange={(e) =>
                                                        setCapital(
                                                            Number(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                    className="h-12 text-lg text-center bg-[#1a1d24] border-[#2d303a]/50 text-[#e8eaed]"
                                                    placeholder="Enter amount"
                                                />

                                                <div className="grid grid-cols-5 gap-2">
                                                    {CAPITAL_PRESETS.map(
                                                        (preset) => (
                                                            <button
                                                                key={
                                                                    preset.value
                                                                }
                                                                onClick={() =>
                                                                    setCapital(
                                                                        preset.value
                                                                    )
                                                                }
                                                                className={cn(
                                                                    "py-2.5 text-sm rounded-lg border transition-colors",
                                                                    capital ===
                                                                        preset.value
                                                                        ? "bg-[#6c8cff] border-[#6c8cff] text-white"
                                                                        : "bg-[#1a1d24] border-[#2d303a]/50 text-[#8b8f9a] hover:border-[#6c8cff]/50 hover:text-[#e8eaed]"
                                                                )}
                                                            >
                                                                {preset.label}
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 4: Strategy */}
                                    {currentStep === "strategy" && (
                                        <div className="space-y-6">
                                            <div className="text-center">
                                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#6c8cff]/10 border border-[#6c8cff]/20 mb-4">
                                                    <TrendingUp className="h-6 w-6 text-[#6c8cff]" />
                                                </div>
                                                <h2 className="text-xl font-semibold text-[#e8eaed] mb-2">
                                                    Define Your Strategy
                                                </h2>
                                                <p className="text-sm text-[#8b8f9a]">
                                                    Describe when to buy and
                                                    sell in plain English
                                                </p>
                                            </div>

                                            <div className="space-y-4">
                                                {/* Entry Strategy */}
                                                <div className="space-y-2">
                                                    <label className="flex items-center gap-2 text-xs font-medium text-[#3dd68c]">
                                                        <TrendingUp className="h-3.5 w-3.5" />
                                                        Entry Strategy (When to
                                                        Buy)
                                                    </label>
                                                    <textarea
                                                        value={entryStrategy}
                                                        onChange={(e) =>
                                                            setEntryStrategy(
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="e.g., Buy when RSI drops below 30 and price is above 200-day moving average"
                                                        rows={3}
                                                        className="w-full px-4 py-3 text-sm bg-[#1a1d24] border border-[#2d303a]/50 rounded-xl text-[#e8eaed] placeholder:text-[#8b8f9a] focus:border-[#3dd68c] focus:ring-1 focus:ring-[#3dd68c]/20 focus:outline-none resize-none transition-colors"
                                                    />
                                                    <div className="flex flex-wrap gap-2">
                                                        {ENTRY_SUGGESTIONS.slice(
                                                            0,
                                                            2
                                                        ).map(
                                                            (suggestion, i) => (
                                                                <button
                                                                    key={i}
                                                                    onClick={() =>
                                                                        setEntryStrategy(
                                                                            suggestion
                                                                        )
                                                                    }
                                                                    className="px-2.5 py-1 text-[10px] text-[#8b8f9a] bg-[#1a1d24] border border-[#2d303a]/50 rounded-lg hover:border-[#3dd68c]/50 hover:text-[#3dd68c] transition-colors"
                                                                >
                                                                    {suggestion}
                                                                </button>
                                                            )
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Visual Separator */}
                                                <div className="flex items-center gap-3 py-2">
                                                    <div className="flex-1 h-px bg-[#2d303a]/50" />
                                                    <ArrowRightLeft className="h-4 w-4 text-[#8b8f9a]" />
                                                    <div className="flex-1 h-px bg-[#2d303a]/50" />
                                                </div>

                                                {/* Exit Strategy */}
                                                <div className="space-y-2">
                                                    <label className="flex items-center gap-2 text-xs font-medium text-[#f06c6c]">
                                                        <TrendingUp className="h-3.5 w-3.5 rotate-180" />
                                                        Exit Strategy (When to
                                                        Sell)
                                                    </label>
                                                    <textarea
                                                        value={exitStrategy}
                                                        onChange={(e) =>
                                                            setExitStrategy(
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="e.g., Sell when RSI rises above 70 or stop loss at 5% below entry price"
                                                        rows={3}
                                                        className="w-full px-4 py-3 text-sm bg-[#1a1d24] border border-[#2d303a]/50 rounded-xl text-[#e8eaed] placeholder:text-[#8b8f9a] focus:border-[#f06c6c] focus:ring-1 focus:ring-[#f06c6c]/20 focus:outline-none resize-none transition-colors"
                                                    />
                                                    <div className="flex flex-wrap gap-2">
                                                        {EXIT_SUGGESTIONS.slice(
                                                            0,
                                                            2
                                                        ).map(
                                                            (suggestion, i) => (
                                                                <button
                                                                    key={i}
                                                                    onClick={() =>
                                                                        setExitStrategy(
                                                                            suggestion
                                                                        )
                                                                    }
                                                                    className="px-2.5 py-1 text-[10px] text-[#8b8f9a] bg-[#1a1d24] border border-[#2d303a]/50 rounded-lg hover:border-[#f06c6c]/50 hover:text-[#f06c6c] transition-colors"
                                                                >
                                                                    {suggestion}
                                                                </button>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 5: Risk Management */}
                                    {currentStep === "risk" && (
                                        <div className="space-y-6">
                                            <div className="text-center">
                                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#6c8cff]/10 border border-[#6c8cff]/20 mb-4">
                                                    <AlertTriangle className="h-6 w-6 text-[#6c8cff]" />
                                                </div>
                                                <h2 className="text-xl font-semibold text-[#e8eaed] mb-2">
                                                    Risk Management
                                                </h2>
                                                <p className="text-sm text-[#8b8f9a]">
                                                    Set your risk tolerance and
                                                    profit targets
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                {RISK_PROFILES.map(
                                                    (profile) => (
                                                        <button
                                                            key={profile.id}
                                                            onClick={() =>
                                                                setRiskProfile(
                                                                    profile.id
                                                                )
                                                            }
                                                            className={cn(
                                                                "flex flex-col items-start p-4 rounded-xl border transition-all text-left",
                                                                riskProfile ===
                                                                    profile.id
                                                                    ? "bg-[#6c8cff]/10 border-[#6c8cff]"
                                                                    : "bg-[#1a1d24] border-[#2d303a]/50 hover:border-[#6c8cff]/50"
                                                            )}
                                                        >
                                                            <span
                                                                className={cn(
                                                                    "font-medium text-sm mb-1",
                                                                    riskProfile ===
                                                                        profile.id
                                                                        ? "text-[#e8eaed]"
                                                                        : "text-[#8b8f9a]"
                                                                )}
                                                            >
                                                                {profile.label}
                                                            </span>
                                                            <span className="text-xs text-[#8b8f9a]">
                                                                {
                                                                    profile.description
                                                                }
                                                            </span>
                                                            {profile.id !==
                                                                "custom" && (
                                                                <div className="flex gap-2 mt-2">
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="text-[10px] bg-[#f06c6c]/10 border-[#f06c6c]/30 text-[#f06c6c]"
                                                                    >
                                                                        SL:{" "}
                                                                        {
                                                                            profile.stopLoss
                                                                        }
                                                                        %
                                                                    </Badge>
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="text-[10px] bg-[#3dd68c]/10 border-[#3dd68c]/30 text-[#3dd68c]"
                                                                    >
                                                                        TP:{" "}
                                                                        {
                                                                            profile.takeProfit
                                                                        }
                                                                        %
                                                                    </Badge>
                                                                </div>
                                                            )}
                                                        </button>
                                                    )
                                                )}
                                            </div>

                                            {/* Custom risk inputs */}
                                            {riskProfile === "custom" && (
                                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#2d303a]/50">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-medium text-[#f06c6c]">
                                                            Stop Loss %
                                                        </label>
                                                        <Input
                                                            type="number"
                                                            value={
                                                                customStopLoss
                                                            }
                                                            onChange={(e) =>
                                                                setCustomStopLoss(
                                                                    Number(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                )
                                                            }
                                                            className="h-10 bg-[#1a1d24] border-[#2d303a]/50 text-[#e8eaed]"
                                                            min={1}
                                                            max={50}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-medium text-[#3dd68c]">
                                                            Take Profit %
                                                        </label>
                                                        <Input
                                                            type="number"
                                                            value={
                                                                customTakeProfit
                                                            }
                                                            onChange={(e) =>
                                                                setCustomTakeProfit(
                                                                    Number(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                )
                                                            }
                                                            className="h-10 bg-[#1a1d24] border-[#2d303a]/50 text-[#e8eaed]"
                                                            min={1}
                                                            max={100}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Step 6: Review */}
                                    {currentStep === "review" && (
                                        <div className="space-y-6">
                                            <div className="text-center">
                                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#3dd68c]/10 border border-[#3dd68c]/20 mb-4">
                                                    <Check className="h-6 w-6 text-[#3dd68c]" />
                                                </div>
                                                <h2 className="text-xl font-semibold text-[#e8eaed] mb-2">
                                                    Review & Run
                                                </h2>
                                                <p className="text-sm text-[#8b8f9a]">
                                                    Confirm your backtest
                                                    configuration
                                                </p>
                                            </div>

                                            <div className="space-y-3">
                                                {/* Time Frame */}
                                                <div className="flex items-center justify-between p-3 rounded-lg bg-[#1a1d24] border border-[#2d303a]/50">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4 text-[#8b8f9a]" />
                                                        <span className="text-sm text-[#8b8f9a]">
                                                            Time Frame
                                                        </span>
                                                    </div>
                                                    <span className="text-sm font-medium text-[#e8eaed]">
                                                        {
                                                            TIME_FRAMES.find(
                                                                (t) =>
                                                                    t.value ===
                                                                    timeFrame
                                                            )?.label
                                                        }
                                                    </span>
                                                </div>

                                                {/* Stocks */}
                                                <div className="flex items-center justify-between p-3 rounded-lg bg-[#1a1d24] border border-[#2d303a]/50">
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="h-4 w-4 text-[#8b8f9a]" />
                                                        <span className="text-sm text-[#8b8f9a]">
                                                            Stocks
                                                        </span>
                                                    </div>
                                                    <span className="text-sm font-medium text-[#e8eaed]">
                                                        {
                                                            selectedBasketData?.label
                                                        }{" "}
                                                        ({stocks.length})
                                                    </span>
                                                </div>

                                                {/* Capital */}
                                                <div className="flex items-center justify-between p-3 rounded-lg bg-[#1a1d24] border border-[#2d303a]/50">
                                                    <div className="flex items-center gap-2">
                                                        <Wallet className="h-4 w-4 text-[#8b8f9a]" />
                                                        <span className="text-sm text-[#8b8f9a]">
                                                            Capital
                                                        </span>
                                                    </div>
                                                    <span className="text-sm font-medium text-[#e8eaed]">
                                                        ₹
                                                        {capital.toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </span>
                                                </div>

                                                {/* Risk */}
                                                <div className="flex items-center justify-between p-3 rounded-lg bg-[#1a1d24] border border-[#2d303a]/50">
                                                    <div className="flex items-center gap-2">
                                                        <AlertTriangle className="h-4 w-4 text-[#8b8f9a]" />
                                                        <span className="text-sm text-[#8b8f9a]">
                                                            Risk
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[10px] bg-[#f06c6c]/10 border-[#f06c6c]/30 text-[#f06c6c]"
                                                        >
                                                            SL: {stopLoss}%
                                                        </Badge>
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[10px] bg-[#3dd68c]/10 border-[#3dd68c]/30 text-[#3dd68c]"
                                                        >
                                                            TP: {takeProfit}%
                                                        </Badge>
                                                    </div>
                                                </div>

                                                {/* Strategy Summary */}
                                                <div className="p-3 rounded-lg bg-[#1a1d24] border border-[#2d303a]/50 space-y-2">
                                                    <div className="flex items-start gap-2">
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[10px] bg-[#3dd68c]/10 border-[#3dd68c]/30 text-[#3dd68c] shrink-0"
                                                        >
                                                            Entry
                                                        </Badge>
                                                        <span className="text-xs text-[#8b8f9a]">
                                                            {entryStrategy.length >
                                                            100
                                                                ? entryStrategy.slice(
                                                                      0,
                                                                      100
                                                                  ) + "..."
                                                                : entryStrategy}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[10px] bg-[#f06c6c]/10 border-[#f06c6c]/30 text-[#f06c6c] shrink-0"
                                                        >
                                                            Exit
                                                        </Badge>
                                                        <span className="text-xs text-[#8b8f9a]">
                                                            {exitStrategy.length >
                                                            100
                                                                ? exitStrategy.slice(
                                                                      0,
                                                                      100
                                                                  ) + "..."
                                                                : exitStrategy}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Navigation Buttons */}
                                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#2d303a]/50">
                                        {currentStepIndex > 0 ? (
                                            <Button
                                                onClick={goToPreviousStep}
                                                variant="outline"
                                                className="h-10 px-4 bg-[#1a1d24] border-[#2d303a]/50 text-[#8b8f9a] hover:bg-[#252730] hover:text-[#e8eaed]"
                                            >
                                                <ChevronLeft className="h-4 w-4 mr-1" />
                                                Back
                                            </Button>
                                        ) : (
                                            <div />
                                        )}

                                        {currentStep === "review" ? (
                                            <Button
                                                onClick={handleSubmit}
                                                disabled={
                                                    !canProceed ||
                                                    mutation.isPending
                                                }
                                                className="h-10 px-6 bg-[#6c8cff] hover:bg-[#5c7ce8] disabled:opacity-50"
                                            >
                                                <Play className="h-4 w-4 mr-2" />
                                                Run Backtest
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={goToNextStep}
                                                disabled={!canProceed}
                                                className="h-10 px-6 bg-[#6c8cff] hover:bg-[#5c7ce8] disabled:opacity-50"
                                            >
                                                Continue
                                                <ChevronRight className="h-4 w-4 ml-1" />
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <p className="text-[10px] text-center text-[#8b8f9a] mt-4">
                                    Backtesting uses historical data. Past
                                    performance does not guarantee future
                                    results.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results Area */}
                {result && (
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="max-w-6xl mx-auto px-6 py-6">
                            {/* Run New Backtest Button */}
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <Badge
                                            variant="outline"
                                            className="bg-[#1a1d24] border-[#2d303a]/50 text-[#8b8f9a]"
                                        >
                                            <Clock className="h-3 w-3 mr-1" />
                                            {
                                                TIME_FRAMES.find(
                                                    (t) => t.value === timeFrame
                                                )?.label
                                            }
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="bg-[#1a1d24] border-[#2d303a]/50 text-[#8b8f9a]"
                                        >
                                            <Building2 className="h-3 w-3 mr-1" />
                                            {stocks.length} stocks
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="bg-[#1a1d24] border-[#2d303a]/50 text-[#8b8f9a]"
                                        >
                                            <DollarSign className="h-3 w-3 mr-1" />
                                            ₹{capital.toLocaleString("en-IN")}
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="bg-[#f06c6c]/10 border-[#f06c6c]/30 text-[#f06c6c]"
                                        >
                                            SL: {stopLoss}%
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="bg-[#3dd68c]/10 border-[#3dd68c]/30 text-[#3dd68c]"
                                        >
                                            TP: {takeProfit}%
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <Badge
                                            variant="outline"
                                            className="bg-[#3dd68c]/10 border-[#3dd68c]/30 text-[#3dd68c]"
                                        >
                                            <TrendingUp className="h-3 w-3 mr-1" />
                                            Entry:{" "}
                                            {entryStrategy.length > 30
                                                ? entryStrategy.slice(0, 30) +
                                                  "..."
                                                : entryStrategy}
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="bg-[#f06c6c]/10 border-[#f06c6c]/30 text-[#f06c6c]"
                                        >
                                            <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
                                            Exit:{" "}
                                            {exitStrategy.length > 30
                                                ? exitStrategy.slice(0, 30) +
                                                  "..."
                                                : exitStrategy}
                                        </Badge>
                                    </div>
                                </div>
                                <Button
                                    onClick={resetForm}
                                    variant="outline"
                                    className="h-9 px-4 text-xs bg-[#1a1d24] border-[#2d303a]/50 text-[#e8eaed] hover:bg-[#252730] hover:border-[#6c8cff]/50"
                                >
                                    <Plus className="h-3.5 w-3.5 mr-2" />
                                    New Backtest
                                </Button>
                            </div>

                            <BacktestResults
                                result={result}
                                capital={capital}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Custom Scrollbar Styles */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(139, 143, 154, 0.2);
                    border-radius: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(139, 143, 154, 0.35);
                }
                .custom-scrollbar::-webkit-scrollbar-corner {
                    background: transparent;
                }
                @keyframes bounce {
                    0%,
                    100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-4px);
                    }
                }
            `}</style>
        </TerminalLayout>
    );
}

