import { notFound } from "next/navigation";
import type { CandlestickData, HistogramData } from "lightweight-charts";

import { StockPageClient } from "@/components/stock-details/stock-page-client";
import { fetchQuote } from "@/lib/api-clients/market-data";

async function fetchCompanyProfile(symbol: string) {
    try {
        const response = await fetch(
            `${
                process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
            }/api/company-overview?symbol=${symbol}`,
            { cache: "no-store" }
        );
        if (!response.ok) throw new Error("Failed to fetch company profile");
        return await response.json();
    } catch (error) {
        console.error("Error fetching company profile:", error);
        // Return minimal profile data
        return {
            symbol,
            companyName: symbol,
            sector: "Unknown",
            industry: "Unknown",
            description: `Company information for ${symbol}`,
            website: "",
            ceo: "",
            employees: 0,
            marketCap: 0,
            country: "",
        };
    }
}

async function fetchChartData(symbol: string) {
    try {
        const response = await fetch(
            `${
                process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
            }/api/historical-price?symbol=${symbol}&timeframe=1Y`,
            { cache: "no-store" }
        );
        if (!response.ok) throw new Error("Failed to fetch chart data");
        return await response.json();
    } catch (error) {
        console.error("Error fetching chart data:", error);
        return [];
    }
}

export default async function StockPage({
    params,
}: {
    params: Promise<{ symbol: string }>;
}) {
    const { symbol: symbolParam } = await params;
    const symbol = symbolParam.toUpperCase();

    // Helper function to convert date to yyyy-mm-dd format
    const formatDateForChart = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                console.warn(`Invalid date: ${dateString}`);
                return dateString;
            }
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        } catch (error) {
            console.error(`Error formatting date ${dateString}:`, error);
            return dateString;
        }
    };

    try {
        const [quote, profile, chartData] = await Promise.all([
            fetchQuote(symbol),
            fetchCompanyProfile(symbol),
            fetchChartData(symbol),
        ]);

        const candles: CandlestickData[] = chartData.map((candle: any) => ({
            time: formatDateForChart(candle.date || candle.time),
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
        }));

        const volumes: HistogramData[] = chartData.map((candle: any) => ({
            time: formatDateForChart(candle.date || candle.time),
            value: candle.volume,
            color:
                candle.close >= candle.open
                    ? "rgba(34,197,94,0.5)"
                    : "rgba(239,68,68,0.5)",
        }));

        return (
            <StockPageClient
                symbol={symbol}
                initialQuote={quote}
                initialProfile={profile}
                initialCandles={candles}
                initialVolumes={volumes}
            />
        );
    } catch (error) {
        console.error("Error loading stock page:", error);
        notFound();
    }
}

