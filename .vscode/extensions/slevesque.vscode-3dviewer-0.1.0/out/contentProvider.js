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
const vscode_1 = require("vscode");
const path = require("path");
class MeshPreviewContentProvider {
    constructor(context) {
        this.context = context;
        this._disposables = [];
        this._onDidChange = new vscode_1.EventEmitter();
        if (MeshPreviewContentProvider.s_instance) {
            MeshPreviewContentProvider.s_instance.dispose();
        }
        MeshPreviewContentProvider.s_instance = this;
        this._disposables.push(vscode_1.workspace.registerTextDocumentContentProvider('preview3dfile', this));
        this._disposables.push(vscode_1.workspace.registerTextDocumentContentProvider('preview3dhttp', this));
        this._disposables.push(vscode_1.workspace.registerTextDocumentContentProvider('preview3dhttps', this));
        this._disposables.push(vscode_1.commands.registerCommand("3dviewer.openInViewer", (fileUri) => {
            if (fileUri) {
                let previewUri = fileUri.with({ scheme: 'preview3dfile' });
                vscode_1.commands.executeCommand('vscode.previewHtml', previewUri, vscode_1.ViewColumn.Active, "3D Mesh Preview");
                console.log(previewUri.toString());
            }
        }));
        this._disposables.push(vscode_1.commands.registerCommand("3dviewer.openUrlInViewer", () => {
            vscode_1.window.showInputBox({ prompt: "Enter URL to open", placeHolder: "http://..." }).then((value) => {
                if (value) {
                    let fileUri = vscode_1.Uri.parse(value);
                    let previewUri = fileUri.with({ scheme: 'preview3d' + fileUri.scheme });
                    vscode_1.commands.executeCommand('vscode.previewHtml', previewUri, vscode_1.ViewColumn.Active, "3D Mesh Preview");
                    console.log(previewUri.toString());
                }
            });
        }));
    }
    static get instance() {
        return MeshPreviewContentProvider.s_instance;
    }
    dispose() {
        this._onDidChange.dispose();
        if (MeshPreviewContentProvider.s_instance) {
            MeshPreviewContentProvider.s_instance.dispose();
            MeshPreviewContentProvider.s_instance = null;
        }
        this._disposables.forEach(d => d.dispose());
    }
    getMediaPath(mediaFile) {
        return vscode_1.Uri.file(this.context.asAbsolutePath(path.join('media', mediaFile))).toString();
    }
    getSettings(uri) {
        let config = vscode_1.workspace.getConfiguration('3dviewer');
        let initialData = {
            fileToLoad: uri.toString(),
            wireframe: config.get('wireframe', false),
            background: config.get('background', '#8f8f8f'),
            boundingBox: config.get('boundingBox', false),
            grid: config.get('grid', true),
            gridSize: config.get('gridSize', 32),
            near: config.get('near', 0.01),
            far: config.get('far', 1000000)
        };
        return `<meta id="vscode-3dviewer-data" data-settings="${JSON.stringify(initialData).replace(/"/g, '&quot;')}">`;
    }
    getScripts() {
        const scripts = [
            this.getMediaPath('build/three.js'),
            this.getMediaPath('examples/js/libs/inflate.min.js'),
            this.getMediaPath('examples/js/libs/dat.gui.min.js'),
            this.getMediaPath('examples/js/controls/OrbitControls.js'),
            this.getMediaPath('examples/js/loaders/ColladaLoader.js'),
            this.getMediaPath('examples/js/loaders/FBXLoader.js'),
            this.getMediaPath('examples/js/loaders/TDSLoader.js'),
            this.getMediaPath('examples/js/loaders/OBJLoader.js'),
            this.getMediaPath('examples/js/loaders/STLLoader.js'),
            this.getMediaPath('viewer.js')
        ];
        return scripts
            .map(source => `<script src="${source}"></script>`)
            .join('\n');
    }
    provideTextDocumentContent(uri) {
        switch (uri.scheme) {
            case 'preview3dfile':
                uri = uri.with({ scheme: 'file' });
                break;
            case 'preview3dhttp':
                uri = uri.with({ scheme: 'http' });
                break;
            case 'preview3dhttps':
                uri = uri.with({ scheme: 'https' });
                break;
            default:
                return null;
        }
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            resolve(`
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <title>three.js webgl - FBX loader</title>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
                    ${this.getSettings(uri)}
                    <base href="${this.getMediaPath('/')}">
                    <style>
                        body {
                            font-family: Monospace;
                            background-color: #0f0;
                            color: #f00;
                            margin: 0px;
                            padding: 0px 0px;
                            overflow: hidden;
                        }
                    </style>
                </head>
                <body>
                    ${this.getScripts()}
                </body>
            </html>
            `);
        }));
    }
    get onDidChange() {
        return this._onDidChange.event;
    }
    update(uri) {
        this._onDidChange.fire(uri);
    }
}
MeshPreviewContentProvider.s_instance = null;
exports.default = MeshPreviewContentProvider;
//# sourceMappingURL=contentProvider.js.map