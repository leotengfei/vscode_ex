"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const cmdSqlite3Utils_1 = require("../utils/cmdSqlite3Utils");
const logger_1 = require("../logging/logger");
const properties = require('../../package.json').contributes.configuration.properties;
function getConfiguration(extensionPath) {
    return {
        sqlite3: _sqlite3(extensionPath),
        logLevel: _logLevel(),
        recordsPerPage: _recordsPerPage()
    };
}
exports.getConfiguration = getConfiguration;
function _sqlite3(extensionPath) {
    let sqlite3Conf = vscode_1.workspace.getConfiguration().get('sqlite.sqlite3');
    let sqlite3 = sqlite3Conf ? sqlite3Conf.toString() : '';
    sqlite3 = cmdSqlite3Utils_1.validateOrFallback(sqlite3, extensionPath);
    sqlite3 = sqlite3 ? sqlite3 : "";
    return sqlite3;
}
function _logLevel() {
    let logLevelConf = vscode_1.workspace.getConfiguration().get('sqlite.logLevel');
    let logLevel = properties["sqlite.logLevel"]["default"];
    if (logLevelConf && logger_1.Level[`${logLevelConf}`] != null) {
        logLevel = logLevelConf.toString();
    }
    return logLevel;
}
function _recordsPerPage() {
    let recordsPerPageConf = vscode_1.workspace.getConfiguration().get('sqlite.recordsPerPage');
    let recordsPerPage = properties["sqlite.recordsPerPage"]["default"];
    if (typeof recordsPerPageConf === "string") {
        let n = Number.parseInt(recordsPerPageConf);
        if (n >= -1)
            recordsPerPage = n;
    }
    else if (typeof recordsPerPageConf === "number") {
        if (recordsPerPageConf >= -1)
            recordsPerPage = recordsPerPageConf;
    }
    return recordsPerPage;
}
//# sourceMappingURL=index.js.map