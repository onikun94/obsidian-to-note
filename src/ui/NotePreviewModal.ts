import { App, Modal, Notice, Setting } from 'obsidian';

export class NotePreviewModal extends Modal {
	content: string;

	constructor(app: App, content: string) {
		super(app);
		this.content = content;
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.createEl('h2', {text: 'note形式プレビュー'});
		
		const previewContainer = contentEl.createDiv('note-preview-container');
		previewContainer.style.cssText = 'max-height: 400px; overflow-y: auto; border: 1px solid var(--background-modifier-border); padding: 10px; margin: 10px 0;';
		
		const pre = previewContainer.createEl('pre');
		pre.style.cssText = 'white-space: pre-wrap; font-family: monospace;';
		pre.setText(this.content);

		const buttonContainer = contentEl.createDiv();
		buttonContainer.style.cssText = 'display: flex; gap: 10px; justify-content: flex-end; margin-top: 10px;';

		new Setting(buttonContainer)
			.addButton(btn => btn
				.setButtonText('コピー')
				.onClick(() => {
					navigator.clipboard.writeText(this.content);
					new Notice('クリップボードにコピーしました');
				}));

		new Setting(buttonContainer)
			.addButton(btn => btn
				.setButtonText('noteで開く')
				.setCta()
				.onClick(() => {
					navigator.clipboard.writeText(this.content);
					window.open('https://note.com/notes/new', '_blank');
					new Notice('クリップボードにコピーしました。noteの編集画面に貼り付けてください。');
					this.close();
				}));

		new Setting(buttonContainer)
			.addButton(btn => btn
				.setButtonText('閉じる')
				.onClick(() => {
					this.close();
				}));
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}