import { useQuery } from '@tanstack/react-query';
import { fetchAllPosts, fetchCaseStudies } from '../lib/api';
import { scoreCaseStudy } from '../lib/caseStudyScore';
import { auditCaseStudy, auditPost } from '../lib/contentAudit';

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

export function OverviewPage() {
  const postsQuery = useQuery({
    queryKey: ['all-posts'],
    queryFn: fetchAllPosts,
  });
  const caseStudiesQuery = useQuery({
    queryKey: ['case-studies'],
    queryFn: fetchCaseStudies,
  });
  const posts = postsQuery.data ?? [];
  const caseStudies = caseStudiesQuery.data ?? [];
  const scores = caseStudies.map(scoreCaseStudy);
  const averageScore = scores.length === 0
    ? 0
    : Math.round(scores.reduce((total, result) => total + result.score, 0) / scores.length);
  const findings = [
    ...posts.flatMap(auditPost),
    ...caseStudies.flatMap(auditCaseStudy),
  ];
  const highPriorityCount = findings.filter((finding) => finding.severity === 'high').length;
  const recentPosts = [...posts].sort((first, second) => (
    new Date(second.modified).getTime() - new Date(first.modified).getTime()
  )).slice(0, 5);
  const isLoading = postsQuery.isLoading || caseStudiesQuery.isLoading;
  const isError = postsQuery.isError || caseStudiesQuery.isError;

  return (
    <section className="page">
      <header className="page-header">
        <h1>Content Ops Overview</h1>
        <p>Start here to verify WordPress connectivity and baseline content health.</p>
      </header>

      {isLoading && <article className="card"><p>Loading dashboard metrics...</p></article>}
      {isError && <article className="card error"><p>Could not load dashboard data from WordPress.</p></article>}

      {!isLoading && !isError && (
        <>
          <div className="metric-grid">
            <article className="metric"><span>Published Posts</span><strong>{posts.length}</strong></article>
            <article className="metric"><span>Case Studies</span><strong>{caseStudies.length}</strong></article>
            <article className="metric"><span>Average Case Study Score</span><strong>{averageScore}%</strong></article>
            <article className="metric"><span>High Priority Findings</span><strong>{highPriorityCount}</strong></article>
          </div>

          <div className="cards">
            <article className="card">
              <h2>Recently Modified</h2>
              {recentPosts.length === 0 && <p>No posts found.</p>}
              {recentPosts.length > 0 && (
                <ul className="recent-list">
                  {recentPosts.map((post) => (
                    <li key={post.id}>
                      <a href={post.link} target="_blank" rel="noreferrer">{stripHtml(post.title.rendered)}</a>
                      <span>{formatDate(post.modified)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </div>
        </>
      )}
    </section>
  );
}
