/******************************************************************
MIT License http://www.opensource.org/licenses/mit-license.php
Author Mora <qiuzhongleiabc@126.com> (https://github.com/qiu8310)
*******************************************************************/
import { HoverProvider, TextDocument, Position, CancellationToken, Hover } from 'vscode';
import { Config } from './lib/config';
export default class implements HoverProvider {
    config: Config;
    constructor(config: Config);
    provideHover(document: TextDocument, position: Position, token: CancellationToken): Promise<Hover | null>;
}
