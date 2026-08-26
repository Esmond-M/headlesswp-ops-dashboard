import { describe, expect, it } from 'vitest';
import type { WpCaseStudy, WpPost } from './api';
import { auditCaseStudy, auditPost } from './contentAudit';

const basePost: WpPost = {
  id: 4,
  date: '2026-01-01T00:00:00',
  modified: '2026-01-01T00:00:00',
  link: 'https://example.test/post',
  title: { rendered: 'Short' },
  excerpt: { rendered: '' },
  categories: [],
};

const baseCaseStudy: WpCaseStudy = {
  ...basePost,
  title: { rendered: 'Short' },
  featured_media: 0,
  project_type: [],
  project_stack: [],
  meta: {},
};

describe('content audit rules', () => {
  it('reports short titles and missing excerpts for posts', () => {
    const findings = auditPost(basePost);

    expect(findings.map((finding) => finding.rule)).toEqual(['Title length', 'Excerpt']);
    expect(findings.find((finding) => finding.rule === 'Excerpt')?.severity).toBe('high');
  });

  it('reports missing case study requirements', () => {
    const findings = auditCaseStudy(baseCaseStudy);
    const rules = findings.map((finding) => finding.rule);

    expect(rules).toContain('Featured image');
    expect(rules).toContain('Project type');
    expect(rules).toContain('Technology stack');
    expect(rules).toContain('Outcome');
  });
});
