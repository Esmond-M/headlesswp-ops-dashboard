import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { fetchCaseStudies } from '../lib/api';
import { scoreCaseStudy } from '../lib/caseStudyScore';
import { plainText } from '../lib/text';

type CompletenessFilter = 'all' | 'complete' | 'needs-work';

export function PortfolioIntelligencePage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<CompletenessFilter>('all');
  const [selectedId, setSelectedId] = useState<number | null>(null);
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
    const matchesSearch = plainText(caseStudy.title.rendered).toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all'
      || (filter === 'complete' && result.score === 100)
      || (filter === 'needs-work' && result.score < 100);
    return matchesSearch && matchesFilter;
  });
  const completeCount = scored.filter(({ result }) => result.score === 100).length;
  const averageScore = scored.length === 0
    ? 0
    : Math.round(scored.reduce((total, item) => total + item.result.score, 0) / scored.length);
  const selected = scored.find(({ caseStudy }) => caseStudy.id === selectedId);
  const selectedTerms = selected?.caseStudy._embedded?.['wp:term']?.flat() ?? [];
  const selectedTypes = selectedTerms.filter((term) => term.taxonomy === 'project_type');
  const selectedStacks = selectedTerms.filter((term) => term.taxonomy === 'project_stack');

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
                  <h2>{plainText(caseStudy.title.rendered)}</h2>
                  <p>{caseStudy.meta?.emclient_client_name || 'Client not entered'} · {caseStudy.meta?.emclient_role || 'Role not entered'}</p>
                  {result.missing.length > 0 && <small>Missing: {result.missing.join(', ')}</small>}
                </div>
                <div className="case-study-actions">
                  <strong className={result.score === 100 ? 'score complete' : 'score'}>{result.score}%</strong>
                  <button type="button" onClick={() => setSelectedId(caseStudy.id)}>Details</button>
                </div>
              </article>
            ))}
            {filtered.length === 0 && <article className="card"><p>No Case Studies match this view.</p></article>}
          </div>

          {selected && (
            <aside className="detail-panel" aria-label="Case Study details">
              <div className="detail-panel-header">
                <div>
                  <span className="eyebrow">Case Study Details</span>
                  <h2>{plainText(selected.caseStudy.title.rendered)}</h2>
                </div>
                <button type="button" aria-label="Close Case Study details" onClick={() => setSelectedId(null)}>Close</button>
              </div>
              <div className="detail-grid">
                <div><span>Client / Organization</span><strong>{plainText(selected.caseStudy.meta?.emclient_client_name) || 'Not entered'}</strong></div>
                <div><span>Role</span><strong>{plainText(selected.caseStudy.meta?.emclient_role) || 'Not entered'}</strong></div>
                <div><span>Completion Year</span><strong>{selected.caseStudy.meta?.emclient_completion_year || 'Not entered'}</strong></div>
                <div><span>Completeness</span><strong>{selected.result.score}%</strong></div>
              </div>
              <div className="detail-copy">
                <div><span>Challenge</span><p>{plainText(selected.caseStudy.meta?.emclient_challenge) || 'Not entered'}</p></div>
                <div><span>Solution</span><p>{plainText(selected.caseStudy.meta?.emclient_solution) || 'Not entered'}</p></div>
                <div><span>Outcome</span><p>{plainText(selected.caseStudy.meta?.emclient_outcome) || 'Not entered'}</p></div>
              </div>
              <div className="detail-terms">
                <div><span>Project Type</span><p>{selectedTypes.map((term) => plainText(term.name)).join(', ') || 'Not assigned'}</p></div>
                <div><span>Technology Stack</span><p>{selectedStacks.map((term) => plainText(term.name)).join(', ') || 'Not assigned'}</p></div>
              </div>
              <div className="detail-links">
                {selected.caseStudy.meta?.emclient_project_url && <a href={selected.caseStudy.meta.emclient_project_url} target="_blank" rel="noreferrer">Project URL</a>}
                {selected.caseStudy.meta?.emclient_repository_url && <a href={selected.caseStudy.meta.emclient_repository_url} target="_blank" rel="noreferrer">Repository</a>}
                <a href={selected.caseStudy.link} target="_blank" rel="noreferrer">WordPress entry</a>
              </div>
            </aside>
          )}
        </>
      )}
    </section>
  );
}
