import { describe, it, expect } from 'vitest';
import { DEFAULT_SETTINGS } from '../src/types/index';

describe('型定義とデフォルト設定', () => {
  it('DEFAULT_SETTINGSが正しいデフォルト値を持つ', () => {
    expect(DEFAULT_SETTINGS).toEqual({
      h1Conversion: 'h1',
      h2Conversion: 'h2',
      h3Conversion: 'bold',
      h4Conversion: 'bold',
      h5Conversion: 'bold',
      h6Conversion: 'bold',
      highlightConversion: 'bold',
      checkboxUnchecked: '□',
      checkboxChecked: '☑',
      mermaidConversionType: 'code',
      mermaidReplacementText: '[Mermaid図]\n(noteでは直接mermaid図を表示できません。mermaid図を別途生成して、noteに貼り付けてください。)',
      internalLinkConversion: 'markdown'
    });
  });

  it('見出しのデフォルト設定が期待通り', () => {
    // H1とH2は見出しとして保持
    expect(DEFAULT_SETTINGS.h1Conversion).toBe('h1');
    expect(DEFAULT_SETTINGS.h2Conversion).toBe('h2');
    
    // H3以降は強調に変換
    expect(DEFAULT_SETTINGS.h3Conversion).toBe('bold');
    expect(DEFAULT_SETTINGS.h4Conversion).toBe('bold');
    expect(DEFAULT_SETTINGS.h5Conversion).toBe('bold');
    expect(DEFAULT_SETTINGS.h6Conversion).toBe('bold');
  });

  it('その他の変換設定が期待通り', () => {
    expect(DEFAULT_SETTINGS.highlightConversion).toBe('bold');
    expect(DEFAULT_SETTINGS.internalLinkConversion).toBe('markdown');
    expect(DEFAULT_SETTINGS.checkboxUnchecked).toBe('□');
    expect(DEFAULT_SETTINGS.checkboxChecked).toBe('☑');
  });
});