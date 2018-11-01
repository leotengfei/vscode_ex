"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
function createSqlDocument(show) {
    return vscode_1.workspace.openTextDocument({ language: 'sql' }).then(sqlDocument => {
        if (show) {
            vscode_1.window.showTextDocument(sqlDocument, vscode_1.ViewColumn.One);
        }
        return Promise.resolve(sqlDocument);
    });
}
exports.createSqlDocument = createSqlDocument;
function getEditorSqlDocument() {
    let editor = vscode_1.window.activeTextEditor;
    if (editor) {
        return editor.document.languageId === 'sql' ? editor.document : undefined;
    }
    else {
        return undefined;
    }
}
exports.getEditorSqlDocument = getEditorSqlDocument;
function getEditorSelection() {
    let selection = vscode_1.window.activeTextEditor ? vscode_1.window.activeTextEditor.selection : undefined;
    selection = selection && selection.isEmpty ? undefined : selection;
    return selection;
}
exports.getEditorSelection = getEditorSelection;
//# sourceMappingURL=workspace.js.map