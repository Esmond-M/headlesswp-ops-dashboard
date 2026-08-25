import { useQuery } from '@tanstack/react-query';
import { fetchRecentPosts } from '../lib/api';

export function OverviewPage() {
  const postsQuery = useQuery({
    queryKey: ['recent-posts'],
    queryFn: () => fetchRecentPosts(5),
  });

  return (
    <section className="page">
      <header className="page-header">
        <h1>Content Ops Overview</h1>
        <p>Start here to verify WordPress connectivity and baseline content health.</p>
      </header>

      <div className="cards">
        <article className="card">
          <h2>Recent Posts</h2>
          {postsQuery.isLoading && <p>Loading posts...</p>}
          {postsQuery.isError && <p>Could not load posts from WordPress.</p>}
          {postsQuery.data && (
            <ul>
              {postsQuery.data.map((post) => (
                <li key={post.id}>{post.title.rendered}</li>
              ))}
            </ul>
          )}
        </article>
      </div>
    </section>
  );
}
