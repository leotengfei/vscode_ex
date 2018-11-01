"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const ui_1 = require("./ui");
const common_1 = require("../plantuml/common");
exports.uiPreview = new ui_1.UI("plantuml.preview", common_1.localize(17, null), path.join(common_1.extensionPath, "templates/preview.html"));
//# sourceMappingURL=uiPreview.js.map