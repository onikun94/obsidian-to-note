# Obsidian to Note

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/onikun94/obsidian-to-note/releases)
[![Obsidian Plugin](https://img.shields.io/badge/Obsidian-Plugin-7c3aed.svg)](https://obsidian.md)

Obsidianのマークダウンをnoteのエディタにコピペできるフォーマットに変換するプラグインです。

## 機能

- Obsidian独自の記法をnoteで表示可能な形式に変換
- 変換ルールを設定画面でカスタマイズ可能
- プレビュー機能でコピー前に確認
- ワンクリックでnoteの新規作成画面を開く

## インストール方法

1. Obsidianの設定 → コミュニティプラグイン → ブラウズ
2. "Obsidian to Note"を検索
3. インストールして有効化

### 手動インストール

1. [Releases](https://github.com/yourusername/obsidian-to-note/releases)から最新版をダウンロード
2. `main.js`、`manifest.json`を`VaultFolder/.obsidian/plugins/obsidian-to-note/`にコピー
3. Obsidianを再起動し、設定でプラグインを有効化

## 使い方

1. noteに投稿したいノートを開く
2. 以下のいずれかの方法で変換を実行：
   - コマンドパレット（Cmd/Ctrl+P）で「Convert current file to note format」
   - 左サイドバーの鉛筆アイコンをクリック
3. プレビューで変換結果を確認
4. 「コピー」または「noteで開く」をクリック
5. noteのエディタに貼り付けて投稿

## 変換ルール

### デフォルト設定

- **H1 (#)** → 大見出し
- **H2 (##)** → 小見出し  
- **H3-H6 (###〜)** → 強調（**太字**）
- **内部リンク [[link]]** → Markdownリンク
- **ハイライト ==text==** → `<mark>text</mark>`
- **チェックボックス** → □ / ☑

### カスタマイズ可能な項目

設定画面で以下の項目をカスタマイズできます：

- 各見出しレベル（H1〜H6）の変換方法
- ハイライトの変換方法
- 内部リンクの処理方法
- チェックボックスの記号
- Mermaid図表の代替テキスト

## 開発

```bash
# 依存関係のインストール
npm install

# 開発モード
npm run dev

# ビルド
npm run build
```

## ライセンス

MIT License
