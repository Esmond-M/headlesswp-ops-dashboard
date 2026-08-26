export type QueueSortOrder = 'modified-desc' | 'modified-asc' | 'title-asc';

export type SavedEditorialView = {
  id: string;
  name: string;
  search: string;
  status: string;
  sort: QueueSortOrder;
};

const STORAGE_KEY = 'headlesswp-editorial-views';

export function loadSavedEditorialViews(): SavedEditorialView[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const value: unknown = JSON.parse(stored);
    return Array.isArray(value) ? value as SavedEditorialView[] : [];
  } catch {
    return [];
  }
}

export function saveEditorialViews(views: SavedEditorialView[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(views));
}
