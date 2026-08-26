export type QueueSortOrder = 'modified-desc' | 'modified-asc' | 'title-asc';

export type SavedEditorialView = {
  id: string;
  name: string;
  search: string;
  status: string;
  category: string;
  staleOnly: boolean;
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
    return Array.isArray(value)
      ? (value as SavedEditorialView[]).map((view) => ({
        ...view,
        category: view.category ?? 'all',
        staleOnly: view.staleOnly ?? false,
      }))
      : [];
  } catch {
    return [];
  }
}

export function saveEditorialViews(views: SavedEditorialView[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(views));
}
