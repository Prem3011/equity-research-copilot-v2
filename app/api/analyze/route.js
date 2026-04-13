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
        { error: "API keys not configured" },
        { status: 500 }
      );
    }

    // Step 1: Fetch FMP data first (we need company name for Gemini)
    let fmpData;
    try {
      fmpData = await fetchFMPData(ticker, fmpKey);
    } catch (e) {
      console.error("FMP error:", e.message);
      return Response.json(
        { error: `Could not fetch financial data for "${ticker}". Check if the ticker is valid.` },
        { status: 404 }
      );
    }

    // Step 2: Compute financial metrics
    const financials = computeFinancials(fmpData);

    // Step 3: Fetch Gemini analysis (can happen after we have the company name)
    let gemini;
    try {
      gemini = await fetchGeminiAnalysis(
        fmpData.rawTicker,
        financials.profile.companyName,
        fmpData.isIndian,
        geminiKey
      );
    } catch (e) {
      console.error("Gemini error:", e.message);
      // Non-fatal — return financials with empty AI analysis
      gemini = {
        overview: "AI analysis temporarily unavailable.",
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
    console.error("API route error:", e);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
