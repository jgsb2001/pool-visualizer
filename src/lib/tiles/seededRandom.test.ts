import { createSeededRandom } from './seededRandom';

describe('createSeededRandom', () => {
  it('produces values between 0 and 1', () => {
    const rng = createSeededRandom(42);
    for (let i = 0; i < 1000; i++) {
      const val = rng();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  it('produces the same sequence for the same seed', () => {
    const rng1 = createSeededRandom(12345);
    const rng2 = createSeededRandom(12345);

    for (let i = 0; i < 100; i++) {
      expect(rng1()).toBe(rng2());
    }
  });

  it('produces different sequences for different seeds', () => {
    const rng1 = createSeededRandom(1);
    const rng2 = createSeededRandom(2);

    const seq1 = Array.from({ length: 10 }, () => rng1());
    const seq2 = Array.from({ length: 10 }, () => rng2());

    // At least some values should differ
    const allSame = seq1.every((v, i) => v === seq2[i]);
    expect(allSame).toBe(false);
  });

  it('has reasonable distribution', () => {
    const rng = createSeededRandom(999);
    const bins = [0, 0, 0, 0, 0]; // 5 bins: [0-0.2), [0.2-0.4), etc.
    const n = 10000;

    for (let i = 0; i < n; i++) {
      const val = rng();
      const bin = Math.min(4, Math.floor(val * 5));
      bins[bin]++;
    }

    // Each bin should have roughly 20% of values (±5%)
    bins.forEach((count) => {
      const ratio = count / n;
      expect(ratio).toBeGreaterThan(0.15);
      expect(ratio).toBeLessThan(0.25);
    });
  });
});
