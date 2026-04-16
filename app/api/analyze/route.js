import { fetchFMPData, isKnownIndianTicker } from "@/lib/fmp";
import { computeFinancials } from "@/lib/computeFinancials";
import { fetchGeminiAnalysis, fetchGeminiCombined } from "@/lib/gemini";
import { fetchYahooQuote } from "@/lib/yahoo";

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
      // US STOCKS: FMP for financials + Gemini for analysis
      try {
        const fmpData = await fetchFMPData(upper, fmpKey);
        if (!fmpData.income?.length && !fmpData.profile?.companyName) {
          throw new Error("No FMP data");
        }
        financials = computeFinancials(fmpData);
        dataSource = "fmp";

        try {
          gemini = await fetchGeminiAnalysis(upper, financials.profile.companyName, false, geminiKey);
        } catch (ge) {
          gemini = {
            overview: "AI analysis temporarily unavailable: " + ge.message,
            risks: [], bullCase: "", bearCase: "", thesis: "", outlook: "Neutral",
            news: [], segmentRevenue: [], geographyRevenue: [], debtMaturity: [],
            liquidity: { sources: {}, uses: {} }, peers: [],
          };
        }
      } catch (fmpError) {
        // FMP failed — fall through to Gemini combined
        console.log("FMP failed for", upper, "- trying Gemini combined:", fmpError.message);
        dataSource = "gemini";

        const [yahooResult, geminiResult] = await Promise.allSettled([
          fetchYahooQuote(upper),
          fetchGeminiCombined(upper, geminiKey),
        ]);

        if (geminiResult.status !== "fulfilled") {
          return Response.json({ error: `Could not fetch data for "${upper}": ${geminiResult.reason?.message}` }, { status: 404 });
        }

        financials = geminiResult.value.financials;
        gemini = geminiResult.value.gemini;

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
          const eps = financials.profile.trailingEps || financials.latest?.eps || 0;
          const shares = financials.profile.sharesOutstanding || 0;
          if (yq.price && eps) financials.profile.peRatio = yq.price / eps;
          if (yq.price && shares) financials.profile.marketCap = yq.price * shares;
        }
      }

     // Fix liquidity period to match real FMP data year
      if (dataSource === "fmp" && financials?.years?.length && gemini?.liquidity) {
        gemini.liquidity.period = `FY${financials.years[financials.years.length - 1]?.year}`;
      }
      return Response.json({ ticker: upper, financials, gemini, dataSource });
    }

    // INDIAN STOCKS: Yahoo for price + Gemini combined for financials & analysis
    dataSource = "gemini";

    const [yahooResult, geminiResult] = await Promise.allSettled([
      fetchYahooQuote(upper),
      fetchGeminiCombined(upper, geminiKey),
    ]);

    if (geminiResult.status !== "fulfilled") {
      return Response.json({ error: `Could not fetch data for "${upper}": ${geminiResult.reason?.message}` }, { status: 404 });
    }

    financials = geminiResult.value.financials;
    gemini = geminiResult.value.gemini;

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
      const eps = financials.profile.trailingEps || financials.latest?.eps || 0;
      const shares = financials.profile.sharesOutstanding || 0;
      if (yq.price && eps) financials.profile.peRatio = yq.price / eps;
      if (yq.price && shares) financials.profile.marketCap = yq.price * shares;
    }

    return Response.json({ ticker: upper, financials, gemini, dataSource });
  } catch (e) {
    return Response.json({ error: "Server error: " + e.message }, { status: 500 });
  }
}
