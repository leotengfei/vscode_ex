"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = require("./sqlite3");
var Schema;
(function (Schema) {
    function build(dbPath, sqlite3) {
        return new Promise(resolve => {
            let schema = {
                path: dbPath,
                tables: []
            };
            const tablesQuery = `SELECT name FROM sqlite_master WHERE type="table" ORDER BY name ASC;`;
            sqlite3_1.execute(sqlite3, dbPath, tablesQuery, (resultSet) => {
                if (!resultSet || resultSet.length === 0)
                    return;
                schema.tables = resultSet[0].rows.map(row => {
                    return { database: dbPath, name: row[0], columns: [] };
                });
                let columnsQuery = schema.tables.map(table => `PRAGMA table_info('${table.name}');`).join('');
                sqlite3_1.execute(sqlite3, dbPath, columnsQuery, (resultSet) => {
                    if (!resultSet || resultSet.length === 0)
                        return;
                    resultSet.forEach(result => {
                        let tableName = result.stmt.replace(/.+\(\'?(\w+)\'?\).+/, '$1');
                        for (let i = 0; i < schema.tables.length; i++) {
                            if (schema.tables[i].name === tableName) {
                                schema.tables[i].columns = result.rows.map(row => {
                                    return {
                                        database: dbPath,
                                        table: tableName,
                                        name: row[result.header.indexOf('name')],
                                        type: row[result.header.indexOf('type')].toUpperCase(),
                                        notnull: row[result.header.indexOf('notnull')] === '1' ? true : false,
                                        pk: Number(row[result.header.indexOf('pk')]) || 0,
                                        defVal: row[result.header.indexOf('dflt_value')]
                                    };
                                });
                                break;
                            }
                        }
                    });
                    resolve(schema);
                });
            });
        });
    }
    Schema.build = build;
})(Schema = exports.Schema || (exports.Schema = {}));
//# sourceMappingURL=schema.js.map