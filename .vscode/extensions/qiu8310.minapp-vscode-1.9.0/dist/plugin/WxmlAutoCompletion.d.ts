/******************************************************************
MIT License http://www.opensource.org/licenses/mit-license.php
Author Mora <qiuzhongleiabc@126.com> (https://github.com/qiu8310)
*******************************************************************/
import { Position, CancellationToken, CompletionItemProvider, TextDocument, CompletionItem, CompletionContext } from 'vscode';
import AutoCompletion from './AutoCompletion';
import { getTagAtPosition } from './lib/getTagAtPositionForWxml';
export default class extends AutoCompletion implements CompletionItemProvider {
    id: "wxml";
    getTagAtPosition: typeof getTagAtPosition;
    provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken, context: CompletionContext): Promise<CompletionItem[]>;
}
