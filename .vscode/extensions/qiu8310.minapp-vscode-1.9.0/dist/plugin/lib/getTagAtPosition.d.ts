/******************************************************************
MIT License http://www.opensource.org/licenses/mit-license.php
Author Mora <qiuzhongleiabc^126.com> (https://github.com/qiu8310)
*******************************************************************/
import { TextDocument, Position } from 'vscode';
export interface Tag {
    /** Tag 的名称 */
    name: string;
    /** 光标位置是否是在 tag name 上 */
    isOnTagName: boolean;
    /** 光标位置是否是在 tag attr name 上 */
    isOnAttrName: boolean;
    /** 只有 isOnAttrName 为 true 时才有效 */
    attrName: string;
    /** 光标位置是否是在 tag attr value 上 */
    isOnAttrValue: boolean;
    /** 光标所在位置上的单词是什么 */
    posWord: string;
    attrs: {
        [key: string]: string | boolean;
    };
}
export declare type getTagAtPosition = (doc: TextDocument, pos: Position) => null | Tag;
export declare function getAttrName(str: string): string;
export declare function getAttrs(text: string): any;
export declare function getAttrs2(text: string, attrs: {
    [key: string]: any;
}): string;
