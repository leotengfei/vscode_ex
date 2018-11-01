"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Random = /** @class */ (function () {
    function Random() {
    }
    Random.prototype.getName = function () {
        return 'random';
    };
    Random.prototype.getMethods = function () {
        return [
            'number',
            'arrayElement',
            'objectElement',
            'uuid',
            'boolean',
            'word',
            'words',
            'image',
            'locale',
            'alphaNumeric',
        ];
    };
    return Random;
}());
exports.Random = Random;
//# sourceMappingURL=random.js.map