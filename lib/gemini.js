const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const INDIAN_TICKERS = [
  "RELIANCE","TCS","INFY","HDFCBANK","ITC","WIPRO","BHARTIARTL","SBIN",
  "BAJFINANCE","MARUTI","LT","HCLTECH","SUNPHARMA","TITAN","AXISBANK",
  "KOTAKBANK","ADANIENT","ADANIPORTS","NTPC","POWERGRID","TATAMOTORS",
  "TATASTEEL","ONGC","COALINDIA","JSWSTEEL","HINDALCO","ICICIBANK","ASIANPAINT",
  "ULTRACEMCO","NESTLEIND","BAJAJFINSV","TECHM","DRREDDY","CIPLA","DIVISLAB",
  "HEROMOTOCO","EICHERMOT","BPCL","GRASIM","INDUSINDBK","TATACONSUM",
  "APOLLOHOSP","BRITANNIA","NTPC","POWERGRID","ONGC","COALINDIA","JSWSTEEL","HINDALCO",
];

function isIndian(ticker) {
  return INDIAN_TICKERS.includes(ticker.toUpperCase().trim());
}

function buildAnalysisPrompt(ticker, companyName, isIndian) {
  const currency = isIndian ? "INR (₹)" : "USD ($)";
  return `You are a senior equity research analyst. For the stock ticker "${ticker}" (${companyName || ticker}), generate a comprehensive research analysis.

Use ${currency} for all monetary values. Be specific with real numbers from public filings. Write authoritatively.

Respond with ONLY valid JSON (no markdown, no backticks, no preamble). Use this exact schema:

{
  "overview": "3-4 sentences about what the company does, CEO, HQ, key business segments, market position",
  "creditStrengths": [
    "Key strength 1 — one sentence",
    "Key strength 2 — one sentence",
    "Key strength 3 — one sentence",
    "Key strength 4 — one sentence"
  ],
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
    "period": "FY2025 or latest fiscal year",
    "sources": [
      {"item": "Cash and equivalents", "value": 67.2},
      {"item": "Undrawn committed RCF", "value": 10.0},
      {"item": "Operating cash flow (CFO)", "value": 111.5}
    ],
    "uses": [
      {"item": "Short-term debt maturities", "value": 10.8},
      {"item": "Bonds maturing within 12 months", "value": 5.2},
      {"item": "Capital expenditure", "value": 11.0},
      {"item": "Dividends", "value": 15.8},
      {"item": "Working capital needs", "value": 3.5}
    ]
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

function buildCombinedPrompt(ticker) {
  const indian = isIndian(ticker);
  const currency = indian ? "INR" : "USD";
  const sym = indian ? "₹" : "$";
  const filingSource = indian ? "BSE/NSE/MCA annual reports" : "SEC filings";

  return {
    prompt: `You are a senior equity research analyst and financial data specialist. For the stock ticker "${ticker}", provide BOTH financial data AND qualitative analysis in a single JSON response.

Use ${currency} (${sym}) for all monetary values. Pull real numbers from ${filingSource}. Be specific and accurate.

Respond with ONLY valid JSON (no markdown, no backticks, no preamble). Use this exact schema:

{
  "profile": {
    "companyName": "Full Company Name",
    "exchange": "${indian ? "NSE" : "NASDAQ"}",
    "sector": "Sector",
    "industry": "Industry",
    "price": 0,
    "change": 0,
    "changePercentage": 0,
    "marketCap": 0,
    "sharesOutstanding": total shares outstanding as a raw number,
    "trailingEps": trailing twelve month earnings per share as number
  },
  "years": [
    {
      "year": "2020 or 2021",
      "revenue": raw number,
      "operatingIncome": raw number,
      "depreciationAndAmortization": raw number,
      "interestExpense": raw number,
      "operatingCashFlow": raw number,
      "capitalExpenditure": positive raw number,
      "dividendsPaid": positive raw number,
      "changeInWorkingCapital": raw number,
      "totalDebt": raw number,
      "totalStockholdersEquity": raw number,
      "eps": number
    },
    ...4 more years up to the most recent fiscal year
  ],
  "overview": "3-4 sentences about what the company does, CEO, HQ, segments, market position",
  "creditStrengths": [
    "Key strength 1 — one sentence",
    "Key strength 2 — one sentence",
    "Key strength 3 — one sentence",
    "Key strength 4 — one sentence"
  ],
  "risks": [
    {"title": "Risk name", "description": "1-2 sentence explanation"},
    {"title": "Risk name", "description": "1-2 sentence explanation"},
    {"title": "Risk name", "description": "1-2 sentence explanation"},
    {"title": "Risk name", "description": "1-2 sentence explanation"}
  ],
  "bullCase": "3-4 sentences on why the stock could go up",
  "bearCase": "3-4 sentences on why the stock could go down",
  "thesis": "3-4 sentence investment thesis",
  "outlook": "Bullish" or "Neutral" or "Bearish",
  "news": [
    {"date": "MMM DD, YYYY", "headline": "text", "source": "publication", "url": "https://example.com"},
    {"date": "MMM DD, YYYY", "headline": "text", "source": "publication", "url": "https://example.com"},
    {"date": "MMM DD, YYYY", "headline": "text", "source": "publication", "url": "https://example.com"},
    {"date": "MMM DD, YYYY", "headline": "text", "source": "publication", "url": "https://example.com"}
  ],
  "segmentRevenue": [{"segment": "Name", "percentage": number}, ...],
  "geographyRevenue": [{"region": "Name", "percentage": number}, ...],
  "debtMaturity": [{"year": "2026", "bankLoans": number, "bonds": number}, ...5 entries],
  "liquidity": {
    "sources": {"cfo": number, "cash": number, "undrawnRCF": number},
    "uses": {"workingCapital": number, "capex": number, "dividends": number, "debtMaturity": number}
  },
  "peers": [{"name": "Company", "ticker": "TICK"}, ...3 entries]
}

All monetary values in years[] must be raw numbers in ${currency} (e.g. 1500000000000 for 1.5T ${sym}).
Debt maturity and liquidity values in billions.
Segment and geography percentages must sum to 100.
Return ONLY the JSON.`,
    isIndian: indian,
    currency,
    currencySymbol: sym,
  };
}

async function callGemini(prompt, apiKey) {
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
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

export async function fetchGeminiAnalysis(ticker, companyName, isInd, apiKey) {
  const prompt = buildAnalysisPrompt(ticker, companyName, isInd);
  const cleaned = await callGemini(prompt, apiKey);

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    return {
      overview: "AI analysis temporarily unavailable.", risks: [], bullCase: "",
      bearCase: "", thesis: "", outlook: "Neutral", news: [], segmentRevenue: [],
      geographyRevenue: [], debtMaturity: [], liquidity: { sources: {}, uses: {} }, peers: [],
    };
  }
}

export async function fetchGeminiCombined(ticker, apiKey) {
  const { prompt, isIndian: isInd, currency, currencySymbol: sym } = buildCombinedPrompt(ticker);
  const cleaned = await callGemini(prompt, apiKey);

  let raw;
  try {
    raw = JSON.parse(cleaned);
  } catch (e) {
    throw new Error("Failed to parse Gemini combined data");
  }

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

    return {
      year: y.year, revenue,
      revenueGrowth: i === 0 ? null : (prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : null),
      ebitda, ebitdaMargin: revenue > 0 ? (ebitda / revenue) * 100 : 0,
      cfo, fcf, capex, dividendsPaid, changeInWC, interestExpense,
      debtToEbitda: ebitda > 0 ? totalDebt / ebitda : 0,
      ebitdaToInterest: interestExpense > 0 ? ebitda / interestExpense : 0,
      ebitdaMinusCapexToInterest: interestExpense > 0 ? (ebitda - capex) / interestExpense : 0,
      debtToEquity: totalEquity > 0 ? totalDebt / totalEquity : 0,
      totalDebt, totalEquity, eps: y.eps || 0,
      ffo: cfo - changeInWC, wcChange: changeInWC,
    };
  });

  const latest = years[years.length - 1] || {};
  const price = raw.profile?.price || 0;

  const financials = {
    years,
    profile: {
      companyName: raw.profile?.companyName || ticker,
      exchange: raw.profile?.exchange || "NSE",
      sector: raw.profile?.sector || "",
      industry: raw.profile?.industry || "",
      description: "",
      marketCap: raw.profile?.marketCap || 0,
      sharesOutstanding: raw.profile?.sharesOutstanding || 0,
      trailingEps: raw.profile?.trailingEps || 0,
      price,
      peRatio: price && (raw.profile?.trailingEps || latest.eps) ? price / (raw.profile?.trailingEps || latest.eps) : 0,
      currency, currencySymbol: sym, isIndian: isInd,
      change: raw.profile?.change || 0,
      changePercent: raw.profile?.changePercentage || 0,
    },
    latest,
  };
const gemini = {
    overview: raw.overview || "",
    creditStrengths: raw.creditStrengths || [],
    risks: raw.risks || [],
    bullCase: raw.bullCase || "",
    bearCase: raw.bearCase || "",
    thesis: raw.thesis || "",
    outlook: raw.outlook || "Neutral",
    news: raw.news || [],
    segmentRevenue: raw.segmentRevenue || [],
    geographyRevenue: raw.geographyRevenue || [],
    debtMaturity: raw.debtMaturity || [],
    liquidity: raw.liquidity || { sources: {}, uses: {} },
    peers: raw.peers || [],
  };

  return { financials, gemini };
}
