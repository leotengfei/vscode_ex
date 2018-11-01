'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const contentProvider_1 = require("./contentProvider");
const editorProvider_1 = require("./editorProvider");
let _disposables = [];
function activate(context) {
    context.subscriptions.push(new vscode_1.Disposable(() => vscode_1.Disposable.from(..._disposables).dispose()));
    _disposables.push(new contentProvider_1.default(context));
    _disposables.push(new editorProvider_1.default(context));
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map