"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const commandExists = require("command-exists");
const logger_1 = require("../logging/logger");
const os_1 = require("os");
const fs_1 = require("fs");
const path_1 = require("path");
/**
 * Validate the sqlite3 command/path passed as argument, if not valid fallback to binaries.
 */
function validateOrFallback(sqlite3, extensionPath) {
    if (!commandExists.sync(sqlite3) || sqlite3.trim() === '') {
        logger_1.logger.warn(`'${sqlite3}' is not recognized as a command.`);
        // fallback to sqlite3 binaries in {extension}/bin
        return sqliteBinariesFallback(extensionPath);
    }
    if (!validateCmdSqlite(sqlite3)) {
        logger_1.logger.warn(`'${sqlite3}' is not a valid command. Falling back to binaries.`);
        // fallback to sqlite3 binaries in {extension}/bin
        return sqliteBinariesFallback(extensionPath);
    }
    return sqlite3;
}
exports.validateOrFallback = validateOrFallback;
function sqliteBinariesFallback(extensionPath) {
    let binPath = getSqliteBinariesPath(extensionPath);
    if (binPath === '') {
        logger_1.logger.error(`Fallback binaries not found.`);
        return undefined;
    }
    else {
        logger_1.logger.info(`Fallback binaries found: '${binPath}'`);
    }
    if (!validateCmdSqlite(binPath)) {
        logger_1.logger.error(`Invalid binaries '${binPath}'.`);
        return undefined;
    }
    else {
        return binPath;
    }
}
function validateCmdSqlite(cmdSqlite) {
    try {
        let out = child_process_1.execSync(`${cmdSqlite} -version`).toString();
        // out must be: {version at least 3} {date} {time} {hex string (the length varies)}
        // this is to check that the command is actually for sqlite3
        if (out.match(/3\.[0-9]{1,2}\.[0-9]{1,2} [0-9]{4}\-[0-9]{2}\-[0-9]{2} [0-9]{2}\:[0-9]{2}\:[0-9]{2} [a-f0-9]{0,90}/)) {
            return true;
        }
    }
    catch (e) {
        return logger_1.logger.error(e.message);
    }
    return false;
}
/**
 * Get the path of the sqlite3 binaries based on the platform.
 * If there are no binaries for the platform returns an empty string.
 * @param extensionPath The path of this extension
 */
function getSqliteBinariesPath(extensionPath) {
    let plat = os_1.platform();
    let sqliteBin;
    switch (plat) {
        case 'win32':
            sqliteBin = 'sqlite-win32-x86.exe';
            break;
        case 'linux':
            sqliteBin = 'sqlite-linux-x86';
            break;
        case 'darwin':
            sqliteBin = 'sqlite-osx-x86';
            break;
        default:
            sqliteBin = '';
            break;
    }
    if (sqliteBin) {
        let path = path_1.join(extensionPath, 'bin', sqliteBin);
        return fs_1.existsSync(path) ? path : '';
    }
    else {
        return '';
    }
}
//# sourceMappingURL=cmdSqlite3Utils.js.map