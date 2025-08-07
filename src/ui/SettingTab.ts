import { App, PluginSettingTab, Setting } from 'obsidian';
import { ObsidianToNoteSettings, HeadingConversion, HighlightConversion, InternalLinkConversion } from '../types';
import ObsidianToNotePlugin from '../../main';

export class ObsidianToNoteSettingTab extends PluginSettingTab {
	plugin: ObsidianToNotePlugin;

	constructor(app: App, plugin: ObsidianToNotePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Obsidian to Note 設定'});

		// 見出し変換設定
		containerEl.createEl('h3', {text: '見出し変換設定'});
		
		const headingLevels = [
			{ level: 1, setting: 'h1Conversion', name: 'H1 (#)' },
			{ level: 2, setting: 'h2Conversion', name: 'H2 (##)' },
			{ level: 3, setting: 'h3Conversion', name: 'H3 (###)' },
			{ level: 4, setting: 'h4Conversion', name: 'H4 (####)' },
			{ level: 5, setting: 'h5Conversion', name: 'H5 (#####)' },
			{ level: 6, setting: 'h6Conversion', name: 'H6 (######)' }
		];

		headingLevels.forEach(({ level, setting, name }) => {
			new Setting(containerEl)
				.setName(name)
				.setDesc(`${name}の変換方法を選択`)
				.addDropdown(dropdown => dropdown
					.addOption('h1', '大見出し (#)')
					.addOption('h2', '小見出し (###)')
					.addOption('bold', '強調 (**)')
					.addOption('plain', 'プレーンテキスト')
					.setValue(this.plugin.settings[setting as keyof ObsidianToNoteSettings] as string)
					.onChange(async (value) => {
						(this.plugin.settings as any)[setting] = value;
						await this.plugin.saveSettings();
					}));
		});

		// その他の変換設定
		containerEl.createEl('h3', {text: 'その他の変換設定'});

		new Setting(containerEl)
			.setName('ハイライト (==テキスト==)')
			.setDesc('ハイライトの変換方法')
			.addDropdown(dropdown => dropdown
				.addOption('mark', '<mark>タグ')
				.addOption('bold', '強調 (**)')
				.addOption('italic', '斜体 (*)')
				.addOption('plain', 'プレーンテキスト')
				.setValue(this.plugin.settings.highlightConversion)
				.onChange(async (value: HighlightConversion) => {
					this.plugin.settings.highlightConversion = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('内部リンク ([[リンク]])')
			.setDesc('内部リンクの変換方法')
			.addDropdown(dropdown => dropdown
				.addOption('markdown', 'Markdownリンク')
				.addOption('plain', 'テキストのみ')
				.addOption('remove', '削除')
				.setValue(this.plugin.settings.internalLinkConversion)
				.onChange(async (value: InternalLinkConversion) => {
					this.plugin.settings.internalLinkConversion = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('未チェックボックス')
			.setDesc('未チェックのチェックボックスの記号')
			.addText(text => text
				.setPlaceholder('□')
				.setValue(this.plugin.settings.checkboxUnchecked)
				.onChange(async (value) => {
					this.plugin.settings.checkboxUnchecked = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('チェック済みボックス')
			.setDesc('チェック済みのチェックボックスの記号')
			.addText(text => text
				.setPlaceholder('☑')
				.setValue(this.plugin.settings.checkboxChecked)
				.onChange(async (value) => {
					this.plugin.settings.checkboxChecked = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Mermaid図表')
			.setDesc('Mermaid図表の代替テキスト')
			.addTextArea(text => text
				.setPlaceholder('[Mermaid図]\n(Obsidianで表示してください)')
				.setValue(this.plugin.settings.mermaidConversion)
				.onChange(async (value) => {
					this.plugin.settings.mermaidConversion = value;
					await this.plugin.saveSettings();
				}));

		// 使い方
		containerEl.createEl('h3', {text: '使い方'});
		
		const instructions = containerEl.createEl('ol');
		instructions.createEl('li', {text: 'Obsidianでnoteに投稿したいノートを開く'});
		instructions.createEl('li', {text: 'コマンドパレット（Cmd/Ctrl+P）で「Convert current file to note format」を実行'});
		instructions.createEl('li', {text: 'プレビューを確認して「コピー」または「noteで開く」をクリック'});
		instructions.createEl('li', {text: 'noteの編集画面に貼り付けて投稿'});
	}
}