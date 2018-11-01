"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var System = /** @class */ (function () {
    function System() {
    }
    System.prototype.getName = function () {
        return 'system';
    };
    System.prototype.getMethods = function () {
        return [
            'fileName',
            'commonFileName',
            'mimeType',
            'commonFileType',
            'commonFileExt',
            'fileType',
            'fileExt',
            'directoryPath',
            'filePath',
            'semver',
        ];
    };
    return System;
}());
exports.System = System;
//# sourceMappingURL=system.js.map