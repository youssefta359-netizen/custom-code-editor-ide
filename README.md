# MY IDE

An offline-first desktop code editor and IDE. It intentionally provides **no AI assistant and no autocomplete**.

## Included in this first release

- Desktop app shell using Electron (Windows, macOS, and Linux builds)
- Workspace folder explorer and file creation
- Tabs, line numbers, indentation, save/autosafe-ready architecture, UTF-8 files, LF line endings
- Automatic language label from the file name (no extensions or training required)
- Built-in real shell terminal with stdin/stdout/stderr and ANSI-capable process output
- Run configurations for JavaScript, Python, C, C++, Go, and Java when the local compiler/runtime exists
- Problems and Debug Console panels ready for language-server/debug-adapter integration
- Secure preload bridge: renderer has no direct Node.js access

## Run locally

```bash
npm install
npm start
```

Build an installable package with `npm run dist`.

## Design decisions

The editor deliberately uses a plain text editing surface rather than an AI-enabled editor. Language detection is extension-based and does not download models, send code anywhere, or require a plugin. Compiler and debugger availability is local-machine dependent; the next integration point is the Debug Adapter Protocol and Language Server Protocol, which can be added as optional local back-end adapters.

## Roadmap

- Syntax token rendering, bracket matching, folding, search/replace, multi-cursor
- Local LSP adapters for diagnostics, symbols, definitions, references, formatting, and refactoring
- DAP adapters for breakpoints, stepping, variables, watches, and call stacks
- Workspace settings, build configurations, crash recovery, and autosave snapshots
