"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lockfile = require("lockfile");
const util_1 = require("./util");
exports.default = {
    Check,
    Lock,
    Unlock
};
function Check(filepath, options = {}) {
    return util_1.Util.promisify(lockfile.check)(filepath, options);
}
exports.Check = Check;
function Lock(filepath, options = {}) {
    return util_1.Util.promisify(lockfile.lock)(filepath, options);
}
exports.Lock = Lock;
function Unlock(filepath) {
    return util_1.Util.promisify(lockfile.unlock)(filepath);
}
exports.Unlock = Unlock;
//# sourceMappingURL=lockfile.js.map