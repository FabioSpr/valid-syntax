import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

  const hasShownEncodingPrompt = context.globalState.get<boolean>("hasShownEncodingPrompt");
  
  if (!hasShownEncodingPrompt) {
    // Show the message to the user
    vscode.window.showInformationMessage(
      `For best experience, please add this lines to settings.json file: ` +
      `Command Palette → "Preferences: Open User Settings (JSON)" ` +
      `"[valid]": {"files.encoding": "cp437"},`
    );

    // Save flag so we don't show this again
    context.globalState.update('hasShownEncodingPrompt', true);
  }

  // Document symbol provider
  const symbolProvider = vscode.languages.registerDocumentSymbolProvider({ language: 'valid' }, {
    provideDocumentSymbols(document: vscode.TextDocument): vscode.DocumentSymbol[] {
      const symbols: vscode.DocumentSymbol[] = [];
      const lines = document.getText().split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let match = line.match(/^\s*procedure\s+([a-zA-Z_][a-zA-Z0-9_]*)/i);
        if (match) {
          const name = match[1];
          const range = new vscode.Range(i, 0, i, line.length);
          symbols.push(new vscode.DocumentSymbol(
            name,
            'Procedure',
            vscode.SymbolKind.Function,
            range,
            range
          ));
          continue;
        }

        match = line.match(/^\s*Test Case\s+([a-zA-Z_][a-zA-Z0-9_]*)\(\)\s+Is/);
        if (match) {
          const name = match[1];
          const range = new vscode.Range(i, 0, i, line.length);
          symbols.push(new vscode.DocumentSymbol(
            name,
            'Test Case',
            vscode.SymbolKind.Method,
            range,
            range
          ));
          continue;
        }

        match = line.match(/^\s*Main Test Sequence\s+([a-zA-Z_][a-zA-Z0-9_]*)\([^)]*\)\s+is/);
        if (match) {
          const name = match[1];
          const range = new vscode.Range(i, 0, i, line.length);
          symbols.push(new vscode.DocumentSymbol(
            name,
            'Main',
            vscode.SymbolKind.Method,
            range,
            range
          ));
          continue;
        }
      }

      return symbols;
    }
  });

  // Completion provider
  const completionProvider = vscode.languages.registerCompletionItemProvider(
    'valid',
    {
      provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
        const linePrefix = document.lineAt(position).text.slice(0, position.character);
        const prefix = linePrefix.trim().toLowerCase();

        if ('test case'.startsWith(prefix)) {
          const completion = new vscode.CompletionItem('Test Case', vscode.CompletionItemKind.Snippet);
          completion.insertText = new vscode.SnippetString('Test Case ${1:name}() Is\n\t${2:}\nEndTest');
          completion.documentation = new vscode.MarkdownString('Snippet per Test Case');

          return [completion];
        } else if ('procedure'.startsWith(prefix)) {
          const completion = new vscode.CompletionItem('Procedure', vscode.CompletionItemKind.Snippet);
          completion.insertText = new vscode.SnippetString('PROCEDURE ${1:name}()\n\t${2:}\nENDPROCEDURE');
          completion.documentation = new vscode.MarkdownString('Snippet per PROCEDURE');

          return [completion];
        }

        return undefined;
      }
    },
    // Trigger completion when typing 'P' or 'T' (start of 'Procedure' or 'Test Case')
    ...['P', 'T', 'p', 't']
  );

  context.subscriptions.push(symbolProvider, completionProvider);
}