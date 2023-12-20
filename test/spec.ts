import { descriptionFromSpecFile, lineStartFromNode, lineEndFromNode } from '../src/jest-info';
import { linesFromGitDiff, specFilesChanged } from '../src/git-diff';


// poor man's tests
const testSourceCode = `import { some } from 'thing';

describe('my describe text', () => {

    describe('this is a nested desc block', () => {
        it('does a thing', () => {
            console.log('test here');
        });
    });

    describe('second nested block', () => {
        it('does some other thing', () => {
            console.log('second assertion');
        });
        describe('when another thing', () => {
            it('does some third thing', () => {
                console.log('third assertion');
            });
        });
    });
});
`;

console.assert(
    descriptionFromSpecFile(testSourceCode)['tree'][0]['text'] == 'my describe text',
    'First level parse tree'
);
console.assert(
    descriptionFromSpecFile(testSourceCode)['tree'][0]['children'][0]['text'] == 'this is a nested desc block',
    'Second level parse tree'
);
console.assert(
    descriptionFromSpecFile(testSourceCode)['tree'][0]['lineStart'] == 3,
    'Line start included'
);
console.assert(
    descriptionFromSpecFile(testSourceCode)['tree'][0]['lineEnd'] == 21,
    'Line end included in top level tree'
);
const expectedDoc = `my describe text
  this is a nested desc block
    it does a thing
  second nested block
    it does some other thing
    when another thing
      it does some third thing
`;
console.assert(
    descriptionFromSpecFile(testSourceCode)['doc'] == expectedDoc,
    'Formatted doc'
);
const slimDoc = `my describe text
  second nested block
    it does some other thing
`;
console.assert(
    descriptionFromSpecFile(testSourceCode, [[13, 13]])['doc'] == slimDoc,
    'Formatted doc excluding nodes that were not changed'
);


console.assert(
    lineStartFromNode(testSourceCode, descriptionFromSpecFile(testSourceCode)['tree'][0]) == 3,
    'Line start function'
);
console.assert(
    lineEndFromNode(testSourceCode, descriptionFromSpecFile(testSourceCode)['tree'][0]) == 21,
    'Line end function'
);
console.assert(
    lineStartFromNode(testSourceCode, descriptionFromSpecFile(testSourceCode)['tree'][0]['children'][0]) == 5,
    'Line Start function, nested describe'
);
console.assert(
    lineEndFromNode(testSourceCode, descriptionFromSpecFile(testSourceCode)['tree'][0]['children'][0]) == 9,
    'Line end function, nested describe'
);
const expectedFlatDoc = `
my describe text
this is a nested desc block
it does a thing

my describe text
second nested block
it does some other thing

my describe text
second nested block
when another thing
it does some third thing
`;
console.assert(
    descriptionFromSpecFile(testSourceCode)['flatDoc'] == expectedFlatDoc,
    'formatted flatDoc'
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
const lineNums = linesFromGitDiff(testDiffOutput, 'spec.ts');
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
const filenames = specFilesChanged(testDiffOutput);
console.assert(
    filenames[0] == 'spec.ts' && filenames[1] == 'test-diff.ts' && filenames.length == 2,
    'specFilesChanged function'
);
const testIgnoreRegExp = ['spec.','test-diff.ts'];
const allFilesIgnored = specFilesChanged(testDiffOutput, testIgnoreRegExp);
console.assert(
    allFilesIgnored.length == 0,
    'ignoreRegex passed into specFilesChanged'
);
console.log('Test suite finished.');
