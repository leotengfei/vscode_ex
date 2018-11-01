"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
function mkdirs(dirname, callback) {
    fs.exists(dirname, function (exists) {
        if (exists) {
            callback();
        }
        else {
            mkdirs(path.dirname(dirname), function () {
                fs.mkdir(dirname, callback);
            });
        }
    });
}
exports.mkdirs = mkdirs;
function mkdirsSync(dirname) {
    if (fs.existsSync(dirname)) {
        return true;
    }
    else {
        if (mkdirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
}
exports.mkdirsSync = mkdirsSync;
function isSubPath(from, to) {
    let rel = path.relative(to, from);
    return !(path.isAbsolute(rel) || rel.substr(0, 2) == "..");
}
exports.isSubPath = isSubPath;
function parseError(error) {
    let nb = new Buffer("");
    if (typeof (error) === "string") {
        return [{ error: error, out: nb }];
    }
    else if (error instanceof TypeError || error instanceof Error) {
        let err = error;
        return [{ error: err.stack, out: nb }];
    }
    else if (error instanceof Array) {
        return error;
    }
    else {
        return [error];
    }
}
exports.parseError = parseError;
function showError(panel, errors) {
    panel.clear();
    for (let e of errors) {
        panel.appendLine(e.error);
    }
    panel.show();
}
exports.showError = showError;
//# sourceMappingURL=tools.js.map