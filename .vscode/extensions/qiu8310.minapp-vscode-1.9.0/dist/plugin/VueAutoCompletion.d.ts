import { CompletionItemProvider, TextDocument, Position, CancellationToken, CompletionContext, CompletionItem } from 'vscode';
import PugAutoCompletion from './PugAutoCompletion';
import WxmlAutoCompletion from './WxmlAutoCompletion';
export default class implements CompletionItemProvider {
    pug: PugAutoCompletion;
    wxml: WxmlAutoCompletion;
    constructor(pug: PugAutoCompletion, wxml: WxmlAutoCompletion);
    provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken, context: CompletionContext): CompletionItem[] | (Promise<CompletionItem[]>);
}
