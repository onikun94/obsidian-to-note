import { vi } from 'vitest';

// Obsidian APIのモック
export class Plugin {
  app: any;
  manifest: any;
  
  constructor() {
    this.app = {};
    this.manifest = {};
  }
  
  loadData = vi.fn().mockResolvedValue({});
  saveData = vi.fn().mockResolvedValue(undefined);
  addCommand = vi.fn();
  addRibbonIcon = vi.fn();
  addSettingTab = vi.fn();
}

export class Modal {
  app: any;
  contentEl: HTMLElement;
  
  constructor(app: any) {
    this.app = app;
    this.contentEl = document.createElement('div');
  }
  
  open = vi.fn();
  close = vi.fn();
  onOpen = vi.fn();
  onClose = vi.fn();
}

export class PluginSettingTab {
  app: any;
  plugin: any;
  containerEl: HTMLElement;
  
  constructor(app: any, plugin: any) {
    this.app = app;
    this.plugin = plugin;
    this.containerEl = document.createElement('div');
  }
  
  display = vi.fn();
}

export class Setting {
  constructor(containerEl: HTMLElement) {}
  
  setName = vi.fn().mockReturnThis();
  setDesc = vi.fn().mockReturnThis();
  addText = vi.fn().mockReturnThis();
  addTextArea = vi.fn().mockReturnThis();
  addDropdown = vi.fn().mockReturnThis();
  addToggle = vi.fn().mockReturnThis();
  addButton = vi.fn().mockReturnThis();
}

export class Notice {
  constructor(message: string, timeout?: number) {}
}

export class MarkdownView {
  editor: {
    getValue: () => string;
  };
  
  constructor() {
    this.editor = {
      getValue: vi.fn().mockReturnValue(''),
    };
  }
}

export class Editor {
  getValue = vi.fn().mockReturnValue('');
  setValue = vi.fn();
}

export const requestUrl = vi.fn();