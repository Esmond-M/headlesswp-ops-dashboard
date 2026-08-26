import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { fetchCaseStudies } from '../lib/api';
import { scoreCaseStudy } from '../lib/caseStudyScore';

type CompletenessFilter = 'all' | 'complete' | 'needs-work';

export function PortfolioIntelligencePage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<CompletenessFilter>('all');
  const caseStudiesQuery = useQuery({
    queryKey: ['case-studies'],
    queryFn: fetchCaseStudies,
  });

  const caseStudies = useMemo(() => caseStudiesQuery.data ?? [], [caseStudiesQuery.data]);
  const scored = useMemo(() => caseStudies.map((caseStudy) => ({
    caseStudy,
    result: scoreCaseStudy(caseStudy),
  })), [caseStudies]);
  const filtered = scored.filter(({ caseStudy, result }) => {
    const matchesSearch = caseStudy.title.rendered.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all'
      || (filter === 'complete' && result.score === 100)
      || (filter === 'needs-work' && result.score < 100);
    return matchesSearch && matchesFilter;
  });
  const completeCount = scored.filter(({ result }) => result.score === 100).length;
  const averageScore = scored.length === 0
    ? 0
    : Math.round(scored.reduce((total, item) => total + item.result.score, 0) / scored.length);

  return (
    <section className="page">
      <header className="page-header">
        <h1>Portfolio Intelligence</h1>
        <p>Review Case Study completeness before content reaches the public frontend.</p>
      </header>

      {caseStudiesQuery.isLoading && <article className="card"><p>Loading Case Studies...</p></article>}
      {caseStudiesQuery.isError && <article className="card error"><p>Could not load Case Studies from WordPress.</p></article>}

      {!caseStudiesQuery.isLoading && !caseStudiesQuery.isError && (
        <>
          <div className="metric-grid">
            <article className="metric"><span>Total Case Studies</span><strong>{caseStudies.length}</strong></article>
            <article className="metric"><span>Complete</span><strong>{completeCount}</strong></article>
            <article className="metric"><span>Average Score</span><strong>{averageScore}%</strong></article>
          </div>

          <div className="toolbar">
            <input
              aria-label="Search Case Studies"
              placeholder="Search Case Studies"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select aria-label="Filter Case Studies" value={filter} onChange={(event) => setFilter(event.target.value as CompletenessFilter)}>
              <option value="all">All records</option>
              <option value="complete">Complete only</option>
              <option value="needs-work">Needs work</option>
            </select>
          </div>

          <div className="case-study-list">
            {filtered.map(({ caseStudy, result }) => (
              <article className="case-study-row" key={caseStudy.id}>
                <div>
                  <h2>{caseStudy.title.rendered}</h2>
                  <p>{caseStudy.meta?.emclient_client_name || 'Client not entered'} · {caseStudy.meta?.emclient_role || 'Role not entered'}</p>
                  {result.missing.length > 0 && <small>Missing: {result.missing.join(', ')}</small>}
                </div>
                <strong className={result.score === 100 ? 'score complete' : 'score'}>{result.score}%</strong>
              </article>
            ))}
            {filtered.length === 0 && <article className="card"><p>No Case Studies match this view.</p></article>}
          </div>
        </>
      )}
    </section>
  );
}
