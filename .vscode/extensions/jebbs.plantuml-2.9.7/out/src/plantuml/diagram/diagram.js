"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
const title = require("./title");
const includer_1 = require("./includer");
exports.diagramStartReg = /@start/i;
exports.diagramEndReg = /@end/i;
function currentDiagram() {
    let editor = vscode.window.activeTextEditor;
    if (editor)
        return diagramAt(editor.document, editor.selection.anchor.line);
}
exports.currentDiagram = currentDiagram;
function diagramAt(document, lineNumber) {
    let start;
    let end;
    let content = "";
    for (let i = lineNumber; i >= 0; i--) {
        let line = document.lineAt(i);
        if (exports.diagramStartReg.test(line.text)) {
            start = line.range.start;
            break;
        }
        else if (i != lineNumber && exports.diagramEndReg.test(line.text)) {
            return this;
        }
    }
    for (let i = lineNumber; i < document.lineCount; i++) {
        let line = document.lineAt(i);
        if (exports.diagramEndReg.test(line.text)) {
            end = line.range.end;
            break;
        }
        else if (i != lineNumber && exports.diagramStartReg.test(line.text)) {
            return this;
        }
    }
    // if no diagram block found, add entire document
    if (!(start && end) &&
        document.getText().trim() &&
        document.languageId == "diagram") {
        start = document.lineAt(0).range.start;
        end = document.lineAt(document.lineCount - 1).range.end;
    }
    let diagram = undefined;
    if (start && end) {
        content = document.getText(new vscode.Range(start, end));
        diagram = new Diagram(content, document, start, end);
    }
    return diagram ? includer_1.includer.addIncludes(diagram) : undefined;
}
exports.diagramAt = diagramAt;
function diagramsOf(document) {
    let diagrams = [];
    for (let i = 0; i < document.lineCount; i++) {
        let line = document.lineAt(i);
        if (exports.diagramStartReg.test(line.text)) {
            let d = diagramAt(document, i);
            diagrams.push(d);
        }
    }
    // if no diagram block found, try add entire document
    if (!diagrams.length) {
        let d = diagramAt(document, 0);
        if (d)
            diagrams.push(d);
    }
    return diagrams;
}
exports.diagramsOf = diagramsOf;
class Diagram {
    constructor(content, ...para) {
        this.pageCount = 1;
        this.index = 0;
        this.content = content;
        this.lines = content.replace(/\r/g, "").split('\n');
        if (para && para.length == 3) {
            this.document = para[0];
            this.start = para[1];
            this.end = para[2];
            this.parentUri = this.document.uri;
            this.path = this.document.uri.fsPath;
            this.fileName = path.basename(this.path);
            let i = this.fileName.lastIndexOf(".");
            if (i >= 0)
                this.fileName = this.fileName.substr(0, i);
            this.dir = path.dirname(this.path);
            if (!path.isAbsolute(this.dir))
                this.dir = "";
            this.getPageCount();
            this.getIndex();
            this.getTitle();
        }
    }
    isEqual(d) {
        if (this.dir !== d.dir)
            return false;
        if (this.fileName !== d.fileName)
            return false;
        if (!this.start || !d.start)
            return false;
        if (!this.start.isEqual(d.start))
            return false;
        return true;
    }
    getPageCount() {
        let regNewPage = /^\s*newpage\b/i;
        for (let text of this.lines) {
            if (regNewPage.test(text))
                this.pageCount++;
        }
    }
    getTitle() {
        let RegFName = /@start(\w+)\s+(.+?)\s*$/i;
        let matches;
        ;
        if (matches = this.lines[0].match(RegFName)) {
            this.titleRaw = matches[2];
            this.title = title.Deal(this.titleRaw);
            return;
        }
        let inlineTitle = /^\s*title\s+(.+?)\s*$/i;
        let multLineTitle = /^\s*title\s*$/i;
        for (let text of this.lines) {
            if (inlineTitle.test(text)) {
                let matches = text.match(inlineTitle);
                this.titleRaw = matches[1];
            }
        }
        if (this.titleRaw) {
            this.title = title.Deal(this.titleRaw);
        }
        else if (this.start && this.end) {
            // this.title = `${this.fileName}@${this.start.line + 1}-${this.end.line + 1}`;
            if (this.index)
                this.title = `${this.fileName}-${this.index}`;
            else
                this.title = this.fileName;
        }
        else {
            this.title = "Untitled";
        }
    }
    getIndex() {
        for (let i = 0; i < this.start.line; i++) {
            if (exports.diagramStartReg.test(this.document.lineAt(i).text))
                this.index++;
        }
    }
}
exports.Diagram = Diagram;
//# sourceMappingURL=diagram.js.map