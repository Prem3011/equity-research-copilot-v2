const YAHOO_CHART = "https://query1.finance.yahoo.com/v8/finance/chart";
const YAHOO_FUNDAMENTALS = "https://query1.finance.yahoo.com/ws/fundamentals-timeseries/v1/finance/timeseries";

const TYPES = [
  "annualTotalRevenue",
  "annualEbitda",
  "annualFreeCashFlow",
  "annualOperatingCashFlow",
  "annualCapitalExpenditure",
  "annualTotalDebt",
  "annualStockholdersEquity",
  "annualBasicEPS",
  "annualInterestExpense",
  "annualDepreciationAndAmortization",
  "annualNetIncome",
].join(",");

function getYahooSymbol(ticker) {
  const upper = ticker.toUpperCase().trim();
  if (upper.includes(".")) return upper;
  return `${upper}.NS`;
}

export async function fetchYahooQuote(ticker) {
  const symbol = getYahooSymbol(ticker);
  const url = `${YAHOO_CHART}/${symbol}?range=1d&interval=1d`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Yahoo chart error: ${res.status}`);

  const data = await res.json();
  const meta = data?.chart?.result?.[0]?.meta;
  if (!meta?.regularMarketPrice) throw new Error("No Yahoo price data");

  return {
    price: meta.regularMarketPrice,
    previousClose: meta.chartPreviousClose || 0,
    change: meta.regularMarketPrice - (meta.chartPreviousClose || 0),
    changePercent: meta.chartPreviousClose
      ? ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100
      : 0,
    currency: meta.currency || "INR",
    currencySymbol: meta.currency === "INR" ? "₹" : "$",
    exchangeName: meta.fullExchangeName || "NSE",
    longName: meta.longName || "",
    shortName: meta.shortName || "",
    isIndian: meta.currency === "INR",
  };
}

export async function fetchYahooFinancials(ticker) {
  const symbol = getYahooSymbol(ticker);
  const now = Math.floor(Date.now() / 1000);
  const fiveYearsAgo = now - 5 * 365 * 24 * 3600;

  const url = `${YAHOO_FUNDAMENTALS}/${symbol}?type=${TYPES}&period1=${fiveYearsAgo}&period2=${now}&merge=false`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Yahoo fundamentals error: ${res.status}`);

  const data = await res.json();
  const results = data?.timeseries?.result;
  if (!results?.length) throw new Error("No Yahoo fundamentals data");

  // Parse each metric into a map of { date -> value }
  const metrics = {};
  for (const series of results) {
    const type = series.meta?.type?.[0];
    if (!type || !series[type]) continue;

    for (const entry of series[type]) {
      const date = entry.asOfDate;
      if (!date) continue;
      const year = date.substring(0, 4);
      const fiscalKey = `${year}-${date.substring(5, 7)}`;

      if (!metrics[fiscalKey]) metrics[fiscalKey] = { date, year };
      metrics[fiscalKey][type] = entry.reportedValue?.raw || 0;
    }
  }

  // Sort by date and take last 5 years
  const sorted = Object.values(metrics)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-5);

  // Build years array matching our standard format
  const years = sorted.map((m, i, arr) => {
    const revenue = m.annualTotalRevenue || 0;
    const ebitda = m.annualEbitda || 0;
    const cfo = m.annualOperatingCashFlow || 0;
    const capex = Math.abs(m.annualCapitalExpenditure || 0);
    const fcf = m.annualFreeCashFlow || cfo - capex;
    const totalDebt = m.annualTotalDebt || 0;
    const totalEquity = m.annualStockholdersEquity || 0;
    const interestExpense = Math.abs(m.annualInterestExpense || 0);
    const depAmort = m.annualDepreciationAndAmortization || 0;
    const eps = m.annualBasicEPS || 0;
    const dividendsPaid = 0; // not available in this endpoint
    const changeInWC = cfo - (m.annualNetIncome || 0) - depAmort; // approximate

    const prevRevenue = i > 0 ? (arr[i - 1].annualTotalRevenue || 0) : 0;

    return {
      year: m.year,
      revenue,
      revenueGrowth: i === 0 ? null : (prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : null),
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
      eps,
      ffo: cfo - changeInWC,
      wcChange: changeInWC,
    };
  });

  return { years, latestEps: years[years.length - 1]?.eps || 0 };
}
