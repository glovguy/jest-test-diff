import * as ts from 'typescript';
import { lineNumPair, lineNumPairsArray } from './git-diff';

export interface contextInterface {
    tree: Array<describeNodeTree>,
    doc: string,
    flatDoc: string,
    sourceFile: any,
    linesChanged: lineNumPairsArray | null,
};
export interface describeNodeTree {
    text: string,
    pos: number,
    end: number,
    lineStart: number,
    lineEnd: number,
    children: Array<describeNodeTree>,
    isAssertion: boolean,
    isDirectlyModified: boolean,
}

export let lineStartFromNode = function(file: string, descNode: describeNodeTree): number {
    return (file.slice(0, descNode['pos']+1).split('\n') || []).length + 1;
}

export let lineEndFromNode = function(file: string, descNode: describeNodeTree): number {
    return (file.slice(0, descNode['end']).split('\n') || []).length;
}

export const linePairInsideLinesChanged = function(subjectLinePair: lineNumPair, linesChanged: lineNumPairsArray): boolean {
    return linesChanged.some((changedLinePair) => {
        return linePairInRange(subjectLinePair, changedLinePair) || linePairContainsRange(subjectLinePair, changedLinePair);
    });
}

const linePairInRange = function(subjectLinePair: lineNumPair, range: lineNumPair): boolean {
    const isSubjectStartInChangedRange = subjectLinePair[0] >= range[0] && subjectLinePair[0] <= range[1];
    const isSubjectEndInChangedRange = subjectLinePair[1] >= range[0] && subjectLinePair[1] <= range[1];
    return isSubjectStartInChangedRange || isSubjectEndInChangedRange;
}

const linePairContainsRange = function(subjectLinePair: lineNumPair, range: lineNumPair): boolean {
    return subjectLinePair[0] <= range[0] && subjectLinePair[1] >= range[1];
}

function docTreeDescribe(node: any, context: contextInterface, depth: number, testContext: string): Array<describeNodeTree> {
    const lineStart = lineStartFromNode(context['sourceFile'], node);
    const lineEnd = lineEndFromNode(context['sourceFile'], node);
    if (context['linesChanged'] !== null && !linePairInsideLinesChanged([lineStart, lineEnd], context['linesChanged'])) { return; }
    for (let i=0; i<depth; i++) { context['doc'] = context['doc'].concat(' '); }
    const text = node.arguments[0].text;
    context['doc'] = context['doc'].concat(text + '\n');
    const children = descriptionFromNode(node.arguments[1], context, depth+1, `${testContext}${text}\n`);
    if (children === undefined || children.length === 0) { return []; }
    return [{
        text: node.arguments[0].text,
        pos: node.pos,
        end: node.end,
        lineStart,
        lineEnd,
        children,
        isAssertion: false,
        isDirectlyModified: true
    }];
}

function docTreeAssertion(node: any, context: contextInterface, depth: number, testContext: string): Array<describeNodeTree> {
    const lineStart = lineStartFromNode(context['sourceFile'], node);
    const lineEnd = lineEndFromNode(context['sourceFile'], node);
    if (context['linesChanged'] !== null && !linePairInsideLinesChanged([lineStart, lineEnd], context['linesChanged'])) { return; }
    for (let i = 0; i<depth; i++) { context['doc'] = context['doc'].concat(' '); }
    const text = node.arguments[0].text;
    context['doc'] = context['doc'].concat(`${node.expression.escapedText} ${text}\n`);
    context['flatDoc'] = `${context['flatDoc']}\n${testContext}${node.expression.escapedText} ${text}\n`;
    return [{
        text,
        pos: node.pos,
        end: node.end,
        lineStart,
        lineEnd,
        children: [],
        isAssertion: true,
        isDirectlyModified: true
    }];
}

function docTree(node: any, context: contextInterface, depth: number, testContext: string): Array<describeNodeTree> {
    if (node.expression && node.expression.kind == ts.SyntaxKind.Identifier && node.expression.escapedText === 'describe') {
        return docTreeDescribe(node, context, depth, testContext);
    } else if (node.expression && node.expression.kind == ts.SyntaxKind.Identifier && (node.expression.escapedText === 'it' || node.expression.escapedText === 'test')) {
        return docTreeAssertion(node, context, depth, testContext);
    } else if (node.statements) {
        let nodes = [];
        node.statements.forEach((n) => {
            const nn = descriptionFromNode(n, context, depth+1, testContext);
            if (nn && nn.length>0) { return nodes.push(...nn); }
        });
        if (nodes.length) { return nodes; }
    } else if (node.body) {
        const nn = descriptionFromNode(node.body, context, depth+1, testContext);
        if (nn && nn.length) { return nn; }
    }
}

function descriptionFromNode(node: ts.Statement, context: contextInterface, depth = 0, testContext = ''): Array<describeNodeTree> {
    let nodes = [];
    ts.forEachChild(node, (n) => {
        const descNode = docTree(n, context, depth, testContext);
        if (descNode) { nodes.push(...descNode); }
    });
    if (nodes && nodes.length) { return nodes; }
}

export function descriptionFromSpecFile(specFile: string, linesChanged = null): contextInterface {
    // linesChanged is an array of line number pairs, e.g. [[1, 3], [5, 5]]
    // an empty array means no lines changed
    // a null value means all lines changed
    let context = { tree: [], doc: '', sourceFile: specFile, linesChanged, flatDoc: '' };
    if (linesChanged !== null && !linesChanged.length) { return context; }
    const tsSourceFile = ts.createSourceFile(
        '_.js',
        specFile,
        ts.ScriptTarget.Latest
    );
    tsSourceFile.statements.forEach((n) => {
        const nodes = descriptionFromNode(n, context);
        if (nodes) { context['tree'].push(...nodes); }
    });
    return context;
}
