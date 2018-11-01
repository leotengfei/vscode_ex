'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const planuml_1 = require("./planuml");
let extension;
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    let extension = new planuml_1.PlantUML(context);
    context.subscriptions.push(...extension.activate());
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
    extension.deactivate();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map