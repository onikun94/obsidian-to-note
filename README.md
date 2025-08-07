# Obsidian to Note

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/onikun94/obsidian-to-note/releases)
[![Obsidian Plugin](https://img.shields.io/badge/Obsidian-Plugin-7c3aed.svg)](https://obsidian.md)

A plugin that converts Obsidian markdown to a format that can be copy-pasted into note editor.

## Features

- Converts Obsidian-specific syntax to a format displayable in note
- Customizable conversion rules via settings screen
- Preview function to check before copying
- One-click to open note's new post screen

## Installation

1. Obsidian Settings → Community plugins → Browse
2. Search for "Obsidian to Note"
3. Install and enable

### Manual Installation

1. Download the latest release from [Releases](https://github.com/yourusername/obsidian-to-note/releases)
2. Copy `main.js` and `manifest.json` to `VaultFolder/.obsidian/plugins/obsidian-to-note/`
3. Restart Obsidian and enable the plugin in settings

## Usage

1. Open the note you want to post to note
2. Execute conversion using one of the following methods:
   - Command palette (Cmd/Ctrl+P) → "Convert current file to note format"
   - Click the pencil icon in the left sidebar
3. Check the conversion result in preview
4. Click "Copy" or "Open in note"
5. Paste into note editor and post

## Conversion Rules

### Default Settings

- **H1 (#)** → Large heading
- **H2 (##)** → Small heading
- **H3-H6 (###〜)** → Emphasis (**Bold**)
- **Internal links [[link]]** → Markdown links
- **Highlight ==text==** → `<mark>text</mark>`
- **Checkboxes** → □ / ☑

### Customizable Items

You can customize the following items in the settings screen:

- Conversion method for each heading level (H1-H6)
- Highlight conversion method
- Internal link processing method
- Checkbox symbols
- Alternative text for Mermaid diagrams

## Development

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build
npm run build
```

## License

MIT License