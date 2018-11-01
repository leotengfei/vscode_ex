"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/******************************************************************
 MIT License http://www.opensource.org/licenses/mit-license.php
 Author Mora <qiuzhongleiabc@126.com> (https://github.com/qiu8310)
*******************************************************************/
const vscode_1 = require("vscode");
const language_1 = require("./language");
// <template lang="wxml/pug/wxml-pug" minapp="native/wepy/mpvue"> ；默认 minapp="mpvue"
const vueTemplateMinappStartTag = /^\s*<template\b[^>]*(?:minapp)=['"](native|wepy|mpvue)['"][^>]*>/;
const vueTemplateLangStartTag = /^\s*<template\b[^>]*(?:x?lang)=['"]([\w-]+)['"][^>]*>/;
const vueTemplateEndTag = /<\/template>\s*$/;
function getLanguage(doc, pos) {
    let minapp;
    if (doc.languageId === 'wxml' || doc.languageId === 'wxml-pug') {
        minapp = 'native';
    }
    else {
        doc.getText().split(/\r?\n/).some((text, i) => {
            if (!minapp && vueTemplateMinappStartTag.test(text))
                minapp = RegExp.$1.replace(/['"]/g, '');
            if (i === pos.line)
                return true;
            if (minapp && vueTemplateEndTag.test(text))
                minapp = undefined;
            return false;
        });
        if (!minapp)
            minapp = 'mpvue';
    }
    return minapp && language_1.Languages[minapp] ? language_1.Languages[minapp] : undefined;
}
exports.getLanguage = getLanguage;
function getLangForVue(doc, pos) {
    let lang;
    doc.getText().split(/\r?\n/).some((text, i) => {
        if (!lang && vueTemplateLangStartTag.test(text))
            lang = RegExp.$1.replace(/['"]/g, '');
        if (i === pos.line)
            return true;
        if (lang && vueTemplateEndTag.test(text))
            lang = undefined;
        return false;
    });
    return lang;
}
exports.getLangForVue = getLangForVue;
function getCustomOptions(config, document) {
    return config.disableCustomComponentAutocomponent || document.languageId !== 'wxml'
        ? undefined
        : { filename: document.fileName, resolves: config.getResolveRoots(document) };
}
exports.getCustomOptions = getCustomOptions;
function getTextAtPosition(doc, pos, charRegExp) {
    let line = doc.lineAt(pos.line).text;
    let mid = pos.character - 1;
    if (!(charRegExp.test(line[mid])))
        return;
    let str = line[mid];
    let i = mid;
    while (++i < line.length) {
        if (charRegExp.test(line[i]))
            str += line[i];
        else
            break;
    }
    i = mid;
    while (--i >= 0) {
        if (charRegExp.test(line[i]))
            str = line[i] + str;
        else
            break;
    }
    return str;
}
exports.getTextAtPosition = getTextAtPosition;
function getLastChar(doc, pos) {
    return doc.getText(new vscode_1.Range(new vscode_1.Position(pos.line, pos.character - 1), pos));
}
exports.getLastChar = getLastChar;
//# sourceMappingURL=helper.js.map