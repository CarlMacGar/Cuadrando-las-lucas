export function getPreviousMonthKey(): string {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth(); // Enero es 0

  if (month === 0) {
    month = 12;
    year -= 1;
  }

  const formattedMonth = String(month).padStart(2, "0");
  return `${year}-${formattedMonth}`;
}

export function getLastDecemberKey(): string {
  const now = new Date();
  const year = now.getFullYear() - 1;
  return `${year}-12`;
}

export function getAnnualReportKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-anual`;
}