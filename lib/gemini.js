const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

function buildPrompt(ticker, companyName, isIndian) {
  const currency = isIndian ? "INR (₹)" : "USD ($)";
  return `You are a senior equity research analyst. For the stock ticker "${ticker}" (${companyName || ticker}), generate a comprehensive research analysis.

Use ${currency} for all monetary values. Be specific with real numbers from public filings. Write authoritatively.

Respond with ONLY valid JSON (no markdown, no backticks, no preamble). Use this exact schema:

{
  "overview": "3-4 sentences about what the company does, CEO, HQ, key business segments, market position",
  "risks": [
    {"title": "Risk name", "description": "1-2 sentence explanation"},
    {"title": "Risk name", "description": "1-2 sentence explanation"},
    {"title": "Risk name", "description": "1-2 sentence explanation"},
    {"title": "Risk name", "description": "1-2 sentence explanation"}
  ],
  "bullCase": "3-4 sentences on why the stock could go up",
  "bearCase": "3-4 sentences on why the stock could go down",
  "thesis": "3-4 sentence investment thesis with a clear conclusion",
  "outlook": "Bullish" or "Neutral" or "Bearish",
  "news": [
    {"date": "MMM DD, YYYY", "headline": "headline text", "source": "publication name", "url": "https://example.com"},
    {"date": "MMM DD, YYYY", "headline": "headline text", "source": "publication name", "url": "https://example.com"},
    {"date": "MMM DD, YYYY", "headline": "headline text", "source": "publication name", "url": "https://example.com"},
    {"date": "MMM DD, YYYY", "headline": "headline text", "source": "publication name", "url": "https://example.com"}
  ],
  "segmentRevenue": [
    {"segment": "Segment Name", "percentage": 45},
    {"segment": "Segment Name", "percentage": 30},
    {"segment": "Segment Name", "percentage": 15},
    {"segment": "Other", "percentage": 10}
  ],
  "geographyRevenue": [
    {"region": "Region Name", "percentage": 50},
    {"region": "Region Name", "percentage": 20},
    {"region": "Region Name", "percentage": 15},
    {"region": "Other", "percentage": 15}
  ],
  "debtMaturity": [
    {"year": "2026", "bankLoans": 2.5, "bonds": 1.8},
    {"year": "2027", "bankLoans": 3.0, "bonds": 2.2},
    {"year": "2028", "bankLoans": 2.0, "bonds": 3.5},
    {"year": "2029", "bankLoans": 1.5, "bonds": 2.8},
    {"year": "2030+", "bankLoans": 2.0, "bonds": 4.0}
  ],
  "liquidity": {
    "sources": {"cfo": 13.2, "cash": 8.4, "undrawnRCF": 5.0},
    "uses": {"workingCapital": -2.1, "capex": -8.1, "dividends": -0.9, "debtMaturity": -4.2}
  },
  "peers": [
    {"name": "Company Name", "ticker": "TICK"},
    {"name": "Company Name", "ticker": "TICK"},
    {"name": "Company Name", "ticker": "TICK"}
  ]
}

All number values in debt maturity and liquidity should be in billions (${currency}).
For news, use the most recent real headlines you can find with real source URLs.
Segment and geography percentages must sum to 100.
Return ONLY the JSON object, nothing else.`;
}

async function callGemini(prompt, apiKey) {
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
      thinkingConfig: { thinkingBudget: 0 },
    },
  };

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${res.status}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts
    ?.filter((p) => p.text)
    ?.map((p) => p.text)
    ?.join("") || "";

  return text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
}

export async function fetchGeminiAnalysis(ticker, companyName, isIndian, apiKey) {
  const prompt = buildPrompt(ticker, companyName, isIndian);
  const cleaned = await callGemini(prompt, apiKey);

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    return {
      overview: "AI analysis temporarily unavailable.",
      risks: [], bullCase: "", bearCase: "", thesis: "", outlook: "Neutral",
      news: [], segmentRevenue: [], geographyRevenue: [], debtMaturity: [],
      liquidity: { sources: {}, uses: {} }, peers: [],
    };
  }
}
