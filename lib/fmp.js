const INDIAN_TICKERS = [
  "RELIANCE","TCS","INFY","HDFCBANK","ITC","WIPRO","BHARTIARTL","SBIN",
  "BAJFINANCE","MARUTI","LT","HCLTECH","SUNPHARMA","TITAN","AXISBANK",
  "KOTAKBANK","ADANIENT","ADANIPORTS","NTPC","POWERGRID","TATAMOTORS",
  "TATASTEEL","ONGC","COALINDIA","JSWSTEEL","HINDALCO","ICICIBANK",
  "ASIANPAINT","ULTRACEMCO","NESTLEIND","BAJAJFINSV","TECHM","DRREDDY",
  "CIPLA","DIVISLAB","HEROMOTOCO","EICHERMOT","BPCL","GRASIM",
  "INDUSINDBK","UPL","TATACONSUM","APOLLOHOSP","BRITANNIA",
];

function mapTicker(ticker) {
  const upper = ticker.toUpperCase().trim();
  if (upper.includes(".")) return upper;
  if (INDIAN_TICKERS.includes(upper)) return `${upper}.NS`;
  return upper;
}

export function isIndianStock(ticker) {
  const upper = ticker.toUpperCase().trim();
  return upper.endsWith(".NS") || upper.endsWith(".BO") || INDIAN_TICKERS.includes(upper);
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
  const ticker = mapTicker(rawTicker);
  const indian = isIndianStock(rawTicker);

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
    rawTicker: rawTicker.toUpperCase().trim(),
    isIndian: indian,
    currency: indian ? "INR" : "USD",
    currencySymbol: indian ? "₹" : "$",
  };
}

export async function fetchYahooQuote(ticker) {
  const symbol = ticker.toUpperCase().trim();
  const ySymbol = INDIAN_TICKERS.includes(symbol) ? `${symbol}.NS` : symbol;

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ySymbol}?range=1d&interval=1d`;
  const res = await fetch(url);

  if (!res.ok) throw new Error(`Yahoo Finance error: ${res.status}`);

  const data = await res.json();
  const meta = data?.chart?.result?.[0]?.meta;

  if (!meta) throw new Error("No Yahoo Finance data");

  return {
    price: meta.regularMarketPrice || 0,
    previousClose: meta.chartPreviousClose || meta.previousClose || 0,
    change: (meta.regularMarketPrice || 0) - (meta.chartPreviousClose || 0),
    changePercent: meta.chartPreviousClose
      ? (((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100)
      : 0,
    currency: meta.currency || "INR",
    exchangeName: meta.fullExchangeName || "NSE",
    shortName: meta.shortName || "",
    longName: meta.longName || "",
    fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh || 0,
    fiftyTwoWeekLow: meta.fiftyTwoWeekLow || 0,
    regularMarketVolume: meta.regularMarketVolume || 0,
  };
}
