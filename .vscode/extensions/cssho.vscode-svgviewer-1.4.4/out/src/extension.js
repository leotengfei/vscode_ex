'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const svgProvider_1 = require("./svgProvider");
const exportProvider_1 = require("./exportProvider");
const exec = require('sync-exec');
const fs = require('pn/fs');
const tmp = require('tmp');
const cp = require('copy-paste');
const svgexport = require('svgexport');
const path = require('path');
const phantomjs = require('phantomjs-prebuilt');
function activate(context) {
    // Check PhantomJS Binary
    if (!fs.existsSync(phantomjs.path)) {
        exec('npm rebuild', { cwd: context.extensionPath });
        process.env.PHANTOMJS_PLATFORM = process.platform;
        process.env.PHANTOMJS_ARCH = process.arch;
        phantomjs.path = process.platform === 'win32' ?
            path.join(path.dirname(phantomjs.path), 'phantomjs.exe') :
            path.join(path.dirname(phantomjs.path), 'phantom', 'bin', 'phantomjs');
    }
    let provider = new svgProvider_1.SvgDocumentContentProvider();
    let registration = vscode.workspace.registerTextDocumentContentProvider('svg-preview', provider);
    let fileUriProviders = new Map();
    vscode.workspace.onDidChangeTextDocument((e) => {
        if (vscode.window.activeTextEditor) {
            if (e.document === vscode.window.activeTextEditor.document && !checkNoSvg(vscode.window.activeTextEditor.document, false)) {
                provider.update(svgProvider_1.getSvgUri(e.document.uri));
            }
        }
    });
    vscode.window.onDidChangeActiveTextEditor((textEditor) => {
        if (vscode.window.activeTextEditor) {
            if (textEditor.document === vscode.window.activeTextEditor.document && !checkNoSvg(vscode.window.activeTextEditor.document, false)) {
                provider.update(svgProvider_1.getSvgUri(textEditor.document.uri));
                let auto = vscode.workspace.getConfiguration('svgviewer').get('enableautopreview');
                if (auto && !provider.exist(svgProvider_1.getSvgUri(textEditor.document.uri))) {
                    return openPreview(textEditor.document.uri, textEditor.document.fileName);
                }
            }
        }
    });
    let open = vscode.commands.registerTextEditorCommand('svgviewer.open', (te, t) => {
        if (checkNoSvg(te.document))
            return;
        provider.update(svgProvider_1.getSvgUri(te.document.uri));
        return openPreview(te.document.uri, te.document.fileName);
    });
    context.subscriptions.push(open);
    let openfile = vscode.commands.registerCommand('svgviewer.openfile', function (uri) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(uri instanceof vscode.Uri)) {
                return;
            }
            let document = yield vscode.workspace.openTextDocument(uri);
            if (checkNoSvg(document, false)) {
                vscode.window.showWarningMessage("Selected file is not an SVG document - no properties to preview.");
                return;
            }
            let fName = vscode.workspace.asRelativePath(document.fileName);
            let fileUriProvider = fileUriProviders.get(fName);
            if (fileUriProvider == undefined) {
                let fileUri = svgProvider_1.getSvgUri(uri);
                let fileProvider = new svgProvider_1.SvgFileContentProvider(fileUri, document.fileName);
                let fileRegistration = vscode.workspace.registerTextDocumentContentProvider('svg-preview', fileProvider);
                fileUriProvider = { uri: fileUri, provider: fileProvider, registration: fileRegistration };
                fileUriProviders.set(fName, fileUriProvider);
            }
            else {
                fileUriProvider.provider.update(fileUriProvider.uri);
            }
            return openPreview(fileUriProvider.uri, fName);
        });
    });
    context.subscriptions.push(openfile);
    let saveas = vscode.commands.registerTextEditorCommand('svgviewer.saveas', (te, t) => {
        if (checkNoSvg(te.document))
            return;
        let editor = vscode.window.activeTextEditor;
        if (editor) {
            let text = editor.document.getText();
            let tmpobj = tmp.fileSync({ 'postfix': '.svg' });
            let pngpath = editor.document.uri.fsPath.replace('.svg', '.png');
            exportPng(tmpobj, text, pngpath);
        }
    });
    context.subscriptions.push(saveas);
    let saveassize = vscode.commands.registerTextEditorCommand('svgviewer.saveassize', (te, t) => {
        if (checkNoSvg(te.document))
            return;
        let editor = vscode.window.activeTextEditor;
        if (!editor)
            return;
        let text = editor.document.getText();
        let tmpobj = tmp.fileSync({ 'postfix': '.svg' });
        let pngpath = editor.document.uri.fsPath.replace('.svg', '.png');
        creatInputBox('width')
            .then(width => {
            if (width) {
                creatInputBox('height')
                    .then(height => {
                    if (height) {
                        exportPng(tmpobj, text, pngpath, Number(width), Number(height));
                    }
                });
            }
        });
    });
    context.subscriptions.push(saveassize);
    let copydu = vscode.commands.registerTextEditorCommand('svgviewer.copydui', (te, t) => {
        if (checkNoSvg(te.document))
            return;
        let editor = vscode.window.activeTextEditor;
        if (!editor)
            return;
        let text = editor.document.getText();
        cp.copy('data:image/svg+xml,' + encodeURIComponent(text));
    });
    context.subscriptions.push(copydu);
    let exportProvider = new exportProvider_1.ExportDocumentContentProvider(context);
    vscode.workspace.registerTextDocumentContentProvider('svg-export', exportProvider);
    let makeExportUri = (uri) => uri.with({
        scheme: 'svg-export',
        path: uri.path + '.rendered',
        query: uri.toString()
    });
    vscode.workspace.onDidChangeTextDocument((event) => {
        if (vscode.window.activeTextEditor && event.document === vscode.window.activeTextEditor.document) {
            exportProvider.update(makeExportUri(event.document.uri));
        }
    });
    let openexport = vscode.commands.registerCommand('svgviewer.openexport', function (uri) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(uri instanceof vscode.Uri)) {
                if (vscode.window.activeTextEditor) {
                    uri = vscode.window.activeTextEditor.document.uri;
                }
                else {
                    return;
                }
            }
            let document = yield vscode.workspace.openTextDocument(uri);
            if (checkNoSvg(document)) {
                vscode.window.showWarningMessage("Active editor doesn't show a SVG document - no properties to preview.");
                return;
            }
            return vscode.commands.executeCommand('vscode.previewHtml', makeExportUri(uri));
        });
    });
    context.subscriptions.push(openexport);
    let savedu = vscode.commands.registerCommand('svgviewer.savedu', function (args) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = new Buffer(args.du.split(',')[1], 'base64');
            fs.writeFileSync(args.output, data);
            vscode.window.showInformationMessage('export done. ' + args.output);
        });
    });
    context.subscriptions.push(savedu);
}
exports.activate = activate;
function creatInputBox(param) {
    return vscode.window.showInputBox({
        prompt: `Set ${param} of the png.`,
        placeHolder: `${param}`,
        validateInput: checkSizeInput
    });
}
function checkNoSvg(document, displayMessage = true) {
    let isNGType = document.languageId !== 'xml' && document.getText().indexOf('</svg>') < 0;
    if (isNGType && displayMessage) {
        vscode.window.showWarningMessage("Active editor doesn't show a SVG document - no properties to preview.");
    }
    return isNGType;
}
function checkSizeInput(value) {
    return value !== '' && !isNaN(Number(value)) && Number(value) > 0
        ? null : 'Please set number.';
}
function exportPng(tmpobj, text, pngpath, w, h) {
    console.log(`export width:${w} height:${h}`);
    let result = fs.writeFile(tmpobj.name, text, 'utf-8')
        .then(x => {
        svgexport.render({
            'input': tmpobj.name,
            'output': `${pngpath} pad ${w || ''}${w == null && h == null ? '' : ':'}${h || ''}`
        }, function (err) {
            if (!err)
                vscode.window.showInformationMessage('export done. ' + pngpath);
            else
                vscode.window.showErrorMessage(err);
        });
    })
        .catch(e => vscode.window.showErrorMessage(e.message));
}
function openPreview(previewUri, fileName) {
    let viewColumn;
    switch (vscode.workspace.getConfiguration('svgviewer').get('previewcolumn')) {
        case "One":
            viewColumn = 1;
            break;
        case "Two":
            viewColumn = 2;
            break;
        case "Three":
            viewColumn = 3;
            break;
        default:
            viewColumn = 0;
            break;
    }
    if (viewColumn) {
        return vscode.commands.executeCommand('vscode.previewHtml', svgProvider_1.getSvgUri(previewUri), viewColumn, `Preview : ${fileName}`)
            .then(s => console.log('done.'), vscode.window.showErrorMessage);
    }
}
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map