import { printAllDescribesFromSourceFile, lineStart, lineEnd } from './test-diff';
declare var require: any
export const ts = require("typescript");
export const fs = require("fs");

// poor man's tests
const testSourceCode = `import { some } from 'thing';

describe('my describe text', () => {

  describe('this is a nested desc block', () => {
    it('does a thing', () => {
      console.log('test here');
    });
  });
});
`;
const testTsSourceFile = ts.createSourceFile(
  'test-diff.js',
  testSourceCode,
  ts.ScriptTarget.Latest
);
console.assert(
    printAllDescribesFromSourceFile(testTsSourceFile)['tree'][0]['text'] == 'my describe text',
    'First level parse tree'
);
console.assert(
    printAllDescribesFromSourceFile(testTsSourceFile)['tree'][1]['text'] == 'this is a nested desc block',
    'Second level parse tree'
);
const expectedDoc = `my describe text
  this is a nested desc block
    it does a thing
`;
console.assert(
    printAllDescribesFromSourceFile(testTsSourceFile)['doc'] == expectedDoc,
    'Formatted doc'
);
console.assert(
    lineStart(testSourceCode, printAllDescribesFromSourceFile(testTsSourceFile)['tree'][0]) == 3,
    'Line start function'
);
console.assert(
    lineEnd(testSourceCode, printAllDescribesFromSourceFile(testTsSourceFile)['tree'][0]) == 10,
    'Line end function'
);
console.assert(
    lineStart(testSourceCode, printAllDescribesFromSourceFile(testTsSourceFile)['tree'][1]) == 5,
    'Line Start function, nested describe'
);
console.assert(
    lineEnd(testSourceCode, printAllDescribesFromSourceFile(testTsSourceFile)['tree'][1]) == 9,
    'Line end function, nested describe'
);
console.log('All tests pass!');
