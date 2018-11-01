"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Database = /** @class */ (function () {
    function Database() {
    }
    Database.prototype.getName = function () {
        return 'database';
    };
    Database.prototype.getMethods = function () {
        return ['column', 'type', 'collation', 'engine'];
    };
    return Database;
}());
exports.Database = Database;
//# sourceMappingURL=database.js.map