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
const zlib = require("zlib");
const diagram_1 = require("./diagram");
const config_1 = require("./config");
const planuml_1 = require("./planuml");
class URLMaker {
    register() {
        function showError(error) {
            let err = error;
            vscode.window.showErrorMessage(err.message);
        }
        //register url maker
        let ds = [];
        let d = vscode.commands.registerCommand('plantuml.URLCurrent', () => {
            try {
                this.makeDocumentURL(false);
            }
            catch (error) {
                showError(error);
            }
        });
        ds.push(d);
        d = vscode.commands.registerCommand('plantuml.URLDocument', () => {
            try {
                this.makeDocumentURL(true);
            }
            catch (error) {
                showError(error);
            }
        });
        ds.push(d);
        return ds;
    }
    makeDocumentURL(all) {
        return __awaiter(this, void 0, void 0, function* () {
            let editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage(planuml_1.localize(14, null));
                return;
            }
            let format = config_1.config.urlFormat;
            if (!format) {
                format = yield vscode.window.showQuickPick(config_1.config.urlFormats);
                if (!format)
                    return;
            }
            let ds = new diagram_1.Diagrams();
            if (all) {
                ds.AddDocument();
                if (!ds.diagrams.length) {
                    vscode.window.showWarningMessage(planuml_1.localize(15, null));
                    return;
                }
            }
            else {
                let dg = new diagram_1.Diagram().GetCurrent();
                if (!dg.content) {
                    vscode.window.showWarningMessage(planuml_1.localize(3, null));
                    return;
                }
                ds.Add(dg);
                editor.selections = [new vscode.Selection(dg.start, dg.end)];
            }
            let bar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
            let urls = this.makeURLs(ds.diagrams, config_1.config.urlServer, format, bar);
            bar.dispose();
            planuml_1.outputPanel.clear();
            urls.map(url => {
                planuml_1.outputPanel.appendLine(url.name);
                if (config_1.config.urlResult == "MarkDown") {
                    planuml_1.outputPanel.appendLine(`\n![${url.name}](${url.url} "${url.name}")`);
                }
                else {
                    planuml_1.outputPanel.appendLine(url.url);
                }
                planuml_1.outputPanel.appendLine("");
            });
            planuml_1.outputPanel.show();
            return urls;
        });
    }
    makeURL(diagram, server, format, bar) {
        if (bar) {
            bar.show();
            bar.text = planuml_1.localize(16, null, diagram.title);
        }
        let c = this.urlTextFrom(diagram.content);
        return { name: diagram.title, url: [server.replace(/^\/|\/$/g, ""), format, c].join("/") };
    }
    makeURLs(diagrams, server, format, bar) {
        return diagrams.map((diagram) => {
            return this.makeURL(diagram, server, format, bar);
        });
    }
    urlTextFrom(s) {
        let opt = { level: 9 };
        let d = zlib.deflateRawSync(new Buffer(s), opt);
        let b = encode64(String.fromCharCode(...d.subarray(0)));
        return b;
        // from synchro.js
        /* Copyright (C) 1999 Masanao Izumo <iz@onicos.co.jp>
         * Version: 1.0.1
         * LastModified: Dec 25 1999
         */
        function encode64(data) {
            let r = "";
            for (let i = 0; i < data.length; i += 3) {
                if (i + 2 == data.length) {
                    r += append3bytes(data.charCodeAt(i), data.charCodeAt(i + 1), 0);
                }
                else if (i + 1 == data.length) {
                    r += append3bytes(data.charCodeAt(i), 0, 0);
                }
                else {
                    r += append3bytes(data.charCodeAt(i), data.charCodeAt(i + 1), data.charCodeAt(i + 2));
                }
            }
            return r;
        }
        function append3bytes(b1, b2, b3) {
            let c1 = b1 >> 2;
            let c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
            let c3 = ((b2 & 0xF) << 2) | (b3 >> 6);
            let c4 = b3 & 0x3F;
            let r = "";
            r += encode6bit(c1 & 0x3F);
            r += encode6bit(c2 & 0x3F);
            r += encode6bit(c3 & 0x3F);
            r += encode6bit(c4 & 0x3F);
            return r;
        }
        function encode6bit(b) {
            if (b < 10) {
                return String.fromCharCode(48 + b);
            }
            b -= 10;
            if (b < 26) {
                return String.fromCharCode(65 + b);
            }
            b -= 26;
            if (b < 26) {
                return String.fromCharCode(97 + b);
            }
            b -= 26;
            if (b == 0) {
                return '-';
            }
            if (b == 1) {
                return '_';
            }
            return '?';
        }
    }
}
exports.urlMaker = new URLMaker();
//# sourceMappingURL=urlMaker.js.map