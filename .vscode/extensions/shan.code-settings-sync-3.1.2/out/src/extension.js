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
const localize_1 = require("./localize");
const sync_1 = require("./sync");
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        yield localize_1.init();
        const sync = new sync_1.Sync(context);
        sync.bootstrap();
        context.subscriptions.push(vscode.commands.registerCommand("extension.updateSettings", sync.upload.bind(sync)));
        context.subscriptions.push(vscode.commands.registerCommand("extension.downloadSettings", sync.download.bind(sync)));
        context.subscriptions.push(vscode.commands.registerCommand("extension.resetSettings", sync.reset.bind(sync)));
        context.subscriptions.push(vscode.commands.registerCommand("extension.HowSettings", sync.how.bind(sync)));
        context.subscriptions.push(vscode.commands.registerCommand("extension.otherOptions", sync.advance.bind(sync)));
    });
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map