import { fetchFMPData, isKnownIndianTicker } from "@/lib/fmp";
import { computeFinancials } from "@/lib/computeFinancials";
import { fetchGeminiAnalysis } from "@/lib/gemini";
import { fetchYahooQuote, fetchYahooFinancials } from "@/lib/yahoo";

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
      // US STOCKS: FMP for financials
      try {
        const fmpData = await fetchFMPData(upper, fmpKey);
        if (!fmpData.income?.length && !fmpData.profile?.companyName) {
          throw new Error("No FMP data");
        }
        financials = computeFinancials(fmpData);
        dataSource = "fmp";
      } catch (fmpError) {
        // FMP failed — try Yahoo (might be an Indian stock not in our list)
        console.log("FMP failed for", upper, "- trying Yahoo:", fmpError.message);
        try {
          const [yahooQuote, yahooFin] = await Promise.all([
            fetchYahooQuote(upper),
            fetchYahooFinancials(upper),
          ]);

          financials = {
            years: yahooFin.years,
            profile: {
              companyName: yahooQuote.longName || yahooQuote.shortName || upper,
              exchange: yahooQuote.exchangeName,
              sector: "", industry: "", description: "",
              marketCap: 0, price: yahooQuote.price,
              peRatio: yahooQuote.price && yahooFin.latestEps ? yahooQuote.price / yahooFin.latestEps : 0,
              currency: yahooQuote.currency,
              currencySymbol: yahooQuote.currencySymbol,
              isIndian: yahooQuote.isIndian,
              change: yahooQuote.change,
              changePercent: yahooQuote.changePercent,
            },
            latest: yahooFin.years[yahooFin.years.length - 1] || {},
          };
          dataSource = "yahoo";
        } catch (yahooError) {
          return Response.json({ error: `Could not fetch data for "${upper}": ${yahooError.message}` }, { status: 404 });
        }
      }
    } else {
      // INDIAN STOCKS: Yahoo for both price and financials
      dataSource = "yahoo";
      try {
        const [yahooQuote, yahooFin] = await Promise.all([
          fetchYahooQuote(upper),
          fetchYahooFinancials(upper),
        ]);

        financials = {
          years: yahooFin.years,
          profile: {
            companyName: yahooQuote.longName || yahooQuote.shortName || upper,
            exchange: yahooQuote.exchangeName,
            sector: "", industry: "", description: "",
            marketCap: 0, price: yahooQuote.price,
            peRatio: yahooQuote.price && yahooFin.latestEps ? yahooQuote.price / yahooFin.latestEps : 0,
            currency: yahooQuote.currency,
            currencySymbol: yahooQuote.currencySymbol,
            isIndian: yahooQuote.isIndian,
            change: yahooQuote.change,
            changePercent: yahooQuote.changePercent,
          },
          latest: yahooFin.years[yahooFin.years.length - 1] || {},
        };
      } catch (e) {
        return Response.json({ error: `Could not fetch data for "${upper}": ${e.message}` }, { status: 404 });
      }
    }

    // GEMINI: qualitative analysis only (1 request for ALL stocks)
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
