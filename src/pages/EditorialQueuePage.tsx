import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { fetchEditorialPosts } from '../lib/api';

type SortOrder = 'modified-desc' | 'modified-asc' | 'title-asc';

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, '').trim();
}

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
  const [sort, setSort] = useState<SortOrder>('modified-desc');
  const postsQuery = useQuery({
    queryKey: ['editorial-posts', page],
    queryFn: () => fetchEditorialPosts(page, 10),
  });

  const posts = [...(postsQuery.data?.posts ?? [])]
    .filter((post) => status === 'all' || post.status === status)
    .filter((post) => stripHtml(post.title.rendered).toLowerCase().includes(search.toLowerCase()))
    .sort((first, second) => {
      if (sort === 'title-asc') {
        return stripHtml(first.title.rendered).localeCompare(stripHtml(second.title.rendered));
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
        <select aria-label="Sort posts" value={sort} onChange={(event) => setSort(event.target.value as SortOrder)}>
          <option value="modified-desc">Recently modified</option>
          <option value="modified-asc">Least recently modified</option>
          <option value="title-asc">Title A-Z</option>
        </select>
      </div>

      {postsQuery.isLoading && <article className="card"><p>Loading editorial queue...</p></article>}
      {postsQuery.isError && <article className="card error"><p>Could not load posts from WordPress.</p></article>}

      {!postsQuery.isLoading && !postsQuery.isError && (
        <>
          <div className="queue-summary">
            <span>{posts.length} posts on this page</span>
            <span>{postsQuery.data?.total ?? 0} total posts</span>
          </div>
          <div className="editorial-list">
            {posts.map((post) => (
              <article className="editorial-row" key={post.id}>
                <div>
                  <h2>{stripHtml(post.title.rendered) || 'Untitled post'}</h2>
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
