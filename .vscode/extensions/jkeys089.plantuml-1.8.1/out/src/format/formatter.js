"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const formatRules_1 = require("./formatRules");
const formatRuleCompiler_1 = require("./formatRuleCompiler");
const matchPositions_1 = require("./matchPositions");
const config_1 = require("../config");
const planuml_1 = require("../planuml");
const tools_1 = require("../tools");
class Formatter {
    constructor() {
        this.blocks = [];
    }
    provideDocumentFormattingEdits(document, options, token) {
        try {
            return this.formate(document, options, token);
        }
        catch (error) {
            tools_1.showError(planuml_1.outputPanel, tools_1.parseError(error));
        }
    }
    register() {
        let ds = [];
        let d = vscode.languages.registerDocumentFormattingEditProvider({ language: "diagram" }, this);
        ds.push(d);
        return ds;
    }
    formate(document, options, token) {
        let edits = [];
        this.blocks = [];
        const spaceStr = options.insertSpaces ? " ".repeat(options.tabSize) : "\t";
        for (let i = 0; i < document.lineCount; i++) {
            if (token.isCancellationRequested)
                return [];
            let docLine = document.lineAt(i);
            let line = {
                text: docLine.text,
                newText: docLine.text,
                matchPositions: new matchPositions_1.MatchPositions(docLine.text),
                elements: []
            };
            let indentDelta = 0;
            //test block out
            if (this.blocks.length) {
                let rule = this.blocks[this.blocks.length - 1];
                if (this.doMatch(line, rule.blockEnd, rule.blockEndCaptures)) {
                    this.blocks.pop();
                }
            }
            for (let rule of formatRules_1.formatRules) {
                //test match    
                if (config_1.config.formatInLine && rule.match) {
                    this.doMatch(line, rule.match, rule.captures);
                }
                else if (rule.blockBegin && rule.blockEnd) {
                    if (this.doMatch(line, rule.blockBegin, rule.blockBeginCaptures)) {
                        this.blocks.push(rule);
                        indentDelta = -1;
                    }
                    else {
                        //test 'again' line
                        if (rule.blockAgain && this.doMatch(line, rule.blockAgain, rule.blockAgainCaptures))
                            indentDelta = -1;
                    }
                }
            }
            if (config_1.config.formatInLine) {
                this.makeLineElements(line);
                this.formatLine(line);
            }
            line.newText = this.indent(line.newText, spaceStr, this.blocks.length + indentDelta);
            edits.push({ range: docLine.range, newText: line.newText });
        }
        return edits;
    }
    doMatch(line, patt, captures) {
        let matched = false;
        for (let u of line.matchPositions.GetUnmatchedTexts()) {
            if (!u.text.trim())
                continue;
            // console.log("test", u.text, "with", patt.regExp.source);
            let matches = [];
            patt.regExp.lastIndex = 0;
            while (matches = patt.execForAllGroups(u.text, false)) {
                // console.log("TEST", u.text, "MATCH", matches[0].match, "WITH", patt.regExp.source);
                matched = true;
                line.matchPositions.AddPosition(matches[0].start, matches[0].end, u.offset);
                if (captures) {
                    for (let capture of captures) {
                        if (matches[capture.index])
                            line.elements.push({
                                type: capture.type,
                                text: matches[capture.index].match,
                                start: matches[capture.index].start + u.offset,
                                end: matches[capture.index].end + u.offset,
                            });
                    }
                }
            }
            patt.regExp.lastIndex = 0;
        }
        return matched;
    }
    indent(lineText, spaceStr, level) {
        if (!lineText.trim())
            return "";
        level = level < 0 ? 0 : level;
        return spaceStr.repeat(level) + lineText.trim();
    }
    formatLine(line) {
        if (line.text.trim() && !line.elements.length)
            throw ("no element found for a non-empty line!");
        if (!line.elements.length) {
            line.newText = "";
            return;
        }
        let text = getElementText(line.elements[0]);
        // let formatType: FormatType;
        for (let i = 0; i < line.elements.length - 1; i++) {
            let thisEl = line.elements[i];
            let nextEl = line.elements[i + 1];
            switch (thisEl.type) {
                case formatRuleCompiler_1.FormatType.none:
                case formatRuleCompiler_1.FormatType.word:
                    switch (nextEl.type) {
                        case formatRuleCompiler_1.FormatType.none:
                        case formatRuleCompiler_1.FormatType.punctLeftSpace:
                        case formatRuleCompiler_1.FormatType.operater:
                        case formatRuleCompiler_1.FormatType.word:
                            text += " " + getElementText(nextEl);
                            break;
                        default:
                            text += getElementText(nextEl);
                            break;
                    }
                    break;
                case formatRuleCompiler_1.FormatType.operater:
                case formatRuleCompiler_1.FormatType.punctRightSpace:
                    switch (nextEl.type) {
                        case formatRuleCompiler_1.FormatType.none:
                        case formatRuleCompiler_1.FormatType.word:
                        case formatRuleCompiler_1.FormatType.punctLeftSpace:
                            text += " " + getElementText(nextEl);
                            break;
                        default:
                            text += getElementText(nextEl);
                            break;
                    }
                    break;
                case formatRuleCompiler_1.FormatType.punctLeftSpace:
                    text += getElementText(nextEl);
                    break;
                case formatRuleCompiler_1.FormatType.connector:
                    text += getElementText(nextEl);
                    break;
                default:
                    text += getElementText(nextEl);
                    break;
            }
        }
        line.newText = text;
        function getElementText(el) {
            if (el.type == formatRuleCompiler_1.FormatType.asIs)
                return el.text;
            return el.text.trim();
        }
    }
    makeLineElements(line) {
        if (line.elements.length)
            line.elements.sort((a, b) => a.start - b.start);
        let pos = 0;
        let els = [];
        for (let e of line.elements) {
            if (e.start > pos && line.text.substring(pos, e.start).trim())
                els.push({
                    type: formatRuleCompiler_1.FormatType.none,
                    text: line.text.substring(pos, e.start),
                    start: pos,
                    end: e.start - 1
                });
            pos = e.end + 1;
        }
        if (pos < line.text.length && line.text.substring(pos, line.text.length).trim()) {
            els.push({
                type: formatRuleCompiler_1.FormatType.none,
                text: line.text.substring(pos, line.text.length),
                start: pos,
                end: line.text.length - 1
            });
        }
        line.elements.push(...els);
        if (line.elements.length)
            line.elements.sort((a, b) => a.start - b.start);
    }
}
exports.formatter = new Formatter();
//# sourceMappingURL=formatter.js.map