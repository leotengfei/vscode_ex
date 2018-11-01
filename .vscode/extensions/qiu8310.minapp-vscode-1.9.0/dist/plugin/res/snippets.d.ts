export interface Snippet {
    body: string | string[];
    description?: string;
    /** 程序中生成的，不需要配置 */
    markdown?: string;
}
export interface Snippets {
    [key: string]: Snippet;
}
export declare const PugSnippets: Snippets;
export declare const WxmlSnippets: Snippets;
