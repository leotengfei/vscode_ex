"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vscode_1 = require("vscode");
var entity = require("./entity");
var faker = require('faker');
var address = new entity.Address();
var commerce = new entity.Commerce();
var company = new entity.Company();
var database = new entity.Database();
var date = new entity.Date();
var finance = new entity.Finance();
var hacker = new entity.Hacker();
var image = new entity.Image();
var internet = new entity.Internet();
var lorem = new entity.Lorem();
var name = new entity.Name();
var phone = new entity.Phone();
var random = new entity.Random();
var system = new entity.System();
function activate(context) {
    faker.locale = vscode_1.workspace.getConfiguration('faker').get('locale');
    var fakerEntities = [
        address,
        commerce,
        company,
        database,
        date,
        finance,
        hacker,
        image,
        internet,
        lorem,
        name,
        phone,
        random,
        system,
    ];
    var _loop_1 = function (entity_1) {
        var entityName = entity_1.getName();
        context.subscriptions.push(vscode_1.commands.registerCommand("faker." + entityName, function () {
            return executeFaker(entity_1);
        }));
    };
    for (var _i = 0, fakerEntities_1 = fakerEntities; _i < fakerEntities_1.length; _i++) {
        var entity_1 = fakerEntities_1[_i];
        _loop_1(entity_1);
    }
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
/**
 * Get vscode active editor
 */
function getEditor() {
    var editor = vscode_1.window.activeTextEditor;
    if (!editor) {
        return;
    }
    return editor;
}
/**
 * Insert text in editor
 */
function insertText(editor, generateFakeFn) {
    var selections = editor.selections;
    editor.edit(function (editBuilder) {
        selections.forEach(function (selection) {
            var start = selection.start, end = selection.end;
            var range = new vscode_1.Range(start, end);
            var value = generateFakeFn().toString();
            editBuilder.replace(range, value);
        });
    });
}
function executeFaker(fakerEntity) {
    vscode_1.window.showQuickPick(fakerEntity.getMethods()).then(function (selectedMethod) {
        var generateFakeFn = faker[fakerEntity.getName()][selectedMethod];
        insertText(getEditor(), generateFakeFn);
    });
}
//# sourceMappingURL=extension.js.map