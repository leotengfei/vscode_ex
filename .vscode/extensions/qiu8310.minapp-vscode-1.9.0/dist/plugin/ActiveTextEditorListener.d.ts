import { Config } from './lib/config';
import { TextEditor, Disposable } from 'vscode';
export default class ActiveTextEditorListener {
    config: Config;
    private decorationCache;
    disposables: Disposable[];
    constructor(config: Config);
    onChange(editor: TextEditor | undefined, resetCache?: boolean): void;
    decorateWxml(editor: TextEditor): void;
    updateDecorationCache(): void;
    dispose(): void;
}
