declare var require: any
const ts = require("typescript");

interface contextInterface { tree: Array<describeNodeTree>, doc: string, sourceFile: any };
interface describeNodeTree {
    text: string,
    pos: number,
    end: number,
    lineStart: number,
    lineEnd: number,
    children: Array<describeNodeTree>
}

export let lineStartFromNode = function(file: string, descNode): number {
    return (file.slice(0, descNode['pos']+1).split('\n') || []).length + 1;
}

export let lineEndFromNode = function(file: string, descNode): number {
    return (file.slice(0, descNode['end']).split('\n') || []).length;
}

function printTextIfDescribe(node, context: contextInterface, depth): Array<describeNodeTree> {
    if (node.expression && node.expression.kind == ts.SyntaxKind.Identifier && node.expression.escapedText == 'describe') {
        for (let i=0; i<depth; i++) { context['doc'] = context['doc'].concat(' '); }
            context['doc'] = context['doc'].concat(node.arguments[0].text + '\n');
        return [{
            text: node.arguments[0].text,
            pos: node.pos,
            end: node.end,
            lineStart: lineStartFromNode(context['sourceFile'], node),
            lineEnd: lineEndFromNode(context['sourceFile'], node),
            children: printAllDescribesAtNode(node.arguments[1], context, depth+1)
        }];
    } else if (node.expression && node.expression.kind == ts.SyntaxKind.Identifier && node.expression.escapedText == 'it') {
        for (let i = 0; i<depth; i++) { context['doc'] = context['doc'].concat(' '); }
            context['doc'] = context['doc'].concat('it ' + node.arguments[0].text + '\n');
        return [{
            text: 'it ' + node.arguments[0].text,
            pos: node.pos,
            end: node.end,
            lineStart: lineStartFromNode(context['sourceFile'], node),
            lineEnd: lineEndFromNode(context['sourceFile'], node),
            children: []
        }];
    } else if (node.statements) {
        let nodes = [];
        node.statements.forEach((n) => {
            const nn = printAllDescribesAtNode(n, context, depth+1)
            if (nn && nn.length>0) { return nodes.push(...nn); }
        });
        if (nodes.length) { return nodes; }
    } else if (node.body) {
        const nn = printAllDescribesAtNode(node.body, context, depth+1);
        if (nn && nn.length) { return nn; }
    }
}

function printAllDescribesAtNode(node, context: contextInterface, depth = 0): Array<describeNodeTree> {
    let nodes = [];
    ts.forEachChild(node, (n) => {
        const descNode = printTextIfDescribe(n, context, depth);
        if (descNode) { nodes.push(...descNode); }
    });
    if (nodes && nodes.length) { return nodes; }
}

export function printAllDescribesFromSpecFile(specFile: string): contextInterface {
    const tsSourceFile = ts.createSourceFile(
        '_.js',
        specFile,
        ts.ScriptTarget.Latest
        );
    let context = { tree: [], doc: '', sourceFile: specFile };
    tsSourceFile.statements.forEach((n) => {
        const nodes = printAllDescribesAtNode(n, context);
        if (nodes) { context['tree'].push(...nodes); }
    });
    return context;
}
