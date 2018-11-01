'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
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
    constructor(context) {
        this.context = context;
        this._onDidChange = new vscode.EventEmitter();
        this._waiting = false;
        this.stylesheetRegex = /<\?\s*xml-stylesheet\s+.*href="(.+?)".*\s*\?>/gi;
    }
    provideTextDocumentContent(uri) {
        let sourceUri = vscode.Uri.parse(uri.query);
        console.log(sourceUri);
        this._resourceDir = path.dirname(sourceUri.fsPath);
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
    getPath(file) {
        return path.join(this.context.extensionPath, file);
    }
    getWorkspacePath(file) {
        return path.join(this._resourceDir, file);
    }
    insertCss(svg, css) {
        if (css == null || css.length == 0)
            return svg;
        let defsEndIndex = svg.toLowerCase().indexOf('</defs>');
        if (defsEndIndex === -1) {
            let svgEndIndex = svg.toLowerCase().indexOf('</svg>');
            return svg.slice(0, svgEndIndex)
                + `<defs>${this.loadCss(css)}</defs>`
                + svg.slice(svgEndIndex, svg.length);
        }
        return svg.slice(0, defsEndIndex)
            + this.loadCss(css)
            + svg.slice(defsEndIndex, svg.length);
    }
    loadCss(css) {
        let result = "";
        css.forEach(x => {
            result += `<style type="text/css"><![CDATA[${fs.readFileSync(this.getWorkspacePath(x))}]]></style>`;
        });
        return result;
    }
    buttonHtml() {
        return vscode.workspace.getConfiguration('svgviewer').get('showzoominout') ?
            `<div class="svgv-zoom-container">
            <button class="svgv-btn" type="button" title="Zoom in" id="zoom_in">+</button>
            <button class="svgv-btn" type="button" title="Zoom out" id="zoom_out">-</button>
            </div>` : '';
    }
    snippet(properties) {
        let showTransGrid = vscode.workspace.getConfiguration('svgviewer').get('transparencygrid');
        let transparencycolor = vscode.workspace.getConfiguration('svgviewer').get('transparencycolor');
        let transparencyGridCss = '';
        if (showTransGrid) {
            if (transparencycolor != null && transparencycolor !== "") {
                transparencyGridCss = `
<style type="text/css">
.svgv-bg img {
    background: ` + transparencycolor + `;
    transform-origin: top left;
}
</style>`;
            }
            else {
                transparencyGridCss = `<link rel="stylesheet" href="${this.getPath('media/background.css')}" type="text/css"></style>`;
            }
        }
        let matches;
        let css = new Array();
        while (matches = this.stylesheetRegex.exec(properties)) {
            css.push(matches[1]);
        }
        let html = `<!DOCTYPE html><html><head>${transparencyGridCss}
<script src="${this.getPath('media/preview.js')}"></script>
<link rel="stylesheet" href="${this.getPath('media/preview.css')}" type="text/css"></style>
</head><body>
        ${this.buttonHtml()}
        <div class="svgv-bg"><img id="svgimg" src="data:image/svg+xml,${encodeURIComponent(this.insertCss(properties, css))}"></div>
        </body></html>`;
        return html;
    }
}
exports.SvgDocumentContentProvider = SvgDocumentContentProvider;
class SvgFileContentProvider extends SvgDocumentContentProvider {
    constructor(context, previewUri, filename) {
        super(context);
        this.context = context;
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