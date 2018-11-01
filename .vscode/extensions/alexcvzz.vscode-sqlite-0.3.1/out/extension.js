'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const vscodewrapper_1 = require("./vscodewrapper");
const logger_1 = require("./logging/logger");
const configuration_1 = require("./configuration");
const constants_1 = require("./constants/constants");
const sqlworkspace_1 = require("./sqlworkspace");
const sqlite_1 = require("./sqlite");
const explorer_1 = require("./explorer");
const resultview_1 = require("./resultview");
const languageserver_1 = require("./languageserver");
var Commands;
(function (Commands) {
    Commands.runDocumentQuery = "sqlite.runDocumentQuery";
    Commands.useDatabase = 'sqlite.useDatabase';
    Commands.explorerAdd = 'sqlite.explorer.add';
    Commands.explorerRemove = 'sqlite.explorer.remove';
    Commands.explorerRefresh = 'sqlite.explorer.refresh';
    Commands.newQuery = 'sqlite.newQuery';
    Commands.quickQuery = 'sqlite.quickQuery';
    Commands.runTableQuery = 'sqlite.runTableQuery';
    Commands.runSqliteMasterQuery = 'sqlite.runSqliteMasterQuery';
})(Commands = exports.Commands || (exports.Commands = {}));
let configuration;
let languageserver;
let sqlWorkspace;
let sqlite;
let explorer;
let resultView;
function activate(context) {
    logger_1.logger.info(`Activating extension ${constants_1.Constants.extensionName} v${constants_1.Constants.extensionVersion}...`);
    // load configuration and reload every time it's changed
    configuration = configuration_1.getConfiguration(context.extensionPath);
    context.subscriptions.push(vscode_1.workspace.onDidChangeConfiguration(() => {
        configuration = configuration_1.getConfiguration(context.extensionPath);
    }));
    // initialize modules
    languageserver = new languageserver_1.default();
    sqlWorkspace = new sqlworkspace_1.default();
    sqlite = new sqlite_1.default(configuration.sqlite3);
    explorer = new explorer_1.default();
    resultView = new resultview_1.default(context.extensionPath);
    languageserver.setSchemaHandler(doc => {
        let dbPath = sqlWorkspace.getDocumentDatabase(doc);
        if (dbPath)
            return sqlite.schema(dbPath);
        else
            return Promise.resolve();
    });
    context.subscriptions.push(languageserver, sqlWorkspace, sqlite, explorer, resultView);
    // register commands
    context.subscriptions.push(vscode_1.commands.registerCommand(Commands.runDocumentQuery, () => {
        return runDocumentQuery();
    }));
    context.subscriptions.push(vscode_1.commands.registerCommand(Commands.explorerAdd, (dbUri) => {
        let dbPath = dbUri ? dbUri.fsPath : dbUri;
        return explorerAdd(dbPath);
    }));
    context.subscriptions.push(vscode_1.commands.registerCommand(Commands.explorerRemove, (db) => {
        let dbPath = db ? db.path : db;
        return explorerRemove(dbPath);
    }));
    context.subscriptions.push(vscode_1.commands.registerCommand(Commands.explorerRefresh, () => {
        return explorerRefresh();
    }));
    context.subscriptions.push(vscode_1.commands.registerCommand(Commands.useDatabase, (dbPath) => {
        return useDatabase();
    }));
    context.subscriptions.push(vscode_1.commands.registerCommand(Commands.newQuery, (db) => {
        let dbPath = db ? db.path : db;
        return newQuery(dbPath);
    }));
    context.subscriptions.push(vscode_1.commands.registerCommand(Commands.quickQuery, () => {
        return quickQuery();
    }));
    context.subscriptions.push(vscode_1.commands.registerCommand(Commands.runTableQuery, (table) => {
        return runTableQuery(table.database, table.name);
    }));
    context.subscriptions.push(vscode_1.commands.registerCommand(Commands.runSqliteMasterQuery, (db) => {
        return runSqliteMasterQuery(db.path);
    }));
    return Promise.resolve(true);
}
exports.activate = activate;
function runDocumentQuery() {
    let sqlDocument = vscodewrapper_1.getEditorSqlDocument();
    if (sqlDocument) {
        let dbPath = sqlWorkspace.getDocumentDatabase(sqlDocument);
        if (dbPath) {
            let selection = vscodewrapper_1.getEditorSelection();
            let query = sqlDocument.getText(selection);
            runQuery(dbPath, query, true);
        }
        else {
            useDatabase().then(dbPath => {
                if (dbPath)
                    runDocumentQuery();
            });
        }
    }
}
function quickQuery() {
    vscodewrapper_1.pickWorkspaceDatabase(false).then(dbPath => {
        if (dbPath) {
            vscodewrapper_1.showQueryInputBox(dbPath).then(query => {
                if (query)
                    runQuery(dbPath, query, true);
            });
        }
    });
}
function useDatabase() {
    let sqlDocument = vscodewrapper_1.getEditorSqlDocument();
    return vscodewrapper_1.pickWorkspaceDatabase(false).then(dbPath => {
        if (sqlDocument && dbPath)
            sqlWorkspace.bindDatabaseToDocument(dbPath, sqlDocument);
        return Promise.resolve(dbPath);
    });
}
function explorerAdd(dbPath) {
    if (dbPath) {
        sqlite.schema(dbPath).then(schema => {
            explorer.add(schema);
        });
    }
    else {
        vscodewrapper_1.pickWorkspaceDatabase(false).then(dbPath => {
            if (dbPath)
                explorerAdd(dbPath);
        });
    }
}
function explorerRemove(dbPath) {
    if (dbPath) {
        explorer.remove(dbPath);
    }
    else {
        let dbList = explorer.list().map(db => db.path);
        vscodewrapper_1.pickListDatabase(true, dbList).then(dbPath => {
            if (dbPath)
                explorerRemove(dbPath);
        });
    }
}
function explorerRefresh() {
    let dbList = explorer.list();
    dbList.forEach(db => {
        let dbPath = db.path;
        sqlite.schema(dbPath).then(schema => {
            explorer.add(schema);
        });
    });
}
function newQuery(dbPath) {
    return vscodewrapper_1.createSqlDocument(true).then(sqlDocument => {
        if (dbPath)
            sqlWorkspace.bindDatabaseToDocument(dbPath, sqlDocument);
        return Promise.resolve(sqlDocument);
    });
}
function runTableQuery(dbPath, tableName) {
    let query = `SELECT * FROM \`${tableName}\`;`;
    runQuery(dbPath, query, true);
}
function runSqliteMasterQuery(dbPath) {
    let query = `SELECT * FROM sqlite_master;`;
    runQuery(dbPath, query, true);
}
function runQuery(dbPath, query, display) {
    let resultSet = sqlite.query(dbPath, query).then(queryResult => {
        if (queryResult.error) {
            logger_1.logger.error(queryResult.error);
            vscode_1.window.showErrorMessage(queryResult.error.message);
        }
        if (queryResult.resultSet) {
            return queryResult.resultSet;
        }
    });
    if (display)
        resultView.display(resultSet, configuration.recordsPerPage);
}
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map