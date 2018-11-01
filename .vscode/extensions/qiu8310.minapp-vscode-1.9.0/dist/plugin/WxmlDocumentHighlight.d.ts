import { DocumentHighlightProvider, TextDocument, Position, CancellationToken, DocumentHighlight } from 'vscode';
import { Config } from './lib/config';
export default class WxmlDocumentHighlight implements DocumentHighlightProvider {
    config: Config;
    constructor(config: Config);
    provideDocumentHighlights(doc: TextDocument, pos: Position, token: CancellationToken): DocumentHighlight[];
    /**
     * 因为只需要 tag，所以这里把所有的注释属性替换成特殊字符
     */
    private normalize;
    private findMatchedEndTag;
    private findMatchedStartTag;
}
