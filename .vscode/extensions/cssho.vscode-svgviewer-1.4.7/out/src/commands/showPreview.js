"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const vscode_1 = require("vscode");
function getViewColumn() {
    switch (vscode.workspace.getConfiguration('svgviewer').get('previewcolumn')) {
        case "One":
            return vscode_1.ViewColumn.One;
        case "Two":
            return vscode_1.ViewColumn.Two;
        case "Three":
            return vscode_1.ViewColumn.Three;
    }
}
function showPreview(webviewManager, uri, title) {
    let resource = uri;
    if (!(resource instanceof vscode.Uri)) {
        if (vscode.window.activeTextEditor) {
            // we are relaxed and don't check for markdown files
            resource = vscode.window.activeTextEditor.document.uri;
        }
    }
    if (!(resource instanceof vscode.Uri)) {
        if (!vscode.window.activeTextEditor) {
            // this is most likely toggling the preview
            //return vscode.commands.executeCommand('markdown.showSource');
        }
        // nothing found that could be shown or toggled
        return;
    }
    const column = getViewColumn();
    if (column) {
        const view = webviewManager.create(resource, column, title);
        return view;
    }
}
class ShowPreviewCommand {
    constructor(webviewManager) {
        this.webviewManager = webviewManager;
        this.id = 'svgviewer.open';
    }
    execute(mainUri, allUris) {
        for (const uri of (allUris || [mainUri])) {
            showPreview(this.webviewManager, uri, 'hoge');
        }
    }
}
exports.ShowPreviewCommand = ShowPreviewCommand;
//# sourceMappingURL=showPreview.js.map