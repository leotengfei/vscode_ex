"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const planuml_1 = require("./planuml");
let conf = vscode.workspace.getConfiguration('plantuml');
class ConfigReader {
    _read(key) {
        return conf.get(key);
    }
    watch() {
        return vscode.workspace.onDidChangeConfiguration(() => {
            conf = vscode.workspace.getConfiguration('plantuml');
            this._jar = "";
        });
    }
    get jar() {
        return this._jar || (() => {
            let jar = this._read('jar');
            let intJar = path.join(planuml_1.context.extensionPath, "plantuml.jar");
            if (!jar) {
                jar = intJar;
            }
            else {
                if (!fs.existsSync(jar)) {
                    vscode.window.showWarningMessage(planuml_1.localize(19, null));
                    jar = intJar;
                }
            }
            this._jar = jar;
            return jar;
        })();
    }
    get fileExtensions() {
        let extReaded = this._read('fileExtensions').replace(/\s/g, "");
        let exts = extReaded || ".*";
        if (exts.indexOf(",") > 0)
            exts = `{${exts}}`;
        //REG: .* | .wsd | {.wsd,.java}
        if (!exts.match(/^(.\*|\.\w+|\{\.\w+(,\.\w+)*\})$/)) {
            throw new Error(planuml_1.localize(18, null, extReaded));
        }
        return exts;
    }
    get exportOutDirName() {
        return this._read('exportOutDirName') || "out";
    }
    get exportFormat() {
        return this._read('exportFormat');
    }
    get exportInPlace() {
        return this._read('exportInPlace');
    }
    get exportSubFolder() {
        return this._read('exportSubFolder');
    }
    get exportConcurrency() {
        // note: node-plantuml is single-threaded, but that's OK because it is fast!
        //return this._read<number>('exportConcurrency') || 3;
        return 1;
    }
    get exportFormats() {
        return [
            "png",
            "svg",
            "eps",
            "pdf",
            "vdx",
            "xmi",
            "scxml",
            "html",
            "txt",
            "utxt",
            "latex",
            "latex:nopreamble"
        ];
    }
    get previewAutoUpdate() {
        return this._read('previewAutoUpdate');
    }
    get previewFileType() {
        return this._read('previewFileType') || "png";
    }
    get urlServer() {
        return this._read('urlServer') || "http://www.plantuml.com/plantuml";
    }
    get urlFormat() {
        return this._read('urlFormat');
    }
    get urlResult() {
        return this._read('urlResult') || "MarkDown";
    }
    get urlFormats() {
        return [
            "png",
            "svg",
            "txt"
        ];
    }
    get previewFromUrlServer() {
        return this._read('previewFromUrlServer');
    }
    get includes() {
        return this._read('includes') || [];
    }
    get commandArgs() {
        return this._read('commandArgs') || [];
    }
    get formatInLine() {
        return this._read('experimental.formatInLine');
    }
}
exports.config = new ConfigReader();
//# sourceMappingURL=config.js.map