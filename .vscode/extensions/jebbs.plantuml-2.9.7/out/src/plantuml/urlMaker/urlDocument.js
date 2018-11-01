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
const diagram_1 = require("../diagram/diagram");
const config_1 = require("../config");
const common_1 = require("../common");
const plantumlServer_1 = require("../renders/plantumlServer");
function makeDocumentURL(all) {
    return __awaiter(this, void 0, void 0, function* () {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage(common_1.localize(14, null));
            return;
        }
        let format = config_1.config.urlFormat;
        if (!format) {
            format = yield vscode.window.showQuickPick(plantumlServer_1.plantumlServer.formats());
            if (!format)
                return;
        }
        let diagrams = [];
        if (all) {
            diagrams = diagram_1.diagramsOf(editor.document);
            if (!diagrams.length) {
                vscode.window.showWarningMessage(common_1.localize(15, null));
                return;
            }
        }
        else {
            let dg = diagram_1.currentDiagram();
            if (!dg) {
                vscode.window.showWarningMessage(common_1.localize(3, null));
                return;
            }
            diagrams.push(dg);
            editor.selections = [new vscode.Selection(dg.start, dg.end)];
        }
        let urls = makeURLs(diagrams, config_1.config.server, format, common_1.bar);
        common_1.bar.hide();
        common_1.outputPanel.clear();
        urls.map(url => {
            common_1.outputPanel.appendLine(url.name);
            if (config_1.config.urlResult == "MarkDown") {
                common_1.outputPanel.appendLine(`\n![${url.name}](${url.url} "${url.name}")`);
            }
            else {
                common_1.outputPanel.appendLine(url.url);
            }
            common_1.outputPanel.appendLine("");
        });
        common_1.outputPanel.show();
        return urls;
    });
}
exports.makeDocumentURL = makeDocumentURL;
function makeURLs(diagrams, server, format, bar) {
    return diagrams.map((diagram) => {
        return makeURL(diagram, server, format, bar);
    });
}
function makeURL(diagram, server, format, bar) {
    if (bar) {
        bar.show();
        bar.text = common_1.localize(16, null, diagram.title);
    }
    return { name: diagram.title, url: plantumlServer_1.plantumlServer.makeURL(diagram, format) };
}
//# sourceMappingURL=urlDocument.js.map