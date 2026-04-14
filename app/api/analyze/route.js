import { fetchFMPData } from "@/lib/fmp";
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

    // Step 1: Try FMP first
    try {
      const fmpData = await fetchFMPData(ticker, fmpKey);
      financials = computeFinancials(fmpData);

      // Step 2: FMP worked — fetch Gemini for qualitative analysis only (1 request)
      try {
        gemini = await fetchGeminiAnalysis(
          ticker.toUpperCase().trim(),
          financials.profile.companyName,
          financials.profile.isIndian,
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
    } catch (fmpError) {
      // Step 1b: FMP failed — use single combined Gemini call (1 request for everything)
      console.error("FMP failed, using Gemini combined:", fmpError.message);
      dataSource = "gemini";

      try {
        const combined = await fetchGeminiCombined(ticker.toUpperCase().trim(), geminiKey);
        financials = combined.financials;
        gemini = combined.gemini;
      } catch (ge) {
        return Response.json(
          { error: `Could not fetch data for "${ticker}": ${ge.message}` },
          { status: 404 }
        );
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
