import { createContext, useContext, useMemo, useState } from "react";

export const currencies = {
  ALL: { label: "Albanian lek", rate: 1, locale: "sq-AL" },
  EUR: { label: "Euro", rate: 0.0097, locale: "de-DE" },
  USD: { label: "US dollar", rate: 0.0105, locale: "en-US" },
  GBP: { label: "British pound", rate: 0.0083, locale: "en-GB" }
};

const CurrencyContext = createContext(null);

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => localStorage.getItem("currency") || "ALL");

  const changeCurrency = (nextCurrency) => {
    setCurrency(nextCurrency);
    localStorage.setItem("currency", nextCurrency);
  };

  const formatCurrency = (amountInLek) => {
    const details = currencies[currency] || currencies.ALL;
    const convertedAmount = Number(amountInLek || 0) * details.rate;

    return new Intl.NumberFormat(details.locale, {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "ALL" ? 0 : 2
    }).format(convertedAmount);
  };

  const value = useMemo(
    () => ({
      currency,
      currencies,
      setCurrency: changeCurrency,
      formatCurrency
    }),
    [currency]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = () => useContext(CurrencyContext);
