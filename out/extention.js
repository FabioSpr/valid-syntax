const vscode = require('vscode');

function activate(context) {
  // Provider per outline (document symbols)
  const symbolProvider = vscode.languages.registerDocumentSymbolProvider({ language: 'valid' }, {
    provideDocumentSymbols(document) {
      const symbols = [];
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

  // Provider per completamento automatico
  const completionProvider = vscode.languages.registerCompletionItemProvider(
    'valid',
    {
      provideCompletionItems(document, position) {
        const linePrefix = document.lineAt(position).text.substr(0, position.character);
        const prefix = linePrefix.trim().toLowerCase();

        // Completamento per "Test Case" (case sensitive)
        if ('test case'.startsWith(prefix)) {
          const completion = new vscode.CompletionItem('Test Case');
          completion.insertText = new vscode.SnippetString('Test Case ${1:name}() Is\n\t${2:}\nEndTest');
          completion.documentation = new vscode.MarkdownString('Snippet per Test Case');

          return [completion];
        }
        
        // Completamento per "PROCEDURE"  (case insensitive)
        else if ('procedure'.startsWith(prefix)) {
          const completion = new vscode.CompletionItem('Procedure');
          completion.insertText = new vscode.SnippetString('PROCEDURE ${1:name}()\n\t${2:}\nENDPROCEDURE');
          completion.documentation = new vscode.MarkdownString('Snippet per PROCEDURE');

          return [completion];
        }

        return undefined;
      }
    },
    // trigger su 'Procedure' e su 'T' di "Test"
    ...'PpRrOoCcEeDdUuTt'.split('')
  );

  context.subscriptions.push(symbolProvider, completionProvider);
}

exports.activate = activate;