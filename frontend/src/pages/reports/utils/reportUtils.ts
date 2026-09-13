import type { AgeBand, LifecycleAssetRecord, CustodyRecord, MaintenanceReportItem } from "../types";
import type { AssetResponse } from "../../../types/asset";

/**
 * Calculates asset age in years relative to the current date.
 * Returns null if purchaseDate is missing or invalid.
 */
export function calculateAssetAgeInYears(purchaseDateStr: string | null | undefined): number | null {
  if (!purchaseDateStr) return null;
  const purchase = new Date(purchaseDateStr);
  if (isNaN(purchase.getTime())) return null;
  const now = new Date();
  const diffMs = now.getTime() - purchase.getTime();
  if (diffMs < 0) return 0;
  return Number((diffMs / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1));
}

/**
 * Maps asset age in years to canonical non-overlapping age bands:
 *  0 <= age < 1 -> "0–<1 year"
 *  1 <= age < 3 -> "1–<3 years"
 *  3 <= age < 5 -> "3–<5 years"
 *  age >= 5     -> "5+ years"
 */
export function getAgeBand(ageYears: number | null): AgeBand {
  if (ageYears === null || isNaN(ageYears)) return "Unknown";
  if (ageYears < 1.0) return "0–<1 year";
  if (ageYears < 3.0) return "1–<3 years";
  if (ageYears < 5.0) return "3–<5 years";
  return "5+ years";
}

/**
 * Safely converts an array of headers and row tuples to a CSV download.
 */
export function exportToCsv(
  filename: string,
  headers: string[],
  rows: (string | number | null | undefined)[][]
): void {
  const sanitizeCell = (val: string | number | null | undefined): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const csvContent = [
    headers.map(sanitizeCell).join(","),
    ...rows.map((row) => row.map(sanitizeCell).join(",")),
  ].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Helper to format warranty status display
 */
export function getWarrantyStatus(expiryStr?: string | null): "Active" | "Expired" | "None" {
  if (!expiryStr) return "None";
  const exp = new Date(expiryStr);
  if (isNaN(exp.getTime())) return "None";
  return exp.getTime() >= Date.now() ? "Active" : "Expired";
}

/**
 * Normalizes and cleans department names for presentation and aggregation.
 * Strips generated timestamp suffixes and random test numbers (e.g. "IT Dept 1787595174157" -> "IT Dept",
 * "TestDept_2411" -> "Test Dept", "Dept_831526" -> "Dept").
 * Returns clean, human-readable department titles.
 */
export function cleanDepartmentName(rawName?: string | null): string {
  if (!rawName || !rawName.trim()) return "Unassigned";
  let cleaned = rawName.trim();

  // Strip trailing timestamps / random IDs (e.g., "IT Dept 1787595174157" -> "IT Dept")
  cleaned = cleaned.replace(/[\s_-]+\d{4,}$/, "");
  // Strip trailing hexadecimal hashes
  cleaned = cleaned.replace(/[\s_-]+[0-9a-fA-F]{6,}$/, "");
  // Replace underscores with spaces (e.g., "Test_Dept" -> "Test Dept")
  cleaned = cleaned.replace(/_/g, " ").trim();

  return cleaned || "General";
}
