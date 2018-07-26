declare var require: any;
const simpleGit = require('simple-git')();
const fs = require("fs");
import { linesFromGitDiff, specFilesChanged } from './src/git-diff';
import { printAllDescribesFromSpecFile } from './src/jest-info';


const comparisonBranchName = 'master';
const ignoreRegex = /\+\+\+ b.(.*spec.*\.snap)/g;


let myl = [];
let files = [];
simpleGit.diff(['-U0', comparisonBranchName], (err, gDiff) => {
    files = specFilesChanged(gDiff, ignoreRegex);
    files.forEach((filename) => {
        const linesChanged = linesFromGitDiff(gDiff, filename);
        const specFile = fs.readFileSync(filename, 'utf8');
        const { tree, doc } = printAllDescribesFromSpecFile(specFile, linesChanged);
        console.log(doc);
    });
});
