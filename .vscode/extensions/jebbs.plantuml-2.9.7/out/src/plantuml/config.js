"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const common_1 = require("./common");
const configReader_1 = require("./configReader");
const tools_1 = require("./tools");
exports.RenderType = {
    Local: 'Local',
    PlantUMLServer: 'PlantUMLServer'
};
var IncludeSearchType;
(function (IncludeSearchType) {
    IncludeSearchType[IncludeSearchType["Fixed"] = 0] = "Fixed";
    IncludeSearchType[IncludeSearchType["Relative"] = 1] = "Relative";
})(IncludeSearchType = exports.IncludeSearchType || (exports.IncludeSearchType = {}));
class Config extends configReader_1.ConfigReader {
    constructor() {
        super('plantuml');
        this._jar = {};
    }
    onChange() {
        this._jar = {};
        this._java = "";
    }
    jar(uri) {
        let folder = vscode.workspace.getWorkspaceFolder(uri);
        let folderPath = folder ? folder.uri.fsPath : "";
        return this._jar[folderPath] || (() => {
            let jar = this.read('jar', uri, (folderUri, value) => {
                if (!value)
                    return "";
                const workspaceFolder = folderUri.fsPath;
                let result = eval('`' + value + '`');
                if (!path.isAbsolute(result))
                    result = path.join(workspaceFolder, result);
                return result;
            });
            let intJar = path.join(common_1.extensionPath, "plantuml.jar");
            if (!jar) {
                jar = intJar;
            }
            else {
                if (!fs.existsSync(jar)) {
                    vscode.window.showWarningMessage(common_1.localize(19, null));
                    jar = intJar;
                }
            }
            this._jar[folderPath] = jar;
            return jar;
        })();
    }
    fileExtensions(uri) {
        let extReaded = this.read('fileExtensions', uri).replace(/\s/g, "");
        let exts = extReaded || ".*";
        if (exts.indexOf(",") > 0)
            exts = `{${exts}}`;
        //REG: .* | .wsd | {.wsd,.java}
        if (!exts.match(/^(.\*|\.\w+|\{\.\w+(,\.\w+)*\})$/)) {
            throw new Error(common_1.localize(18, null, extReaded));
        }
        return exts;
    }
    diagramsRoot(uri) {
        let folder = vscode.workspace.getWorkspaceFolder(uri);
        if (!folder)
            return undefined;
        let fsPath = path.join(folder.uri.fsPath, this.read("diagramsRoot", uri));
        return vscode.Uri.file(fsPath);
    }
    includeSearch(uri) {
        return IncludeSearchType[this.read('includeSearch', uri)];
    }
    exportOutDir(uri) {
        let folder = vscode.workspace.getWorkspaceFolder(uri);
        if (!folder)
            return undefined;
        let fsPath = path.join(folder.uri.fsPath, this.read("exportOutDir", uri) || "out");
        return vscode.Uri.file(fsPath);
    }
    exportFormat(uri) {
        return this.read('exportFormat', uri);
    }
    exportSubFolder(uri) {
        return this.read('exportSubFolder', uri);
    }
    get exportConcurrency() {
        return this.read('exportConcurrency') || 3;
    }
    exportMapFile(uri) {
        return this.read('exportMapFile', uri) || false;
    }
    get previewAutoUpdate() {
        return this.read('previewAutoUpdate');
    }
    get previewSnapIndicators() {
        return this.read('previewSnapIndicators');
    }
    get server() {
        return this.read('server') || "http://www.plantuml.com/plantuml";
    }
    get serverIndexParameter() {
        return this.read('serverIndexParameter');
    }
    get urlFormat() {
        return this.read('urlFormat');
    }
    get urlResult() {
        return this.read('urlResult') || "MarkDown";
    }
    get render() {
        return this.read('render');
    }
    includes(uri) {
        return this.read('includes', uri);
    }
    get commandArgs() {
        return this.read('commandArgs') || [];
    }
    jarArgs(uri) {
        return this.read('jarArgs', uri) || [];
    }
    get java() {
        return this._java || (() => {
            let java = this.read('java') || "java";
            if (tools_1.testJava(java)) {
                this._java = java;
            }
            return this._java;
        })();
    }
}
exports.config = new Config();
//# sourceMappingURL=config.js.map