"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const diagram_1 = require("../plantuml/diagram/diagram");
const config_1 = require("../plantuml/config");
const plantumlServer_1 = require("../plantuml/renders/plantumlServer");
const type_1 = require("../plantuml/diagram/type");
function renderHtml(tokens, idx) {
    // console.log("request html for:", idx, tokens[idx].content);
    let token = tokens[idx];
    if (token.type !== "plantuml")
        return tokens[idx].content;
    let diagram = new diagram_1.Diagram(token.content);
    // Ditaa only supports png
    let format = diagram.type == type_1.DiagramType.Ditaa ? "png" : "svg";
    return [...Array(diagram.pageCount).keys()].reduce((p, index) => {
        let requestUrl = plantumlServer_1.plantumlServer.makeURL(diagram, format);
        if (config_1.config.serverIndexParameter) {
            requestUrl += "?" + config_1.config.serverIndexParameter + "=" + index;
        }
        p += `\n<img id="image" src="${requestUrl}">`;
        return p;
    }, "");
}
exports.renderHtml = renderHtml;
//# sourceMappingURL=render.js.map