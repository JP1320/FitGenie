export function formatCurrency(value: number, locale = "en-US", currency = "USD") {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
}

export function formatSizeLabel(size: string, system: "US" | "UK" | "EU" | "IN") {
  return `${system} ${size}`;
}
