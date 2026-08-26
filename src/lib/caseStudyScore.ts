import type { WpCaseStudy } from './api';
import { plainText } from './text';

export type CaseStudyScore = {
  score: number;
  missing: string[];
};

export function scoreCaseStudy(caseStudy: WpCaseStudy): CaseStudyScore {
  const meta = caseStudy.meta ?? {};
  const checks = [
    {
      label: 'client / organization',
      complete: Boolean(meta.emclient_client_name),
      points: 20,
    },
    {
      label: 'role',
      complete: Boolean(meta.emclient_role),
      points: 15,
    },
    {
      label: 'excerpt',
      complete: Boolean(plainText(caseStudy.excerpt?.rendered)),
      points: 20,
    },
    {
      label: 'featured image',
      complete: Boolean(caseStudy.featured_media),
      points: 15,
    },
    {
      label: 'project type',
      complete: caseStudy.project_type.length > 0,
      points: 10,
    },
    {
      label: 'technology stack',
      complete: caseStudy.project_stack.length > 0,
      points: 10,
    },
    {
      label: 'outcome',
      complete: Boolean(meta.emclient_outcome),
      points: 10,
    },
  ];

  return {
    score: checks.reduce((total, check) => total + (check.complete ? check.points : 0), 0),
    missing: checks.filter((check) => !check.complete).map((check) => check.label),
  };
}
