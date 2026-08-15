const INDONESIAN_MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function formatPlanningDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
  if (!match) return "-";

  const [, year, month, day] = match;
  const monthLabel = INDONESIAN_MONTHS[Number(month) - 1];
  if (!monthLabel) return "-";

  return `${Number(day)} ${monthLabel} ${year}`;
}
