import { App, Modal, Notice } from 'obsidian';

export class NotePreviewModal extends Modal {
	private content: string;

	constructor(app: App, content: string) {
		super(app);
		this.content = content;
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.createEl('h2', {text: 'note形式プレビュー'});
		
		// プレビューコンテナを作成
		const previewContainer = this.createPreviewContainer(contentEl);
		
		// ボタンコンテナを作成
		const buttonContainer = this.createButtonContainer(contentEl);
		
		// ボタンを追加
		this.addCopyButton(buttonContainer);
		this.addOpenNoteButton(buttonContainer);
		this.addCloseButton(buttonContainer);
	}

	private createPreviewContainer(contentEl: HTMLElement): HTMLElement {
		const previewContainer = contentEl.createDiv('note-preview-container');
		previewContainer.style.cssText = this.getPreviewContainerStyles();
		
		const pre = previewContainer.createEl('pre');
		pre.style.cssText = 'white-space: pre-wrap; font-family: monospace;';
		pre.setText(this.content);
		
		return previewContainer;
	}

	private createButtonContainer(contentEl: HTMLElement): HTMLElement {
		const buttonContainer = contentEl.createDiv('modal-button-container');
		buttonContainer.style.cssText = this.getButtonContainerStyles();
		return buttonContainer;
	}

	private addCopyButton(container: HTMLElement): void {
		const copyButton = container.createEl('button');
		copyButton.setText('コピー');
		copyButton.addEventListener('click', async () => {
			try {
				const sanitized = this.sanitizeContent(this.content);
				await navigator.clipboard.writeText(sanitized);
				const charCount = sanitized.length;
				new Notice(`クリップボードにコピーしました（${charCount}文字）`);
			} catch (error) {
				console.error('Copy failed:', error);
				new Notice('コピーに失敗しました');
			}
		});
	}

	private addOpenNoteButton(container: HTMLElement): void {
		const openNoteButton = container.createEl('button');
		openNoteButton.setText('note で開く');
		openNoteButton.addEventListener('click', async () => {
			try {
				const sanitized = this.sanitizeContent(this.content);
				await navigator.clipboard.writeText(sanitized);
				const charCount = sanitized.length;
				new Notice(`クリップボードにコピーしました（${charCount}文字）`);
				window.open('https://note.com/notes/new', '_blank');
			} catch (error) {
				console.error('Failed to open note:', error);
				new Notice('noteの新規投稿画面を開けませんでした');
			}
		});
	}

	private addCloseButton(container: HTMLElement): void {
		const closeButton = container.createEl('button');
		closeButton.setText('閉じる');
		closeButton.addEventListener('click', () => this.close());
	}

	private sanitizeContent(content: string): string {
		let sanitized = content;

		// 制御文字を削除（改行とタブは除く）
		sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
		
		// ゼロ幅文字を削除
		sanitized = sanitized.replace(/[\u200B-\u200D\uFEFF]/g, '');
		
		// 改行コードを統一
		sanitized = sanitized.replace(/\r\n/g, '\n');
		sanitized = sanitized.replace(/\r/g, '\n');
		
		// 連続する改行を制限（3つ以上は2つに）
		sanitized = sanitized.replace(/\n{3,}/g, '\n\n');
		
		// 行末の空白を除去
		sanitized = sanitized.replace(/[ \t]+$/gm, '');
		
		// noteエディタ対策
		// バックスラッシュをエスケープ
		sanitized = sanitized.replace(/\\/g, '\\\\');
		
		// 角括弧を全角に変換
		sanitized = sanitized.replace(/\[/g, '［').replace(/\]/g, '］');
		
		// 丸括弧を全角に変換
		sanitized = sanitized.replace(/\(/g, '（').replace(/\)/g, '）');
		
		return sanitized;
	}

	private getPreviewContainerStyles(): string {
		return [
			'max-height: 400px',
			'overflow-y: auto',
			'border: 1px solid var(--background-modifier-border)',
			'padding: 10px',
			'margin: 10px 0'
		].join('; ');
	}

	private getButtonContainerStyles(): string {
		return [
			'display: flex',
			'gap: 10px',
			'justify-content: flex-end',
			'margin-top: 10px'
		].join('; ');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}