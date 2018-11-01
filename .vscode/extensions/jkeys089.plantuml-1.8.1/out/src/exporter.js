"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const child_process = require("child_process");
const fs = require("fs");
const path = require("path");
const devnull = require("dev-null");
const plantuml = require("node-plantuml");
const diagram_1 = require("./diagram");
const config_1 = require("./config");
const planuml_1 = require("./planuml");
const tools_1 = require("./tools");
class Exporter {
    constructor() {
        this.java = "java";
        this.javeInstalled = true;
    }
    initialize() {
        this.testJava();
        this.primeNG();
    }
    testJava() {
        var process = child_process.exec(this.java + " -version", (e, stdout, stderr) => {
            if (e instanceof Error) {
                this.javeInstalled = false;
            }
        });
    }
    primeNG() {
        plantuml.useNailgun();
        let gen = plantuml.generate();
        gen.in.end("@startuml\nBob->Alice : hello\n@enduml");
        gen.out.pipe(devnull());
    }
    register() {
        this.initialize();
        //register export
        let ds = [];
        let d = vscode.commands.registerCommand('plantuml.exportCurrent', () => {
            this.exportDocument(false);
        });
        ds.push(d);
        d = vscode.commands.registerCommand('plantuml.exportDocument', () => {
            this.exportDocument(true);
        });
        ds.push(d);
        return ds;
    }
    exportURI(uri, format, concurrency, bar) {
        return __awaiter(this, void 0, void 0, function* () {
            let doc = yield vscode.workspace.openTextDocument(uri);
            let ds = new diagram_1.Diagrams().AddDocument(doc);
            if (!ds.diagrams.length)
                return Promise.resolve([]);
            let p = this.doExports(ds.diagrams, format, concurrency, bar);
            return new Promise((resolve, reject) => {
                p.then(r => { resolve(r); }, e => { reject(e); });
            });
        });
    }
    exportToFile(diagram, format, savePath, bar) {
        return this.doExport(diagram, format, savePath, bar);
    }
    exportToBuffer(diagram, format, bar) {
        return this.doExport(diagram, format, "", bar);
    }
    calculateExportPath(diagram, format) {
        if (config_1.config.exportInPlace) {
            let p = diagram.path;
            let i = p.lastIndexOf(".");
            if (i >= 0)
                p = p.substr(0, i);
            return p + "." + format;
        }
        let outDirName = config_1.config.exportOutDirName;
        let subDir = config_1.config.exportSubFolder;
        let dir = "";
        let wkdir = vscode.workspace.rootPath;
        //if current document is in workspace, organize exports in 'out' directory.
        //if not, export beside the document.
        if (wkdir && tools_1.isSubPath(diagram.path, wkdir))
            dir = path.join(wkdir, outDirName);
        let exportDir = diagram.dir;
        if (!path.isAbsolute(exportDir))
            return "";
        if (dir && wkdir) {
            let temp = path.relative(wkdir, exportDir);
            exportDir = path.join(dir, temp);
        }
        if (subDir) {
            exportDir = path.join(exportDir, diagram.fileName);
        }
        return path.join(exportDir, diagram.title + "." + format);
    }
    exportDocument(all) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let editor = vscode.window.activeTextEditor;
                if (!editor) {
                    vscode.window.showInformationMessage(planuml_1.localize(0, null));
                    return;
                }
                if (!path.isAbsolute(editor.document.fileName)) {
                    vscode.window.showInformationMessage(planuml_1.localize(1, null));
                    return;
                }
                ;
                let format = config_1.config.exportFormat;
                if (!format) {
                    format = yield vscode.window.showQuickPick(config_1.config.exportFormats);
                    if (!format)
                        return;
                }
                planuml_1.outputPanel.clear();
                let ds = new diagram_1.Diagrams();
                if (all) {
                    ds.AddDocument();
                    if (!ds.diagrams.length) {
                        vscode.window.showInformationMessage(planuml_1.localize(2, null));
                        return;
                    }
                }
                else {
                    let dg = new diagram_1.Diagram().GetCurrent();
                    if (!dg.content) {
                        vscode.window.showInformationMessage(planuml_1.localize(3, null));
                        return;
                    }
                    ds.Add(dg);
                    editor.selections = [new vscode.Selection(dg.start, dg.end)];
                }
                let bar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
                let concurrency = config_1.config.exportConcurrency;
                this.doExports(ds.diagrams, format, concurrency, bar).then(results => {
                    bar.dispose();
                    if (results.length) {
                        vscode.window.showInformationMessage(planuml_1.localize(4, null));
                    }
                }, error => {
                    bar.dispose();
                    let err = tools_1.parseError(error);
                    tools_1.showError(planuml_1.outputPanel, err);
                });
            }
            catch (error) {
                let err = tools_1.parseError(error);
                tools_1.showError(planuml_1.outputPanel, err);
            }
            return;
        });
    }
    /**
     * export a diagram to file or to Buffer.
     * @param diagram The diagram to export.
     * @param format format of export file.
     * @param savePath if savePath is given, it exports to a file, or, to Buffer.
     * @returns A Promise of Buffer.
     */
    doExport(diagram, format, savePath, bar) {
        if (!this.javeInstalled) {
            let pms = Promise.reject(planuml_1.localize(5, null));
            return { promise: pms };
        }
        //TODO: support custom jar definition once node-plantuml supports it
        // if (!fs.existsSync(config.jar)) {
        //     let pms = Promise.reject(localize(6, null, context.extensionPath));
        //     return <ExportTask>{ promise: pms };
        // }
        if (bar) {
            bar.show();
            bar.text = planuml_1.localize(7, null, diagram.title + "." + format.split(":")[0]);
        }
        let opts = {
            format,
            charset: 'utf-8',
        };
        if (path.isAbsolute(diagram.dir))
            opts['include'] = diagram.dir;
        //TODO: support environment vars (e.g. -DPLANTUML_LIMIT_SIZE=8192) once node-plantuml supports them
        //TODO: support misc puml args (e.g. -nometadata) once node-plantuml supports them
        //add user args
        //params.unshift(...config.commandArgs);
        let gen = plantuml.generate(opts);
        if (diagram.content !== null) {
            gen.in.end(diagram.content);
        }
        let pms = new Promise((resolve, reject) => {
            let buffs = [];
            let bufflen = 0;
            let stderror = '';
            if (savePath) {
                let f = fs.createWriteStream(savePath);
                gen.out.pipe(f);
            }
            else {
                gen.out.on('data', function (x) {
                    buffs.push(x);
                    bufflen += x.length;
                });
            }
            gen.out.on('finish', () => {
                let stdout = Buffer.concat(buffs, bufflen);
                if (!stderror) {
                    resolve(stdout);
                }
                else {
                    stderror = planuml_1.localize(10, null, diagram.title, stderror);
                    reject({ error: stderror, out: stdout });
                }
            });
            //TODO: support stderr once node-plantuml exposes it
            // process.stderr.on('data', function (x) {
            //     stderror += x;
            // });
        });
        return { promise: pms };
    }
    /**
     * export diagrams to file.
     * @param diagrams The diagrams array to export.
     * @param format format of export file.
     * @param dir if dir is given, it exports files to this dir which has same structure to files in workspace. Or, directly to workspace dir.
     * @returns A Promise of Buffer array.
     */
    doExports(diagrams, format, concurrency, bar) {
        concurrency = concurrency > 0 ? concurrency : 1;
        concurrency = concurrency > diagrams.length ? diagrams.length : concurrency;
        let promises = [];
        let errors = [];
        for (let i = 0; i < concurrency; i++) {
            //each i starts a task chain, which export indexes like 0,3,6,9... (task 1, concurrency 3 for example.)
            promises.push(diagrams.reduce((prev, diagram, index) => {
                if (index % concurrency != i) {
                    // ignore indexes belongs to other task chain
                    return prev;
                }
                if (!path.isAbsolute(diagram.dir))
                    return Promise.reject(planuml_1.localize(1, null));
                let savePath = this.calculateExportPath(diagram, format.split(":")[0]);
                tools_1.mkdirsSync(path.dirname(savePath));
                return prev.then(() => {
                    return this.exportToFile(diagram, format, savePath, bar).promise;
                }, err => {
                    errors.push(...tools_1.parseError(err));
                    // return Promise.reject(err);
                    //continue next diagram
                    return this.exportToFile(diagram, format, savePath, bar).promise;
                });
            }, Promise.resolve(new Buffer(""))).then(
            //to push last error of a chain
            r => {
                return r;
            }, err => {
                errors.push(...tools_1.parseError(err));
                return;
            }));
        }
        let all = Promise.all(promises);
        return new Promise((resolve, reject) => {
            all.then(r => {
                if (errors.length)
                    reject(errors);
                else
                    resolve(r);
            });
        });
    }
}
exports.exporter = new Exporter();
//# sourceMappingURL=exporter.js.map