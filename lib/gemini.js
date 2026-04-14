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

function buildFinancialsPrompt(ticker) {
  const isIndian = ["RELIANCE","TCS","INFY","HDFCBANK","ITC","WIPRO","BHARTIARTL","SBIN","BAJFINANCE","MARUTI","LT","HCLTECH","SUNPHARMA","TITAN","AXISBANK","KOTAKBANK","ADANIENT","TATAMOTORS","TATASTEEL","ICICIBANK"].includes(ticker.toUpperCase().trim());
  const currency = isIndian ? "INR" : "USD";
  const currencySymbol = isIndian ? "₹" : "$";

  return {
    prompt: `You are a financial data analyst. For the stock ticker "${ticker}", provide 5 years of annual financial data from the most recent public filings.

Use ${currency} for all values. Be as accurate as possible using real annual report data.

Respond with ONLY valid JSON (no markdown, no backticks). Use this exact schema:

{
  "companyName": "Full Company Name",
  "exchange": "${isIndian ? "NSE" : "NASDAQ"}",
  "sector": "Sector name",
  "industry": "Industry name",
  "price": current stock price as number,
  "change": daily price change as number,
  "changePercentage": daily change percentage as number,
  "marketCap": market cap in raw number (not abbreviated),
  "years": [
    {
      "year": "2021",
      "revenue": revenue in raw number,
      "operatingIncome": operating income in raw number,
      "depreciationAndAmortization": D&A in raw number,
      "interestExpense": interest expense in raw number,
      "operatingCashFlow": CFO in raw number,
      "capitalExpenditure": capex in raw number (positive number),
      "dividendsPaid": dividends in raw number (positive number),
      "changeInWorkingCapital": working capital change in raw number,
      "totalDebt": total debt in raw number,
      "totalStockholdersEquity": total equity in raw number,
      "eps": earnings per share as number
    },
    {"year": "2022", ...same fields...},
    {"year": "2023", ...same fields...},
    {"year": "2024", ...same fields...},
    {"year": "2025", ...same fields...}
  ]
}

Use real numbers from annual reports filed with ${isIndian ? "BSE/NSE/MCA" : "SEC"}. All monetary values should be in ${currency} (not millions or billions — use raw numbers like 1500000000000 for 1.5 trillion ${currencySymbol}).
Return ONLY the JSON object.`,
    isIndian,
    currency,
    currencySymbol,
  };
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
      overview: "AI analysis temporarily unavailable. Please try again.",
      risks: [], bullCase: "", bearCase: "", thesis: "", outlook: "Neutral",
      news: [], segmentRevenue: [], geographyRevenue: [], debtMaturity: [],
      liquidity: { sources: {}, uses: {} }, peers: [],
    };
  }
}

export async function fetchGeminiFinancials(ticker, apiKey) {
  const { prompt, isIndian, currency, currencySymbol } = buildFinancialsPrompt(ticker);
  const cleaned = await callGemini(prompt, apiKey);

  let raw;
  try {
    raw = JSON.parse(cleaned);
  } catch (e) {
    throw new Error("Failed to parse Gemini financial data");
  }

  // Transform Gemini response into the same format as computeFinancials output
  const years = (raw.years || []).map((y, i, arr) => {
    const revenue = y.revenue || 0;
    const operatingIncome = y.operatingIncome || 0;
    const depAmort = y.depreciationAndAmortization || 0;
    const ebitda = operatingIncome + depAmort;
    const interestExpense = Math.abs(y.interestExpense || 0);
    const cfo = y.operatingCashFlow || 0;
    const capex = Math.abs(y.capitalExpenditure || 0);
    const dividendsPaid = Math.abs(y.dividendsPaid || 0);
    const changeInWC = y.changeInWorkingCapital || 0;
    const fcf = cfo - capex;
    const totalDebt = y.totalDebt || 0;
    const totalEquity = y.totalStockholdersEquity || 0;

    const prevRevenue = i > 0 ? (arr[i - 1].revenue || 0) : 0;
    const revenueGrowth = i === 0 ? null : (prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : null);

    return {
      year: y.year,
      revenue,
      revenueGrowth,
      ebitda,
      ebitdaMargin: revenue > 0 ? (ebitda / revenue) * 100 : 0,
      cfo,
      fcf,
      capex,
      dividendsPaid,
      changeInWC,
      interestExpense,
      debtToEbitda: ebitda > 0 ? totalDebt / ebitda : 0,
      ebitdaToInterest: interestExpense > 0 ? ebitda / interestExpense : 0,
      ebitdaMinusCapexToInterest: interestExpense > 0 ? (ebitda - capex) / interestExpense : 0,
      debtToEquity: totalEquity > 0 ? totalDebt / totalEquity : 0,
      totalDebt,
      totalEquity,
      eps: y.eps || 0,
      ffo: cfo - changeInWC,
      wcChange: changeInWC,
    };
  });

  const latest = years[years.length - 1] || {};
  const price = raw.price || 0;

  return {
    years,
    profile: {
      companyName: raw.companyName || ticker,
      exchange: raw.exchange || "NSE",
      sector: raw.sector || "",
      industry: raw.industry || "",
      description: "",
      marketCap: raw.marketCap || 0,
      price,
      peRatio: price && latest.eps ? price / latest.eps : 0,
      currency,
      currencySymbol,
      isIndian,
      change: raw.change || 0,
      changePercent: raw.changePercentage || 0,
    },
    latest,
  };
}
