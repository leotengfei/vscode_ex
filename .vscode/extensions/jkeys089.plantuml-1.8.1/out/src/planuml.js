"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const nls = require("vscode-nls");
const path_1 = require("path");
const config_1 = require("./config");
const exporter_1 = require("./exporter");
const previewer_1 = require("./previewer");
const builder_1 = require("./builder");
const symboler_1 = require("./symboler");
const urlMaker_1 = require("./urlMaker");
const formatter_1 = require("./format/formatter");
exports.outputPanel = vscode.window.createOutputChannel("PlantUML");
class PlantUML {
    constructor(ctx) {
        exports.context = ctx;
        nls.config({ locale: vscode.env.language });
        exports.localize = nls.loadMessageBundle(path_1.join(exports.context.extensionPath, "langs", "lang.json"));
    }
    activate() {
        try {
            let ds = [];
            ds.push(config_1.config.watch());
            //register export
            ds.push(...exporter_1.exporter.register());
            //register preview
            ds.push(...previewer_1.previewer.register());
            //register builder
            ds.push(...builder_1.builder.register());
            //register symbol provider
            ds.push(...symboler_1.symboler.register());
            //register server
            ds.push(...urlMaker_1.urlMaker.register());
            //register formatter
            ds.push(...formatter_1.formatter.register());
            return ds;
        }
        catch (error) {
            exports.outputPanel.clear();
            exports.outputPanel.append(error);
        }
    }
    deactivate() {
        previewer_1.previewer.stopWatch();
        exports.outputPanel.dispose();
    }
}
exports.PlantUML = PlantUML;
//# sourceMappingURL=planuml.js.map