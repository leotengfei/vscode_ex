"use strict";
/******************************************************************
MIT License http://www.opensource.org/licenses/mit-license.php
Author Mora <qiuzhongleiabc@126.com> (https://github.com/qiu8310)
*******************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
const AutoCompletion_1 = require("./AutoCompletion");
const getTagAtPositionForWxml_1 = require("./lib/getTagAtPositionForWxml");
const helper_1 = require("./lib/helper");
class default_1 extends AutoCompletion_1.default {
    constructor() {
        super(...arguments);
        this.id = 'wxml';
        this.getTagAtPosition = getTagAtPositionForWxml_1.getTagAtPosition;
    }
    provideCompletionItems(document, position, token, context) {
        let language = helper_1.getLanguage(document, position);
        if (!language)
            return [];
        let char = context.triggerCharacter || helper_1.getLastChar(document, position);
        switch (char) {
            case '<': return this.createComponentSnippetItems(language, document, position);
            case '"':
            case '\'':
            case ' ': return this.createComponentAttributeSnippetItems(language, document, position);
            case ':': // 绑定变量 （也可以是原生小程序的控制语句或事件，如 wx:for, bind:tap）
            case '@': // 绑定事件
            case '-': // v-if
            case '.': // 变量或事件的修饰符
                return this.createSpecialAttributeSnippetItems(language, document, position);
            default:
                return [];
        }
    }
}
exports.default = default_1;
//# sourceMappingURL=WxmlAutoCompletion.js.map