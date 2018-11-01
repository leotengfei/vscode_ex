"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const os_1 = require("os");
const wxml_parser_1 = require("@minapp/wxml-parser");
class default_1 {
    constructor(config) {
        this.config = config;
    }
    getEOL(doc) {
        return vscode_1.workspace.getConfiguration('files', doc.uri).get('eol', os_1.EOL);
    }
    format(doc, range, options, prefix = '') {
        let xml = wxml_parser_1.parse(doc.getText(range));
        return [
            new vscode_1.TextEdit(range, xml.toXML({
                prefix,
                eol: this.getEOL(doc),
                preferSpaces: options.insertSpaces,
                tabSize: options.tabSize,
                maxLineCharacters: this.config.formatMaxLineCharacters,
                removeComment: false,
                reserveTags: this.config.reserveTags
            }))
        ];
    }
    provideDocumentFormattingEdits(doc, options) {
        let range = new vscode_1.Range(doc.lineAt(0).range.start, doc.lineAt(doc.lineCount - 1).range.end);
        return this.format(doc, range, options);
    }
    provideDocumentRangeFormattingEdits(doc, range, options) {
        let prefixRange = doc.getWordRangeAtPosition(range.start, /[ \t]+/);
        let prefix = prefixRange ? doc.getText(prefixRange) : '';
        return this.format(doc, range, options, prefix);
    }
}
exports.default = default_1;
//# sourceMappingURL=WxmlFormatter.js.map