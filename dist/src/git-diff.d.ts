export type lineNumPair = Array<number>;
export type lineNumPairsArray = Array<lineNumPair>;
export declare const specFilesChanged: (diffText?: string, ignoreRegex?: string | RegExp | null) => Array<string> | undefined;
export declare const linesFromGitDiff: (diffText: string, fileName: string) => lineNumPairsArray;
