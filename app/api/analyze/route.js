import { fetchFMPData, fetchYahooQuote, isIndianStock } from "@/lib/fmp";
import { computeFinancials } from "@/lib/computeFinancials";
import { fetchGeminiAnalysis, fetchGeminiCombined } from "@/lib/gemini";

export async function POST(request) {
  try {
    const { ticker } = await request.json();

    if (!ticker || typeof ticker !== "string") {
      return Response.json({ error: "Ticker is required" }, { status: 400 });
    }

    const fmpKey = process.env.FMP_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!fmpKey || !geminiKey) {
      return Response.json({ error: "API keys not configured" }, { status: 500 });
    }

    let financials;
    let gemini;
    let dataSource = "fmp";
    const isIndian = isIndianStock(ticker);

    if (!isIndian) {
      // US STOCKS: FMP for financials + Gemini for analysis
      try {
        const fmpData = await fetchFMPData(ticker, fmpKey);
        financials = computeFinancials(fmpData);
      } catch (e) {
        return Response.json({ error: `FMP error for "${ticker}": ${e.message}` }, { status: 404 });
      }

      try {
        gemini = await fetchGeminiAnalysis(
          ticker.toUpperCase().trim(),
          financials.profile.companyName,
          false,
          geminiKey
        );
      } catch (ge) {
        gemini = {
          overview: "Gemini error: " + ge.message,
          risks: [], bullCase: "", bearCase: "", thesis: "", outlook: "Neutral",
          news: [], segmentRevenue: [], geographyRevenue: [], debtMaturity: [],
          liquidity: { sources: {}, uses: {} }, peers: [],
        };
      }
    } else {
      // INDIAN STOCKS: Yahoo for price + Gemini combined for everything else
      dataSource = "gemini";

      // Fetch Yahoo quote and Gemini combined in parallel
      let yahooQuote = null;
      let combined = null;

      const [yahooResult, geminiResult] = await Promise.allSettled([
        fetchYahooQuote(ticker),
        fetchGeminiCombined(ticker.toUpperCase().trim(), geminiKey),
      ]);

      if (yahooResult.status === "fulfilled") {
        yahooQuote = yahooResult.value;
      }

      if (geminiResult.status === "fulfilled") {
        combined = geminiResult.value;
        financials = combined.financials;
        gemini = combined.gemini;
      } else {
        return Response.json(
          { error: `Could not fetch data for "${ticker}": ${geminiResult.reason?.message}` },
          { status: 404 }
        );
      }

      // Override Gemini's price/market data with accurate Yahoo data
      if (yahooQuote && financials?.profile) {
        financials.profile.price = yahooQuote.price;
        financials.profile.change = yahooQuote.change;
        financials.profile.changePercent = yahooQuote.changePercent;
        financials.profile.companyName = yahooQuote.longName || yahooQuote.shortName || financials.profile.companyName;
        financials.profile.exchange = yahooQuote.exchangeName || financials.profile.exchange;

        // Recalculate P/E with real price
        const latestEps = financials.latest?.eps || 0;
        if (yahooQuote.price && latestEps) {
          financials.profile.peRatio = yahooQuote.price / latestEps;
        }
      }
    }

    return Response.json({
      ticker: ticker.toUpperCase().trim(),
      financials,
      gemini,
      dataSource,
    });
  } catch (e) {
    return Response.json({ error: "Server error: " + e.message }, { status: 500 });
  }
}
