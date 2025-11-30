import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
    entryStrategy: z.string().min(3),
    exitStrategy: z.string().min(3),
    stocks: z.array(z.string()).min(1),
    capital: z.number().default(50000),
    period: z.string().default("2y"),
    riskProfile: z
        .object({
            stopLoss: z.number().min(1).max(50).default(5),
            takeProfit: z.number().min(1).max(100).default(10),
        })
        .optional(),
});

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5001";

export async function POST(request: Request) {
    try {
        const payload = await request.json();
        const parsed = schema.safeParse(payload);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.flatten() },
                { status: 422 }
            );
        }

        const {
            entryStrategy,
            exitStrategy,
            stocks,
            capital,
            period,
            riskProfile,
        } = parsed.data;

        // Combine entry and exit strategies into a query for the backend
        const query = `Entry: ${entryStrategy}. Exit: ${exitStrategy}`;

        // Call the backend backtest API
        const backendResponse = await fetch(`${BACKEND_URL}/backtest`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query,
                tickers: stocks,
                period,
                capital,
            }),
        });

        if (!backendResponse.ok) {
            const errorData = await backendResponse.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.error || "Backend request failed" },
                { status: backendResponse.status }
            );
        }

        const result = await backendResponse.json();
        return NextResponse.json(result);
    } catch (error) {
        console.error("Backtest API error:", error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Internal server error",
            },
            { status: 500 }
        );
    }
}

