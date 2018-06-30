declare var require: any
const ts = require("typescript");

interface contextInterface { tree: Array<any>, doc: string, sourceFile: any };

export let lineStartFromNode = function(file: string, descNode): number {
    return (file.slice(0, descNode['pos']+1).split('\n') || []).length + 1;
}

export let lineEndFromNode = function(file: string, descNode): number {
    return (file.slice(0, descNode['end']).split('\n') || []).length;
}

function printTextIfDescribe(node, context: contextInterface, depth): contextInterface {
    if (node.expression && node.expression.kind == 71 && node.expression.escapedText == 'describe') {
        for (let i = 0; i<depth; i++) { context['doc'] = context['doc'].concat(' '); }
            context['doc'] = context['doc'].concat(node.arguments[0].text + '\n');
        context['tree'].push({
            text: node.arguments[0].text,
            pos: node.pos,
            end: node.end,
            lineStart: lineStartFromNode(context['sourceFile'], node),
            lineEnd: lineEndFromNode(context['sourceFile'], node)
        });
        printAllDescribesAtNode(node.arguments[1], context, depth+1);
    } else if (node.expression && node.expression.kind == 71 && node.expression.escapedText == 'it') {
        for (let i = 0; i<depth; i++) { context['doc'] = context['doc'].concat(' '); }
            context['doc'] = context['doc'].concat('it ' + node.arguments[0].text + '\n');
        context['tree'].push({
            text: 'it ' + node.arguments[0].text,
            pos: node.pos,
            end: node.end,
            lineStart: lineStartFromNode(context['sourceFile'], node),
            lineEnd: lineEndFromNode(context['sourceFile'], node)
        });
    } else if (node.statements) {
        node.statements.forEach((n) => {
            printAllDescribesAtNode(n, context, depth+1)
        });
    } else if (node.body) {
        printAllDescribesAtNode(node.body, context, depth+1);
    }
    return context;
}

function printAllDescribesAtNode(node, context: contextInterface, depth = 0): contextInterface {
    ts.forEachChild(node, (n) => {
        printTextIfDescribe(n, context, depth)
    });
    return context;
}

export function printAllDescribesFromSpecFile(specFile: string): contextInterface {
    const tsSourceFile = ts.createSourceFile(
        '_.js',
        specFile,
        ts.ScriptTarget.Latest
        );
    let context = { tree: [], doc: '', sourceFile: specFile };
    tsSourceFile.statements.forEach((n) => {
        printAllDescribesAtNode(n, context);
    });
    return context;
}
