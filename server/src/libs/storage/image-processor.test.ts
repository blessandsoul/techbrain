import { describe, expect, it, vi } from 'vitest';

vi.mock('sharp', () => {
  throw new Error('Sharp must not load while the server modules initialize');
});

describe('production image processor bootstrap', () => {
  it('does not load Sharp when the optimizer service is imported', async () => {
    const { imageOptimizerService } = await import('./image-optimizer.service.js');

    expect(imageOptimizerService).toBeDefined();
  });
});
