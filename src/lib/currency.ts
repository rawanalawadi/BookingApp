export interface Currency {
  code: string
  symbol: string
  name: string
  rate: number // relative to USD
}

export const CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$",    name: "US Dollar",        rate: 1      },
  { code: "SAR", symbol: "SAR", name: "Saudi Riyal",      rate: 3.75   },
  { code: "AED", symbol: "AED", name: "UAE Dirham",       rate: 3.67   },
  { code: "KWD", symbol: "KWD", name: "Kuwaiti Dinar",    rate: 0.31   },
  { code: "BHD", symbol: "BHD", name: "Bahraini Dinar",   rate: 0.38   },
  { code: "QAR", symbol: "QAR", name: "Qatari Riyal",     rate: 3.64   },
  { code: "OMR", symbol: "OMR", name: "Omani Rial",       rate: 0.38   },
  { code: "EUR", symbol: "€",   name: "Euro",             rate: 0.92   },
  { code: "GBP", symbol: "£",   name: "British Pound",    rate: 0.79   },
]

export function getCurrency(code: string): Currency {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0]
}

export function convertFromUSD(usdAmount: number, currency: Currency): number {
  return usdAmount * currency.rate
}

export function formatWithCurrency(usdAmount: number, currency: Currency): string {
  const amount = convertFromUSD(usdAmount, currency)
  const decimals = ["KWD", "BHD", "OMR"].includes(currency.code) ? 3 : 0
  return `${currency.symbol} ${amount.toFixed(decimals)}`
}
