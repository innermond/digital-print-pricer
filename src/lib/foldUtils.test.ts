import { describe, expect, it } from 'vitest';
import { derivedPageCount, unfoldFactor, unfoldedSizeMm } from './foldUtils';
import type { Finishing } from '../types';

const fold = (type: Finishing['folding']['type'], folds = 0): Finishing['folding'] => ({ type, folds });

describe('unfoldFactor', () => {
  it('leaves an unfolded sheet alone', () => {
    expect(unfoldFactor(fold('none'))).toBe(1);
  });

  it('doubles a half-fold and triples a tri- or z-fold', () => {
    expect(unfoldFactor(fold('half-fold'))).toBe(2);
    expect(unfoldFactor(fold('tri-fold'))).toBe(3);
    expect(unfoldFactor(fold('z-fold'))).toBe(3);
  });

  it('doubles a gate-fold, however many panels that makes', () => {
    // Two half-width flaps close over the middle: the flat sheet is ¼ + ½ + ¼,
    // so it is twice the finished piece even though it reads as four panels and
    // prints eight pages. Merging this with the page table would make it 4.
    expect(unfoldFactor(fold('gate-fold'))).toBe(2);
    expect(derivedPageCount('gate-fold')).toBe(8);
  });

  it('gives a custom fold one panel more than it has folds', () => {
    expect(unfoldFactor(fold('custom', 3))).toBe(4);
    // Nothing folded is nothing opened, whatever the type says.
    expect(unfoldFactor(fold('custom', 0))).toBe(1);
  });

  it('reads the folder’s structural half fold off the config', () => {
    // A Mapă is creased, not folded, so it carries no folding type of its own.
    expect(unfoldFactor(fold('none'), true)).toBe(2);
  });

  it('does not compound a real fold with the structural flag', () => {
    // A host catalog carrying both must still describe one half fold.
    expect(unfoldFactor(fold('half-fold'), true)).toBe(2);
    expect(unfoldFactor(fold('tri-fold'), true)).toBe(3);
  });
});

describe('unfoldedSizeMm', () => {
  it('grows the shorter edge, so the panels sit side by side', () => {
    expect(unfoldedSizeMm(100, 210, 3)).toEqual({ widthMm: 300, heightMm: 210, grownAxis: 'x' });
    expect(unfoldedSizeMm(210, 297, 2)).toEqual({ widthMm: 420, heightMm: 297, grownAxis: 'x' });
  });

  it('grows the height instead when that is the shorter edge', () => {
    expect(unfoldedSizeMm(297, 210, 2)).toEqual({ widthMm: 297, heightMm: 420, grownAxis: 'y' });
  });

  it('grows a square piece by its width, arbitrarily but predictably', () => {
    expect(unfoldedSizeMm(100, 100, 2)).toEqual({ widthMm: 200, heightMm: 100, grownAxis: 'x' });
  });

  it('reports the axis even when the sheet stays the taller way round', () => {
    // The trap: this opened sideways, but it is still taller than it is wide, so
    // the axis cannot be recovered from the result's shape afterwards.
    expect(unfoldedSizeMm(100, 250, 2)).toEqual({ widthMm: 200, heightMm: 250, grownAxis: 'x' });
  });

  it('leaves a flat sheet at its own size', () => {
    expect(unfoldedSizeMm(210, 297, 1)).toMatchObject({ widthMm: 210, heightMm: 297 });
  });
});
