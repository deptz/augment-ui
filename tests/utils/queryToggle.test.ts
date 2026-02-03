import { describe, expect, it } from 'vitest';
import { isTruthyQueryParam } from '../../src/utils/queryToggle';

describe('isTruthyQueryParam', () => {
  it('returns true for truthy values', () => {
    expect(isTruthyQueryParam('1')).toBe(true);
    expect(isTruthyQueryParam('true')).toBe(true);
    expect(isTruthyQueryParam('yes')).toBe(true);
    expect(isTruthyQueryParam('on')).toBe(true);
    expect(isTruthyQueryParam('TRUE')).toBe(true);
  });

  it('returns false for falsy values and missing', () => {
    expect(isTruthyQueryParam('0')).toBe(false);
    expect(isTruthyQueryParam('false')).toBe(false);
    expect(isTruthyQueryParam('no')).toBe(false);
    expect(isTruthyQueryParam('off')).toBe(false);
    expect(isTruthyQueryParam(undefined)).toBe(false);
    expect(isTruthyQueryParam(null)).toBe(false);
  });

  it('handles arrays by checking any value', () => {
    expect(isTruthyQueryParam(['0', '1'])).toBe(true);
    expect(isTruthyQueryParam(['false', 'off'])).toBe(false);
  });
});
