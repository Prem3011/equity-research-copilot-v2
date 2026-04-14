import { fetchFMPData, fetchYahooQuote, isKnownIndianTicker } from "@/lib/fmp";
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

    const upper = ticker.toUpperCase().trim();
    let financials;
    let gemini;
    let dataSource = "fmp";

    // If we know it's Indian, skip FMP entirely (saves a failed API call)
    const knownIndian = isKnownIndianTicker(upper);

    if (!knownIndian) {
      // TRY FMP FIRST (works for US stocks)
      try {
        const fmpData = await fetchFMPData(upper, fmpKey);

        // Check if FMP returned actual data
        if (!fmpData.income?.length && !fmpData.profile?.companyName) {
          throw new Error("No FMP data returned");
        }

        financials = computeFinancials(fmpData);
        dataSource = "fmp";

        // Fetch Gemini for qualitative analysis only
        try {
          gemini = await fetchGeminiAnalysis(
            upper,
            financials.profile.companyName,
            false,
            geminiKey
          );
        } catch (ge) {
          gemini = {
            overview: "AI analysis temporarily unavailable: " + ge.message,
            risks: [], bullCase: "", bearCase: "", thesis: "", outlook: "Neutral",
            news: [], segmentRevenue: [], geographyRevenue: [], debtMaturity: [],
            liquidity: { sources: {}, uses: {} }, peers: [],
          };
        }

        return Response.json({ ticker: upper, financials, gemini, dataSource });
      } catch (fmpError) {
        // FMP failed — fall through to Yahoo + Gemini path
        console.log("FMP failed for", upper, "- trying Yahoo + Gemini:", fmpError.message);
      }
    }

    // YAHOO + GEMINI PATH (Indian stocks or FMP failures)
    dataSource = "gemini";

    const [yahooResult, geminiResult] = await Promise.allSettled([
      fetchYahooQuote(upper),
      fetchGeminiCombined(upper, geminiKey),
    ]);

    if (geminiResult.status !== "fulfilled") {
      // Gemini failed — check if we at least have Yahoo data
      const errMsg = geminiResult.reason?.message || "Unknown error";
      return Response.json(
        { error: `Could not fetch data for "${upper}": ${errMsg}` },
        { status: 404 }
      );
    }

    const combined = geminiResult.value;
    financials = combined.financials;
    gemini = combined.gemini;

    // Override with accurate Yahoo price data
    if (yahooResult.status === "fulfilled") {
      const yq = yahooResult.value;
      financials.profile.price = yq.price;
      financials.profile.change = yq.change;
      financials.profile.changePercent = yq.changePercent;
      financials.profile.companyName = yq.longName || yq.shortName || financials.profile.companyName;
      financials.profile.exchange = yq.exchangeName || financials.profile.exchange;
      financials.profile.currency = yq.currency || financials.profile.currency;
      financials.profile.currencySymbol = yq.currencySymbol || financials.profile.currencySymbol;
      financials.profile.isIndian = yq.isIndian;

      // Recalculate P/E with real price
      const latestEps = financials.latest?.eps || 0;
      if (yq.price && latestEps) {
        financials.profile.peRatio = yq.price / latestEps;
      }
    }

    return Response.json({ ticker: upper, financials, gemini, dataSource });
  } catch (e) {
    return Response.json({ error: "Server error: " + e.message }, { status: 500 });
  }
}
