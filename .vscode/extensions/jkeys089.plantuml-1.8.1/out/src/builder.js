"use strict";
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
const path = require("path");
const fs = require("fs");
const exporter_1 = require("./exporter");
const config_1 = require("./config");
const planuml_1 = require("./planuml");
const tools_1 = require("./tools");
class Builder {
    register() {
        //register export
        let ds = [];
        let d = vscode.commands.registerCommand('plantuml.exportWorkspace', (fileUri) => {
            this.build(fileUri);
        });
        ds.push(d);
        return ds;
    }
    build(para) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!vscode.workspace.rootPath) {
                    return;
                }
                let format = config_1.config.exportFormat;
                if (!format) {
                    format = yield vscode.window.showQuickPick(config_1.config.exportFormats);
                    if (!format)
                        return;
                }
                planuml_1.outputPanel.clear();
                let exts = config_1.config.fileExtensions;
                if (!para) {
                    this.doBuild(yield vscode.workspace.findFiles(`**/*${exts}`, ""), format);
                }
                else if (para instanceof vscode.Uri) {
                    //commnad from the explorer/context
                    if (fs.statSync(para.fsPath).isDirectory()) {
                        let relPath = path.relative(vscode.workspace.rootPath, para.fsPath);
                        this.doBuild(yield vscode.workspace.findFiles(`${relPath}/**/*${exts}`, ""), format);
                    }
                    else {
                        this.doBuild([para], format);
                    }
                }
                else if (para instanceof Array) {
                    //FIXME: directory uri(s) in array
                    let uris = [];
                    for (let p of para) {
                        if (p instanceof vscode.Uri) {
                            uris.push(p);
                        }
                    }
                    this.doBuild(uris, format);
                }
            }
            catch (error) {
                tools_1.showError(planuml_1.outputPanel, tools_1.parseError(error));
            }
        });
    }
    doBuild(uris, format) {
        if (!uris.length) {
            vscode.window.showInformationMessage(planuml_1.localize(8, null));
            return;
        }
        let concurrency = config_1.config.exportConcurrency;
        let bar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        let errors = [];
        uris.reduce((prev, uri, index) => {
            return prev.then(() => {
                return exporter_1.exporter.exportURI(uri, format, concurrency, bar);
            }, error => {
                errors.push(...tools_1.parseError(planuml_1.localize(11, null, error.length, uris[index - 1].fsPath)));
                errors.push(...tools_1.parseError(error));
                // continue next file
                return exporter_1.exporter.exportURI(uri, format, concurrency, bar);
            });
        }, Promise.resolve([])).then(() => {
            bar.dispose();
            if (uris.length) {
                if (errors.length) {
                    vscode.window.showInformationMessage(planuml_1.localize(12, null, uris.length));
                    tools_1.showError(planuml_1.outputPanel, errors);
                }
                else {
                    vscode.window.showInformationMessage(planuml_1.localize(13, null, uris.length));
                }
            }
        }, error => {
            bar.dispose();
            errors.push(...tools_1.parseError(planuml_1.localize(11, null, error.length, uris[uris.length - 1].fsPath)));
            errors.push(...tools_1.parseError(error));
            if (uris.length) {
                vscode.window.showInformationMessage(planuml_1.localize(12, null, uris.length));
                tools_1.showError(planuml_1.outputPanel, errors);
            }
        });
    }
}
exports.builder = new Builder();
//# sourceMappingURL=builder.js.map