export const formatCurrency = (amount: number, currency: string = 'MYR'): string => {
  return `RM ${amount.toLocaleString('en-MY', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

export const formatCurrencyDecimal = (amount: number): string => {
  return `RM ${amount.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
