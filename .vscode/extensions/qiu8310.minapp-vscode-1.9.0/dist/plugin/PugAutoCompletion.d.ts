/******************************************************************
MIT License http://www.opensource.org/licenses/mit-license.php
Author Mora <qiuzhongleiabc@126.com> (https://github.com/qiu8310)
*******************************************************************/
import { Position, CancellationToken, CompletionItemProvider, TextDocument, CompletionItem, CompletionContext } from 'vscode';
import AutoCompletion from './AutoCompletion';
import { getTagAtPosition } from './lib/getTagAtPositionForPug';
import { LanguageConfig } from './lib/language';
export declare const LINE_TAG_REGEXP: RegExp;
export default class extends AutoCompletion implements CompletionItemProvider {
    id: "wxml-pug";
    getTagAtPosition: typeof getTagAtPosition;
    provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken, context: CompletionContext): CompletionItem[] | Promise<CompletionItem[]>;
    createComponentAttributeSnippetItems(lc: LanguageConfig, doc: TextDocument, pos: Position): Promise<CompletionItem[]>;
    createSpecialAttributeSnippetItems(lc: LanguageConfig, doc: TextDocument, pos: Position): Promise<CompletionItem[]>;
    private wrapAttrItems;
    private shouldNearLeftBracket;
    /**
     * 获取上一行带内容的行
     */
    private getLastContentLine;
}
