"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const diagram_1 = require("./diagram");
class Symbol {
    register() {
        //register Symbol provider
        let ds = [];
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
        let d = vscode.languages.registerDocumentSymbolProvider(sel, this);
        ds.push(d);
        return ds;
    }
    provideDocumentSymbols(document, token) {
        let results = [];
        let ds = new diagram_1.Diagrams().AddDocument(document);
        for (let d of ds.diagrams) {
            results.push(new vscode.SymbolInformation(d.title, vscode.SymbolKind.Object, new vscode.Range(d.start, d.end), document.uri, ""));
        }
        return results;
    }
}
exports.symboler = new Symbol();
//# sourceMappingURL=symboler.js.map