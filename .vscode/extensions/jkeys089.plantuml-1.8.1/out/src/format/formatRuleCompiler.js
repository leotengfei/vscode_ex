"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const multiRegExp2_1 = require("./multiRegExp2");
var FormatType;
(function (FormatType) {
    FormatType[FormatType["none"] = 0] = "none";
    FormatType[FormatType["word"] = 1] = "word";
    FormatType[FormatType["operater"] = 2] = "operater";
    FormatType[FormatType["punctRightSpace"] = 3] = "punctRightSpace";
    FormatType[FormatType["punctLeftSpace"] = 4] = "punctLeftSpace";
    FormatType[FormatType["connector"] = 5] = "connector";
    FormatType[FormatType["asIs"] = 6] = "asIs";
})(FormatType = exports.FormatType || (exports.FormatType = {}));
function compile(rules, regVars) {
    let compiled = [];
    for (let r of rules) {
        let c = {};
        c.comment = r.comment ? r.comment : "";
        if (r.blockBegin)
            c.blockBegin = compileRegExp(r.blockBegin);
        if (r.blockAgain)
            c.blockAgain = compileRegExp(r.blockAgain);
        if (r.blockEnd)
            c.blockEnd = compileRegExp(r.blockEnd);
        if (r.match)
            c.match = compileRegExp(r.match);
        if (r.captures)
            c.captures = compileCaptures(r.captures);
        if (r.blockBeginCaptures)
            c.blockBeginCaptures = compileCaptures(r.blockBeginCaptures);
        if (r.blockAgainCaptures)
            c.blockAgainCaptures = compileCaptures(r.blockAgainCaptures);
        if (r.blockEndCaptures)
            c.blockEndCaptures = compileCaptures(r.blockEndCaptures);
        compiled.push(c);
    }
    return compiled;
    function compileRegExp(reg) {
        let str = reg.source.replace(/\{\{(\w+)\}\}/g, "${regVars.$1}");
        str = str.replace(/\\/g, "\\\\");
        str = eval("`" + str + "`");
        let flags = "";
        flags += reg.ignoreCase ? "i" : "";
        flags += "g";
        let r = new multiRegExp2_1.MultiRegExp2(new RegExp(str, flags));
        return r;
    }
    function compileCaptures(captures) {
        let compiled = [];
        let properties = Object.getOwnPropertyNames(captures);
        for (let i = 0; i < properties.length; i++) {
            let c = {
                index: Number(properties[i]),
                type: captures[properties[i]]
            };
            compiled.push(c);
        }
        return compiled;
    }
}
exports.compile = compile;
//# sourceMappingURL=formatRuleCompiler.js.map