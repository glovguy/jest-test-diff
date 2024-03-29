import { lineNumPair, lineNumPairsArray } from './git-diff';
export interface contextInterface {
    tree: Array<describeNodeTree>;
    doc: string;
    flatDoc: string;
    sourceFile: any;
    linesChanged: lineNumPairsArray | null;
}
export interface describeNodeTree {
    text: string;
    pos: number;
    end: number;
    lineStart: number;
    lineEnd: number;
    children: Array<describeNodeTree>;
    isAssertion: boolean;
    isDirectlyModified: boolean;
}
export declare let lineStartFromNode: (file: string, descNode: describeNodeTree) => number;
export declare let lineEndFromNode: (file: string, descNode: describeNodeTree) => number;
export declare const linePairInsideLinesChanged: (subjectLinePair: lineNumPair, linesChanged: lineNumPairsArray) => boolean;
export declare function descriptionFromSpecFile(specFile: string, linesChanged?: any): contextInterface;
