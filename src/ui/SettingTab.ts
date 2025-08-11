import { App, PluginSettingTab, Setting } from 'obsidian';
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

		// 見出しの設定セクション
		this.addHeadingSettings(containerEl);

		// その他の変換設定セクション
		this.addFormattingSettings(containerEl);

		// リンク変換設定セクション
		this.addLinkSettings(containerEl);

		// チェックボックス設定セクション
		this.addCheckboxSettings(containerEl);

		// Mermaid設定セクション
		this.addMermaidSettings(containerEl);

		// 使い方セクション
		this.addUsageInstructions(containerEl);
	}

	private addHeadingSettings(containerEl: HTMLElement): void {
		containerEl.createEl('h3', {text: '見出しの変換'});

		const headingLevels = [
			{ level: 1, name: 'H1（#）', setting: 'h1Conversion' },
			{ level: 2, name: 'H2（##）', setting: 'h2Conversion' },
			{ level: 3, name: 'H3（###）', setting: 'h3Conversion' },
			{ level: 4, name: 'H4（####）', setting: 'h4Conversion' },
			{ level: 5, name: 'H5（#####）', setting: 'h5Conversion' },
			{ level: 6, name: 'H6（######）', setting: 'h6Conversion' }
		];

		headingLevels.forEach(({ level, name, setting }) => {
			new Setting(containerEl)
				.setName(name)
				.setDesc(`見出しレベル${level}の変換方法`)
				.addDropdown(dropdown => dropdown
					.addOption('h1', '大見出し（#）')
					.addOption('h2', '小見出し（###）')
					.addOption('bold', '強調（**）')
					.addOption('plain', 'プレーンテキスト')
					.setValue(this.plugin.settings[setting as keyof typeof this.plugin.settings] as string)
					.onChange(async (value) => {
						(this.plugin.settings as any)[setting] = value;
						await this.plugin.saveSettings();
					}));
		});
	}

	private addFormattingSettings(containerEl: HTMLElement): void {
		containerEl.createEl('h3', {text: 'その他の変換'});

		new Setting(containerEl)
			.setName('ハイライト')
			.setDesc('==ハイライト==の変換方法')
			.addDropdown(dropdown => dropdown
				.addOption('mark', '<mark>タグ')
				.addOption('bold', '太字（**）')
				.addOption('italic', '斜体（*）')
				.addOption('plain', 'プレーンテキスト')
				.setValue(this.plugin.settings.highlightConversion)
				.onChange(async (value: any) => {
					this.plugin.settings.highlightConversion = value;
					await this.plugin.saveSettings();
				}));
	}

	private addLinkSettings(containerEl: HTMLElement): void {
		new Setting(containerEl)
			.setName('内部リンク')
			.setDesc('[[内部リンク]]の変換方法')
			.addDropdown(dropdown => dropdown
				.addOption('markdown', 'Markdownリンク [text](link)')
				.addOption('plain', 'テキストのみ')
				.addOption('remove', '削除')
				.setValue(this.plugin.settings.internalLinkConversion)
				.onChange(async (value: any) => {
					this.plugin.settings.internalLinkConversion = value;
					await this.plugin.saveSettings();
				}));
	}

	private addCheckboxSettings(containerEl: HTMLElement): void {
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
	}

	private addMermaidSettings(containerEl: HTMLElement): void {
		let mermaidTextSetting: Setting;

		new Setting(containerEl)
			.setName('Mermaid図表の変換方法')
			.setDesc('Mermaid図表をどのように変換するか')
			.addDropdown(dropdown => dropdown
				.addOption('text', 'テキストに置換')
				.addOption('code', 'コードブロックとして保持')
				.setValue(this.plugin.settings.mermaidConversionType)
				.onChange(async (value: any) => {
					this.plugin.settings.mermaidConversionType = value;
					await this.plugin.saveSettings();
					// 代替テキスト設定の表示/非表示を切り替え
					if (value === 'code') {
						mermaidTextSetting.settingEl.style.display = 'none';
					} else {
						mermaidTextSetting.settingEl.style.display = '';
					}
				}));

		// テキスト置換の場合の設定
		mermaidTextSetting = new Setting(containerEl)
			.setName('Mermaid代替テキスト')
			.setDesc('Mermaid図表をテキストに置換する場合の代替テキスト')
			.addTextArea(text => text
				.setPlaceholder('[Mermaid図]\n(noteでは直接mermaid図を表示できません。mermaid図を別途生成して、noteに貼り付けてください。)')
				.setValue(this.plugin.settings.mermaidReplacementText)
				.onChange(async (value) => {
					this.plugin.settings.mermaidReplacementText = value;
					await this.plugin.saveSettings();
				}));
		
		// 変換方法がコードの場合は代替テキスト設定を非表示
		if (this.plugin.settings.mermaidConversionType === 'code') {
			mermaidTextSetting.settingEl.style.display = 'none';
		}
	}

	private addUsageInstructions(containerEl: HTMLElement): void {
		containerEl.createEl('h3', {text: '使い方'});
		
		const instructions = containerEl.createEl('ol');
		instructions.createEl('li', {text: 'noteに投稿したいノートを開く'});
		instructions.createEl('li', {text: 'コマンドパレット（Cmd/Ctrl+P）から「Convert current file to note format」を実行'});
		instructions.createEl('li', {text: '左サイドバーのペンアイコンをクリック'});
		instructions.createEl('li', {text: 'プレビューで変換結果を確認'});
		instructions.createEl('li', {text: '「コピー」または「note で開く」をクリック'});
		instructions.createEl('li', {text: 'noteのエディタに貼り付け'});
		
		containerEl.createEl('p', {
			text: '※ 「note で開く」をクリックすると、自動でクリップボードにコピーしてからnoteの新規投稿画面を開きます。',
			cls: 'setting-item-description'
		});
	}
}