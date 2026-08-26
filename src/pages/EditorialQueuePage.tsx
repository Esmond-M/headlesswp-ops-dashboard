import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { fetchEditorialPosts } from '../lib/api';
import { plainText } from '../lib/text';
import {
  loadSavedEditorialViews,
  saveEditorialViews,
  type QueueSortOrder,
  type SavedEditorialView,
} from '../lib/savedViews';

const STALE_DAYS = 90;

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function EditorialQueuePage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [staleOnly, setStaleOnly] = useState(false);
  const [now] = useState(() => Date.now());
  const [sort, setSort] = useState<QueueSortOrder>('modified-desc');
  const [savedViews, setSavedViews] = useState<SavedEditorialView[]>(loadSavedEditorialViews);
  const [viewName, setViewName] = useState('');
  const postsQuery = useQuery({
    queryKey: ['editorial-posts', page],
    queryFn: () => fetchEditorialPosts(page, 10),
  });

  useEffect(() => {
    saveEditorialViews(savedViews);
  }, [savedViews]);

  function saveCurrentView() {
    const name = viewName.trim();
    if (!name) return;

    setSavedViews((views) => [
      ...views.filter((view) => view.name.toLowerCase() !== name.toLowerCase()),
      { id: crypto.randomUUID(), name, search, status, category, staleOnly, sort },
    ]);
    setViewName('');
  }

  function loadView(view: SavedEditorialView) {
    setSearch(view.search);
    setStatus(view.status);
    setCategory(view.category);
    setStaleOnly(view.staleOnly);
    setSort(view.sort);
    setPage(1);
  }

  function clearFilters() {
    setSearch('');
    setStatus('all');
    setCategory('all');
    setStaleOnly(false);
    setPage(1);
  }

  const loadedPosts = postsQuery.data?.posts ?? [];
  const categories = [...new Map(
    loadedPosts.flatMap((post) => post._embedded?.['wp:term']?.flat() ?? [])
      .filter((term) => term.taxonomy === 'category')
      .map((term) => [term.id, term]),
  ).values()].sort((first, second) => first.name.localeCompare(second.name));
  const posts = [...loadedPosts]
    .filter((post) => status === 'all' || post.status === status)
    .filter((post) => plainText(post.title.rendered).toLowerCase().includes(search.toLowerCase()))
    .filter((post) => category === 'all' || post._embedded?.['wp:term']?.flat().some((term) => term.taxonomy === 'category' && term.slug === category))
    .filter((post) => !staleOnly || (now - new Date(post.modified).getTime()) > STALE_DAYS * 86400000)
    .sort((first, second) => {
      if (sort === 'title-asc') {
        return plainText(first.title.rendered).localeCompare(plainText(second.title.rendered));
      }
      const difference = new Date(second.modified).getTime() - new Date(first.modified).getTime();
      return sort === 'modified-desc' ? difference : -difference;
    });

  return (
    <section className="page">
      <header className="page-header">
        <h1>Editorial Queue</h1>
        <p>Review published WordPress content and identify items that need attention.</p>
      </header>

      <div className="toolbar editorial-toolbar">
        <input
          aria-label="Search posts"
          placeholder="Search posts"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">All statuses</option>
          <option value="publish">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="all">All categories</option>
          {categories.map((term) => <option key={term.id} value={term.slug}>{term.name}</option>)}
        </select>
        <select aria-label="Sort posts" value={sort} onChange={(event) => setSort(event.target.value as QueueSortOrder)}>
          <option value="modified-desc">Recently modified</option>
          <option value="modified-asc">Least recently modified</option>
          <option value="title-asc">Title A-Z</option>
        </select>
        <label className="checkbox-filter">
          <input type="checkbox" checked={staleOnly} onChange={(event) => setStaleOnly(event.target.checked)} />
          Stale only ({STALE_DAYS}+ days)
        </label>
        <button type="button" onClick={clearFilters}>Clear filters</button>
      </div>

      <div className="saved-views">
        <label htmlFor="view-name">Saved views</label>
        <input id="view-name" placeholder="Name this view" value={viewName} onChange={(event) => setViewName(event.target.value)} />
        <button type="button" onClick={saveCurrentView} disabled={!viewName.trim()}>Save</button>
        {savedViews.map((view) => (
          <span className="saved-view" key={view.id}>
            <button type="button" onClick={() => loadView(view)}>{view.name}</button>
            <button type="button" aria-label={`Delete ${view.name}`} onClick={() => setSavedViews((views) => views.filter((item) => item.id !== view.id))}>x</button>
          </span>
        ))}
      </div>

      {postsQuery.isLoading && <article className="card"><p>Loading editorial queue...</p></article>}
      {postsQuery.isError && <article className="card error"><p>Could not load posts from WordPress.</p></article>}

      {!postsQuery.isLoading && !postsQuery.isError && (
        <>
          <div className="queue-summary">
            <span>{posts.length} matching posts on this page</span>
            <span>{postsQuery.data?.total ?? 0} total posts</span>
          </div>
          <div className="editorial-list">
            {posts.map((post) => (
              <article className="editorial-row" key={post.id}>
                <div>
                  <h2>{plainText(post.title.rendered) || 'Untitled post'}</h2>
                  <p>Last modified {formatDate(post.modified)}</p>
                </div>
                <span className={`status status-${post.status ?? 'unknown'}`}>{post.status ?? 'unknown'}</span>
              </article>
            ))}
            {posts.length === 0 && <article className="card"><p>No posts match this view.</p></article>}
          </div>
          {(postsQuery.data?.totalPages ?? 1) > 1 && (
            <div className="pagination">
              <button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>Previous</button>
              <span>Page {page} of {postsQuery.data?.totalPages}</span>
              <button type="button" disabled={page === postsQuery.data?.totalPages} onClick={() => setPage((current) => current + 1)}>Next</button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
