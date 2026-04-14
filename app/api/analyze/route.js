import { fetchFMPData, isKnownIndianTicker } from "@/lib/fmp";
import { computeFinancials } from "@/lib/computeFinancials";
import { fetchGeminiAnalysis } from "@/lib/gemini";
import { fetchYahooQuote, fetchYahooFinancials } from "@/lib/yahoo";

function buildYahooFinancials(yahooQuote, yahooFin, ticker) {
  const latest = yahooFin.years[yahooFin.years.length - 1] || {};
  const price = yahooQuote.price || 0;
  const eps = yahooFin.latestEps || latest.eps || 0;

  return {
    years: yahooFin.years,
    profile: {
      companyName: yahooQuote.longName || yahooQuote.shortName || ticker,
      exchange: yahooQuote.exchangeName || "NSE",
      sector: "",
      industry: "",
      description: "",
      marketCap: yahooFin.latestMarketCap || 0,
      price,
      peRatio: price && eps ? price / eps : 0,
      currency: yahooQuote.currency || "INR",
      currencySymbol: yahooQuote.currencySymbol || "₹",
      isIndian: yahooQuote.isIndian || false,
      change: yahooQuote.change || 0,
      changePercent: yahooQuote.changePercent || 0,
    },
    latest,
  };
}

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
    const knownIndian = isKnownIndianTicker(upper);

    if (!knownIndian) {
      // US STOCKS: try FMP first
      try {
        const fmpData = await fetchFMPData(upper, fmpKey);
        if (!fmpData.income?.length && !fmpData.profile?.companyName) {
          throw new Error("No FMP data");
        }
        financials = computeFinancials(fmpData);
        dataSource = "fmp";
      } catch (fmpError) {
        // FMP failed — try Yahoo (might be Indian stock not in our list, or other exchange)
        console.log("FMP failed for", upper, "trying Yahoo:", fmpError.message);
        try {
          const [yahooQuote, yahooFin] = await Promise.all([
            fetchYahooQuote(upper),
            fetchYahooFinancials(upper),
          ]);
          financials = buildYahooFinancials(yahooQuote, yahooFin, upper);
          dataSource = "yahoo";
        } catch (yahooError) {
          return Response.json(
            { error: `Could not fetch data for "${upper}": FMP: ${fmpError.message}, Yahoo: ${yahooError.message}` },
            { status: 404 }
          );
        }
      }
    } else {
      // INDIAN STOCKS: Yahoo for price + financials
      dataSource = "yahoo";
      try {
        const [yahooQuote, yahooFin] = await Promise.all([
          fetchYahooQuote(upper),
          fetchYahooFinancials(upper),
        ]);
        financials = buildYahooFinancials(yahooQuote, yahooFin, upper);
      } catch (e) {
        return Response.json(
          { error: `Could not fetch Indian stock data for "${upper}": ${e.message}` },
          { status: 404 }
        );
      }
    }

    // GEMINI: qualitative analysis only (1 call for all stocks)
    try {
      gemini = await fetchGeminiAnalysis(
        upper,
        financials.profile.companyName,
        financials.profile.isIndian || false,
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
  } catch (e) {
    return Response.json({ error: "Server error: " + e.message }, { status: 500 });
  }
}
