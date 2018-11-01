"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const keywords_1 = require("./keywords");
class CompletionProvider {
    constructor(schemaProvider) {
        this.schemaProvider = schemaProvider;
        this.schemaMap = {};
    }
    provideCompletionItems(document, position, token, context) {
        let schema = this.schemaMap[document.uri.fsPath];
        if (schema) {
            let items = this.getCompletionItems(keywords_1.keywords, schema.tables);
            return items;
        }
        else {
            return this.schemaProvider.provideSchema(document).then(schema => {
                let items = this.getCompletionItems(keywords_1.keywords, schema ? schema.tables : undefined);
                return items;
            });
        }
    }
    getCompletionItems(keywords, tables) {
        let items = keywords.map(word => new KeywordCompletionItem(word));
        if (tables) {
            let tableItems = tables.map(tbl => new TableCompletionItem(tbl.name));
            let columnItems = [];
            tables.forEach(tbl => {
                columnItems.push(...tbl.columns.map(col => new ColumnCompletionItem(`${tbl.name}.${col.name}`)));
            });
            items.push(...tableItems, ...columnItems);
        }
        return items;
    }
}
exports.CompletionProvider = CompletionProvider;
class KeywordCompletionItem extends vscode_1.CompletionItem {
    constructor(keyword) {
        super(keyword, vscode_1.CompletionItemKind.Keyword);
    }
}
class TableCompletionItem extends vscode_1.CompletionItem {
    constructor(name) {
        super(name, vscode_1.CompletionItemKind.File);
    }
}
class ColumnCompletionItem extends vscode_1.CompletionItem {
    constructor(name) {
        super(name, vscode_1.CompletionItemKind.Field);
    }
}
//# sourceMappingURL=completionProvider.js.map