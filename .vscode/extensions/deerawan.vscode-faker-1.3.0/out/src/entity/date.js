"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Date = /** @class */ (function () {
    function Date() {
    }
    Date.prototype.getName = function () {
        return 'date';
    };
    Date.prototype.getMethods = function () {
        return ['past', 'future', 'between', 'recent', 'month', 'weekday'];
    };
    return Date;
}());
exports.Date = Date;
//# sourceMappingURL=date.js.map