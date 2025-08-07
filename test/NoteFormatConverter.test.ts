import { describe, it, expect, beforeEach } from 'vitest';
import { NoteFormatConverter } from '../src/converters/NoteFormatConverter';
import { DEFAULT_SETTINGS, ObsidianToNoteSettings } from '../src/types';

describe('NoteFormatConverter', () => {
  let converter: NoteFormatConverter;
  let settings: ObsidianToNoteSettings;

  beforeEach(() => {
    settings = { ...DEFAULT_SETTINGS };
    converter = new NoteFormatConverter(settings);
  });

  describe('見出しの変換', () => {
    it('H1をデフォルト設定で変換する', () => {
      const input = '# 大見出し';
      const expected = '# 大見出し';
      expect(converter.convert(input)).toBe(expected);
    });

    it('H2をデフォルト設定で変換する', () => {
      const input = '## 小見出し';
      const expected = '### 小見出し';
      expect(converter.convert(input)).toBe(expected);
    });

    it('H3を強調に変換する', () => {
      const input = '### セクション';
      const expected = '**セクション**';
      expect(converter.convert(input)).toBe(expected);
    });

    it('H4-H6を強調に変換する', () => {
      const inputs = [
        '#### H4見出し',
        '##### H5見出し',
        '###### H6見出し'
      ];
      const expected = [
        '**H4見出し**',
        '**H5見出し**',
        '**H6見出し**'
      ];

      inputs.forEach((input, index) => {
        expect(converter.convert(input)).toBe(expected[index]);
      });
    });

    it('カスタム設定で見出しを変換する', () => {
      settings.h1Conversion = 'bold';
      settings.h2Conversion = 'plain';
      converter = new NoteFormatConverter(settings);

      expect(converter.convert('# タイトル')).toBe('**タイトル**');
      expect(converter.convert('## サブタイトル')).toBe('サブタイトル');
    });
  });

  describe('内部リンクの変換', () => {
    it('シンプルな内部リンクをMarkdownリンクに変換する', () => {
      const input = '[[ページ名]]';
      const expected = '[ページ名](ページ名)';
      expect(converter.convert(input)).toBe(expected);
    });

    it('エイリアス付き内部リンクを変換する', () => {
      const input = '[[実際のページ名|表示名]]';
      const expected = '[表示名](実際のページ名)';
      expect(converter.convert(input)).toBe(expected);
    });

    it('内部リンクをプレーンテキストに変換する', () => {
      settings.internalLinkConversion = 'plain';
      converter = new NoteFormatConverter(settings);

      expect(converter.convert('[[ページ名]]')).toBe('ページ名');
      expect(converter.convert('[[実際のページ名|表示名]]')).toBe('表示名');
    });

    it('内部リンクを削除する', () => {
      settings.internalLinkConversion = 'remove';
      converter = new NoteFormatConverter(settings);

      expect(converter.convert('前[[リンク]]後')).toBe('前後');
    });
  });

  describe('ハイライトの変換', () => {
    it('ハイライトをデフォルト設定（太字）で変換する', () => {
      const input = '==重要なテキスト==';
      const expected = '**重要なテキスト**';
      expect(converter.convert(input)).toBe(expected);
    });

    it('ハイライトを<mark>タグに変換する', () => {
      settings.highlightConversion = 'mark';
      converter = new NoteFormatConverter(settings);

      const input = '==重要なテキスト==';
      const expected = '<mark>重要なテキスト</mark>';
      expect(converter.convert(input)).toBe(expected);
    });

    it('ハイライトを斜体に変換する', () => {
      settings.highlightConversion = 'italic';
      converter = new NoteFormatConverter(settings);

      const input = '==重要なテキスト==';
      const expected = '*重要なテキスト*';
      expect(converter.convert(input)).toBe(expected);
    });
  });

  describe('チェックボックスの変換', () => {
    it('未チェックのチェックボックスを変換する', () => {
      const input = '- [ ] タスク1';
      const expected = '□ タスク1';
      expect(converter.convert(input)).toBe(expected);
    });

    it('チェック済みのチェックボックスを変換する', () => {
      const input = '- [x] 完了タスク';
      const expected = '☑ 完了タスク';
      expect(converter.convert(input)).toBe(expected);
    });

    it('カスタム記号でチェックボックスを変換する', () => {
      settings.checkboxUnchecked = '[ ]';
      settings.checkboxChecked = '[x]';
      converter = new NoteFormatConverter(settings);

      expect(converter.convert('- [ ] タスク')).toBe('[ ] タスク');
      expect(converter.convert('- [x] 完了')).toBe('[x] 完了');
    });
  });

  describe('インラインコードとインライン数式の変換', () => {
    it('インラインコードのバッククオートを除去する', () => {
      const input = 'これは`console.log("Hello")`というコードです';
      const expected = 'これはconsole.log("Hello")というコードです';
      expect(converter.convert(input)).toBe(expected);
    });

    it('インライン数式のドル記号を除去する', () => {
      const input = 'アインシュタインの式は$E = mc^2$です';
      const expected = 'アインシュタインの式はE = mc^2です';
      expect(converter.convert(input)).toBe(expected);
    });

    it('ブロック数式のドル記号を除去する', () => {
      const input = '$$\n\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}\n$$';
      const expected = '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}';
      expect(converter.convert(input)).toBe(expected);
    });
  });

  describe('取り消し線と下付き文字の変換', () => {
    it('取り消し線をそのまま保持する', () => {
      const input = '~~取り消し線~~';
      const expected = '~~取り消し線~~';
      expect(converter.convert(input)).toBe(expected);
    });

    it('下付き文字を<sub>タグに変換する', () => {
      const input = 'H~2~O';
      const expected = 'H<sub>2</sub>O';
      expect(converter.convert(input)).toBe(expected);
    });

    it('取り消し線と下付き文字が混在する場合も正しく変換する', () => {
      const input = '~~削除テキスト~~ と H~2~O';
      const expected = '~~削除テキスト~~ と H<sub>2</sub>O';
      expect(converter.convert(input)).toBe(expected);
    });
  });

  describe('コードブロックの変換', () => {
    it('コードブロックを整形する', () => {
      const input = '```\nconst x = 1;\n```';
      const expected = '```\nconst x = 1;\n```';
      expect(converter.convert(input)).toBe(expected);
    });

    it('言語指定付きコードブロックを整形する', () => {
      const input = '```javascript\nconst x = 1;\n```';
      const expected = '```\nconst x = 1;\n```';
      expect(converter.convert(input)).toBe(expected);
    });
  });

  describe('ネストされた構造の変換', () => {
    it('番号付きリスト内の引用を正しく変換する', () => {
      const input = `1. 親項目
   > 引用文の中で
   > - リスト項目1
   > - リスト項目2`;
      
      const expected = `1. 親項目
> 引用文の中で
> - リスト項目1
> - リスト項目2`;
      
      expect(converter.convert(input)).toBe(expected);
    });
  });

  describe('特殊な変換', () => {
    it('画像の内部リンクを変換する', () => {
      const input = '![[image.png]]';
      const expected = '![image.png](image.png)';
      expect(converter.convert(input)).toBe(expected);
    });

    it('上付き文字と下付き文字を変換する', () => {
      const input = 'x^[2] + H~2~O';
      const expected = 'x<sup>2</sup> + H<sub>2</sub>O';
      expect(converter.convert(input)).toBe(expected);
    });

    it('Mermaid図表を代替テキストに変換する', () => {
      const input = '```mermaid\ngraph TD\n  A-->B\n```';
      const expected = DEFAULT_SETTINGS.mermaidConversion;
      expect(converter.convert(input)).toBe(expected);
    });
  });

  describe('複合的な変換', () => {
    it('複数の要素を含むドキュメントを変換する', () => {
      const input = `# タイトル
## サブタイトル
### セクション

これは==重要な==テキストです。

- [ ] タスク1
- [x] タスク2

内部リンク: [[ページ]]と[[ページ|別名]]

\`\`\`javascript
console.log("Hello");
\`\`\``;

      const expected = `# タイトル
### サブタイトル
**セクション**

これは**重要な**テキストです。

□ タスク1
☑ タスク2

内部リンク: [ページ](ページ)と[別名](ページ)

\`\`\`
console.log("Hello");
\`\`\``;

      expect(converter.convert(input)).toBe(expected);
    });
  });
});
