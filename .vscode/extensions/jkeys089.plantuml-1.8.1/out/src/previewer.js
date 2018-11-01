"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const exporter_1 = require("./exporter");
const httpExporter_1 = require("./httpExporter");
const diagram_1 = require("./diagram");
const config_1 = require("./config");
const planuml_1 = require("./planuml");
const tools_1 = require("./tools");
var previewStatus;
(function (previewStatus) {
    previewStatus[previewStatus["default"] = 0] = "default";
    previewStatus[previewStatus["error"] = 1] = "error";
    previewStatus[previewStatus["processing"] = 2] = "processing";
})(previewStatus || (previewStatus = {}));
class Previewer {
    constructor() {
        this.Emittor = new vscode.EventEmitter();
        this.onDidChange = this.Emittor.event;
        this.Uri = vscode.Uri.parse('plantuml://preview');
        this.process = null;
        this.watchDisposables = [];
        this.error = "";
        this.killingLock = false;
    }
    initialize() {
        let tplPath = path.join(planuml_1.context.extensionPath, "templates");
        let tplPreviewPath = path.join(tplPath, "preview.html");
        let tplPreviewErrorPath = path.join(tplPath, "preview-error.html");
        let tplPreviewProcessingPath = path.join(tplPath, "preview-processing.html");
        this.template = '`' + fs.readFileSync(tplPreviewPath, "utf-8") + '`';
        this.templateError = '`' + fs.readFileSync(tplPreviewErrorPath, "utf-8") + '`';
        this.templateProcessing = '`' + fs.readFileSync(tplPreviewProcessingPath, "utf-8") + '`';
    }
    provideTextDocumentContent(uri, token) {
        let image;
        let imageError;
        let error;
        switch (this.status) {
            case previewStatus.default:
                let nonce = Math.random().toString(36).substr(2);
                let jsPath = "file:///" + path.join(planuml_1.context.extensionPath, "templates", "js");
                image = this.image;
                return eval(this.template);
            case previewStatus.error:
                image = this.image;
                imageError = this.imageError;
                error = this.error.replace(/\n/g, "<br />");
                return eval(this.templateError);
            case previewStatus.processing:
                let icon = "file:///" + path.join(planuml_1.context.extensionPath, "images", "icon.png");
                let processingTip = planuml_1.localize(9, null);
                image = exporter_1.exporter.calculateExportPath(this.rendered, config_1.config.previewFileType);
                if (!fs.existsSync(image))
                    image = "";
                else
                    image = "file:///" + image;
                return eval(this.templateProcessing);
            default:
                return "";
        }
    }
    update(processingTip) {
        //FIXME: last update may not happen due to killingLock
        if (this.killingLock)
            return;
        if (this.process) {
            this.killingLock = true;
            //kill lats unfinished task.
            // let pid = this.process.pid;
            this.process.kill();
            this.process.on('exit', (code) => {
                // console.log(`killed (${pid} ${code}) and restart!`);
                this.process = null;
                this.doUpdate(processingTip);
                this.killingLock = false;
            });
            return;
        }
        this.doUpdate(processingTip);
    }
    get TargetChanged() {
        let current = new diagram_1.Diagram().GetCurrent();
        let changed = (!this.rendered || !this.rendered.start || this.rendered.start.line != current.start.line || this.rendered.fileName != current.fileName);
        if (changed) {
            this.rendered = current;
            this.error = "";
            this.image = "";
            this.imageError = "";
        }
        return changed;
    }
    doUpdate(processingTip) {
        let diagram = new diagram_1.Diagram().GetCurrent();
        if (!diagram.content) {
            this.status = previewStatus.error;
            this.error = planuml_1.localize(3, null);
            this.image = "";
            this.Emittor.fire(this.Uri);
            return;
        }
        const previewFileType = config_1.config.previewFileType;
        const previewMimeType = previewFileType === 'png' ? 'png' : "svg+xml";
        let task;
        if (config_1.config.previewFromUrlServer) {
            task = httpExporter_1.httpExporter.exportToBuffer(diagram, previewFileType);
            this.process = null;
        }
        else {
            task = exporter_1.exporter.exportToBuffer(diagram, previewFileType);
            this.process = task.process;
        }
        // console.log(`start pid ${this.process.pid}!`);
        if (processingTip)
            this.processing();
        task.promise.then(result => {
            this.process = null;
            this.status = previewStatus.default;
            let b64 = result.toString('base64');
            if (!b64)
                return;
            this.image = `data:image/${previewMimeType};base64,${b64}`;
            this.Emittor.fire(this.Uri);
        }, error => {
            this.process = null;
            this.status = previewStatus.error;
            let err = tools_1.parseError(error)[0];
            this.error = err.error;
            let b64 = err.out.toString('base64');
            if (!(b64 || err.error))
                return;
            this.imageError = `data:image/${previewMimeType};base64,${b64}`;
            this.Emittor.fire(this.Uri);
        });
    }
    //display processing tip
    processing() {
        this.status = previewStatus.processing;
        this.Emittor.fire(this.Uri);
    }
    register() {
        this.initialize();
        let disposable;
        let disposables = [];
        //register provider
        disposable = vscode.workspace.registerTextDocumentContentProvider('plantuml', this);
        disposables.push(disposable);
        //register command
        disposable = vscode.commands.registerCommand('plantuml.preview', () => {
            var editor = vscode.window.activeTextEditor;
            if (!editor)
                return;
            let ds = new diagram_1.Diagrams().AddDocument(editor.document);
            if (!ds.diagrams.length)
                return;
            this.TargetChanged;
            return vscode.commands.executeCommand('vscode.previewHtml', this.Uri, vscode.ViewColumn.Two, planuml_1.localize(17, null))
                .then(success => {
                //active source editor
                vscode.window.showTextDocument(editor.document);
                //update preview
                if (config_1.config.previewAutoUpdate)
                    this.startWatch();
                else
                    this.stopWatch();
                this.update(true);
                return;
            }, reason => {
                vscode.window.showErrorMessage(reason);
            });
        });
        disposables.push(disposable);
        return disposables;
    }
    startWatch() {
        if (this.watchDisposables.length) {
            return;
        }
        let disposable;
        let disposables = [];
        //register watcher
        let lastTimestamp = new Date().getTime();
        disposable = vscode.workspace.onDidChangeTextDocument(e => {
            if (vscode.window.activeTextEditor.document !== e.document) {
                return;
            }
            lastTimestamp = new Date().getTime();
            setTimeout(() => {
                if (new Date().getTime() - lastTimestamp >= 400) {
                    this.update(false);
                }
            }, 500);
        });
        disposables.push(disposable);
        disposable = vscode.window.onDidChangeTextEditorSelection(e => {
            if (!this.TargetChanged)
                return;
            lastTimestamp = new Date().getTime();
            setTimeout(() => {
                if (new Date().getTime() - lastTimestamp >= 400) {
                    this.update(true);
                }
            }, 500);
        });
        disposables.push(disposable);
        //stop watcher when preview window is closed
        disposable = vscode.workspace.onDidCloseTextDocument(e => {
            if (e.uri.scheme === this.Uri.scheme) {
                this.stopWatch();
            }
        });
        disposables.push(disposable);
        this.watchDisposables = disposables;
    }
    stopWatch() {
        for (let d of this.watchDisposables) {
            d.dispose();
        }
        this.watchDisposables = [];
    }
}
exports.previewer = new Previewer();
//# sourceMappingURL=previewer.js.map