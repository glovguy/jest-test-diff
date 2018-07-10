declare var require: any
const simpleGit = require('simple-git')();
const fs = require("fs");
import { linesFromGitDiff, specFilesChanged } from './src/git-diff';
import { printAllDescribesFromSpecFile } from './src/jest-info';


let myl = [];
let files = [];
simpleGit.diff(['-U0'], (err, gDiff) => {
    gDiff = fs.readFileSync('difftestout.txt', 'utf8');
    files = specFilesChanged(err, gDiff);
    console.log(files)
    files.forEach((filename) => {
        const linesChanged = linesFromGitDiff(err, gDiff, filename);
        const specFile = fs.readFileSync(filename, 'utf8');
        const diffContext = printAllDescribesFromSpecFile(specFile, linesChanged);
        const jestTree = diffContext['tree'];
        const jestDoc = diffContext['doc'];
        console.log('\n\n HERE ', linesChanged, '\n\n', jestTree, '\n\n', jestDoc, '\n\n');
    });
});
