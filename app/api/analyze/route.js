import { fetchFMPData } from "@/lib/fmp";
import { computeFinancials } from "@/lib/computeFinancials";
import { fetchGeminiAnalysis } from "@/lib/gemini";

export async function POST(request) {
  try {
    const { ticker } = await request.json();

    if (!ticker || typeof ticker !== "string") {
      return Response.json({ error: "Ticker is required" }, { status: 400 });
    }

    const fmpKey = process.env.FMP_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!fmpKey || !geminiKey) {
      return Response.json(
        { error: "API keys not configured. FMP: " + !!fmpKey + ", Gemini: " + !!geminiKey },
        { status: 500 }
      );
    }

    // Step 1: Fetch FMP data
    let fmpData;
    try {
      fmpData = await fetchFMPData(ticker, fmpKey);
    } catch (e) {
      return Response.json(
        { error: `FMP error for "${ticker}": ${e.message}` },
        { status: 404 }
      );
    }

    // Step 2: Compute financial metrics
    const financials = computeFinancials(fmpData);

    // Step 3: Fetch Gemini analysis
    let gemini;
    try {
      gemini = await fetchGeminiAnalysis(
        fmpData.rawTicker,
        financials.profile.companyName,
        fmpData.isIndian,
        geminiKey
      );
    } catch (e) {
      // Return the actual Gemini error to the frontend for debugging
      gemini = {
        overview: "Gemini error: " + e.message,
        risks: [],
        bullCase: "",
        bearCase: "",
        thesis: "",
        outlook: "Neutral",
        news: [],
        segmentRevenue: [],
        geographyRevenue: [],
        debtMaturity: [],
        liquidity: { sources: {}, uses: {} },
        peers: [],
      };
    }

    return Response.json({
      ticker: fmpData.rawTicker,
      fmpTicker: fmpData.ticker,
      financials,
      gemini,
    });
  } catch (e) {
    return Response.json(
      { error: "Server error: " + e.message },
      { status: 500 }
    );
  }
}
