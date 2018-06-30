import { printAllDescribesFromSpecFile, lineStartFromNode, lineEndFromNode } from './src/jest-info';
import { linesFromGitDiff, specFilesChanged } from './src/git-diff';


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

console.assert(
    printAllDescribesFromSpecFile(testSourceCode)['tree'][0]['text'] == 'my describe text',
    'First level parse tree'
);
console.assert(
    printAllDescribesFromSpecFile(testSourceCode)['tree'][1]['text'] == 'this is a nested desc block',
    'Second level parse tree'
);
const expectedDoc = `my describe text
  this is a nested desc block
    it does a thing
`;
console.assert(
    printAllDescribesFromSpecFile(testSourceCode)['doc'] == expectedDoc,
    'Formatted doc'
);
console.assert(
    printAllDescribesFromSpecFile(testSourceCode)['tree'][0]['lineStart'] == 3,
    'Line start included'
);
console.assert(
    printAllDescribesFromSpecFile(testSourceCode)['tree'][0]['lineEnd'] == 10,
    'Line end included'
);


console.assert(
    lineStartFromNode(testSourceCode, printAllDescribesFromSpecFile(testSourceCode)['tree'][0]) == 3,
    'Line start function'
);
console.assert(
    lineEndFromNode(testSourceCode, printAllDescribesFromSpecFile(testSourceCode)['tree'][0]) == 10,
    'Line end function'
);
console.assert(
    lineStartFromNode(testSourceCode, printAllDescribesFromSpecFile(testSourceCode)['tree'][1]) == 5,
    'Line Start function, nested describe'
);
console.assert(
    lineEndFromNode(testSourceCode, printAllDescribesFromSpecFile(testSourceCode)['tree'][1]) == 9,
    'Line end function, nested describe'
);

const testDiffOutput = `diff --git a/spec.ts b/spec.ts
index 2a8e06b..2ab1d1a 100644
--- a/spec.ts
+++ b/spec.ts
@@ -12 +12,11 @@ export const specFilesChanged = function(err, diffText) {
-export const linesFromGitDiff = function(err, diffText) {
+//@@ -2 +2,2 @@ don't include this since it is part of the file itself
+export const linesFromGitDiff = function(err, diffText, fileName) {
+    const fileDiffs = diffText.split('diff --git a/');
+    console.log('fileName', fileName)
+    fileName.length
+    const diffBlock = fileDiffs.find((d) => {
+        // const filenameRegex = new RegExp(/^filename.*/);
+        // const myd = d.slice(0, fileName.length);
+        @@ -2 +2,2 @@ don't include this since it is part of the file itself
+        return d.slice(0, fileName.length) == fileName && d.slice(fileName.length, fileName.length+1) == ' ';
+    });
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
const lineNums = linesFromGitDiff(null, testDiffOutput, 'spec.ts');
console.assert(
    lineNums[0][0] == 12 &&
    lineNums[0][1] == 22 &&
    lineNums[1][0] == 23 &&
    lineNums[1][1] == 23,
    'linesFromGitDiff function'
);
console.assert(
    lineNums.length == 2,
    'linesFromGitDiff does not include text from file itself'
);
const filenames = specFilesChanged(null, testDiffOutput);
console.assert(
    filenames[0] == 'spec.ts' && filenames.length == 1,
    'specFilesChanged function'
);
console.log('All tests pass!');
