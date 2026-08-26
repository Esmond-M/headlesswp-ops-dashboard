import type { WpCaseStudy, WpPost } from './api';

export type AuditSeverity = 'high' | 'medium' | 'low';

export type AuditFinding = {
  id: string;
  contentId: number;
  contentType: 'post' | 'case-study';
  title: string;
  rule: string;
  message: string;
  severity: AuditSeverity;
};

function plainText(value: string | undefined): string {
  return value?.replace(/<[^>]+>/g, '').trim() ?? '';
}

function auditBaseContent(content: WpPost, contentType: AuditFinding['contentType']): AuditFinding[] {
  const title = plainText(content.title.rendered) || 'Untitled content';
  const findings: AuditFinding[] = [];

  if (title.length < 20) {
    findings.push({
      id: `${contentType}-${content.id}-short-title`,
      contentId: content.id,
      contentType,
      title,
      rule: 'Title length',
      message: 'Title is shorter than 20 characters.',
      severity: 'medium',
    });
  }

  if (title.length > 70) {
    findings.push({
      id: `${contentType}-${content.id}-long-title`,
      contentId: content.id,
      contentType,
      title,
      rule: 'Title length',
      message: 'Title is longer than 70 characters.',
      severity: 'low',
    });
  }

  if (!plainText(content.excerpt?.rendered)) {
    findings.push({
      id: `${contentType}-${content.id}-missing-excerpt`,
      contentId: content.id,
      contentType,
      title,
      rule: 'Excerpt',
      message: 'Add an excerpt so the content has a useful summary.',
      severity: 'high',
    });
  }

  return findings;
}

export function auditPost(post: WpPost): AuditFinding[] {
  return auditBaseContent(post, 'post');
}

export function auditCaseStudy(caseStudy: WpCaseStudy): AuditFinding[] {
  const findings = auditBaseContent(caseStudy, 'case-study');
  const title = plainText(caseStudy.title.rendered) || 'Untitled content';

  if (!caseStudy.featured_media) {
    findings.push({
      id: `case-study-${caseStudy.id}-featured-image`,
      contentId: caseStudy.id,
      contentType: 'case-study',
      title,
      rule: 'Featured image',
      message: 'Add a featured image for visual completeness.',
      severity: 'medium',
    });
  }

  if (caseStudy.project_type.length === 0) {
    findings.push({
      id: `case-study-${caseStudy.id}-project-type`,
      contentId: caseStudy.id,
      contentType: 'case-study',
      title,
      rule: 'Project type',
      message: 'Assign at least one project type.',
      severity: 'medium',
    });
  }

  if (caseStudy.project_stack.length === 0) {
    findings.push({
      id: `case-study-${caseStudy.id}-project-stack`,
      contentId: caseStudy.id,
      contentType: 'case-study',
      title,
      rule: 'Technology stack',
      message: 'Assign at least one technology stack term.',
      severity: 'low',
    });
  }

  if (!caseStudy.meta?.emclient_outcome) {
    findings.push({
      id: `case-study-${caseStudy.id}-outcome`,
      contentId: caseStudy.id,
      contentType: 'case-study',
      title,
      rule: 'Outcome',
      message: 'Add an outcome to explain the value of the work.',
      severity: 'high',
    });
  }

  return findings;
}
