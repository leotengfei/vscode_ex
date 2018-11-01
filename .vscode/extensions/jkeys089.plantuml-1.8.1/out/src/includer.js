"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const config_1 = require("./config");
const planuml_1 = require("./planuml");
class Includer {
    // private _includeContent: string
    addIncludes(content) {
        if (this._calculated != config_1.config.includes.sort().toString())
            this._calcIncludes();
        if (!this._includes)
            return content;
        return content.replace(/\n\s*'\s*autoinclude\s*\n/i, `${this._includes}\n`);
    }
    _calcIncludes() {
        let includes = "";
        let confs = config_1.config.includes;
        let paths = [];
        for (let c of confs) {
            if (!c)
                continue;
            if (!path.isAbsolute(c)) {
                paths.push(...(this._findWorkspace(c) || this._findIntegrated(c) || []));
                continue;
            }
            if (fs.existsSync(c))
                paths.push(c);
        }
        this._includes = paths.reduce((pre, cur) => `${pre}\n!include ${cur}`, "");
        // FIXME: not watch changes of include file.
        // this._includeContent = paths.reduce((pre, cur) => `${pre}\n${fs.readFileSync(cur, "utf-8")}`, "");
        this._calculated = confs.sort().toString();
    }
    _findWorkspace(p) {
        if (!vscode.workspace.rootPath)
            return null;
        p = path.join(vscode.workspace.rootPath, p);
        if (fs.existsSync(p)) {
            if (fs.statSync(p).isDirectory())
                return fs.readdirSync(p).map(f => path.join(p, f));
            return [p];
        }
        return null;
    }
    _findIntegrated(p) {
        p = path.join(planuml_1.context.extensionPath, "includes", p + ".wsd");
        if (fs.existsSync(p))
            return [p];
        return null;
    }
    _canNotInclude(content) {
        let lines = content.split("\n");
        let line1 = lines[0];
        let line2 = "";
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                line2 = lines[i];
                break;
            }
        }
        return isSalt(line1) || isSalt(line2)
            || isEgg(line2) || isEarth(line2);
        function isSalt(line) {
            return /^\s*salt\s*$/i.test(line) || /^\s*@startsalt/i.test(line);
        }
        function isEgg(line) {
            return lines.length == 3 && /^\s*(license|version|sudoku|listfonts|listopeniconic)/i.test(line);
        }
        function isEarth(line) {
            return /^\s*xearth\(\d+,\d+\)\s*$/i.test(line);
        }
    }
}
exports.includer = new Includer();
//# sourceMappingURL=includer.js.map