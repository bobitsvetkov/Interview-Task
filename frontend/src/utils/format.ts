export function formatCurrency(value: number): string {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatCurrencyShort(value: number): string {
  return `$${(value / 1000).toFixed(0)}k`;
}

export function formatTooltipValue(value: number | undefined): [string, string] {
  return [`$${(value ?? 0).toLocaleString()}`, "Sales"];
}
