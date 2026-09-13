import type { ReportTabId, ReportSavedView } from "../types";

const getStorageKey = (userId: string | number = "default") => `opspilot_saved_views_${userId}`;

export function getSavedViews(userId: string | number, tabId: ReportTabId): ReportSavedView[] {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return [];
    const allViews: ReportSavedView[] = JSON.parse(raw);
    return allViews.filter((v) => v.tabId === tabId);
  } catch (e) {
    console.error("Failed to load saved views from localStorage:", e);
    return [];
  }
}

export function saveReportView(
  userId: string | number,
  tabId: ReportTabId,
  name: string,
  filters: Record<string, any>
): ReportSavedView {
  const newView: ReportSavedView = {
    id: `sv_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    userId,
    tabId,
    name: name.trim() || `View ${new Date().toLocaleDateString()}`,
    filters: { ...filters },
    createdAt: new Date().toISOString(),
  };

  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    const allViews: ReportSavedView[] = raw ? JSON.parse(raw) : [];
    allViews.unshift(newView);
    localStorage.setItem(getStorageKey(userId), JSON.stringify(allViews));
  } catch (e) {
    console.error("Failed to save view to localStorage:", e);
  }

  return newView;
}

export function deleteReportView(userId: string | number, viewId: string): void {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return;
    const allViews: ReportSavedView[] = JSON.parse(raw);
    const filtered = allViews.filter((v) => v.id !== viewId);
    localStorage.setItem(getStorageKey(userId), JSON.stringify(filtered));
  } catch (e) {
    console.error("Failed to delete saved view from localStorage:", e);
  }
}

/**
 * Validates saved view filters against currently available options.
 * Drops stale filter values and returns any warnings.
 */
export function validateAndApplySavedFilters<T extends Record<string, any>>(
  savedFilters: T,
  availableOptions: {
    departments?: string[];
    categories?: string[];
    vendors?: string[];
    technicians?: string[];
    statuses?: string[];
  }
): { cleanFilters: T; droppedWarnings: string[] } {
  const cleanFilters: Record<string, any> = { ...savedFilters };
  const droppedWarnings: string[] = [];

  if (cleanFilters.department && availableOptions.departments) {
    if (cleanFilters.department !== "all" && !availableOptions.departments.includes(cleanFilters.department)) {
      droppedWarnings.push(`Department "${cleanFilters.department}"`);
      cleanFilters.department = "all";
    }
  }

  if (cleanFilters.category && availableOptions.categories) {
    if (cleanFilters.category !== "all" && !availableOptions.categories.includes(cleanFilters.category)) {
      droppedWarnings.push(`Category "${cleanFilters.category}"`);
      cleanFilters.category = "all";
    }
  }

  if (cleanFilters.vendor && availableOptions.vendors) {
    if (cleanFilters.vendor !== "all" && !availableOptions.vendors.includes(cleanFilters.vendor)) {
      droppedWarnings.push(`Vendor "${cleanFilters.vendor}"`);
      cleanFilters.vendor = "all";
    }
  }

  if (cleanFilters.technician && availableOptions.technicians) {
    if (cleanFilters.technician !== "all" && !availableOptions.technicians.includes(cleanFilters.technician)) {
      droppedWarnings.push(`Technician "${cleanFilters.technician}"`);
      cleanFilters.technician = "all";
    }
  }

  if (cleanFilters.status && availableOptions.statuses) {
    if (cleanFilters.status !== "all" && !availableOptions.statuses.includes(cleanFilters.status)) {
      droppedWarnings.push(`Status "${cleanFilters.status}"`);
      cleanFilters.status = "all";
    }
  }

  return { cleanFilters: cleanFilters as T, droppedWarnings };
}
