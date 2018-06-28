declare var require: any
const ts = require("typescript");
const fs = require("fs");
const simpleGit = require('simple-git')();


export const linesFromGitDiff = function(err, diffText) {
    const lines = diffText.split('\n');
    let lineNums = [];
    lines.forEach((line) => {
        const match = new RegExp(/.*@@ -\d+,\d+ \+(\d+),?(\d+)? @@.*/g).exec(line);
        if (match) {
            const endOfLine = match[2] ? Number(match[1])+Number(match[2])-1 : Number(match[1]);
            lineNums.push([Number(match[1]), endOfLine]); }
    });
    return lineNums;
}

simpleGit.diff(['-U0'], linesFromGitDiff);

const specFile = fs.readFileSync('faculty-landing-item-view.component.spec.ts', 'utf8');

export let lineStart = function(file, descNode) {
    return (file.slice(0, descNode['pos']+1).split('\n') || []).length + 1;
}

export let lineEnd = function(file, descNode) {
    return (file.slice(0, descNode['end']).split('\n') || []).length;
}

let tsSourceFile = ts.createSourceFile(
  'test-diff.js',
  specFile,
  ts.ScriptTarget.Latest
);

function printTextIfDescribe(node, context, depth) {
    if (node.expression && node.expression.kind == 71 && node.expression.escapedText == 'describe') {
        for (let i = 0; i<depth; i++) { context['doc'] = context['doc'].concat(' '); }
        context['doc'] = context['doc'].concat(node.arguments[0].text + '\n');
        context['tree'].push({ text: node.arguments[0].text, pos: node.pos, end: node.end });
        printAllDescribesAtNode(node.arguments[1], context, depth+1);
    } else if (node.expression && node.expression.kind == 71 && node.expression.escapedText == 'it') {
        for (let i = 0; i<depth; i++) { context['doc'] = context['doc'].concat(' '); }
        context['doc'] = context['doc'].concat('it ' + node.arguments[0].text + '\n');
        context['tree'].push({ text: 'it ' + node.arguments[0].text, pos: node.pos, end: node.end });
    } else if (node.statements) {
        node.statements.forEach((n) => {
            printAllDescribesAtNode(n, context, depth+1)
        });
    } else if (node.body) {
        printAllDescribesAtNode(node.body, context, depth+1);
    }
    return context;
}

function printAllDescribesAtNode(node, context, depth = 0) {
    ts.forEachChild(node, (n) => {
        printTextIfDescribe(n, context, depth)
    });
    return context;
}

export function printAllDescribesFromSourceFile(sourceFile) {
    let context = { tree: [], doc: '' };
    sourceFile.statements.forEach((n) => {
        printAllDescribesAtNode(n, context);
    });
    return context;
}

//const nodeCon = printAllDescribesFromSourceFile(tsSourceFile)['tree'][47];
//console.log(
//    nodeCon['text'],
//    lineStart(tsSourceFile, nodeCon),
//    lineEnd(tsSourceFile, nodeCon)
//);



// tsSourceFile.statements[0].expression.expression.kind == 71
//   && tsSourceFile.statements[0].expression.expression.escapedText == 'describe'
