import { describe, expect, it } from 'vitest';
import { convertSize, matchSizePreset, orientationOf, resolveSize, rotateSize, sizePresetLabel } from './sizeUtils';
import { makeSize } from '../test/fixtures';

const a4 = makeSize();
const letter = makeSize({ id: 's3', label: 'Letter', width: 215.9, height: 279.4, widthMm: 215.9, heightMm: 279.4 });
const card = makeSize({ id: 's5', label: 'Carte Vizită Standard', width: 90, height: 50, widthMm: 90, heightMm: 50 });
const square = makeSize({ id: 's10', label: '50x50', width: 50, height: 50, widthMm: 50, heightMm: 50 });
const presets = [a4, letter, card, square];

const nameOf = (widthMm: number, heightMm: number) => {
  const match = matchSizePreset(presets, widthMm, heightMm);
  return match ? sizePresetLabel(match) : null;
};

describe('orientationOf', () => {
  it('reads a pair of dimensions', () => {
    expect(orientationOf(210, 297)).toBe('portrait');
    expect(orientationOf(297, 210)).toBe('landscape');
    expect(orientationOf(50, 50)).toBe('square');
  });
});

describe('matchSizePreset', () => {
  it('matches the catalogued orientation without a suffix', () => {
    expect(nameOf(210, 297)).toBe('A4');
  });

  it('names a rotated preset by its format and orientation', () => {
    expect(nameOf(297, 210)).toBe('A4 orizontal');
  });

  it('leaves a preset that is already wide unsuffixed', () => {
    // 90×50 is how the business card is catalogued — it is not "rotated".
    expect(nameOf(90, 50)).toBe('Carte Vizită Standard');
  });

  it('calls a wide preset vertical when stood up', () => {
    expect(nameOf(50, 90)).toBe('Carte Vizită Standard vertical');
  });

  it('never reports a square preset as rotated', () => {
    const match = matchSizePreset(presets, 50, 50);
    expect(match?.rotated).toBe(false);
    expect(sizePresetLabel(match!)).toBe('50x50');
  });

  it('absorbs the rounding drift of a unit round trip', () => {
    // 210 mm → 8.27 in → 210.06 mm: exact equality used to lose the format here.
    const roundTripped = convertSize(convertSize(210, 'mm', 'in'), 'in', 'mm');
    expect(roundTripped).not.toBe(210);
    expect(nameOf(roundTripped, 297)).toBe('A4');
  });

  it('does not confuse two presets that are merely close', () => {
    expect(nameOf(215.9, 279.4)).toBe('Letter');
    expect(nameOf(210, 297)).toBe('A4');
  });

  it('returns nothing for dimensions no preset covers', () => {
    expect(matchSizePreset(presets, 213, 301)).toBeNull();
  });
});

describe('resolveSize', () => {
  it('carries the preset id and name of a rotated sheet', () => {
    expect(resolveSize(presets, 297, 210, 'mm')).toEqual({
      id: 's1',
      label: 'A4 orizontal',
      width: 297,
      height: 210,
      widthMm: 297,
      heightMm: 210,
      unit: 'mm',
    });
  });

  it('falls back to the custom size when nothing matches', () => {
    expect(resolveSize(presets, 213, 301, 'mm')).toEqual(
      expect.objectContaining({ id: 'custom', label: 'Personalizat' })
    );
  });

  it('converts the display dimensions into the asked-for unit', () => {
    expect(resolveSize(presets, 210, 297, 'in')).toEqual(
      expect.objectContaining({ width: 8.27, height: 11.69, widthMm: 210, unit: 'in' })
    );
  });
});

describe('rotateSize', () => {
  it('swaps the dimensions and renames', () => {
    expect(rotateSize(presets, a4)).toEqual(
      expect.objectContaining({ id: 's1', label: 'A4 orizontal', widthMm: 297, heightMm: 210 })
    );
  });

  it('round-trips back to the catalogued orientation', () => {
    expect(rotateSize(presets, rotateSize(presets, a4))).toEqual(a4);
  });

  it('keeps the display unit', () => {
    const inches = resolveSize(presets, 210, 297, 'in');
    expect(rotateSize(presets, inches).unit).toBe('in');
  });
});
