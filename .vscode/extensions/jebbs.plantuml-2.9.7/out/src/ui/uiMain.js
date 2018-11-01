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
const ui_1 = require("./ui");
const vscode = require("vscode");
const context_1 = require("../services/common/context");
const match_1 = require("../services/regexpReplace/match");
const replace_1 = require("../services/regexpReplace/replace");
const extract_1 = require("../services/regexpReplace/extract");
context_1.contextManager.addInitiatedListener(ctx => {
    exports.uiMain = new ui_1.UI("superReplace.main", "Super Replace", ctx.asAbsolutePath("assets/ui/main/index.htm"), replace);
});
var OperMode;
(function (OperMode) {
    OperMode[OperMode["Match"] = 0] = "Match";
    OperMode[OperMode["Replace"] = 1] = "Replace";
    OperMode[OperMode["Extract"] = 2] = "Extract";
})(OperMode || (OperMode = {}));
function replace(option) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!option.find) {
            vscode.window.showInformationMessage("Find pattern cannot be empty!");
            return;
        }
        let editor = vscode.window.visibleTextEditors.reduce((p, c) => {
            return p || (c.document.uri.scheme != "output" ? c : undefined);
        }, undefined);
        if (!editor) {
            vscode.window.showInformationMessage("No active document found!");
            return;
        }
        let hasSelection = editor.selections.reduce((p, s) => {
            return p || !s.isEmpty;
        }, false);
        let worker = null;
        if (option.mode === OperMode.Match) {
            worker = match_1.superMatch;
        }
        else if (option.mode === OperMode.Replace) {
            worker = replace_1.superReplace;
        }
        else if (option.mode === OperMode.Extract) {
            worker = extract_1.superExtract;
        }
        yield worker(editor, hasSelection ? editor.selections : editor.document, option.find, option.replace, option.func);
    });
}
//# sourceMappingURL=uiMain.js.map