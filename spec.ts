import { linesFromGitDiff, printAllDescribesFromSourceFile, lineStart, lineEnd } from './test-diff';
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

const testDiffOutput = `diff --git a/spec.ts b/spec.ts
index 2a8e06b..2ab1d1a 100644
--- a/spec.ts
+++ b/spec.ts
@@ -22,0 +23 @@ const testTsSourceFile = ts.createSourceFile(
+// add a line to test
diff --git a/test-diff.ts b/test-diff.ts
index 460da5e..ffd79c4 100644
--- a/test-diff.ts
+++ b/test-diff.ts
@@ -4,0 +5,18 @@ export const fs = require("fs");
+const simpleGit = require('simple-git')();
+
+
+const linesFromGitDiff = function(err, diffText) {
+    console.log(diffText);
+    const lines = diffText.split('\n');
+    let lineNums = [];
+    lines.forEach((line) => {
+        const match = new RegExp(/.*@@ -\d+,\d+ \+(\d+),?(\d+)? @@.*/g).exec(line);
+        if (match) {
+            const endOfLine = match[2] ? Number(match[1])+Number(match[2])-1 : Number(match[1]);
+            lineNums.push([Number(match[1]), endOfLine]); }
+    });
+    console.log(lineNums);
+    return lineNums;
+}
+
+simpleGit.diff(['-U0'], linesFromGitDiff);
`;
const lineNums = linesFromGitDiff(null, testDiffOutput);
console.assert(
  lineNums[0][0] == 23 &&
    lineNums[0][1] == 23 &&
    lineNums[1][0] == 5 &&
    lineNums[1][1] == 22,
  'linesFromGitDiff'
);
console.log('All tests pass!');
