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

**Note: This plugin is currently under review for the Obsidian Community Plugins.**

### Manual Installation (Recommended during review period)

1. Download the latest release from [Releases](https://github.com/yourusername/obsidian-to-note/releases)
2. Create a new folder in your vault: `VaultFolder/.obsidian/plugins/obsidian-to-note/`
3. Copy `main.js` and `manifest.json` to this folder
4. Restart Obsidian
5. Go to Settings → Community plugins → Turn off Safe Mode
6. Find "Obsidian to Note" in the list and enable it

### Community Plugin Installation (Available after approval)

1. Obsidian Settings → Community plugins → Browse
2. Search for "Obsidian to Note"
3. Install and enable

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

- **H1 (#)** → Large heading (# )
- **H2 (##)** → Small heading (### )
- **H3-H6 (###〜######)** → Emphasis (**Bold**)
- **Internal links [[link]]** → Markdown links [link](link)
- **Image links ![[image.png]]** → Markdown images ![image.png](image.png)
- **Highlight ==text==** → **Bold**
- **Inline code `code`** → Plain text (backticks removed)
- **Inline math $formula$** → Plain text ($ removed)
- **Block math $$formula$$** → Plain text ($$ removed)
- **Code blocks ```lang```** → Code blocks (language specifier removed)
- **Superscript ^[text]** → `<sup>text</sup>`
- **Subscript ~text~** → `<sub>text</sub>`
- **Strikethrough ~~text~~** → Preserved as ~~text~~
- **Checkboxes** → □ / ☑
- **Mermaid diagrams** → Placeholder text
- **Nested numbered lists** → Flattened structure

### Customizable Items

You can customize the following items in the settings screen:

- **Heading conversions (H1-H6)**: Each heading level can be converted to:
  - H1 (Large heading with #)
  - H2 (Small heading with ###)
  - Bold text
  - Plain text
- **Highlight conversion**: Choose between:
  - Bold text (**text**)
  - Italic text (*text*)
  - HTML mark tag (<mark>text</mark>)
  - Plain text
- **Internal link processing**: Options include:
  - Markdown link format [text](link)
  - Plain text (link text only)
  - Remove entirely
- **Checkbox symbols**: Customize the symbols for checked/unchecked items
- **Mermaid diagram replacement**: Set custom placeholder text

All these settings can be changed from the default mappings to suit your preferences for how content appears in note.

## Development

```bash
# Install dependencies
pnpm install

# Development mode
pnpm run dev

# Build
pnpm run build
```

## License

MIT License
