'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("fs");
function getSvgUri(uri) {
    if (uri.scheme === 'svg-preview') {
        return uri;
    }
    return uri.with({
        scheme: 'svg-preview',
        path: uri.path + '.rendered',
        query: uri.toString()
    });
}
exports.getSvgUri = getSvgUri;
class SvgDocumentContentProvider {
    constructor() {
        this._onDidChange = new vscode.EventEmitter();
        this._waiting = false;
    }
    provideTextDocumentContent(uri) {
        let sourceUri = vscode.Uri.parse(uri.query);
        console.log(sourceUri);
        return vscode.workspace.openTextDocument(sourceUri).then(document => this.snippet(document.getText()));
    }
    get onDidChange() {
        return this._onDidChange.event;
    }
    exist(uri) {
        return vscode.workspace.textDocuments
            .find(x => x.uri.path === uri.path && x.uri.scheme === uri.scheme) !== undefined;
    }
    update(uri) {
        if (!this._waiting) {
            this._waiting = true;
            setTimeout(() => {
                this._waiting = false;
                this._onDidChange.fire(uri);
            }, 300);
        }
    }
    snippet(properties) {
        let showTransGrid = vscode.workspace.getConfiguration('svgviewer').get('transparencygrid');
        let transparencycolor = vscode.workspace.getConfiguration('svgviewer').get('transparencycolor');
        let transparencyGridCss = '';
        if (showTransGrid) {
            if (transparencycolor != null && transparencycolor !== "") {
                transparencyGridCss = `
<style type="text/css">
.svgbg img {
    background: ` + transparencycolor + `;
}
</style>`;
            }
            else {
                transparencyGridCss = `
<style type="text/css">
.svgbg img {
    background:initial;
    background-image: url(data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAeUlEQVRYR+3XMQ4AIQhEUTiU9+/hUGy9Wk2G8luDIS8EMWdmYvF09+JtEUmBpieCJiA96AIiiKAswEsik10JCCIoCrAsiGBPOIK2YFWt/knOOW5Nv/ykQNMTQRMwEERQFWAOqmJ3PIIIigIMahHs3ahZt0xCetAEjA99oc8dGNmnIAAAAABJRU5ErkJggg==);
    background-position: left,top;
}
</style>`;
            }
        }
        return `<!DOCTYPE html><html><head>${transparencyGridCss}</head><body><div class="svgbg"><img src="data:image/svg+xml,${encodeURIComponent(properties)}"></div></body></html>`;
    }
}
exports.SvgDocumentContentProvider = SvgDocumentContentProvider;
class SvgFileContentProvider extends SvgDocumentContentProvider {
    constructor(previewUri, filename) {
        super();
        this.filename = filename;
        vscode.workspace.createFileSystemWatcher(this.filename, true, false, true).onDidChange((e) => {
            this.update(previewUri);
        });
    }
    extractSnippet() {
        let fileText = fs.readFileSync(this.filename, 'utf8');
        let text = fileText ? fileText : '';
        return super.snippet(text);
    }
}
exports.SvgFileContentProvider = SvgFileContentProvider;
//# sourceMappingURL=svgProvider.js.map