"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const linq = require("linq-collections");
const macroDefRegex = /!(?:define|definelong) (\w+)(?:\(((?:,? *(?:\w)+ *(?:= *".+")?)+)\))?/i;
const macroCallRegex = /(!(?:define|definelong) )?(\w+)\(([\w, "]*)\)?/gi;
function macrosOf(document) {
    let rawDefinitions = new linq.List();
    for (let i = 0; i < document.lineCount; i++) {
        const line = document.lineAt(i);
        const match = macroDefRegex.exec(line.text);
        if (!match) {
            continue;
        }
        const name = match[1];
        const params = splitParams(match[2]);
        var existingDef = rawDefinitions.singleOrDefault(d => d.name == name);
        if (!existingDef) {
            existingDef = new MacroDefinition(name);
            rawDefinitions.push(existingDef);
        }
        existingDef.addSignature(params);
    }
    return rawDefinitions;
}
exports.macrosOf = macrosOf;
function splitParams(paramsString) {
    return (paramsString || "")
        .split(",")
        .map(p => p.trim())
        .filter(p => p);
}
function macroCallOf(line, position) {
    let match;
    macroCallRegex.lastIndex = 0;
    while (match = macroCallRegex.exec(line.text)) {
        var start = match.index;
        var end = match.index + match[0].length;
        if (start <= position && position <= end) {
            break;
        }
    }
    if (!match || match[1]) {
        return null;
    }
    const macroName = match[2];
    const availableParameters = match[3].split(",").length;
    const activeParameter = line.text.substring(start, position).split(",").length - 1;
    return new MacroCallInfo(macroName, availableParameters, activeParameter);
}
exports.macroCallOf = macroCallOf;
class MacroCallInfo {
    constructor(macroName, availableParameters, activeParameter) {
        this.macroName = macroName;
        this.availableParameters = availableParameters;
        this.activeParameter = activeParameter;
    }
}
exports.MacroCallInfo = MacroCallInfo;
class MacroDefinition {
    constructor(name) {
        this.name = name;
        this.signatures = new linq.List();
    }
    addSignature(params) {
        this.signatures.push(params);
        this.signatures = this.signatures.orderBy(s => s.length).toList();
    }
    getSignatures() {
        return this.signatures.asReadOnly();
    }
    getDetailLabel() {
        const firstSignature = this.signatures.first();
        const signatureLabel = this.getSignatureLabel(firstSignature);
        let overloadLabel = "";
        if (this.signatures.count() == 2) {
            overloadLabel = " (+1 overload)";
        }
        else if (this.signatures.count() > 2) {
            overloadLabel = ` (+${this.signatures.count() - 1} overloads)`;
        }
        return signatureLabel + overloadLabel;
    }
    getSignatureLabel(params) {
        let paramsLabel = "";
        if (params.length > 0) {
            paramsLabel = "(" + params.join(", ") + ")";
        }
        return this.name + paramsLabel;
    }
}
exports.MacroDefinition = MacroDefinition;
//# sourceMappingURL=macros.js.map