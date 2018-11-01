"use strict";
/******************************************************************
MIT License http://www.opensource.org/licenses/mit-license.php
Author Mora <qiuzhongleiabc@126.com> (https://github.com/qiu8310)
*******************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const LinkProvider_1 = require("./plugin/LinkProvider");
const HoverProvider_1 = require("./plugin/HoverProvider");
const WxmlFormatter_1 = require("./plugin/WxmlFormatter");
const WxmlAutoCompletion_1 = require("./plugin/WxmlAutoCompletion");
const PugAutoCompletion_1 = require("./plugin/PugAutoCompletion");
const VueAutoCompletion_1 = require("./plugin/VueAutoCompletion");
const WxmlDocumentHighlight_1 = require("./plugin/WxmlDocumentHighlight");
const ActiveTextEditorListener_1 = require("./plugin/ActiveTextEditorListener");
const config_1 = require("./plugin/lib/config");
function activate(context) {
    // console.log('minapp-vscode is active!')
    config_1.configActivate();
    if (!config_1.config.disableAutoConfig) {
        autoConfig();
    }
    let formatter = new WxmlFormatter_1.default(config_1.config);
    let autoCompletionWxml = new WxmlAutoCompletion_1.default(config_1.config);
    let hoverProvider = new HoverProvider_1.default(config_1.config);
    let linkProvider = new LinkProvider_1.default(config_1.config);
    let autoCompletionPug = new PugAutoCompletion_1.default(config_1.config);
    let autoCompletionVue = new VueAutoCompletion_1.default(autoCompletionPug, autoCompletionWxml);
    let documentHighlight = new WxmlDocumentHighlight_1.default(config_1.config);
    context.subscriptions.push(
    // 给模板中的 脚本 添加特殊颜色
    new ActiveTextEditorListener_1.default(config_1.config), 
    // hover 效果
    vscode_1.languages.registerHoverProvider(['wxml', 'wxml-pug', 'vue'], hoverProvider), 
    // 添加 link
    vscode_1.languages.registerDocumentLinkProvider(['wxml', 'wxml-pug'], linkProvider), 
    // 高亮匹配的标签
    vscode_1.languages.registerDocumentHighlightProvider('wxml', documentHighlight), 
    // 格式化
    vscode_1.languages.registerDocumentFormattingEditProvider('wxml', formatter), vscode_1.languages.registerDocumentRangeFormattingEditProvider('wxml', formatter), 
    // 自动补全
    vscode_1.languages.registerCompletionItemProvider('wxml', autoCompletionWxml, '<', ' ', ':', '@', '.', '-', '"', '\''), vscode_1.languages.registerCompletionItemProvider('wxml-pug', autoCompletionPug, '\n', ' ', '(', ':', '@', '.', '-', '"', '\''), 
    // trigger 需要是上两者的和
    vscode_1.languages.registerCompletionItemProvider('vue', autoCompletionVue, '<', ' ', ':', '@', '.', '-', '(', '"', '\''));
}
exports.activate = activate;
function deactivate() {
    config_1.configDeactivate();
}
exports.deactivate = deactivate;
function autoConfig() {
    let c = vscode_1.workspace.getConfiguration();
    const updates = [
        {
            key: 'files.associations',
            map: {
                '*.cjson': 'jsonc',
                '*.wxss': 'css',
                '*.wxs': 'javascript'
            }
        },
        {
            key: 'emmet.includeLanguages',
            map: {
                wxml: 'html'
            }
        }
    ];
    updates.forEach(({ key, map }) => {
        let oldMap = c.get(key, {});
        let appendMap = {};
        Object.keys(map).forEach(k => {
            if (!(oldMap.hasOwnProperty(k)))
                appendMap[k] = map[k];
        });
        if (Object.keys(appendMap).length) {
            c.update(key, Object.assign({}, oldMap, appendMap), true);
        }
    });
    c.update('minapp-vscode.disableAutoConfig', true, true);
}
//# sourceMappingURL=extension.js.map