import { fetchFMPData } from "@/lib/fmp";
import { computeFinancials } from "@/lib/computeFinancials";
import { fetchGeminiAnalysis, fetchGeminiFinancials } from "@/lib/gemini";

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

    let financials;
    let dataSource = "fmp";

    // Step 1: Try FMP first
    try {
      const fmpData = await fetchFMPData(ticker, fmpKey);
      financials = computeFinancials(fmpData);
    } catch (e) {
      console.error("FMP failed:", e.message);

      // Step 1b: FMP failed (likely Indian stock 402) — use Gemini for financials
      try {
        const geminiFinData = await fetchGeminiFinancials(ticker, geminiKey);
        financials = geminiFinData;
        dataSource = "gemini";
      } catch (ge) {
        return Response.json(
          { error: `Could not fetch data for "${ticker}": FMP error: ${e.message}. Gemini fallback error: ${ge.message}` },
          { status: 404 }
        );
      }
    }

    // Step 2: Fetch Gemini qualitative analysis
    let gemini;
    try {
      gemini = await fetchGeminiAnalysis(
        ticker.toUpperCase().trim(),
        financials.profile?.companyName || ticker,
        financials.profile?.isIndian || false,
        geminiKey
      );
    } catch (e) {
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
      ticker: ticker.toUpperCase().trim(),
      financials,
      gemini,
      dataSource,
    });
  } catch (e) {
    return Response.json(
      { error: "Server error: " + e.message },
      { status: 500 }
    );
  }
}
