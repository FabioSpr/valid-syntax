"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
const vscode = __importStar(require("vscode"));
function activate(context) {
    // Document symbol provider
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
                    symbols.push(new vscode.DocumentSymbol(name, 'Procedure', vscode.SymbolKind.Function, range, range));
                    continue;
                }
                match = line.match(/^\s*Test Case\s+([a-zA-Z_][a-zA-Z0-9_]*)\(\)\s+Is/);
                if (match) {
                    const name = match[1];
                    const range = new vscode.Range(i, 0, i, line.length);
                    symbols.push(new vscode.DocumentSymbol(name, 'Test Case', vscode.SymbolKind.Method, range, range));
                    continue;
                }
                match = line.match(/^\s*Main Test Sequence\s+([a-zA-Z_][a-zA-Z0-9_]*)\([^)]*\)\s+is/);
                if (match) {
                    const name = match[1];
                    const range = new vscode.Range(i, 0, i, line.length);
                    symbols.push(new vscode.DocumentSymbol(name, 'Main', vscode.SymbolKind.Method, range, range));
                    continue;
                }
            }
            return symbols;
        }
    });
    // Completion provider
    const completionProvider = vscode.languages.registerCompletionItemProvider('valid', {
        provideCompletionItems(document, position) {
            const linePrefix = document.lineAt(position).text.slice(0, position.character);
            const prefix = linePrefix.trim().toLowerCase();
            if ('test case'.startsWith(prefix)) {
                const completion = new vscode.CompletionItem('Test Case', vscode.CompletionItemKind.Snippet);
                completion.insertText = new vscode.SnippetString('Test Case ${1:name}() Is\n\t${2:}\nEndTest');
                completion.documentation = new vscode.MarkdownString('Snippet per Test Case');
                return [completion];
            }
            else if ('procedure'.startsWith(prefix)) {
                const completion = new vscode.CompletionItem('Procedure', vscode.CompletionItemKind.Snippet);
                completion.insertText = new vscode.SnippetString('PROCEDURE ${1:name}()\n\t${2:}\nENDPROCEDURE');
                completion.documentation = new vscode.MarkdownString('Snippet per PROCEDURE');
                return [completion];
            }
            return undefined;
        }
    }, 
    // Trigger completion when typing 'P' or 'T' (start of 'Procedure' or 'Test Case')
    ...['P', 'T', 'p', 't']);
    context.subscriptions.push(symbolProvider, completionProvider);
}
