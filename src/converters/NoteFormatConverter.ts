import { ObsidianToNoteSettings, HeadingConversion } from '../types';

export class NoteFormatConverter {
	constructor(private settings: ObsidianToNoteSettings) {}

	convert(content: string): string {
		let converted = content;

		// 見出しの変換（H1〜H6）
		converted = converted.replace(/^(#{1,6}) (.+)$/gm, (match, hashes, text) => {
			const level = hashes.length;
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
			return `![${fileName}](${fileName})`;
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

		// ネストされた番号付きリストの処理
		converted = this.processNestedNumberedLists(converted);

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
			
			// 番号付きリストの開始を検出
			const numberedListMatch = line.match(/^(\d+)\.\s+(.+)$/);
			
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
							processedLines.push(`> ${quoteContent}`);
						}
						// インデントされたリスト項目
						else {
							const listItemMatch = nextLine.match(/^[\s\t]+[-*]\s+(.+)$/);
							if (listItemMatch) {
								// リスト項目をインデントなしで追加
								processedLines.push(`- ${listItemMatch[1]}`);
							} else {
								// その他のインデントされた内容はそのまま追加（インデントを除去）
								processedLines.push(nextLine.trim());
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