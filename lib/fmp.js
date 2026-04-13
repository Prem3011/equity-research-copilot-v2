// Indian stock tickers that need .NS suffix for FMP
const INDIAN_TICKERS = [
  "RELIANCE", "TCS", "INFY", "HDFCBANK", "ITC", "WIPRO",
  "BHARTIARTL", "SBIN", "BAJFINANCE", "MARUTI", "LT",
  "HCLTECH", "SUNPHARMA", "TITAN", "AXISBANK", "KOTAKBANK",
  "ADANIENT", "ADANIPORTS", "NTPC", "POWERGRID", "TATAMOTORS",
  "TATASTEEL", "ONGC", "COALINDIA", "JSWSTEEL", "HINDALCO",
  "ICICIBANK", "ASIANPAINT", "ULTRACEMCO", "NESTLEIND",
  "BAJAJFINSV", "TECHM", "DRREDDY", "CIPLA", "DIVISLAB",
  "HEROMOTOCO", "EICHERMOT", "M&M", "BPCL", "GRASIM",
  "INDUSINDBK", "UPL", "TATACONSUM", "APOLLOHOSP", "BRITANNIA",
];

function mapTicker(ticker) {
  const upper = ticker.toUpperCase().trim();
  // Already has exchange suffix
  if (upper.includes(".")) return upper;
  // Check if Indian stock
  if (INDIAN_TICKERS.includes(upper)) return `${upper}.NS`;
  return upper;
}

function isIndianStock(ticker) {
  const upper = ticker.toUpperCase().trim();
  return upper.endsWith(".NS") || upper.endsWith(".BO") || INDIAN_TICKERS.includes(upper);
}

const FMP_BASE = "https://financialmodelingprep.com/api/v3";

async function fmpFetch(endpoint, apiKey) {
  const sep = endpoint.includes("?") ? "&" : "?";
  const url = `${FMP_BASE}${endpoint}${sep}apikey=${apiKey}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`FMP API error: ${res.status}`);
  return res.json();
}

export async function fetchFMPData(rawTicker, apiKey) {
  const ticker = mapTicker(rawTicker);
  const indian = isIndianStock(rawTicker);

  const [incomeArr, balanceArr, cashFlowArr, profileArr] = await Promise.all([
    fmpFetch(`/income-statement/${ticker}?limit=5`, apiKey),
    fmpFetch(`/balance-sheet-statement/${ticker}?limit=5`, apiKey),
    fmpFetch(`/cash-flow-statement/${ticker}?limit=5`, apiKey),
    fmpFetch(`/profile/${ticker}`, apiKey),
  ]);

  // FMP returns newest first — reverse to get chronological order
  const income = (incomeArr || []).reverse();
  const balance = (balanceArr || []).reverse();
  const cashFlow = (cashFlowArr || []).reverse();
  const profile = profileArr?.[0] || {};

  return {
    income,
    balance,
    cashFlow,
    profile,
    ticker,
    rawTicker: rawTicker.toUpperCase().trim(),
    isIndian: indian,
    currency: indian ? "INR" : "USD",
    currencySymbol: indian ? "₹" : "$",
  };
}
