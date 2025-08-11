import { ObsidianToNoteSettings, HeadingConversion } from '../types';

export class NoteFormatConverter {
	constructor(private settings: ObsidianToNoteSettings) {}

	convert(content: string): string {
		let converted = content;

		// フロントマターを削除
		converted = converted.replace(/^---\n[\s\S]*?\n---\n/m, '');
		// フロントマター削除後の先頭の空行を削除
		converted = converted.replace(/^\n+/, '');

		// 見出しの変換（H1〜H6）
		converted = converted.replace(/^(#{1,6}) (.+)$/gm, (match, hashes, text) => {
			const level = hashes.length;
			// 見出し内のハイライトを先に処理（<mark>タグが見出し内にあるとnote.comで問題が発生するため）
			if (text.includes('==')) {
				// 見出し内では常にハイライトを太字に変換
				text = text.replace(/==(.*?)==/g, '**$1**');
			}
			// 見出し内のインラインコードのバッククオートも削除（note.comでの表示問題を回避）
			text = text.replace(/`([^`]+)`/g, '$1');
			return this.convertHeading(text, level);
		});

		// コードブロックとブロック数式を保護
		const codeBlockPlaceholder = '___CODEBLOCK___';
		const blockMathPlaceholder = '___BLOCKMATH___';
		const codeBlocks: string[] = [];
		const blockMaths: string[] = [];
		
		// Mermaid図表の処理（コードブロックより先に処理）
		converted = converted.replace(/```mermaid([\s\S]*?)```/g, (match, code) => {
			return this.settings.mermaidConversion;
		});

		// コードブロックの保護と整形（言語指定を削除）
		converted = converted.replace(/```(\w+)?\n?([\s\S]*?)```/g, (match, lang, code) => {
			const formatted = '```\n' + code.trim() + '\n```';
			codeBlocks.push(formatted);
			return `${codeBlockPlaceholder}${codeBlocks.length - 1}${codeBlockPlaceholder}`;
		});
		
		// ブロック数式の保護（$$を除去して保存）
		converted = converted.replace(/\$\$([\s\S]*?)\$\$/g, (match, math) => {
			blockMaths.push(math.trim());
			return `${blockMathPlaceholder}${blockMaths.length - 1}${blockMathPlaceholder}`;
		});

		// 画像の内部リンクを標準的なMarkdown形式に変換
		converted = converted.replace(/!\[\[(.+?)\]\]/g, (match, fileName) => {
			// ファイル名から拡張子を取得
			const cleanFileName = fileName.replace(/\|.*$/, '').trim();
			return `![${cleanFileName}](${cleanFileName})`;
		});

		// 内部リンクの変換
		converted = converted.replace(/\[\[(.+?)\]\]/g, (match, linkText) => {
			const parts = linkText.split('|');
			const displayText = parts.length === 2 ? parts[1] : parts[0];
			const linkTarget = parts[0];

			switch (this.settings.internalLinkConversion) {
				case 'markdown':
					return `[${displayText}](${linkTarget})`;
				case 'plain':
					return displayText;
				case 'remove':
					return '';
				default:
					return displayText;
			}
		});

		// インラインコードの変換（バッククオートを除去）
		converted = converted.replace(/`([^`]+)`/g, '$1');
		
		// インライン数式の変換（$...$を除去）
		converted = converted.replace(/\$([^$]+)\$/g, '$1');
		
		// ハイライトの変換
		converted = converted.replace(/==(.+?)==/g, (match, text) => {
			switch (this.settings.highlightConversion) {
				case 'mark':
					return `<mark>${text}</mark>`;
				case 'bold':
					return `**${text}**`;
				case 'italic':
					return `*${text}*`;
				case 'plain':
				default:
					return text;
			}
		});

		// 取り消し線の保護（下付き文字の変換から除外するため一時的に置換）
		const strikethroughPlaceholder = '___STRIKETHROUGH___';
		converted = converted.replace(/~~(.+?)~~/g, (match, content) => {
			return `${strikethroughPlaceholder}${content}${strikethroughPlaceholder}`;
		});
		
		// 上付き文字と下付き文字の変換
		converted = converted.replace(/\^\[(.+?)\]/g, '<sup>$1</sup>');
		converted = converted.replace(/~(.+?)~/g, '<sub>$1</sub>');

		// チェックボックスの変換
		converted = converted.replace(/- \[ \] (.+)$/gm, `${this.settings.checkboxUnchecked} $1`);
		converted = converted.replace(/- \[x\] (.+)$/gm, `${this.settings.checkboxChecked} $1`);

		// 1) 形式の番号付きリストを 1. 形式に変換（単純な場合）
		converted = converted.replace(/^(\d+)\)\s+(.*)$/gm, '$1. $2');

		// ネストされた番号付きリストの処理
		converted = this.processNestedNumberedLists(converted);

		// 通常の引用記号の後に全角スペースを追加（既にスペースがある場合は全角に置換）
		converted = converted.replace(/^>\s*/gm, '>　');
		
		// 取り消し線を元に戻す
		converted = converted.replace(new RegExp(strikethroughPlaceholder, 'g'), '~~');
		
		// コードブロックを元に戻す
		converted = converted.replace(new RegExp(`${codeBlockPlaceholder}(\\d+)${codeBlockPlaceholder}`, 'g'), (match, index) => {
			return codeBlocks[parseInt(index)];
		});
		
		// ブロック数式を元に戻す
		converted = converted.replace(new RegExp(`${blockMathPlaceholder}(\\d+)${blockMathPlaceholder}`, 'g'), (match, index) => {
			return blockMaths[parseInt(index)];
		});

		return converted;
	}

	private convertHeading(text: string, level: number): string {
		const conversionMap: { [key: number]: HeadingConversion } = {
			1: this.settings.h1Conversion,
			2: this.settings.h2Conversion,
			3: this.settings.h3Conversion,
			4: this.settings.h4Conversion,
			5: this.settings.h5Conversion,
			6: this.settings.h6Conversion
		};

		const conversion = conversionMap[level] || 'plain';

		switch (conversion) {
			case 'h1': return `# ${text}`;
			case 'h2': return `### ${text}`;
			case 'bold': return `**${text}**`;
			case 'plain': 
			default: return text;
		}
	}

	private processNestedNumberedLists(content: string): string {
		const lines = content.split('\n');
		const processedLines: string[] = [];
		let i = 0;

		while (i < lines.length) {
			const line = lines[i];
			
			// 番号付きリストの開始を検出（1. または 1) の両形式に対応）
			const numberedListMatch = line.match(/^(\d+)[.)]\s+(.*)$/);
			
			if (numberedListMatch) {
				const listNumber = numberedListMatch[1];
				const listContent = numberedListMatch[2];
				processedLines.push(`${listNumber}. ${listContent}`);
				
				// 次の行以降でインデントされた内容を探す
				i++;
				while (i < lines.length) {
					const nextLine = lines[i];
					
					// インデントされた行（スペースまたはタブで始まる）
					if (nextLine.match(/^[\s\t]+/)) {
						// インデントされた引用ブロック
						const quoteMatch = nextLine.match(/^[\s\t]+>\s*(.*)$/);
						if (quoteMatch) {
							const quoteContent = quoteMatch[1];
							// 引用をインデントなしで追加（> を維持）、空行も含む
							processedLines.push(`>　${quoteContent}`);
						}
						// インデントされたリスト項目
						else {
							const listItemMatch = nextLine.match(/^[\s\t]+[-*]\s*(.*)$/);
							if (listItemMatch) {
								// リスト項目をインデントなしで追加（空の内容も含む）
								const itemContent = listItemMatch[1] || '';
								processedLines.push(`- ${itemContent}`);
							} else {
								// その他のインデントされた内容はそのまま追加（インデントを除去）
								const trimmedContent = nextLine.trim();
								if (trimmedContent) {
									processedLines.push(trimmedContent);
								}
							}
						}
						i++;
					}
					// 空行
					else if (nextLine.trim() === '') {
						processedLines.push('');
						i++;
					}
					// インデントされていない新しい行が来たら終了
					else {
						break;
					}
				}
			} else {
				// 番号付きリストでない行はそのまま追加
				processedLines.push(line);
				i++;
			}
		}

		return processedLines.join('\n');
	}
}