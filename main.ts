import { Editor, MarkdownView, Plugin } from 'obsidian';
import { ObsidianToNoteSettings, DEFAULT_SETTINGS } from './src/types';
import { NoteFormatConverter } from './src/converters/NoteFormatConverter';
import { NotePreviewModal } from './src/ui/NotePreviewModal';
import { ObsidianToNoteSettingTab } from './src/ui/SettingTab';

export default class ObsidianToNotePlugin extends Plugin {
	settings: ObsidianToNoteSettings;
	converter: NoteFormatConverter;

	async onload() {
		await this.loadSettings();
		this.converter = new NoteFormatConverter(this.settings);

		// コマンド: エディタ内でnote形式に変換
		this.addCommand({
			id: 'convert-to-note',
			name: 'Convert current file to note format',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const content = editor.getValue();
				const convertedContent = this.converter.convert(content);
				new NotePreviewModal(this.app, convertedContent).open();
			}
		});

		// リボンアイコン
		this.addRibbonIcon('pencil', 'Convert to note', (evt: MouseEvent) => {
			const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (activeView) {
				const content = activeView.editor.getValue();
				const convertedContent = this.converter.convert(content);
				new NotePreviewModal(this.app, convertedContent).open();
			}
		});

		// 設定タブ
		this.addSettingTab(new ObsidianToNoteSettingTab(this.app, this));
	}

	onunload() {
		// クリーンアップが必要な場合はここに記述
	}

	async loadSettings() {
		const savedData = await this.loadData();
		// 古い設定からの移行
		if (savedData && 'mermaidConversion' in savedData && !('mermaidConversionType' in savedData)) {
			savedData.mermaidConversionType = 'text';
			savedData.mermaidReplacementText = savedData.mermaidConversion;
			delete savedData.mermaidConversion;
		}
		this.settings = Object.assign({}, DEFAULT_SETTINGS, savedData);
	}

	async saveSettings() {
		await this.saveData(this.settings);
		// 設定が変更されたらコンバーターを再作成
		this.converter = new NoteFormatConverter(this.settings);
	}
}