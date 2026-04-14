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
      thinkingConfig: { think
