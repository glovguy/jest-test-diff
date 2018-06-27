declare var require: any
const ts = require("typescript");
const fs = require("fs");

// Parse the code.
let tsSourceFile = ts.createSourceFile(
  'test-diff.js',
  fs.readFileSync('test-component.spec.ts', 'utf8'),
  ts.ScriptTarget.Latest
);

function printTextIfDescribe(node, context, depth) {
    if (node.expression && node.expression.kind == 71 && node.expression.escapedText == 'describe') {
        for (let i = 0; i<depth; i++) { context['doc'] = context['doc'].concat(' '); }
        context['doc'] = context['doc'].concat(node.arguments[0].text + '\n');
        context['tree'].push(node.arguments[0].text);

        printAllDescribesAtNode(node.arguments[1], context, depth+1);
    } else if (node.expression && node.expression.kind == 71 && node.expression.escapedText == 'it') {
        for (let i = 0; i<depth; i++) { context['doc'] = context['doc'].concat(' '); }
        context['doc'] = context['doc'].concat('it ' + node.arguments[0].text + '\n');
        context['tree'].push('it ' + node.arguments[0].text);
    }
    else if (node.statements) {
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

function printAllDescribesFromSourceFile(sourceFile) {
    let context = { tree: [], doc: '' };
    sourceFile.statements.forEach((n) => {
        printAllDescribesAtNode(n, context);
    });
    return context;
}

//console.log(printAllDescribesFromSourceFile(tsSourceFile)['doc']);

// poor man's tests
const testSourceFile = ts.createSourceFile(
  'test-diff.js',
  `describe('my describe text', () => {
      describe('this is a nested desc block', () => {});
  });`,
  ts.ScriptTarget.Latest
);
console.assert(
    printAllDescribesFromSourceFile(testSourceFile)['tree'][0] == 'my describe text', 
    'First level parse tree'
);
console.assert(
    printAllDescribesFromSourceFile(testSourceFile)['tree'][1] == 'this is a nested desc block', 
    'Second level parse tree'
);
const expectedDoc = `my describe text
  this is a nested desc block
`;
console.assert(
    printAllDescribesFromSourceFile(testSourceFile)['doc'] == expectedDoc, 
    'Formatted doc'
);

// tsSourceFile.statements[0].expression.expression.kind == 71 
//   && tsSourceFile.statements[0].expression.expression.escapedText == 'describe'
