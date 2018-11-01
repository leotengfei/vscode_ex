/******************************************************************
MIT License http://www.opensource.org/licenses/mit-license.php
Author Mora <qiuzhongleiabc@126.com> (https://github.com/qiu8310)
*******************************************************************/
import { CompletionItem, CompletionItemKind, TextDocument, Position } from 'vscode';
import { TagItem, TagAttrItem } from '@minapp/common';
import { Config } from './lib/config';
import { LanguageConfig } from './lib/language';
import { getTagAtPosition } from './lib/getTagAtPosition';
import * as s from './res/snippets';
export default abstract class AutoCompletion {
    config: Config;
    abstract id: 'wxml' | 'wxml-pug';
    abstract getTagAtPosition: getTagAtPosition;
    readonly isPug: boolean;
    readonly attrQuote: string;
    constructor(config: Config);
    getCustomOptions(doc: TextDocument): {
        filename: string;
        resolves: string[];
    } | undefined;
    renderTag(tag: TagItem, sortText: string): CompletionItem;
    renderTagAttr(tagAttr: TagAttrItem, sortText: string, kind?: CompletionItemKind): CompletionItem;
    renderSnippet(doc: TextDocument, name: string, snippet: s.Snippet, sortText: string): CompletionItem;
    private setDefault;
    private isDefaultValueValid;
    /**
     * 创建组件名称的自动补全
     */
    createComponentSnippetItems(lc: LanguageConfig, doc: TextDocument, pos: Position, prefix?: string): Promise<CompletionItem[]>;
    /**
     * 创建组件属性的自动补全
     */
    createComponentAttributeSnippetItems(lc: LanguageConfig, doc: TextDocument, pos: Position): Promise<CompletionItem[]>;
    /**
     * wxml:
     *    wx:
     *    bind:
     *    catch:
     *
     * vue:
     *    :
     *    @
     *    :xxx.sync
     *    @xxx.default, @xxx.user, @xxx.stop
     */
    createSpecialAttributeSnippetItems(lc: LanguageConfig, doc: TextDocument, pos: Position): Promise<CompletionItem[]>;
}
