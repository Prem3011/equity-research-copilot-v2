export function computeFinancials(fmpData) {
  const { income, balance, cashFlow, profile, currency, currencySymbol, isIndian } = fmpData;

  const years = income.map((inc, i) => {
    const bal = balance[i] || {};
    const cf = cashFlow[i] || {};

    const revenue = inc.revenue || 0;
    const operatingIncome = inc.operatingIncome || 0;
    const depAmort = cf.depreciationAndAmortization || inc.depreciationAndAmortization || 0;
    const ebitda = operatingIncome + depAmort;
    const interestExpense = Math.abs(inc.interestExpense || 0);
    const cfo = cf.operatingCashFlow || 0;
    const capex = Math.abs(cf.capitalExpenditure || 0);
    const dividendsPaid = Math.abs(cf.dividendsPaid || 0);
    const changeInWC = cf.changeInWorkingCapital || 0;
    const fcf = cfo - capex;
    const totalDebt = bal.totalDebt || (bal.shortTermDebt || 0) + (bal.longTermDebt || 0);
    const totalEquity = bal.totalStockholdersEquity || 0;
    const eps = inc.eps || 0;
    const calendarYear = inc.calendarYear || inc.date?.substring(0, 4) || "";

    return {
      year: calendarYear,
      revenue,
      revenueGrowth: null,
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
      cash: bal.cashAndCashEquivalents || bal.cashAndShortTermInvestments || 0,
      shortTermDebt: bal.shortTermDebt || 0,
      shareRepurchases: Math.abs(cf.commonStockRepurchased || 0),
    };
  });

  for (let i = 0; i < years.length; i++) {
    if (i === 0) {
      years[i].revenueGrowth = null;
    } else {
      const prev = years[i - 1].revenue;
      years[i].revenueGrowth = prev > 0 ? ((years[i].revenue - prev) / prev) * 100 : null;
    }
  }

  const marketCap = profile.marketCap || 0;
  const price = profile.price || 0;
  const companyName = profile.companyName || "";
  const exchange = profile.exchange || profile.exchangeShortName || (isIndian ? "NSE" : "");
  const sector = profile.sector || "";
  const industry = profile.industry || "";
  const description = profile.description || "";
  const change = profile.change || 0;
  const changePercent = profile.changePercentage || 0;

  const latestEps = years.length > 0 ? years[years.length - 1].eps : 0;
  const peRatio = (price > 0 && latestEps > 0) ? price / latestEps : 0;

  const latest = years[years.length - 1] || {};

  return {
    years,
    profile: {
      companyName,
      exchange,
      sector,
      industry,
      description,
      marketCap,
      price,
      peRatio,
      currency,
      currencySymbol,
      isIndian,
      change,
      changePercent,
    },
    latest,
  };
}

export function formatNumber(num, decimals = 1) {
  if (num === null || num === undefined || isNaN(num)) return "-";
  const abs = Math.abs(num);
  const sign = num < 0 ? "-" : "";
  if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(decimals)}T`;
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(decimals)}B`;
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(decimals)}M`;
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(decimals)}K`;
  return `${sign}${abs.toFixed(decimals)}`;
}

export function formatPercent(num) {
  if (num === null || num === undefined || isNaN(num)) return "-";
  return `${num >= 0 ? "+" : ""}${num.toFixed(1)}%`;
}

export function formatRatio(num) {
  if (num === null || num === undefined || isNaN(num) || num === 0) return "-";
  return `${num.toFixed(1)}x`;
}

export function formatPrice(num, symbol = "$") {
  if (!num) return "-";
  return `${symbol}${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
