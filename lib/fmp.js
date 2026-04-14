const COMMON_INDIAN = [
  "RELIANCE","TCS","INFY","HDFCBANK","ITC","WIPRO","BHARTIARTL","SBIN",
  "BAJFINANCE","MARUTI","LT","HCLTECH","SUNPHARMA","TITAN","AXISBANK",
  "KOTAKBANK","ADANIENT","ADANIPORTS","NTPC","POWERGRID","TATAMOTORS",
  "TATASTEEL","ONGC","COALINDIA","JSWSTEEL","HINDALCO","ICICIBANK",
  "ASIANPAINT","ULTRACEMCO","NESTLEIND","BAJAJFINSV","TECHM","DRREDDY",
  "CIPLA","DIVISLAB","HEROMOTOCO","EICHERMOT","BPCL","GRASIM",
  "INDUSINDBK","UPL","TATACONSUM","APOLLOHOSP","BRITANNIA",
];

export function isKnownIndianTicker(ticker) {
  const upper = ticker.toUpperCase().trim();
  return upper.endsWith(".NS") || upper.endsWith(".BO") || COMMON_INDIAN.includes(upper);
}

const FMP_BASE = "https://financialmodelingprep.com/stable";

async function fmpFetch(endpoint, params, apiKey) {
  const query = new URLSearchParams({ ...params, apikey: apiKey });
  const url = `${FMP_BASE}${endpoint}?${query}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`FMP API error: ${res.status}`);
  return res.json();
}

export async function fetchFMPData(rawTicker, apiKey) {
  const upper = rawTicker.toUpperCase().trim();
  const ticker = upper.includes(".") ? upper : upper;

  const [incomeArr, balanceArr, cashFlowArr, profileArr] = await Promise.all([
    fmpFetch("/income-statement", { symbol: ticker, limit: 5 }, apiKey),
    fmpFetch("/balance-sheet-statement", { symbol: ticker, limit: 5 }, apiKey),
    fmpFetch("/cash-flow-statement", { symbol: ticker, limit: 5 }, apiKey),
    fmpFetch("/profile", { symbol: ticker }, apiKey),
  ]);

  const income = (incomeArr || []).reverse();
  const balance = (balanceArr || []).reverse();
  const cashFlow = (cashFlowArr || []).reverse();
  const profile = profileArr?.[0] || {};

  return {
    income, balance, cashFlow, profile, ticker,
    rawTicker: upper,
    isIndian: false,
    currency: "USD",
    currencySymbol: "$",
  };
}

export async function fetchYahooQuote(ticker) {
  const upper = ticker.toUpperCase().trim();

  // Try with .NS first if no suffix, then without
  const candidates = [];
  if (upper.includes(".")) {
    candidates.push(upper);
  } else {
    candidates.push(`${upper}.NS`);
    candidates.push(upper);
  }

  for (const symbol of candidates) {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1d&interval=1d`;
      const res = await fetch(url);
      if (!res.ok) continue;

      const data = await res.json();
      const meta = data?.chart?.result?.[0]?.meta;
      if (!meta || !meta.regularMarketPrice) continue;

      const isIndian = meta.currency === "INR";

      return {
        price: meta.regularMarketPrice || 0,
        previousClose: meta.chartPreviousClose || meta.previousClose || 0,
        change: (meta.regularMarketPrice || 0) - (meta.chartPreviousClose || 0),
        changePercent: meta.chartPreviousClose
          ? (((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100)
          : 0,
        currency: meta.currency || "INR",
        currencySymbol: isIndian ? "₹" : "$",
        exchangeName: meta.fullExchangeName || (isIndian ? "NSE" : ""),
        shortName: meta.shortName || "",
        longName: meta.longName || "",
        symbol: symbol,
        isIndian,
      };
    } catch (e) {
      continue;
    }
  }

  throw new Error("Yahoo Finance: no data found");
}
