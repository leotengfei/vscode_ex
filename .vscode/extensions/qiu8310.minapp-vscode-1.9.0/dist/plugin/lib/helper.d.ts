/******************************************************************
 MIT License http://www.opensource.org/licenses/mit-license.php
 Author Mora <qiuzhongleiabc@126.com> (https://github.com/qiu8310)
*******************************************************************/
import { TextDocument, Position } from 'vscode';
import { Config } from './config';
import { LanguageConfig } from './language';
export declare function getLanguage(doc: TextDocument, pos: Position): undefined | LanguageConfig;
export declare function getLangForVue(doc: TextDocument, pos: Position): string | undefined;
export declare function getCustomOptions(config: Config, document: TextDocument): {
    filename: string;
    resolves: string[];
} | undefined;
export declare function getTextAtPosition(doc: TextDocument, pos: Position, charRegExp: RegExp): string | undefined;
export declare function getLastChar(doc: TextDocument, pos: Position): string;
