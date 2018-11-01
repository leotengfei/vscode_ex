"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const diagram_1 = require("../plantuml/diagram/diagram");
class Symbol extends vscode.Disposable {
    constructor() {
        super(() => this.dispose());
        this._disposables = [];
        let sel = [
            "diagram",
            "markdown",
            "c",
            "csharp",
            "cpp",
            "clojure",
            "coffeescript",
            "fsharp",
            "go",
            "groovy",
            "java",
            "javascript",
            "javascriptreact",
            "lua",
            "objective-c",
            "objective-cpp",
            "php",
            "perl",
            "perl6",
            "python",
            "ruby",
            "rust",
            "swift",
            "typescript",
            "typescriptreact",
            "vb",
            "plaintext"
        ];
        this._disposables.push(vscode.languages.registerDocumentSymbolProvider(sel, this));
    }
    dispose() {
        this._disposables && this._disposables.length && this._disposables.map(d => d.dispose());
    }
    provideDocumentSymbols(document, token) {
        let results = [];
        let diagrams = diagram_1.diagramsOf(document);
        for (let d of diagrams) {
            const location = new vscode.Location(document.uri, new vscode.Range(d.start, d.end));
            results.push(new vscode.SymbolInformation(d.title, vscode.SymbolKind.Object, "", location));
        }
        return results;
    }
}
exports.Symbol = Symbol;
//# sourceMappingURL=symboler.js.map