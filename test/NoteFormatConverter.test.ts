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
>　引用文の中で
>　- リスト項目1
>　- リスト項目2`;
      
      expect(converter.convert(input)).toBe(expected);
    });
    
    it('引用記号後に全角スペースを追加する', () => {
      const input = `> [!note] 動画について
> - **チャンネル**: ジョージ VLOG チャンネル
> - **公開日**: 2025年08月09日
> - **再生時間**: 1962秒
> - **ジャンル**: People & Blogs
> - **視聴回数**: 2596 回
> - **いいね数**: 149 個`;
      
      const expected = `>　[!note] 動画について
>　- **チャンネル**: ジョージ VLOG チャンネル
>　- **公開日**: 2025年08月09日
>　- **再生時間**: 1962秒
>　- **ジャンル**: People & Blogs
>　- **視聴回数**: 2596 回
>　- **いいね数**: 149 個`;
      
      // 通常の引用も全角スペースが追加されることを確認
      const converter2 = new NoteFormatConverter(settings);
      const simpleQuote = '> これは引用です';
      const expectedSimple = '>　これは引用です';
      
      // 標準的な引用を変換する機能を追加する必要がある
      expect(converter2.convert(simpleQuote)).toBe(expectedSimple);
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
      const expected = 'x2 + H2O';
      expect(converter.convert(input)).toBe(expected);
    });

    it('Mermaid図表をコードブロックとして保持する（デフォルト）', () => {
      const input = '```mermaid\ngraph TD\n  A-->B\n```';
      const expected = '```\ngraph TD\n  A-->B\n```';
      expect(converter.convert(input)).toBe(expected);
    });

    it('Mermaid図表を代替テキストに変換する', () => {
      const customSettings = {
        ...DEFAULT_SETTINGS,
        mermaidConversionType: 'text' as const
      };
      const customConverter = new NoteFormatConverter(customSettings);
      const input = '```mermaid\ngraph TD\n  A-->B\n```';
      const expected = DEFAULT_SETTINGS.mermaidReplacementText;
      expect(customConverter.convert(input)).toBe(expected);
    });
  });

  describe('フロントマターの処理', () => {
    it('フロントマターを削除する', () => {
      const input = `---
ID: "2025-08-08T11:33:52"
createdAt: "2025-08-08T11:33:52"
aliases: []
tags: []
type: fleetingNote
date created: 金曜日, 8月 8日 2025, 11:33:52 午前
date modified: 金曜日, 8月 8日 2025, 11:36:46 午前
---

# タイトル`;
      
      const expected = `# タイトル`;
      
      expect(converter.convert(input)).toBe(expected);
    });

    it('フロントマターとその後の内容を正しく処理する', () => {
      const input = `---
title: "テスト"
author: "Author"
---

# 本文のタイトル
## サブタイトル`;
      
      const expected = `# 本文のタイトル
### サブタイトル`;
      
      expect(converter.convert(input)).toBe(expected);
    });

    it('空行を含むフロントマターも削除する', () => {
      const input = `---
ID: "2025-08-08T11:33:52"

aliases: []
tags: []

date created: 金曜日, 8月 8日 2025, 11:33:52 午前
---

本文`;
      
      const expected = `本文`;
      
      expect(converter.convert(input)).toBe(expected);
    });
  });

  describe('ネストされた箇条書きの特殊ケース', () => {
    it('1)形式の番号付きリストを1.形式に変換し、空の箇条書き項目も正しく変換する', () => {
      const input = `1) GitHub の Releases から最新版をダウンロード
   ![GitHub Releases ページのスクリーンショット](need.png)

2) Vault/.obsidian/plugins/obsidian-to-note/ を作成し、main.js、manifest.json（必要なら styles.css）を配置
   ![plugin](need.png)

3) Obsidian を再起動 → 設定 → Community plugins → Safe mode をオフ
   ![Community plugins](need.png)

4) プラグイン一覧から「Obsidian to Note」を有効化
   - 
   - `;
      
      const expected = `1. GitHub の Releases から最新版をダウンロード
![GitHub Releases ページのスクリーンショット](need.png)

2. Vault/.obsidian/plugins/obsidian-to-note/ を作成し、main.js、manifest.json（必要なら styles.css）を配置
![plugin](need.png)

3. Obsidian を再起動 → 設定 → Community plugins → Safe mode をオフ
![Community plugins](need.png)

4. プラグイン一覧から「Obsidian to Note」を有効化
- 
- `;
      
      expect(converter.convert(input)).toBe(expected);
    });

    it('ネストされた番号付きリスト内の箇条書きをフラット化する', () => {
      const input = `1. 手順 1
   - 補足メモ
   - 注意事項`;
      
      const expected = `1. 手順 1
- 補足メモ
- 注意事項`;
      
      expect(converter.convert(input)).toBe(expected);
    });

    it('空の番号付きリスト項目を正しく処理する', () => {
      const input = `1. 
2. 
3. 
4. `;
      
      const expected = `1. 
2. 
3. 
4. `;
      
      expect(converter.convert(input)).toBe(expected);
    });

    it('1)形式の番号付きリスト（インデントなし）を1.形式に変換', () => {
      const input = `1) note に投稿したいノートを Obsidian で開く
2) 次のどちらかで変換を実行
3) プレビューで結果を確認
4) 「コピー」または「note で開く」をクリック
5) note のエディタに貼り付けて投稿`;
      
      const expected = `1. note に投稿したいノートを Obsidian で開く
2. 次のどちらかで変換を実行
3. プレビューで結果を確認
4. 「コピー」または「note で開く」をクリック
5. note のエディタに貼り付けて投稿`;
      
      expect(converter.convert(input)).toBe(expected);
    });
  });

  describe('見出し内の装飾変換', () => {
    it('見出し内のハイライトとインラインコードを正しく変換する', () => {
      const input = `test_before

# 見出し内の装飾: ==ハイライト== と \`code\` を含む見出し

test_after`;
      
      const expected = `test_before

# 見出し内の装飾: ハイライト と code を含む見出し

test_after`;
      
      expect(converter.convert(input)).toBe(expected);
    });

    it('見出し内のハイライトのみを変換する', () => {
      const input = '# ==ハイライト==のみの見出し';
      const expected = '# ハイライトのみの見出し';
      expect(converter.convert(input)).toBe(expected);
    });

    it('見出し内のインラインコードのみを変換する', () => {
      const input = '# \`code\`のみの見出し';
      const expected = '# codeのみの見出し';
      expect(converter.convert(input)).toBe(expected);
    });

    it('H2見出し内の装飾を変換する', () => {
      const input = '## 見出し内の装飾: ==ハイライト== と \`code\` を含む見出し（H2）';
      const expected = '### 見出し内の装飾: ハイライト と code を含む見出し（H2）';
      expect(converter.convert(input)).toBe(expected);
    });

    it('H3見出し内の装飾を変換する', () => {
      const input = '### 見出し内の装飾: ==ハイライト== と \`code\` を含む見出し（H3）';
      const expected = '**見出し内の装飾: ハイライト と code を含む見出し（H3）**';
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

    it('フロントマターと複数の要素を含む実例', () => {
      const input = `---
ID: "2025-08-08T11:33:52"
createdAt: "2025-08-08T11:33:52"
aliases: []
tags: []
type: fleetingNote
date created: 金曜日, 8月 8日 2025, 11:33:52 午前
date modified: 金曜日, 8月 8日 2025, 11:36:46 午前
---

# Obsidian to Note プラグイン紹介ノート（初心者向け）

- **対象**: Obsidian のノートを「note（https://note.com）」へスムーズに投稿したい人
- **できること**: Obsidian 特有の記法を、note でそのまま貼り付け・表示しやすい形式に一括変換し、プレビューで確認してから「コピー」や「note で開く」がワンクリックでできます。

![[Obsidian 側のイメージ（左サイドバーのペンアイコン、プレビュー）を示す]]`;

      const expected = `# Obsidian to Note プラグイン紹介ノート（初心者向け）

- **対象**: Obsidian のノートを「note（https://note.com）」へスムーズに投稿したい人
- **できること**: Obsidian 特有の記法を、note でそのまま貼り付け・表示しやすい形式に一括変換し、プレビューで確認してから「コピー」や「note で開く」がワンクリックでできます。

![Obsidian 側のイメージ（左サイドバーのペンアイコン、プレビュー）を示す](Obsidian 側のイメージ（左サイドバーのペンアイコン、プレビュー）を示す)`;

      expect(converter.convert(input)).toBe(expected);
    });
  });
});
