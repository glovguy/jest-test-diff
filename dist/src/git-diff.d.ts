export type lineNumPair = Array<number>;
export type lineNumPairsArray = Array<lineNumPair>;
export declare const specFilesChanged: (diffText?: string, ingoreSymbols?: string[]) => Array<string> | undefined;
export declare const linesFromGitDiff: (diffText: string, fileName: string) => lineNumPairsArray;
