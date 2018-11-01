/******************************************************************
MIT License http://www.opensource.org/licenses/mit-license.php
Author Mora <qiuzhongleiabc^126.com> (https://github.com/qiu8310)
*******************************************************************/
import { TextDocument, Position } from 'vscode';
import { Tag } from './getTagAtPosition';
export declare function getTagAtPosition(doc: TextDocument, pos: Position): null | Tag;
