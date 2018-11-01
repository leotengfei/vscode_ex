"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const previewer_1 = require("../providers/previewer");
class CommandPreviewStatus extends common_1.Command {
    execute(...args) {
        previewer_1.previewer.setUIStatus(JSON.stringify(args[0]));
    }
    constructor() {
        super("plantuml.previewStatus");
    }
}
exports.CommandPreviewStatus = CommandPreviewStatus;
//# sourceMappingURL=previewStatus.js.map