declare var require: any;
const simpleGit = require('simple-git')();
const fs = require("fs");
import { linesFromGitDiff, specFilesChanged } from './git-diff';
import { printAllDescribesFromSpecFile } from './jest-info';


const comparisonBranchName = 'master';
const ignoreRegex = /\+\+\+ b.(.*spec.*\.snap)/g;

export function generate_diff(): void {
    let myl = [];
    let files = [];
    simpleGit.diff(['-U0', comparisonBranchName], (err, gDiff) => {
        files = specFilesChanged(gDiff, ignoreRegex);
        files.forEach((filename) => {
            const linesChanged = linesFromGitDiff(gDiff, filename);
            const specFile = fs.readFileSync(filename, 'utf8');
            const { tree, doc } = printAllDescribesFromSpecFile(specFile, linesChanged);
            if (tree.length > 0) { console.log(doc); }
        });
    });
}
