import { vi } from 'vitest';

// グローバルな設定
global.navigator = {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
} as any;

global.window = {
  open: vi.fn(),
} as any;