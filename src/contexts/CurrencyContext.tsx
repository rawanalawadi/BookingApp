"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { Currency, CURRENCIES, getCurrency, formatWithCurrency } from "@/lib/currency"

interface CurrencyContextValue {
  currency: Currency
  setCurrencyCode: (code: string) => void
  format: (usdAmount: number) => string
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: CURRENCIES[0],
  setCurrencyCode: () => {},
  format: (n) => `$ ${n}`,
})

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(CURRENCIES[0])

  useEffect(() => {
    const saved = localStorage.getItem("ce_currency")
    if (saved) setCurrency(getCurrency(saved))
  }, [])

  function setCurrencyCode(code: string) {
    const c = getCurrency(code)
    setCurrency(c)
    localStorage.setItem("ce_currency", code)
  }

  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrencyCode, format: (n) => formatWithCurrency(n, currency) }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  return useContext(CurrencyContext)
}
