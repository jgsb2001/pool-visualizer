import { generatePoolPerimeterPoints } from './perimeterPoints';

describe('generatePoolPerimeterPoints', () => {
  describe('rectangle', () => {
    it('generates points that form a closed perimeter', () => {
      const points = generatePoolPerimeterPoints('rectangle', 10, 6, 64);
      expect(points.length).toBeGreaterThan(0);

      // All points should be at Y=0 (XZ plane)
      points.forEach((p) => expect(p.y).toBe(0));
    });

    it('generates points within the pool bounds', () => {
      const length = 10;
      const width = 6;
      const points = generatePoolPerimeterPoints('rectangle', length, width, 64);

      points.forEach((p) => {
        expect(p.x).toBeGreaterThanOrEqual(-length / 2 - 0.01);
        expect(p.x).toBeLessThanOrEqual(length / 2 + 0.01);
        expect(p.z).toBeGreaterThanOrEqual(-width / 2 - 0.01);
        expect(p.z).toBeLessThanOrEqual(width / 2 + 0.01);
      });
    });

    it('has points on all four edges', () => {
      const length = 10;
      const width = 6;
      const points = generatePoolPerimeterPoints('rectangle', length, width, 64);

      const hasBottom = points.some((p) => Math.abs(p.z + width / 2) < 0.01);
      const hasTop = points.some((p) => Math.abs(p.z - width / 2) < 0.01);
      const hasLeft = points.some((p) => Math.abs(p.x + length / 2) < 0.01);
      const hasRight = points.some((p) => Math.abs(p.x - length / 2) < 0.01);

      expect(hasBottom).toBe(true);
      expect(hasTop).toBe(true);
      expect(hasLeft).toBe(true);
      expect(hasRight).toBe(true);
    });
  });

  describe('oval', () => {
    it('generates the requested number of segments', () => {
      const segments = 64;
      const points = generatePoolPerimeterPoints('oval', 10, 6, segments);
      expect(points.length).toBe(segments);
    });

    it('all points lie on the ellipse', () => {
      const length = 10;
      const width = 6;
      const a = length / 2;
      const b = width / 2;
      const points = generatePoolPerimeterPoints('oval', length, width, 64);

      points.forEach((p) => {
        // Ellipse equation: (x/a)^2 + (z/b)^2 = 1
        const val = (p.x / a) ** 2 + (p.z / b) ** 2;
        expect(val).toBeCloseTo(1.0, 1);
      });
    });
  });

  describe('circular', () => {
    it('uses the smaller dimension for both axes', () => {
      const points = generatePoolPerimeterPoints('circular', 10, 6, 64);
      const maxDist = Math.max(...points.map((p) => Math.sqrt(p.x ** 2 + p.z ** 2)));
      // Circular uses min(length, width) = 6, so radius = 3
      expect(maxDist).toBeCloseTo(3, 0);
    });
  });

  describe('jellybean', () => {
    it('generates a valid set of points', () => {
      const points = generatePoolPerimeterPoints('jellybean', 12, 6, 128);
      expect(points.length).toBeGreaterThan(0);
      points.forEach((p) => expect(p.y).toBe(0));
    });

    it('has different left and right radii (kidney shape)', () => {
      const width = 6;
      const points = generatePoolPerimeterPoints('jellybean', 12, width, 128);
      // The jellybean has a larger left semicircle (width/2=3)
      // and a smaller right semicircle (width/3=2)
      // Verify that max X extent differs from min X extent
      const maxX = Math.max(...points.map((p) => p.x));
      const minX = Math.min(...points.map((p) => p.x));
      // Shape should extend further on one side than the other
      expect(maxX).not.toBeCloseTo(Math.abs(minX), 0);
    });
  });
});
