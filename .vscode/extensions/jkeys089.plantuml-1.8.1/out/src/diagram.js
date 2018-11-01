"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
const title = require("./title");
const includer_1 = require("./includer");
class Diagrams {
    constructor() {
        this.diagrams = [];
    }
    Add(diagram) {
        this.diagrams.push(diagram);
        return this;
    }
    AddCurrent() {
        let d = new Diagram();
        d.GetCurrent();
        this.diagrams.push(d);
        return this;
    }
    AddDocument(document) {
        if (!document) {
            let editor = vscode.window.activeTextEditor;
            document = editor.document;
        }
        let RegStart = /@start/;
        for (let i = 0; i < document.lineCount; i++) {
            let line = document.lineAt(i);
            if (RegStart.test(line.text)) {
                let d = new Diagram().DiagramAt(i, document);
                this.diagrams.push(d);
            }
        }
        return this;
    }
}
exports.Diagrams = Diagrams;
class Diagram {
    GetCurrent() {
        let editor = vscode.window.activeTextEditor;
        if (editor)
            this.DiagramAt(editor.selection.anchor.line);
        return this;
    }
    DiagramAt(lineNumber, document) {
        let RegStart = /@start/;
        let RegEnd = /@end/;
        if (!document)
            document = vscode.window.activeTextEditor.document;
        this.path = document.uri.fsPath;
        this.fileName = path.basename(this.path);
        let i = this.fileName.lastIndexOf(".");
        if (i >= 0)
            this.fileName = this.fileName.substr(0, i);
        this.dir = path.dirname(this.path);
        if (!path.isAbsolute(this.dir)) {
            if (vscode.workspace.rootPath) {
                this.dir = vscode.workspace.rootPath;
            }
        }
        for (let i = lineNumber; i >= 0; i--) {
            let line = document.lineAt(i);
            if (RegStart.test(line.text)) {
                this.start = line.range.start;
                break;
            }
            else if (i != lineNumber && RegEnd.test(line.text)) {
                return this;
            }
        }
        for (let i = lineNumber; i < document.lineCount; i++) {
            let line = document.lineAt(i);
            if (RegEnd.test(line.text)) {
                this.end = line.range.end;
                break;
            }
            else if (i != lineNumber && RegStart.test(line.text)) {
                return this;
            }
        }
        if (this.start && this.end) {
            this.content = includer_1.includer.addIncludes(document.getText(new vscode.Range(this.start, this.end)));
            this.getTitle(document);
        }
        return this;
    }
    getTitle(document) {
        let RegFName = /@start(\w+)\s+(.+?)\s*$/i;
        let text = document.lineAt(this.start.line).text;
        let matches = text.match(RegFName);
        if (matches) {
            this.titleRaw = matches[2];
            this.title = title.Deal(this.titleRaw);
            return;
        }
        let inlineTitle = /^\s*title\s+(.+?)\s*$/i;
        let multLineTitle = /^\s*title\s*$/i;
        for (let i = this.start.line; i <= this.end.line; i++) {
            let text = document.lineAt(i).text;
            if (inlineTitle.test(text)) {
                let matches = text.match(inlineTitle);
                this.titleRaw = matches[1];
            }
        }
        if (this.titleRaw) {
            this.title = title.Deal(this.titleRaw);
        }
        else {
            this.title = `${this.fileName}@${this.start.line + 1}-${this.end.line + 1}`;
        }
    }
}
exports.Diagram = Diagram;
//# sourceMappingURL=diagram.js.map