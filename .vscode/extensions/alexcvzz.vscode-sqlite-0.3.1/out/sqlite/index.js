"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = require("./sqlite3");
const schema_1 = require("./schema");
const vscode_1 = require("vscode");
const sqlparser_1 = require("./sqlparser");
const logger_1 = require("../logging/logger");
const sqlite3ErrorMessage = "Unable to execute sqlite3 queries, change the sqlite.sqlite3 setting to fix this issue.";
class SQLite {
    constructor(sqlite3) {
        this.sqlite3 = sqlite3;
        this.activated = false;
        if (sqlite3)
            this.activated = true;
        else
            vscode_1.window.showErrorMessage(sqlite3ErrorMessage);
    }
    query(dbPath, query) {
        if (!this.activated) {
            vscode_1.window.showErrorMessage(sqlite3ErrorMessage);
            return Promise.reject(sqlite3ErrorMessage);
        }
        query = sqlparser_1.SQLParser.parse(query).join('');
        logger_1.logger.info(`[QUERY] ${query}`);
        return new Promise(resolve => {
            sqlite3_1.execute(this.sqlite3, dbPath, query, (resultSet, error) => {
                resolve({ resultSet: resultSet, error: error });
            });
        });
    }
    schema(dbPath) {
        if (!this.activated) {
            vscode_1.window.showErrorMessage(sqlite3ErrorMessage);
            return Promise.reject(sqlite3ErrorMessage);
        }
        return schema_1.Schema.build(dbPath, this.sqlite3);
    }
    dispose() {
        // Nothing for now
    }
}
exports.default = SQLite;
//# sourceMappingURL=index.js.map