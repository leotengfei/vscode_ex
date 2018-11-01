"use strict";
/******************************************************************
MIT License http://www.opensource.org/licenses/mit-license.php
Author Mora <qiuzhongleiabc^126.com> (https://github.com/qiu8310)
*******************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
const getTagAtPosition_1 = require("./getTagAtPosition");
const TAG_REGEXP = /<([\w-:.]+)(\s+[^<>]*)?/g;
function getTagAtPosition(doc, pos) {
    let tag = null;
    let line = doc.lineAt(pos.line).text;
    let replacer = (char) => (raw) => char.repeat(raw.length);
    // 因为双大括号里可能会有任何字符，估优先处理
    // 用特殊字符替换 "{{" 与 "}}"" 之间的语句，并保证字符数一致
    line = line.replace(/\{\{[^\}]*?\}\}/g, replacer('^'));
    let attrFlagLine = line.replace(/("[^"]*"|'[^']*')/g, replacer('%')); // 将引号中的内容也替换了
    line.replace(TAG_REGEXP, (raw, name, attrstr, index) => {
        if (!tag && index <= pos.character && index + raw.length >= pos.character) {
            let range = doc.getWordRangeAtPosition(pos, /\b[\w-:.]+\b/);
            let posWord = '';
            let attrName = '';
            if (range)
                posWord = doc.getText(range);
            let isOnTagName = pos.character <= index + name.length + 1;
            let isOnAttrValue = attrFlagLine[pos.character] === '%';
            if (isOnAttrValue) {
                attrName = getTagAtPosition_1.getAttrName(attrFlagLine.substring(0, pos.character));
            }
            let isOnAttrName = !isOnTagName && !isOnAttrValue && !!posWord;
            tag = {
                name,
                attrs: getTagAtPosition_1.getAttrs((attrstr || '').trim()),
                posWord,
                isOnTagName,
                isOnAttrName,
                isOnAttrValue,
                attrName
            };
        }
        return raw;
    });
    return tag;
}
exports.getTagAtPosition = getTagAtPosition;
//# sourceMappingURL=getTagAtPositionForWxml.js.map