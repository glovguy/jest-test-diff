export declare type lineNumPair = Array<number>;
export declare type lineNumPairsArray = Array<lineNumPair>;
export declare const specFilesChanged: (diffText: string, ignoreRegex?: any) => string[];
export declare const linesFromGitDiff: (diffText: string, fileName: string) => number[][];
