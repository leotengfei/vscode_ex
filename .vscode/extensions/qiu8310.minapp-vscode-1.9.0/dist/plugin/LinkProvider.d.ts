/******************************************************************
 MIT License http://www.opensource.org/licenses/mit-license.php
 Author Mora <qiuzhongleiabc@126.com> (https://github.com/qiu8310)
*******************************************************************/
import { DocumentLinkProvider, DocumentLink, CancellationToken, TextDocument } from 'vscode';
import { Config } from './lib/config';
export default class implements DocumentLinkProvider {
    config: Config;
    constructor(config: Config);
    provideDocumentLinks(doc: TextDocument, token: CancellationToken): Promise<DocumentLink[]>;
    private getLinks;
}
