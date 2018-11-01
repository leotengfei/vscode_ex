"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process = require("child_process");
const streamParser_1 = require("./streamParser");
const resultSetParser_1 = require("./resultSetParser");
function execute(sqlite3, dbPath, query, callback) {
    if (!sqlite3) {
        const err = `sqlite3 command/path not found or invalid.`;
        return callback(undefined, new Error(err));
    }
    let resultSet;
    let error;
    let streamParser = new streamParser_1.StreamParser(new resultSetParser_1.ResultSetParser());
    let args = [
        `${dbPath}`, `${query}`,
        `-header`,
        `-nullvalue`, `NULL`,
        `-echo`,
        `-cmd`, `.mode tcl`
    ];
    let proc = child_process.spawn(sqlite3, args, { stdio: ['ignore', "pipe", "pipe"] });
    proc.stdout.pipe(streamParser).once('done', (data) => {
        resultSet = data;
    });
    proc.stderr.once('data', (data) => {
        error = new Error(data.toString().trim());
    });
    proc.once('error', (data) => {
        error = data;
    });
    proc.once('close', () => {
        callback(resultSet, error);
    });
}
exports.execute = execute;
//# sourceMappingURL=sqlite3.js.map