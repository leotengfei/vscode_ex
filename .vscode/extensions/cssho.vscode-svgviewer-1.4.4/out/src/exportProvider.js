'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
class ExportDocumentContentProvider {
    constructor(_context) {
        this._context = _context;
        this._onDidChange = new vscode.EventEmitter();
    }
    provideTextDocumentContent(uri) {
        let docUri = vscode.Uri.parse(uri.query);
        return vscode.workspace.openTextDocument(docUri).then(document => this.snippet(document));
    }
    get onDidChange() {
        return this._onDidChange.event;
    }
    update(uri) {
        this._onDidChange.fire(uri);
    }
    getPath(p) {
        return path.join(this._context.extensionPath, p);
    }
    snippet(document) {
        let showTransGrid = vscode.workspace.getConfiguration('svgviewer').get('transparencygrid');
        let css = `<link rel="stylesheet" type="text/css" href="${this.getPath('media/export.css')}">`;
        let jquery = `<script src="${this.getPath('node_modules/jquery/dist/jquery.js')}"></script>`;
        let exportjs = `<script src="${this.getPath('media/export.js')}"></script>`;
        let output = document.uri.fsPath.replace('.svg', '.png');
        let exportButton = `<a id="export" data-output="${encodeURIComponent(output)}" href="#" class="button">Export PNG</a>`;
        let canvas = `<canvas id="canvas" class="svgbg" data-showtransgrid="${showTransGrid}"></canvas>`;
        let svg = document.getText();
        let image = `<img id="image" src="${'data:image/svg+xml,' + encodeURIComponent(document.getText())}" alt="svg image" />`;
        let width = `<div class="wrapper"><label for="width" class="label-name">Width</label><input id="width" type="number" placeholder="width"><label for="width"> px</label></div>`;
        let height = `<div class="wrapper"><label for="height" class="label-name">Height</label><input id="height" type="number" placeholder="height"><label for="height"> px</label></div>`;
        let options = `<h1>Options</h1><div class="form">${width}${height}${exportButton}</div>`;
        return `<!DOCTYPE html><html><head>${css}${jquery}${exportjs}</head><body>${options}<h1>Preview</h1><div>${svg}${image}${canvas}</div></body></html>`;
    }
}
exports.ExportDocumentContentProvider = ExportDocumentContentProvider;
//# sourceMappingURL=exportProvider.js.map