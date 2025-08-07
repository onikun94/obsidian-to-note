export type HeadingConversion = 'h1' | 'h2' | 'bold' | 'plain';
export type HighlightConversion = 'mark' | 'bold' | 'italic' | 'plain';
export type InternalLinkConversion = 'markdown' | 'plain' | 'remove';

export interface ObsidianToNoteSettings {
	// 見出し変換設定
	h1Conversion: HeadingConversion;
	h2Conversion: HeadingConversion;
	h3Conversion: HeadingConversion;
	h4Conversion: HeadingConversion;
	h5Conversion: HeadingConversion;
	h6Conversion: HeadingConversion;
	// その他の変換設定
	highlightConversion: HighlightConversion;
	checkboxUnchecked: string;
	checkboxChecked: string;
	mermaidConversion: string;
	// リンク変換設定
	internalLinkConversion: InternalLinkConversion;
}

export const DEFAULT_SETTINGS: ObsidianToNoteSettings = {
	// デフォルト: H1=大見出し、H2=小見出し(###に変換)、H3以降=強調
	h1Conversion: 'h1',
	h2Conversion: 'h2',
	h3Conversion: 'bold',
	h4Conversion: 'bold',
	h5Conversion: 'bold',
	h6Conversion: 'bold',
	// その他のデフォルト設定
	highlightConversion: 'bold',
	checkboxUnchecked: '□',
	checkboxChecked: '☑',
	mermaidConversion: '[Mermaid図]\n(Obsidianで表示してください)',
	internalLinkConversion: 'markdown'
};