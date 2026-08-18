export function normalizeIntegerQuantity(value) {
  if (value === null || value === undefined || value === "") return "0";
  const quantity = Number(value);
  return Number.isFinite(quantity) && quantity >= 0
    ? String(Math.round(quantity))
    : "0";
}
