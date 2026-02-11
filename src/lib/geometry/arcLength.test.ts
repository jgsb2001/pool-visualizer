import * as THREE from 'three';
import { calculateArcLengths } from './arcLength';
import { generatePoolPerimeterPoints } from './perimeterPoints';

describe('calculateArcLengths', () => {
  it('starts at zero', () => {
    const points = generatePoolPerimeterPoints('rectangle', 10, 6, 64);
    const { arcLengths } = calculateArcLengths(points);
    expect(arcLengths[0]).toBe(0);
  });

  it('is monotonically increasing', () => {
    const points = generatePoolPerimeterPoints('oval', 10, 6, 64);
    const { arcLengths } = calculateArcLengths(points);

    for (let i = 1; i < arcLengths.length; i++) {
      expect(arcLengths[i]).toBeGreaterThan(arcLengths[i - 1]);
    }
  });

  it('total length of rectangle matches 2*(L+W)', () => {
    const length = 10;
    const width = 6;
    const expected = 2 * (length + width);
    const points = generatePoolPerimeterPoints('rectangle', length, width, 256);
    const { totalLength } = calculateArcLengths(points);
    // Allow 5% tolerance due to discretization
    expect(totalLength).toBeCloseTo(expected, 0);
  });

  it('total length of circle matches 2*PI*r', () => {
    const diameter = 8;
    const radius = diameter / 2;
    const expected = 2 * Math.PI * radius;
    const points = generatePoolPerimeterPoints('circular', diameter, diameter, 256);
    const { totalLength } = calculateArcLengths(points);
    // Allow 2% tolerance
    expect(Math.abs(totalLength - expected) / expected).toBeLessThan(0.02);
  });

  it('has the correct number of entries', () => {
    const segments = 64;
    const points = generatePoolPerimeterPoints('oval', 10, 6, segments);
    const { arcLengths } = calculateArcLengths(points);
    expect(arcLengths.length).toBe(points.length);
  });

  it('handles a simple square correctly', () => {
    // Manual test with a known simple geometry
    const points = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(1, 0, 1),
      new THREE.Vector3(0, 0, 1),
    ];
    const { arcLengths, totalLength } = calculateArcLengths(points);

    expect(arcLengths).toEqual([0, 1, 2, 3]);
    expect(totalLength).toBe(4); // 3 edges + closing edge back to start
  });
});
