import { ObsidianToNoteSettings, HeadingConversion } from '../types';

export class NoteFormatConverter {
	constructor(private settings: ObsidianToNoteSettings) {}

	convert(content: string): string {
		let converted = content;

		// 1. 前処理
		converted = this.removeFrontmatter(converted);
		
		// 2. 保護が必要な要素を一時的に置換
		const protectedContent = this.protectSpecialContent(converted);
		converted = protectedContent.content;

		// 3. 見出しの変換（見出し内の装飾も処理）
		converted = this.convertHeadings(converted);

		// 4. リンクの変換
		converted = this.convertImageLinks(converted);
		converted = this.convertInternalLinks(converted);

		// 5. テキスト装飾の変換
		converted = this.convertInlineFormatting(converted);

		// 6. リスト要素の変換
		converted = this.convertCheckboxes(converted);
		converted = this.convertNumberedLists(converted);
		converted = this.processNestedNumberedLists(converted);

		// 7. 引用の変換
		converted = this.convertBlockquotes(converted);

		// 8. 保護した要素を復元
		converted = this.restoreProtectedContent(converted, protectedContent);

		return converted;
	}

	private removeFrontmatter(content: string): string {
		// フロントマターを削除
		let result = content.replace(/^---\n[\s\S]*?\n---\n/m, '');
		// フロントマター削除後の先頭の空行を削除
		result = result.replace(/^\n+/, '');
		return result;
	}

	private protectSpecialContent(content: string): {
		content: string;
		codeBlocks: string[];
		blockMaths: string[];
		strikethroughs: string[];
	} {
		const codeBlockPlaceholder = '___CODEBLOCK___';
		const blockMathPlaceholder = '___BLOCKMATH___';
		const strikethroughPlaceholder = '___STRIKETHROUGH___';
		
		const codeBlocks: string[] = [];
		const blockMaths: string[] = [];
		const strikethroughs: string[] = [];
		
		let result = content;

		// コードブロックの保護と整形（言語指定を削除）
		result = result.replace(/```(\w+)?\n?([\s\S]*?)```/g, (_, __, code) => {
			const formatted = '```\n' + code.trim() + '\n```';
			codeBlocks.push(formatted);
			return `${codeBlockPlaceholder}${codeBlocks.length - 1}${codeBlockPlaceholder}`;
		});
		
		// ブロック数式の保護（$$を除去して保存）
		result = result.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
			blockMaths.push(math.trim());
			return `${blockMathPlaceholder}${blockMaths.length - 1}${blockMathPlaceholder}`;
		});

		// 取り消し線の保護（下付き文字の変換から除外するため）
		result = result.replace(/~~(.+?)~~/g, (_, content) => {
			strikethroughs.push(content);
			return `${strikethroughPlaceholder}${strikethroughs.length - 1}${strikethroughPlaceholder}`;
		});

		return {
			content: result,
			codeBlocks,
			blockMaths,
			strikethroughs
		};
	}

	private convertHeadings(content: string): string {
		return content.replace(/^(#{1,6}) (.+)$/gm, (_, hashes, text) => {
			const level = hashes.length;
			// 見出し内の装飾を削除（note.comでの表示問題を回避）
			text = this.removeHeadingDecorations(text);
			return this.formatHeading(text, level);
		});
	}

	private removeHeadingDecorations(text: string): string {
		// ハイライトの削除
		text = text.replace(/==(.*?)==/g, '$1');
		// インラインコードの削除
		text = text.replace(/`([^`]+)`/g, '$1');
		return text;
	}

	private formatHeading(text: string, level: number): string {
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

	private convertImageLinks(content: string): string {
		return content.replace(/!\[\[(.+?)\]\]/g, (_, fileName) => {
			// エイリアスを削除してファイル名のみを取得
			const cleanFileName = fileName.replace(/\|.*$/, '').trim();
			return `![${cleanFileName}](${cleanFileName})`;
		});
	}

	private convertInternalLinks(content: string): string {
		return content.replace(/\[\[(.+?)\]\]/g, (_, linkText) => {
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
	}

	private convertInlineFormatting(content: string): string {
		// インラインコードの変換
		content = content.replace(/`([^`]+)`/g, (_, code) => {
			switch (this.settings.inlineCodeConversion) {
				case 'bold':
					return `**${code}**`;
				case 'plain':
				default:
					return code;
			}
		});
		
		// インライン数式の変換（$...$を除去）
		content = content.replace(/\$([^$]+)\$/g, '$1');
		
		// ハイライトの変換
		content = content.replace(/==(.+?)==/g, (_, text) => {
			switch (this.settings.highlightConversion) {
				case 'bold':
					return `**${text}**`;
				case 'italic':
					return `*${text}*`;
				case 'plain':
				default:
					return text;
			}
		});

		// 上付き文字と下付き文字の変換（プレーンテキストに）
		content = content.replace(/\^\[(.+?)\]/g, '$1');
		content = content.replace(/~(.+?)~/g, '$1');

		return content;
	}

	private convertCheckboxes(content: string): string {
		content = content.replace(/- \[ \] (.+)$/gm, `${this.settings.checkboxUnchecked} $1`);
		content = content.replace(/- \[x\] (.+)$/gm, `${this.settings.checkboxChecked} $1`);
		return content;
	}

	private convertNumberedLists(content: string): string {
		// 1) 形式の番号付きリストを 1. 形式に変換
		return content.replace(/^(\d+)\)\s+(.*)$/gm, '$1. $2');
	}

	private convertBlockquotes(content: string): string {
		// 引用記号の後に全角スペースを追加
		return content.replace(/^>\s*/gm, '>　');
	}

	private restoreProtectedContent(
		content: string, 
		protectedContent: {
			codeBlocks: string[];
			blockMaths: string[];
			strikethroughs: string[];
		}
	): string {
		// 取り消し線を復元
		content = content.replace(/___STRIKETHROUGH___(\d+)___STRIKETHROUGH___/g, (_, index) => {
			return `~~${protectedContent.strikethroughs[parseInt(index)]}~~`;
		});
		
		// コードブロックを復元
		content = content.replace(/___CODEBLOCK___(\d+)___CODEBLOCK___/g, (_, index) => {
			return protectedContent.codeBlocks[parseInt(index)];
		});
		
		// ブロック数式を復元
		content = content.replace(/___BLOCKMATH___(\d+)___BLOCKMATH___/g, (_, index) => {
			return protectedContent.blockMaths[parseInt(index)];
		});

		return content;
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
							// 引用をインデントなしで追加、全角スペースを追加
							processedLines.push(`>　${quoteContent}`);
						}
						// インデントされたリスト項目
						else {
							const listItemMatch = nextLine.match(/^[\s\t]+[-*]\s*(.*)$/);
							if (listItemMatch) {
								// リスト項目をインデントなしで追加
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