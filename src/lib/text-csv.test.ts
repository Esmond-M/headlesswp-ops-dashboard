import { describe, expect, it } from 'vitest';
import { buildCsv } from './csv';
import { plainText } from './text';

describe('plainText', () => {
  it('strips markup and decodes WordPress entities', () => {
    expect(plainText('<p>Healthcare &amp; Enterprise &#8211; Team</p>')).toBe('Healthcare & Enterprise – Team');
  });
});

describe('buildCsv', () => {
  it('escapes commas, quotes, and line breaks', () => {
    expect(buildCsv([
      { title: 'A, title', message: 'She said "go"\nnow' },
    ])).toBe('title,message\n"A, title","She said ""go""\nnow"');
  });

  it('returns an empty string for an empty result set', () => {
    expect(buildCsv([])).toBe('');
  });
});
