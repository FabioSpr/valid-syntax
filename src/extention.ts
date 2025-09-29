import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const provider = new ValidDocumentSymbolProvider();
  const disposable = vscode.languages.registerDocumentSymbolProvider({ language: 'valid' }, provider);
  context.subscriptions.push(disposable);
}

class ValidDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
  provideDocumentSymbols(document: vscode.TextDocument): vscode.ProviderResult<vscode.DocumentSymbol[]> {
    const symbols: vscode.DocumentSymbol[] = [];

    const text = document.getText();
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Esempio semplice: considera che una funzione in Valid inizia con "fun nome()"
      const functionMatch = line.match(/^fun\s+(\w+)/);
      if (functionMatch) {
        const name = functionMatch[1];
        const range = new vscode.Range(i, 0, i, line.length);
        symbols.push(new vscode.DocumentSymbol(
          name,
          'Function',
          vscode.SymbolKind.Function,
          range,
          range
        ));
      }

      // Aggiungi altre regole di parsing per classi, variabili, ecc. se serve
    }

    return symbols;
  }
}