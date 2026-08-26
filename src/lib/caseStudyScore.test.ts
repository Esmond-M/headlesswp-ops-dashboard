import { describe, expect, it } from 'vitest';
import type { WpCaseStudy } from './api';
import { scoreCaseStudy } from './caseStudyScore';

function makeCaseStudy(overrides: Partial<WpCaseStudy> = {}): WpCaseStudy {
  return {
    id: 1,
    date: '2026-01-01T00:00:00',
    modified: '2026-01-01T00:00:00',
    link: 'https://example.test/case-study',
    title: { rendered: 'A complete case study' },
    excerpt: { rendered: '<p>A useful summary.</p>' },
    featured_media: 10,
    project_type: [1],
    project_stack: [2],
    meta: {
      emclient_client_name: 'Example Client',
      emclient_role: 'Developer',
      emclient_outcome: 'Improved workflow',
    },
    ...overrides,
    categories: overrides.categories ?? [],
  };
}

describe('scoreCaseStudy', () => {
  it('gives a complete case study a score of 100', () => {
    expect(scoreCaseStudy(makeCaseStudy())).toEqual({ score: 100, missing: [] });
  });

  it('reports missing fields and removes their points', () => {
    const result = scoreCaseStudy(makeCaseStudy({
      excerpt: undefined,
      featured_media: 0,
      project_type: [],
      project_stack: [],
      meta: {},
    }));

    expect(result.score).toBe(0);
    expect(result.missing).toEqual([
      'client / organization',
      'role',
      'excerpt',
      'featured image',
      'project type',
      'technology stack',
      'outcome',
    ]);
  });
});
