"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const vscode_1 = require("vscode");
const macros_1 = require("../plantuml/macros/macros");
class Completion extends vscode.Disposable {
    constructor() {
        super(() => this.dispose());
        this._disposables = [];
        let sel = [
            "diagram"
        ];
        this._disposables.push(vscode.languages.registerCompletionItemProvider(sel, this));
    }
    dispose() {
        this._disposables && this._disposables.length && this._disposables.map(d => d.dispose());
    }
    provideCompletionItems(document, position, token) {
        return new Promise((resolve, reject) => {
            const results = [];
            const macros = macros_1.macrosOf(document);
            macros
                .forEach(macro => {
                const item = new vscode.CompletionItem(macro.name, vscode.CompletionItemKind.Method);
                item.detail = macro.getDetailLabel();
                item.insertText = new vscode_1.SnippetString(macro.name);
                results.push(item);
            });
            return resolve(results);
        });
    }
    resolveCompletionItem(item, token) {
        // TODO: add item.documentation
        return null;
    }
}
exports.Completion = Completion;
//# sourceMappingURL=completion.js.map