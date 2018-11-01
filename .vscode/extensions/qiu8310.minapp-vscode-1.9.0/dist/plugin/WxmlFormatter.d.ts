import { FormattingOptions, DocumentFormattingEditProvider, DocumentRangeFormattingEditProvider, TextDocument, TextEdit, Range } from 'vscode';
import { Config } from './lib/config';
export default class implements DocumentFormattingEditProvider, DocumentRangeFormattingEditProvider {
    config: Config;
    constructor(config: Config);
    getEOL(doc: TextDocument): string;
    format(doc: TextDocument, range: Range, options: FormattingOptions, prefix?: string): TextEdit[];
    provideDocumentFormattingEdits(doc: TextDocument, options: FormattingOptions): TextEdit[];
    provideDocumentRangeFormattingEdits(doc: TextDocument, range: Range, options: FormattingOptions): TextEdit[];
}
