import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { fetchAllPosts, fetchCaseStudies } from '../lib/api';
import { auditCaseStudy, auditPost, type AuditFinding, type AuditSeverity } from '../lib/contentAudit';
import { downloadCsv } from '../lib/csv';

type SeverityFilter = 'all' | AuditSeverity;

const severityOrder: Record<AuditSeverity, number> = { high: 0, medium: 1, low: 2 };

export function SeoAuditPage() {
  const [severity, setSeverity] = useState<SeverityFilter>('all');
  const postsQuery = useQuery({ queryKey: ['audit-posts'], queryFn: fetchAllPosts });
  const caseStudiesQuery = useQuery({ queryKey: ['audit-case-studies'], queryFn: fetchCaseStudies });
  const findings = useMemo<AuditFinding[]>(() => [
    ...(postsQuery.data ?? []).flatMap(auditPost),
    ...(caseStudiesQuery.data ?? []).flatMap(auditCaseStudy),
  ].sort((first, second) => severityOrder[first.severity] - severityOrder[second.severity]), [postsQuery.data, caseStudiesQuery.data]);
  const filtered = findings.filter((finding) => severity === 'all' || finding.severity === severity);
  const isLoading = postsQuery.isLoading || caseStudiesQuery.isLoading;
  const isError = postsQuery.isError || caseStudiesQuery.isError;

  function exportFindings() {
    downloadCsv('content-audit-findings.csv', filtered.map((finding) => ({
      contentType: finding.contentType,
      title: finding.title,
      rule: finding.rule,
      severity: finding.severity,
      message: finding.message,
      contentId: finding.contentId,
    })));
  }

  return (
    <section className="page">
      <header className="page-header">
        <h1>SEO and Content Audit</h1>
        <p>Prioritize content issues before they reach the public frontend.</p>
      </header>

      {isLoading && <article className="card"><p>Running content audit...</p></article>}
      {isError && <article className="card error"><p>Could not load all content for the audit.</p></article>}

      {!isLoading && !isError && (
        <>
          <div className="metric-grid">
            <article className="metric"><span>Total findings</span><strong>{findings.length}</strong></article>
            <article className="metric"><span>High priority</span><strong>{findings.filter((finding) => finding.severity === 'high').length}</strong></article>
            <article className="metric"><span>Content checked</span><strong>{(postsQuery.data?.length ?? 0) + (caseStudiesQuery.data?.length ?? 0)}</strong></article>
          </div>

          <div className="toolbar">
            <select aria-label="Filter audit severity" value={severity} onChange={(event) => setSeverity(event.target.value as SeverityFilter)}>
              <option value="all">All severities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <button type="button" onClick={exportFindings} disabled={filtered.length === 0}>Export CSV</button>
          </div>

          <div className="audit-list">
            {filtered.map((finding) => (
              <article className="audit-row" key={finding.id}>
                <div>
                  <h2>{finding.title}</h2>
                  <p>{finding.contentType === 'case-study' ? 'Case Study' : 'Post'} · {finding.rule}</p>
                  <small>{finding.message}</small>
                </div>
                <span className={`severity severity-${finding.severity}`}>{finding.severity}</span>
              </article>
            ))}
            {filtered.length === 0 && <article className="card"><p>No findings match this severity.</p></article>}
          </div>
        </>
      )}
    </section>
  );
}
